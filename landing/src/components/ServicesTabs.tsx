import { useState } from 'react';
import { Zap, Stethoscope, Brain, Baby, RotateCcw, Check } from 'lucide-react';

const tabs = [
  { n: '01', icon: Zap, title: 'Pronto Atendimento 24h', desc: 'Clínico geral por vídeo, sem agendamento, para queixas agudas do dia a dia.', items: ['Fila virtual com tempo estimado', 'Atendimento em minutos', 'Receita e atestado na hora'] },
  { n: '02', icon: Stethoscope, title: 'Especialistas', desc: 'Consultas agendadas com dermatologistas, cardiologistas, ginecologistas e mais.', items: ['Escolha o profissional', 'Horários flexíveis', 'Pedido de exames digital'] },
  { n: '03', icon: Brain, title: 'Saúde Mental', desc: 'Psicólogos e psiquiatras para cuidar da sua mente com continuidade.', items: ['Sessões recorrentes', 'Ambiente sigiloso', 'Psiquiatria com prescrição'] },
  { n: '04', icon: Baby, title: 'Pediatria Online', desc: 'Orientação para os pequenos sem sair de casa, a qualquer hora.', items: ['Pediatras 24h', 'Dependentes na mesma conta', 'Orientação para pais'] },
  { n: '05', icon: RotateCcw, title: 'Retorno e Acompanhamento', desc: 'Mostre exames e ajuste tratamentos com o mesmo médico.', items: ['Histórico no prontuário', 'Renovação de receitas', 'Acompanhamento de crônicos'] },
];

export default function ServicesTabs() {
  const [active, setActive] = useState(0);
  const t = tabs[active];
  const Icon = t.icon;
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div role="tablist" aria-label="Serviços" className="flex flex-col gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.n}
            role="tab"
            id={`tab-${i}`}
            aria-selected={i === active}
            aria-controls="services-panel"
            onClick={() => setActive(i)}
            className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
              i === active ? 'border-jopi-blue bg-white shadow-soft' : 'border-transparent hover:bg-white/70'
            }`}
          >
            <span className={`font-mono text-sm ${i === active ? 'text-jopi-blue' : 'text-jopi-muted-2'}`}>{tab.n}</span>
            <span className={`font-display text-lg font-semibold ${i === active ? 'text-jopi-navy' : 'text-jopi-muted'}`}>{tab.title}</span>
          </button>
        ))}
      </div>
      <div id="services-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="card relative overflow-hidden !rounded-[32px] p-8 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-jopi-cyan/10 blur-2xl" />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jopi-blue text-white"><Icon size={26} /></span>
        <h3 className="mt-6 text-2xl font-bold md:text-3xl">{t.title}</h3>
        <p className="mt-3 max-w-md font-body text-lg text-jopi-text-2">{t.desc}</p>
        <ul className="mt-6 space-y-3">
          {t.items.map((it) => (
            <li key={it} className="flex items-center gap-3 text-jopi-text">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jopi-green-soft text-jopi-green-dark"><Check size={14} /></span>
              {it}
            </li>
          ))}
        </ul>
        <a href="#entrar" className="btn-primary mt-8">Começar agora</a>
      </div>
    </div>
  );
}
