"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollSection() {
  return (
    <section className="bg-gradient-to-b from-[#111a24] via-[#F4F6FC] to-[#F4F6FC] relative z-10 pt-16 md:pt-24 pb-16 overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="space-y-4 px-4 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00D37B]/15 border border-[#00D37B]/30 px-4 py-1.5 text-xs font-semibold text-[#007A4D] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#00D37B] animate-pulse"></span>
              Plataforma Médica Online • Consulta Imediata & Agendada
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#182230] tracking-tight leading-tight">
              A saúde que se adapta à sua rotina, <br />
              <span className="text-4xl md:text-6xl font-extrabold text-[#007A4D]">
                sem filas e sem burocracia
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-base text-[#667085] leading-relaxed">
              Atendimento médico ágil por chat ou vídeo com profissionais verificados. Receitas digitais, atestados e requisições de exames válidos em todo o Brasil, a partir de R$ 69.
            </p>
          </div>
        }
      >
        <img
          src="/images/telemedicina-dashboard.png"
          alt="Painel de telemedicina Jopi Saúde com videochamada e prontuário integrado"
          className="mx-auto rounded-xl object-cover object-top w-full h-full shadow-lg"
          loading="eager"
          draggable={false}
        />
      </ContainerScroll>
    </section>
  );
}

export default HeroScrollSection;
