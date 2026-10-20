"""Populate a tenant with fictitious Brazilian demo data.

Creates practitioners, patients, queues, reasons, booking slots,
consultations, appointments, chat messages and prescriptions, all in
Portuguese and dated relative to the moment the command runs, so the
calendar always shows a realistic past/present/future mix:

    python3 manage.py seed_demo --schema acme

Every name, email and clinical story is invented. Accounts use the reserved
`demo.example.com` domain, so no real mailbox can ever receive anything.

The command is IDEMPOTENT: users are updated in place, and the demo
consultations (tagged with an external_id starting with "demo:") are
recreated on each run so their dates move with the current day. Run it
again just before a presentation. `--remove` deletes the demo users,
consultations, reasons and organisation (specialities and queues are kept,
their generic names may be shared with a real setup).

Signals are muted while seeding: no invitation, reminder, geocoding or
websocket event is sent for this fictitious data.
"""

import os
from contextlib import contextmanager
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Q
from django.db.models.signals import (
    m2m_changed,
    post_delete,
    post_save,
    pre_delete,
    pre_save,
)
from django.utils import timezone
from django_tenants.utils import schema_context

from consultations.models import (
    Appointment,
    AppointmentStatus,
    BookingSlot,
    Consultation,
    Message,
    Participant,
    Prescription,
    PrescriptionStatus,
    Queue,
    QueueMembership,
    Reason,
    Type,
)
from users.models import Gender, Organisation, Speciality

User = get_user_model()

DEMO_DOMAIN = "demo.example.com"
DEMO_TAG = "demo:"
DEMO_TZ = "America/Sao_Paulo"
ORGANISATION_NAME = "Clínica Saúde Conectada"

SPECIALITIES = {
    "clinica": "Clínica Médica",
    "cardio": "Cardiologia",
    "dermato": "Dermatologia",
    "psiq": "Psiquiatria",
}

QUEUES = {
    "clinica": "Clínica Médica",
    "cardio": "Cardiologia",
    "dermato": "Dermatologia",
    "psiq": "Saúde Mental",
}

PRACTITIONERS = {
    "ana": {
        "email": "dra.ana.souza",
        "first_name": "Ana",
        "last_name": "Souza",
        "gender": Gender.female,
        "job_title": "Médica de Família e Comunidade - CRM-SP 000001 (fictício)",
        "speciality": "clinica",
    },
    "ricardo": {
        "email": "dr.ricardo.almeida",
        "first_name": "Ricardo",
        "last_name": "Almeida",
        "gender": Gender.male,
        "job_title": "Cardiologista - CRM-SP 000002 (fictício)",
        "speciality": "cardio",
    },
    "juliana": {
        "email": "dra.juliana.costa",
        "first_name": "Juliana",
        "last_name": "Costa",
        "gender": Gender.female,
        "job_title": "Dermatologista - CRM-SP 000003 (fictício)",
        "speciality": "dermato",
    },
    "marcos": {
        "email": "dr.marcos.nogueira",
        "first_name": "Marcos",
        "last_name": "Nogueira",
        "gender": Gender.male,
        "job_title": "Psiquiatra - CRM-SP 000004 (fictício)",
        "speciality": "psiq",
    },
}

PATIENTS = {
    "maria": {
        "email": "maria.silva",
        "first_name": "Maria Aparecida",
        "last_name": "da Silva",
        "gender": Gender.female,
        "birth": (1967, 5, 12),
        "city": "São Paulo",
    },
    "joao": {
        "email": "joao.santos",
        "first_name": "João Pedro",
        "last_name": "Santos",
        "gender": Gender.male,
        "birth": (1991, 9, 3),
        "city": "Campinas",
    },
    "fernanda": {
        "email": "fernanda.lima",
        "first_name": "Fernanda",
        "last_name": "Lima",
        "gender": Gender.female,
        "birth": (1996, 2, 21),
        "city": "Rio de Janeiro",
    },
    "carlos": {
        "email": "carlos.pereira",
        "first_name": "Carlos Eduardo",
        "last_name": "Pereira",
        "gender": Gender.male,
        "birth": (1958, 11, 30),
        "city": "Belo Horizonte",
    },
    "luiza": {
        "email": "luiza.ferreira",
        "first_name": "Luíza",
        "last_name": "Ferreira",
        "gender": Gender.female,
        "birth": (1984, 7, 8),
        "city": "Curitiba",
    },
    "rafael": {
        "email": "rafael.gomes",
        "first_name": "Rafael",
        "last_name": "Gomes",
        "gender": Gender.male,
        "birth": (2000, 4, 17),
        "city": "Porto Alegre",
    },
    "paulo": {
        "email": "paulo.ribeiro",
        "first_name": "Paulo",
        "last_name": "Ribeiro",
        "gender": Gender.male,
        "birth": (1973, 1, 25),
        "city": "Recife",
    },
    "beatriz": {
        "email": "beatriz.martins",
        "first_name": "Beatriz",
        "last_name": "Martins",
        "gender": Gender.female,
        "birth": (1989, 10, 2),
        "city": "Salvador",
    },
}

# (speciality, name, duration, assignment method, assignee key)
REASONS = [
    ("clinica", "Consulta de rotina", 30, "queue", "clinica"),
    ("clinica", "Renovação de receita", 15, "queue", "clinica"),
    ("clinica", "Atestado médico", 15, "queue", "clinica"),
    ("clinica", "Agendar com médica de família", 30, "appointment", None),
    ("clinica", "Retorno pós-operatório", 30, "user", "ana"),
    ("cardio", "Check-up cardiológico", 45, "queue", "cardio"),
    ("cardio", "Avaliação de eletrocardiograma", 20, "user", "ricardo"),
    ("dermato", "Avaliação de pinta ou lesão de pele", 30, "queue", "dermato"),
    ("dermato", "Acompanhamento de acne", 20, "user", "juliana"),
    ("psiq", "Ansiedade e sono", 45, "queue", "psiq"),
]


@contextmanager
def muted_signals():
    """Disconnect every model signal receiver for the duration of the block."""
    signals = (pre_save, post_save, pre_delete, post_delete, m2m_changed)
    saved = [(signal, signal.receivers[:]) for signal in signals]
    try:
        for signal, _ in saved:
            signal.receivers = []
            signal.sender_receivers_cache.clear()
        yield
    finally:
        for signal, receivers in saved:
            signal.receivers = receivers
            signal.sender_receivers_cache.clear()


def _portuguese_language():
    """The Portuguese code declared in settings.LANGUAGES, if any."""
    codes = [code for code, _ in settings.LANGUAGES]
    for candidate in ("pt-br", "pt_BR", "pt"):
        if candidate in codes:
            return candidate
    return None


class Command(BaseCommand):
    help = (
        "Create fictitious Brazilian demo data (practitioners, patients, "
        "consultations, appointments, chat). Idempotent: dates are refreshed "
        "on each run."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--schema",
            default=os.getenv("TENANT_SCHEMA"),
            help="Required. Tenant schema to populate (env: TENANT_SCHEMA).",
        )
        parser.add_argument(
            "--password",
            default=os.getenv("DEMO_PASSWORD", "Demo@2026"),
            help="Password of every demo account (env: DEMO_PASSWORD, default Demo@2026).",
        )
        parser.add_argument(
            "--remove",
            action="store_true",
            help="Delete all demo data instead of creating it.",
        )

    def handle(self, *args, **options):
        schema = options["schema"]
        if not schema:
            raise CommandError("Missing required option: --schema")

        with schema_context(schema), muted_signals(), transaction.atomic():
            self._remove(everything=options["remove"])
            if options["remove"]:
                self.stdout.write(self.style.SUCCESS("Demo data removed."))
                return
            self._seed(options["password"])

        self.stdout.write(self.style.SUCCESS("Demo data ready."))
        self.stdout.write(f"Password for every account: {options['password']}")
        self.stdout.write(f"  Admin: admin@{DEMO_DOMAIN}")
        for data in PRACTITIONERS.values():
            self.stdout.write(f"  Practitioner: {data['email']}@{DEMO_DOMAIN}")
        for data in PATIENTS.values():
            self.stdout.write(f"  Patient: {data['email']}@{DEMO_DOMAIN}")

    # --- Removal ---------------------------------------------------------

    def _remove(self, everything=False):
        demo_users = User.objects.filter(
            Q(email__iendswith=f"@{DEMO_DOMAIN}")
            | Q(external_id__startswith=DEMO_TAG)
        )
        # Consultations first: Consultation.beneficiary is PROTECT.
        Consultation.objects.filter(
            Q(external_id__startswith=DEMO_TAG)
            | Q(beneficiary__in=demo_users)
            | Q(created_by__in=demo_users)
        ).delete()
        Appointment.objects.filter(created_by__in=demo_users).delete()
        if not everything:
            # Users stay (their ids remain stable for open sessions), except
            # the temporary patient which is recreated each time.
            demo_users.filter(temporary=True).delete()
            return

        # Specialities and queues carry generic names a real setup may share,
        # so only the demo reasons, users and organisation go.
        for speciality, name, *_ in REASONS:
            Reason.objects.filter(
                speciality__name=SPECIALITIES[speciality], name=name
            ).delete()
        demo_users.delete()
        Organisation.objects.filter(name=ORGANISATION_NAME).delete()

    # --- Seeding ---------------------------------------------------------

    def _seed(self, password):
        self.tz = ZoneInfo(DEMO_TZ)
        self.now = timezone.now()
        self.language = _portuguese_language()

        organisation = self._organisation()
        specialities = {
            key: Speciality.objects.get_or_create(name=name)[0]
            for key, name in SPECIALITIES.items()
        }
        queues = {}
        for key, name in QUEUES.items():
            queue, _ = Queue.objects.get_or_create(name=name)
            queue.organisation.add(organisation)
            queues[key] = queue

        admin = self._user(
            "admin",
            password,
            organisation,
            first_name="Administrador",
            last_name="Demonstração",
            is_staff=True,
            is_superuser=True,
            is_practitioner=True,
        )
        doctors = {}
        for key, data in PRACTITIONERS.items():
            doctor = self._user(
                data["email"],
                password,
                organisation,
                first_name=data["first_name"],
                last_name=data["last_name"],
                gender=data["gender"],
                job_title=data["job_title"],
                is_practitioner=True,
                city="São Paulo",
                country="Brasil",
            )
            doctor.specialities.set([specialities[data["speciality"]]])
            QueueMembership.objects.get_or_create(
                queue=queues[data["speciality"]], user=doctor
            )
            BookingSlot.objects.filter(user=doctor).delete()
            BookingSlot.objects.create(
                created_by=admin,
                user=doctor,
                start_time=time(8),
                end_time=time(18),
                start_break=time(12),
                end_break=time(13),
                monday=True,
                tuesday=True,
                wednesday=True,
                thursday=True,
                friday=True,
                saturday=False,
                sunday=False,
            )
            doctors[key] = doctor
        # The admin also answers the general queue, handy during the demo.
        QueueMembership.objects.get_or_create(queue=queues["clinica"], user=admin)

        patients = {}
        for key, data in PATIENTS.items():
            patients[key] = self._user(
                data["email"],
                password,
                organisation,
                first_name=data["first_name"],
                last_name=data["last_name"],
                gender=data["gender"],
                date_of_birth=datetime(*data["birth"]).date(),
                city=data["city"],
                country="Brasil",
            )
        patients["anonimo"] = User.objects.create(
            email=None,
            first_name="Paciente",
            last_name="Não identificado",
            temporary=True,
            is_first_login=True,
            timezone=DEMO_TZ,
            external_id=f"{DEMO_TAG}anonimo",
        )

        self._reasons(specialities, queues, doctors)
        self._consultations(queues, doctors, patients)

    def _organisation(self):
        organisation, _ = Organisation.objects.get_or_create(name=ORGANISATION_NAME)
        organisation.street = "Rua Exemplo, 100 (endereço fictício)"
        organisation.city = "São Paulo"
        organisation.postal_code = "01000-000"
        organisation.country = "Brasil"
        organisation.email = f"contato@{DEMO_DOMAIN}"
        # Never steal the main flag from a real organisation already set up.
        if not Organisation.objects.filter(is_main=True).exclude(
            pk=organisation.pk
        ).exists():
            organisation.is_main = True
        organisation.save()
        return organisation

    def _user(self, local_part, password, organisation, **fields):
        email = f"{local_part}@{DEMO_DOMAIN}"
        defaults = {
            "is_active": True,
            "is_staff": False,
            "is_superuser": False,
            "is_practitioner": False,
            "is_first_login": False,
            "temporary": False,
            "email_verified": True,
            "communication_method": "email",
            "timezone": DEMO_TZ,
            "preferred_language": self.language,
            "main_organisation": organisation,
            **fields,
        }
        user = User.objects.find_by_email(email)
        if user is None:
            user = User(email=email)
        for field, value in defaults.items():
            setattr(user, field, value)
        user.set_password(password)
        user.save()
        user.organisations.add(organisation)
        return user

    def _reasons(self, specialities, queues, doctors):
        for speciality, name, duration, method, assignee in REASONS:
            Reason.objects.update_or_create(
                speciality=specialities[speciality],
                name=name,
                defaults={
                    "duration": duration,
                    "assignment_method": method,
                    "queue_assignee": queues[assignee] if method == "queue" else None,
                    "user_assignee": doctors[assignee] if method == "user" else None,
                    "is_active": True,
                },
            )

    # --- Consultations ---------------------------------------------------

    def _at(self, days, hour, minute=0):
        """Aware datetime `days` from today, at local São Paulo time.

        A past or future day landing on a weekend is pushed away from today
        to the nearest weekday, as a clinic agenda would be.
        """
        day = timezone.localtime(self.now, self.tz).date() + timedelta(days=days)
        step = timedelta(days=1 if days > 0 else -1)
        while days and day.weekday() >= 5:
            day += step
        return datetime.combine(day, time(hour, minute), tzinfo=self.tz)

    def _consultation(self, slug, doctor, patient, queue, title, description,
                      created_days_ago, notes=None, closed_days_ago=None,
                      visible_by_patient=True):
        consultation = Consultation.objects.create(
            external_id=f"{DEMO_TAG}{slug}",
            title=title,
            description=description,
            notes=notes,
            beneficiary=patient,
            created_by=doctor,
            owned_by=doctor,
            group=queue,
            visible_by_patient=visible_by_patient,
            closed_at=(
                self.now - timedelta(days=closed_days_ago)
                if closed_days_ago is not None
                else None
            ),
        )
        created_at = self.now - timedelta(days=created_days_ago)
        Consultation.objects.filter(pk=consultation.pk).update(
            created_at=created_at, updated_at=created_at
        )
        return consultation

    def _appointment(self, consultation, title, start, minutes, type=Type.online,
                     status=AppointmentStatus.scheduled, confirmed=True,
                     arrived=False):
        appointment = Appointment.objects.create(
            consultation=consultation,
            title=title,
            type=type,
            status=status,
            scheduled_at=start,
            end_expected_at=start + timedelta(minutes=minutes),
            created_by=consultation.created_by,
        )
        Appointment.objects.filter(pk=appointment.pk).update(
            created_at=start - timedelta(days=5)
        )
        for user, is_patient in (
            (consultation.beneficiary, True),
            (consultation.owned_by, False),
        ):
            if user is None:
                continue
            Participant.objects.create(
                appointment=appointment,
                user=user,
                is_active=status != AppointmentStatus.cancelled,
                is_invited=True,
                is_confirmed=confirmed if is_patient else True,
                is_notified=is_patient,
                is_consultation_visible=is_patient and consultation.visible_by_patient,
                arrived_at=start if arrived else None,
            )
        return appointment

    def _chat(self, consultation, lines, start):
        """Post `lines` as (author, text) pairs, a few minutes apart."""
        for index, (author, text) in enumerate(lines):
            message = Message.objects.create(
                consultation=consultation, created_by=author, content=text
            )
            sent_at = start + timedelta(minutes=7 * index)
            Message.objects.filter(pk=message.pk).update(
                created_at=sent_at, updated_at=sent_at
            )

    def _prescription(self, consultation, medication, dosage, frequency,
                      duration, instructions, days_ago):
        Prescription.objects.create(
            consultation=consultation,
            created_by=consultation.owned_by,
            status=PrescriptionStatus.prescribed,
            prescribed_at=self.now - timedelta(days=days_ago),
            medication_name=medication,
            dosage=dosage,
            frequency=frequency,
            duration=duration,
            instructions=instructions,
        )

    def _consultations(self, queues, doctors, patients):
        ana, ricardo = doctors["ana"], doctors["ricardo"]
        juliana, marcos = doctors["juliana"], doctors["marcos"]

        # Live appointment: joinable as soon as the command finishes, so the
        # video call can be shown without waiting for a slot.
        live_start = self.now.replace(second=0, microsecond=0)
        live_start -= timedelta(minutes=live_start.minute % 5)

        # 1. Main storyline: hypertension and diabetes follow-up.
        maria = self._consultation(
            "maria-cronicos", ana, patients["maria"], queues["clinica"],
            "Acompanhamento de hipertensão e diabetes",
            "Paciente com hipertensão arterial e diabetes tipo 2. Revisão "
            "trimestral dos exames e ajuste da medicação.",
            created_days_ago=20,
            notes="Última HbA1c: 7,4%. PA média em casa: 138/88 mmHg. "
            "Avaliar aumento da dose de metformina.",
        )
        self._appointment(
            maria, "Teleconsulta de retorno - resultados de exames",
            live_start, 120, confirmed=True,
        )
        self._appointment(
            maria, "Primeira teleconsulta", self._at(-14, 9), 30, arrived=True,
            status=AppointmentStatus.completed,
        )
        self._chat(maria, [
            (patients["maria"], "Bom dia, doutora! Já fiz os exames de sangue que a senhora pediu."),
            (ana, "Bom dia, Dona Maria! Ótimo. Pode me enviar uma foto dos resultados por aqui?"),
            (patients["maria"], "Envio sim. A pressão hoje de manhã deu 13 por 8,5."),
            (ana, "Está um pouco acima do ideal. Vamos conversar sobre isso na teleconsulta, combinado?"),
            (patients["maria"], "Combinado. Obrigada!"),
        ], self._at(-1, 8, 30))
        self._prescription(
            maria, "Losartana potássica", "50 mg", "1 comprimido a cada 12 horas",
            "Uso contínuo", "Tomar sempre no mesmo horário. Medir a pressão "
            "em casa 3 vezes por semana.", days_ago=14,
        )
        self._prescription(
            maria, "Metformina", "850 mg", "1 comprimido após o almoço e o jantar",
            "Uso contínuo", "Tomar após as refeições para evitar desconforto "
            "gástrico.", days_ago=14,
        )

        # 2. Post-operative follow-up (ACL surgery).
        joao = self._consultation(
            "joao-joelho", ana, patients["joao"], queues["clinica"],
            "Retorno pós-operatório de joelho",
            "Cirurgia de reconstrução do ligamento cruzado anterior há 3 "
            "semanas. Acompanhamento da cicatrização e da fisioterapia.",
            created_days_ago=21,
        )
        self._appointment(joao, "Avaliação da cicatrização", self._at(1, 10), 30)
        self._appointment(
            joao, "Primeiro contato", self._at(-10, 10), 30,
            status=AppointmentStatus.cancelled,
        )
        self._chat(joao, [
            (patients["joao"], "Doutora, o joelho ainda incha um pouco no fim do dia. É normal?"),
            (ana, "É esperado nessa fase. Mantenha o gelo por 20 minutos e a perna elevada. Amanhã avaliamos pela câmera."),
        ], self._at(-2, 19))

        # 3. Cardiology: atrial fibrillation and pre-operative assessment.
        carlos = self._consultation(
            "carlos-cardio", ricardo, patients["carlos"], queues["cardio"],
            "Avaliação cardiológica pré-operatória",
            "Histórico de fibrilação atrial. Preparação para troca de válvula "
            "aórtica: ecocardiograma e eletrocardiograma de controle.",
            created_days_ago=12,
            notes="Ecocardiograma: estenose aórtica moderada a grave. "
            "Anticoagulado.",
        )
        self._appointment(carlos, "Revisão do ecocardiograma", self._at(0, 16), 45)
        self._appointment(
            carlos, "Consulta presencial pré-operatória", self._at(6, 9), 60,
            type=Type.inperson,
        )
        self._prescription(
            carlos, "Apixabana", "5 mg", "1 comprimido a cada 12 horas",
            "Uso contínuo", "Não interromper sem orientação médica.", days_ago=10,
        )

        # 4. Dermatology: suspicious mole, patient has not confirmed yet.
        fernanda = self._consultation(
            "fernanda-pinta", juliana, patients["fernanda"], queues["dermato"],
            "Avaliação de pinta suspeita",
            "Paciente percebeu mudança de formato e cor em uma pinta nas "
            "costas. Dermatoscopia a agendar.",
            created_days_ago=4,
        )
        self._appointment(
            fernanda, "Dermatoscopia", self._at(2, 14), 30,
            type=Type.inperson, confirmed=None,
        )
        self._chat(fernanda, [
            (patients["fernanda"], "Oi, doutora. Enviei a foto da pinta, dá para ver bem?"),
            (juliana, "Oi, Fernanda! Dá sim. Pelas características, prefiro avaliar pessoalmente com o dermatoscópio."),
        ], self._at(-3, 11))

        # 5. Mental health.
        luiza = self._consultation(
            "luiza-sono", marcos, patients["luiza"], queues["psiq"],
            "Ansiedade e insônia",
            "Dificuldade para dormir há 2 meses, associada a sintomas de "
            "ansiedade. Orientação de higiene do sono e acompanhamento.",
            created_days_ago=9,
        )
        self._appointment(luiza, "Revisão do diário do sono", self._at(3, 18), 45)

        # 6. Sports injury.
        rafael = self._consultation(
            "rafael-tornozelo", ana, patients["rafael"], queues["clinica"],
            "Entorse de tornozelo",
            "Entorse durante partida de futebol. Avaliação para retorno ao "
            "esporte.",
            created_days_ago=6,
        )
        self._appointment(
            rafael, "Avaliação de mobilidade", self._at(4, 11), 30,
            type=Type.inperson,
        )

        # 7. Respiratory follow-up, closed: shows the history.
        paulo = self._consultation(
            "paulo-respiratorio", ana, patients["paulo"], queues["clinica"],
            "Tosse persistente após gripe",
            "Tosse seca há 4 semanas após quadro gripal. Evolução favorável "
            "com o tratamento.",
            created_days_ago=30, closed_days_ago=8,
        )
        self._appointment(
            paulo, "Teleconsulta de acompanhamento", self._at(-12, 15), 20,
            arrived=True, status=AppointmentStatus.completed,
        )

        # 8. Closed dermatology case.
        beatriz = self._consultation(
            "beatriz-eczema", juliana, patients["beatriz"], queues["dermato"],
            "Acompanhamento de dermatite",
            "Revisão do tratamento com corticoide tópico. Boa resposta.",
            created_days_ago=25, closed_days_ago=5,
        )
        self._appointment(
            beatriz, "Retorno dermatológico", self._at(-6, 10), 20,
            arrived=True, status=AppointmentStatus.completed,
        )

        # 9. Unidentified patient, not yet visible to anyone outside the team.
        self._consultation(
            "anonimo-encaminhamento", ana, patients["anonimo"], queues["clinica"],
            "Encaminhamento para especialista",
            "Pedido de encaminhamento recebido por telefone. Paciente ainda "
            "não identificado.",
            created_days_ago=1, visible_by_patient=False,
        )
