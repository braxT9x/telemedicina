import { useState, useEffect, type CSSProperties } from 'react';
import { TriageModal } from './TriageModal';
import { ShieldCheck, Check, CreditCard, Zap, Calendar, ArrowRight } from 'lucide-react';

const image = (name: string) => `/images/${name}`;

const specialties = [
  'Clínico Geral',
  'Dermatologia',
  'Ginecologia e Obstetrícia',
  'Psicologia',
  'Psiquiatria',
  'Pediatria',
  'Cardiologia',
  'Ortopedia',
  'Gastroenterologia',
  'Urologia',
  'Nutrição',
  'Otorrinolaringologia',
  'Neurologia',
  'Endocrinologia',
];

const featuredDoctors = [
  {
    name: 'Dra. Beatriz Santos',
    role: 'Clínica Geral • CRM/SP 198.412',
    image: 'benefit-consultation.jpg',
    specialty: 'Atendimento Imediato & Check-up',
    waitingTime: 'Plantão agora (~4 min)',
  },
  {
    name: 'Dr. Marcelo Alencar',
    role: 'Cardiologia & Clínica • CRM/SP 204.119',
    image: 'benefit-specialties.jpg',
    specialty: 'Saúde Cardiovascular & Hipertensão',
    waitingTime: 'Agendamento disponível hoje',
  },
  {
    name: 'Dra. Camila Duarte',
    role: 'Psicologia Clínica • CRP 06/142.890',
    image: 'benefit-psychology.jpg',
    specialty: 'Ansiedade, Estresse e Burnout',
    waitingTime: 'Sessões online de 50 min',
  },
];

const benefitCards = [
  {
    image: 'benefit-protocol.jpg',
    alt: 'Médico com jaleco e estetoscópio em atendimento',
    tag: 'Rigor científico',
    title: 'Protocolos clínicos próprios com eficácia comprovada',
    desc: 'Atendimento humanizado baseado nas melhores evidências médicas mundiais.',
  },
  {
    image: 'benefit-pharmacy.jpg',
    alt: 'Mulher em uma farmácia mostrando o celular',
    tag: 'Prescrição digital',
    title: 'Receitas, atestados e exames aceitos em todo o Brasil',
    desc: 'Assinatura eletrônica com padrão ICP-Brasil válida em farmácias e laboratórios.',
  },
  {
    image: 'benefit-specialties.jpg',
    alt: 'Médica em teleconsulta na tela de um celular',
    tag: 'Corpo clínico de ponta',
    title: 'Mais de 30 especialidades com CRM verificado',
    desc: 'Médicos experientes prontos para atender você do conforto da sua casa.',
  },
  {
    image: 'benefit-psychology.jpg',
    alt: 'Psicóloga sorrindo durante uma conversa',
    tag: 'Cuidado integral',
    title: 'Saúde mental contínua com psicólogos e psiquiatras',
    desc: 'Acompanhamento empático para ansiedade, estresse e bem-estar emocional.',
  },
];

const faqs = [
  {
    q: 'O que é a telemedicina da Jopi Saúde?',
    a: 'É uma plataforma completa de consultas médicas online que permite escolher entre dois modelos: Consulta Imediata (para falar com um clínico em poucos minutos) ou Consulta Agendada (para escolher o médico especialista e horário). Tudo acontece pelo celular ou computador, com praticidade, rapidez e total segurança.',
  },
  {
    q: 'Qual a diferença entre Consulta Imediata e Consulta Agendada?',
    a: 'A Consulta Imediata funciona como um pronto atendimento digital: você entra na fila virtual e fala com um médico em até 7 minutos, sem agendamento prévio. Já a Consulta Agendada permite que você escolha o profissional especialista de sua preferência e marque o dia e horário que melhor se encaixam na sua rotina.',
  },
  {
    q: 'As receitas e atestados médicos têm validade legal?',
    a: 'Sim! Todos os médicos emitem receitas, atestados e pedidos de exames com assinatura digital certificada no padrão ICP-Brasil. Esses documentos possuem código de validação e QR Code, sendo aceitos em qualquer farmácia, laboratório e empresa do Brasil.',
  },
  {
    q: 'Os médicos possuem registro ativo no CRM?',
    a: 'Sim, 100% dos nossos médicos passam por uma checagem rigorosa de credenciais e possuem CRM ativo e regularizado junto ao Conselho Federal de Medicina (CFM).',
  },
  {
    q: 'Preciso ligar a câmera durante a consulta?',
    a: 'Na Consulta Imediata, você tem a flexibilidade de ser atendido via chat de texto (caso esteja no trabalho ou em ambiente público) ou por chamada de vídeo. Nas consultas agendadas, a chamada de vídeo é recomendada para uma avaliação mais aprofundada.',
  },
  {
    q: 'Preciso de plano de saúde ou mensalidade?',
    a: 'Não! Não cobramos mensalidade nem taxa de adesão. Você paga apenas pelo atendimento que utilizar, com consultas a partir de R$ 69 via Pix ou cartão.',
  },
];

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[#00D37B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [underlinedLinks, setUnderlinedLinks] = useState(false);

  const toggleSetting = (className: string, enabled: boolean, setEnabled: (value: boolean) => void) => {
    const next = !enabled;
    document.documentElement.classList.toggle(className, next);
    setEnabled(next);
  };

  return (
    <div className="accessibility-widget">
      {open && (
        <div className="accessibility-menu" id="jopi-accessibility-menu" role="dialog" aria-label="Opções de acessibilidade">
          <p>Opções de acessibilidade</p>
          <button type="button" onClick={() => toggleSetting('a11y-high-contrast', highContrast, setHighContrast)} aria-pressed={highContrast}>
            Alto contraste
          </button>
          <button type="button" onClick={() => toggleSetting('a11y-underline-links', underlinedLinks, setUnderlinedLinks)} aria-pressed={underlinedLinks}>
            Sublinhar links
          </button>
        </div>
      )}
      <button
        type="button"
        className="accessibility-toggle !bg-[#00D37B] !text-[#0A2617]"
        aria-label={open ? 'Fechar opções de acessibilidade' : 'Abrir opções de acessibilidade'}
        aria-expanded={open}
        aria-controls="jopi-accessibility-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="5.5" r="2" fill="currentColor" />
          <path d="M5.5 9.5 12 8l6.5 1.5M12 8v6m0-3-4.5 8m4.5-8 4.5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default function ConexaLanding() {
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [triageType, setTriageType] = useState<'imediata' | 'agendada'>('imediata');
  const [triageSpecialty, setTriageSpecialty] = useState<string | undefined>(undefined);

  // Escuta evento global de abertura de triagem vindo da navbar
  useEffect(() => {
    const handleOpenTriage = (e: any) => {
      if (e.detail?.type) setTriageType(e.detail.type);
      if (e.detail?.specialty) setTriageSpecialty(e.detail.specialty);
      setIsTriageOpen(true);
    };
    window.addEventListener('open-triage', handleOpenTriage);
    return () => window.removeEventListener('open-triage', handleOpenTriage);
  }, []);

  const openTriage = (type: 'imediata' | 'agendada' = 'imediata', specialty?: string) => {
    setTriageType(type);
    setTriageSpecialty(specialty);
    setIsTriageOpen(true);
  };

  return (
    <main className="page-shell" data-testid="jopi-landing-page" style={{ '--hero-image': `url("${image('hero.webp')}")` } as CSSProperties}>
      
      {/* 1. HERO PRINCIPAL */}
      <section className="hero" data-testid="hero-section" aria-label="Consultas médicas online do seu jeito">
        <div className="hero-inner w-full max-w-[1200px] mx-auto px-5 md:px-8 py-8 md:py-14">
          <div className="max-w-2xl space-y-6">
            

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.12] tracking-tight">
              Consultas do seu jeito <br />
              e no <strong className="text-[#00D37B] font-extrabold">seu tempo</strong>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-200/95 max-w-xl leading-relaxed font-normal">
              Atendimento médico imediato em até 7 minutos por chat ou vídeo, e consultas agendadas com especialistas. Prescrições digitais e atestados válidos em todo o Brasil (ICP-Brasil).
            </p>
            
            {/* Botões de Ação com Cores Límpidas e Alta Legibilidade */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => openTriage('imediata')}
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 font-display text-sm sm:text-base font-bold text-[#052E16] bg-[#00D37B] hover:bg-[#00c572] shadow-[0_4px_18px_rgba(0,211,123,0.45)] hover:shadow-[0_6px_24px_rgba(0,211,123,0.55)] transition-all duration-200 active:translate-y-0.5 cursor-pointer"
                data-testid="immediate-cta"
              >
                <Zap className="h-4 w-4 fill-current transition-transform group-hover:scale-110 shrink-0" />
                <span className="text-center tracking-tight">
                  Consulta Imediata • R$ 69
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => openTriage('agendada')}
                className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-4 font-display text-sm sm:text-base font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/35 shadow-xs hover:shadow-md transition-all duration-200 active:translate-y-0.5 cursor-pointer backdrop-blur-md"
                data-testid="scheduled-cta"
              >
                <Calendar className="h-4 w-4 text-[#00D37B] shrink-0" />
                <span className="text-center tracking-tight">
                  Consulta Agendada • R$ 99
                </span>
              </button>
            </div>

            {/* Selos de Confiança Sóbrios e Reais */}
            <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-200/90 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#00D37B] shrink-0" />
                <span>Assinatura Digital ICP-Brasil</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#00D37B] shrink-0" />
                <span>Sem mensalidade ou plano</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#00D37B] shrink-0" />
                <span>Pix ou Cartão de Crédito</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SEÇÃO "VOCÊ ESCOLHE COMO QUER CONSULTAR" (MODELOS JOPI SAÚDE) */}
      <section id="consulta-imediata" className="py-20 bg-[#F4F6FC]" aria-label="Modelos de consulta">
        <div className="container-j">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#007A4D] bg-[#00D37B]/15 px-3.5 py-1 rounded-full mb-3">
              Escolha seu modelo
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#182230] tracking-tight">
              Você escolhe como quer consultar
            </h2>
            <p className="mt-3 text-base text-[#667085]">
              Do pronto atendimento em minutos ao acompanhamento especializado, escolha o formato ideal para você.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Card 1: Consulta Imediata */}
            <article className="rounded-3xl border-2 border-[#00D37B] bg-white p-8 md:p-10 shadow-lg relative flex flex-col justify-between transition hover:-translate-y-1">
              <div className="absolute -top-3.5 right-6 bg-[#00D37B] text-[#0A2617] text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
                Mais buscado
              </div>
              <div>
                <span className="text-xs font-semibold text-[#007A4D] bg-[#EEFBF4] px-3 py-1 rounded-full">
                  Em até 7 minutos
                </span>
                <h3 className="mt-4 text-2xl md:text-3xl font-bold text-[#182230]">
                  Consulta Imediata
                </h3>
                <p className="mt-2 text-sm text-[#667085] leading-relaxed">
                  Via chat de texto ou videochamada quando você precisa de rapidez. Sem agendamento prévio.
                </p>

                <div className="my-6 py-4 border-y border-[#E5E9E7] flex items-baseline gap-2">
                  <span className="text-xs text-[#667085]">A partir de</span>
                  <span className="font-mono text-4xl font-extrabold text-[#182230]">R$ 69</span>
                  <span className="text-xs text-[#667085]">/ consulta</span>
                </div>

                <ul className="space-y-3 text-sm text-[#28292B]">
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Atendimento 24/7 com Clínico Geral em até 7 min
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Opção de consulta por chat sem ligar a câmera
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Prescrições digitais e atestados válidos na hora
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Pagamento via Pix com liberação imediata ou Cartão
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => openTriage('imediata')}
                className="mt-8 inline-flex items-center justify-center w-full rounded-full bg-[#00D37B] px-6 py-3.5 text-sm font-bold text-[#082417] shadow-md transition hover:bg-[#00bc6d] cursor-pointer"
              >
                Iniciar consulta imediata (R$ 69)
              </button>
            </article>

            {/* Card 2: Consulta Agendada */}
            <article id="consulta-agendada" className="rounded-3xl border border-[#E5E9E7] bg-white p-8 md:p-10 shadow-sm relative flex flex-col justify-between transition hover:-translate-y-1 hover:border-[#5855EF]">
              <div>
                <span className="text-xs font-semibold text-[#5855EF] bg-[#F0F2FE] px-3 py-1 rounded-full">
                  Acompanhamento com Especialistas
                </span>
                <h3 className="mt-4 text-2xl md:text-3xl font-bold text-[#182230]">
                  Consulta Agendada
                </h3>
                <p className="mt-2 text-sm text-[#667085] leading-relaxed">
                  Escolha o profissional, data e horário da sua preferência. Mais de 30 especialidades para acompanhamento.
                </p>

                <div className="my-6 py-4 border-y border-[#E5E9E7] flex items-baseline gap-2">
                  <span className="text-xs text-[#667085]">A partir de</span>
                  <span className="font-mono text-4xl font-extrabold text-[#182230]">R$ 99</span>
                  <span className="text-xs text-[#667085]">/ consulta</span>
                </div>

                <ul className="space-y-3 text-sm text-[#28292B]">
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Escolha o especialista por currículo e avaliações
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Agende no dia e horário que cabe na sua rotina
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Pedidos de exames laboratoriais e de imagem
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon /> Acompanhamento de tratamentos contínuos
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => openTriage('agendada')}
                className="mt-8 inline-flex items-center justify-center w-full rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-800 transition shadow-xs hover:border-slate-400 cursor-pointer"
              >
                Agendar com especialista (R$ 99)
              </button>
            </article>

          </div>
        </div>
      </section>

      {/* 3. CORPO CLÍNICO EM DESTAQUE (PROVA SOCIAL HUMANIZADA COM CRM REAL) */}
      <section className="py-20 bg-white border-b border-[#E5E9E7]" aria-label="Corpo clínico verificado">
        <div className="container-j">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007A4D] bg-[#EEFBF4] px-3.5 py-1 rounded-full">
              Médicos Reais e Verificados
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#182230] tracking-tight">
              Conheça quem cuida de você
            </h2>
            <p className="mt-3 text-base text-[#667085]">
              100% dos nossos médicos passam por checagem rigorosa de registro ativo junto ao CFM.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredDoctors.map((doc) => (
              <div key={doc.name} className="rounded-3xl border border-[#E5E9E7] bg-[#F8FAF9] p-6 text-center shadow-xs flex flex-col justify-between">
                <div>
                  <img
                    src={image(doc.image)}
                    alt={doc.name}
                    className="h-24 w-24 rounded-full object-cover mx-auto border-3 border-[#00D37B] shadow-sm mb-4"
                  />
                  <h3 className="font-display text-lg font-bold text-[#182230]">{doc.name}</h3>
                  <p className="text-xs font-medium text-[#007A4D] mt-0.5">{doc.role}</p>
                  <p className="text-xs text-[#667085] mt-2">{doc.specialty}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E5E9E7]">
                  <span className="inline-block text-[11px] font-semibold text-[#182230] bg-white px-3 py-1 rounded-full border border-[#E5E9E7]">
                    {doc.waitingTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => openTriage('agendada', doc.specialty)}
                    className="mt-3 w-full rounded-full bg-[#00D37B]/15 border border-[#00D37B]/40 py-2.5 text-xs font-bold text-[#007A4D] transition hover:bg-[#00D37B] hover:text-[#052E16] cursor-pointer"
                  >
                    Consultar com este médico
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ÁREAS DE ATUAÇÃO MÉDICA (ESPECIALIDADES INTERATIVAS) */}
      <section id="especialidades" className="py-16 bg-[#F8FAF9] border-b border-[#E5E9E7]" aria-label="Especialidades médicas disponíveis">
        <div className="container-j text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#007A4D] bg-[#EEFBF4] px-3.5 py-1 rounded-full">
            Mais de 30 áreas médicas
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#182230]">
            Especialistas prontos para te atender
          </h2>
          <p className="mt-2 text-sm text-[#667085] max-w-xl mx-auto">
            Clique na área desejada para abrir a triagem e iniciar o agendamento.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {specialties.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => openTriage('agendada', spec)}
                className="rounded-full border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs md:text-sm font-semibold text-[#182230] transition hover:border-[#00D37B] hover:bg-[#EEFBF4] hover:text-[#007A4D] cursor-pointer shadow-xs active:scale-95"
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA (PASSO A PASSO JOPI SAÚDE) */}
      <section id="como-funciona" className="py-20 bg-[#F4F6FC]">
        <div className="container-j">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007A4D] bg-[#EEFBF4] px-3.5 py-1 rounded-full">
              Simples e seguro
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#182230]">
              Cuidar da sua saúde pode ser simples
            </h2>
            <p className="mt-3 text-base text-[#667085]">
              Em poucos minutos você conversa com um médico e resolve seu atendimento de onde estiver.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl bg-white p-7 border border-[#E5E9E7] shadow-sm">
              <span className="font-mono text-2xl font-black text-[#00D37B]">01</span>
              <h3 className="mt-4 text-lg font-bold text-[#182230]">Escolha como consultar</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Opte por atendimento imediato em até 7 minutos ou agende dia e hora com o especialista desejado.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 border border-[#E5E9E7] shadow-sm">
              <span className="font-mono text-2xl font-black text-[#00D37B]">02</span>
              <h3 className="mt-4 text-lg font-bold text-[#182230]">Conte seus sintomas</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Descreva suas queixas ou envie fotos e exames anteriores de forma segura e confidencial.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 border border-[#E5E9E7] shadow-sm">
              <span className="font-mono text-2xl font-black text-[#00D37B]">03</span>
              <h3 className="mt-4 text-lg font-bold text-[#182230]">Fale com o médico</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Converse por chat seguro ou videochamada de alta definição com atenção humanizada e escuta ativa.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 border border-[#E5E9E7] shadow-sm">
              <span className="font-mono text-2xl font-black text-[#00D37B]">04</span>
              <h3 className="mt-4 text-lg font-bold text-[#182230]">Receba seus documentos</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Receitas digitais, atestados e pedidos de exame com assinatura eletrônica oficial no seu celular.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BENEFÍCIOS VISUAIS COM AS FOTOS REAIS */}
      <section className="py-20 bg-white" aria-label="Recursos e diferenciais">
        <div className="container-j">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#007A4D] bg-[#EEFBF4] px-3.5 py-1 rounded-full">
                Muito além de consultas
              </span>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#182230]">
                O ecossistema que coloca você no centro
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openTriage('imediata')}
              className="pill self-start md:self-auto cursor-pointer"
            >
              Consultar agora
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefitCards.map((card) => (
              <article key={card.title} className="benefit-card group">
                <img src={image(card.image)} alt={card.alt} loading="lazy" />
                <span className="benefit-tag !border-[#00D37B]/70 !bg-[#182230]/70 !text-[#00D37B] font-semibold">
                  {card.tag}
                </span>
                <div>
                  <h3 className="!text-lg font-bold">{card.title}</h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2">{card.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MÉTRICAS E PROVA SOCIAL */}
      <section className="py-16 bg-white border-y border-[#E5E9E7] text-[#182230]">
        <div className="container-j grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="font-mono text-4xl md:text-5xl font-black text-[#00874E]">+2.000.000</p>
            <p className="mt-2 text-xs md:text-sm text-[#667085]">Consultas realizadas</p>
          </div>
          <div>
            <p className="font-mono text-4xl md:text-5xl font-black text-[#00874E]">4.9 ★</p>
            <p className="mt-2 text-xs md:text-sm text-[#667085]">+25 mil avaliações</p>
          </div>
          <div>
            <p className="font-mono text-4xl md:text-5xl font-black text-[#00874E]">100%</p>
            <p className="mt-2 text-xs md:text-sm text-[#667085]">Médicos com CRM verificado</p>
          </div>
          <div>
            <p className="font-mono text-4xl md:text-5xl font-black text-[#00874E]">30+</p>
            <p className="mt-2 text-xs md:text-sm text-[#667085]">Especialidades médicas</p>
          </div>
        </div>
      </section>

      {/* 8. PERGUNTAS FREQUENTES (FAQ JOPI SAÚDE) */}
      <section id="faq" className="py-20 bg-[#F4F6FC]">
        <div className="container-j max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007A4D] bg-[#EEFBF4] px-3.5 py-1 rounded-full">
              Tire suas dúvidas
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#182230]">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl bg-white border border-[#E5E9E7] p-5 transition open:border-[#00D37B] open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold text-[#182230]">
                  {faq.q}
                  <span className="ml-4 font-mono text-xl text-[#00D37B] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#4B5563] leading-relaxed border-t border-[#F4F6FC] pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL DE TRIAGEM INTERATIVO (RESOLVE P0 E P1) */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        initialType={triageType}
        initialSpecialty={triageSpecialty}
      />

      {/* WIDGET DE ACESSIBILIDADE */}
      <AccessibilityWidget />
    </main>
  );
}
