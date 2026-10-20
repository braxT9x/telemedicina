from io import StringIO

from django.core.management import call_command
from django_tenants.test.cases import TenantTestCase

from consultations.models import Appointment, Consultation, Message
from users.models import User


class SeedDemoTest(TenantTestCase):
    def seed(self, *args):
        call_command("seed_demo", "--schema", self.tenant.schema_name, *args, stdout=StringIO())

    def test_creates_demo_data(self):
        self.seed()

        maria = User.objects.get(email="maria.silva@demo.example.com")
        self.assertTrue(maria.check_password("Demo@2026"))
        self.assertFalse(maria.is_practitioner)
        self.assertTrue(
            User.objects.get(email="dra.ana.souza@demo.example.com").is_practitioner
        )
        self.assertEqual(Consultation.objects.count(), 9)
        self.assertTrue(Appointment.objects.exists())
        self.assertTrue(Message.objects.exists())

    def test_is_idempotent(self):
        self.seed()
        counts = (User.objects.count(), Consultation.objects.count(), Appointment.objects.count())
        self.seed()
        self.assertEqual(
            counts,
            (User.objects.count(), Consultation.objects.count(), Appointment.objects.count()),
        )

    def test_remove(self):
        self.seed()
        self.seed("--remove")
        self.assertFalse(User.objects.filter(email__endswith="@demo.example.com").exists())
        self.assertFalse(Consultation.objects.exists())
