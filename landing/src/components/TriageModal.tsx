"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Zap, Calendar } from "lucide-react";

export interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "imediata" | "agendada";
  initialSpecialty?: string;
}

const PATIENT_URL = import.meta.env.PUBLIC_PATIENT_URL || "http://localhost:8081";

// Especialidades cadastradas no sistema. A landing usa nomes de marketing;
// as que não estão aqui seguem com o próprio nome para a busca do portal.
const SYSTEM_SPECIALTIES: [RegExp, string][] = [
  [/cl[ií]nic/, "Clínica Médica"],
  [/cardio/, "Cardiologia"],
  [/derma/, "Dermatologia"],
  [/psiq/, "Psiquiatria"],
];

function toSystemSpecialty(specialty: string): string {
  const text = specialty.toLowerCase();
  return SYSTEM_SPECIALTIES.find(([pattern]) => pattern.test(text))?.[1] ?? specialty;
}

export function TriageModal({
  isOpen,
  onClose,
  initialType = "imediata",
  initialSpecialty,
}: TriageModalProps) {
  const [consultationType, setConsultationType] = useState<"imediata" | "agendada">(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // O modal fica montado: a cada abertura o tipo volta a ser o do botão clicado
  useEffect(() => {
    if (isOpen) setConsultationType(initialSpecialty ? "agendada" : initialType);
  }, [isOpen, initialType, initialSpecialty]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setIsSubmitting(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Leva o foco para dentro do modal ao abrir e devolve ao botão de origem ao fechar
  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    modalRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();
    return () => trigger?.focus();
  }, [isOpen]);


  // Trava de foco acessível e tecla Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Leva o paciente ao portal do paciente, que cuida do motivo, do horário,
  // do login e da confirmação. O atendimento imediato vai para Clínica Médica,
  // cujos motivos de fila não pedem horário; o agendado busca a especialidade.
  const handleContinue = () => {
    setIsSubmitting(true);
    const url = new URL("/new-request", PATIENT_URL);
    const who = consultationType === "imediata"
      ? "Clínica Médica"
      : initialSpecialty && toSystemSpecialty(initialSpecialty);
    if (who) url.searchParams.set("who", who);
    window.location.assign(url.toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Backdrop leve com desfoque suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card — Limpo, humano e acolhedor */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80 my-auto text-slate-800"
          >
            {/* Header limpo com identificação do serviço */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00D37B] text-[#052E16] font-bold shadow-2xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div>
                  <h3 id="modal-headline" className="font-display text-base font-bold text-slate-900 leading-none">
                    Jopi<span className="text-[#00874E]">Saúde</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Escolha o tipo de atendimento
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Como você prefere consultar?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConsultationType("imediata")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        consultationType === "imediata"
                          ? "border-[#00D37B] bg-[#EEFBF4] shadow-xs ring-2 ring-[#00D37B]/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00874E]">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        Atendimento Imediato
                      </span>
                      <span className="font-display font-bold text-base text-slate-900 block mt-1">
                        Clínico Geral
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Em até 7 min • <strong className="text-slate-900">R$ 69</strong>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType("agendada")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        consultationType === "agendada"
                          ? "border-[#5855EF] bg-[#F0F2FE] shadow-xs ring-2 ring-[#5855EF]/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5855EF]">
                        <Calendar className="h-3.5 w-3.5 text-[#5855EF]" />
                        Especialistas
                      </span>
                      <span className="font-display font-bold text-base text-slate-900 block mt-1">
                        {initialSpecialty || "Com Agendamento"}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Dia e hora • <strong className="text-slate-900">R$ 99</strong>
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  No próximo passo, no portal do paciente, você escolhe o motivo
                  {consultationType === "agendada" && ", o médico e o horário"} e entra ou cria sua conta.
                </p>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#00D37B] py-3.5 px-6 font-display text-sm font-bold text-[#052E16] shadow-sm hover:bg-[#00c572] disabled:opacity-60 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Abrindo o portal...</span>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default TriageModal;
