"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Zap,
  Calendar,
  Lock,
} from "lucide-react";

export interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "imediata" | "agendada";
  initialSpecialty?: string;
}

const COMMON_REASONS = [
  "Gripe, febre ou tosse",
  "Renovação de receita",
  "Atestado médico",
  "Dor de cabeça ou muscular",
  "Dúvidas / Outro motivo",
];

const PATIENT_URL = import.meta.env.PUBLIC_PATIENT_URL || "http://localhost:8081";

// Os textos da landing são de marketing; o sistema busca pelo nome da
// especialidade cadastrada (Clínica Médica, Cardiologia, Dermatologia, Psiquiatria).
function toSystemSpecialty(specialty: string | undefined, reason: string): string {
  const text = `${specialty ?? ""} ${reason}`.toLowerCase();
  if (/cardio|hipertens/.test(text)) return "Cardiologia";
  if (/derma|pele/.test(text)) return "Dermatologia";
  if (/psiq|ansiedade|estresse|burnout|depress/.test(text)) return "Psiquiatria";
  return "Clínica Médica";
}

export function TriageModal({
  isOpen,
  onClose,
  initialType = "imediata",
  initialSpecialty,
}: TriageModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [consultationType, setConsultationType] = useState<"imediata" | "agendada">(initialType);
  const [selectedReason, setSelectedReason] = useState<string>("Gripe, febre ou tosse");
  const [customNote, setCustomNote] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao">("pix");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialType) setConsultationType(initialType);
    if (initialSpecialty) {
      setConsultationType("agendada");
    }
  }, [initialType, initialSpecialty]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setIsSuccess(false);
        setIsSubmitting(false);
        setCustomNote("");
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Máscara de Telefone simples e amigável
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    setPatientPhone(v);
  };

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
  }, [isOpen, onClose, step, isSuccess]);

  // Envia o paciente para a marcação no portal do paciente, já com a
  // especialidade buscada. O portal cuida de horários, login e confirmação.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = new URL("/new-request", PATIENT_URL);
    url.searchParams.set("who", toSystemSpecialty(initialSpecialty, selectedReason));
    window.location.assign(url.toString());
  };

  const price = consultationType === "imediata" ? "R$ 69" : "R$ 99";
  const typeLabel = consultationType === "imediata" ? "Consulta Imediata" : "Consulta Agendada";

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
                    {step === 1 && "Passo 1 de 2: Formato e motivo"}
                    {step === 2 && "Passo 2 de 2: Contato e confirmação"}
                    {isSuccess && "Atendimento agilizado"}
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
              {!isSuccess ? (
                <>
                  {/* PASSO 1: Escolha da Modalidade & Motivo */}
                  {step === 1 && (
                    <div className="space-y-5">
                      {/* Seletor de Modalidade */}
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

                      {/* Motivo do Atendimento */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Qual é a sua principal necessidade hoje?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_REASONS.map((reason) => {
                            const isSelected = selectedReason === reason;
                            return (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => setSelectedReason(reason)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#00D37B]/15 text-[#007A4D] border-2 border-[#00D37B] shadow-xs"
                                    : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-800"
                                }`}
                              >
                                {reason}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Campo opcional de descrição */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Observações sobre seus sintomas <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={customNote}
                          onChange={(e) => setCustomNote(e.target.value)}
                          placeholder="Ex: febre desde ontem à noite, dor no corpo..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#00D37B] focus:outline-none focus:ring-2 focus:ring-[#00D37B]/20 resize-none transition"
                        />
                      </div>

                      {/* Botão de Avançar */}
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#00D37B] py-3.5 px-6 font-display text-sm font-bold text-[#052E16] shadow-sm hover:bg-[#00c572] transition-all cursor-pointer"
                      >
                        Continuar para Identificação
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* PASSO 2: Identificação & Pagamento */}
                  {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Resumo da Consulta */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EEFBF4] border border-[#00D37B]/40 text-xs">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[#00874E] shrink-0" />
                          <span className="text-slate-700">
                            <strong className="text-slate-900 font-semibold">{typeLabel}</strong> • {selectedReason}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#00874E]">{price}</span>
                      </div>

                      {/* Inputs do Paciente */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nome completo do paciente *
                        </label>
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Ex: Mariana Ferreira de Souza"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#00D37B] focus:outline-none focus:ring-2 focus:ring-[#00D37B]/20 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          WhatsApp com DDD *
                        </label>
                        <input
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={handlePhoneChange}
                          placeholder="(11) 98765-4321"
                          maxLength={15}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#00D37B] focus:outline-none focus:ring-2 focus:ring-[#00D37B]/20 transition"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          O médico enviará o link seguro da chamada e as receitas por este número.
                        </span>
                      </div>

                      {/* Forma de Pagamento */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Forma de Pagamento
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("pix")}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                              paymentMethod === "pix"
                                ? "border-[#00D37B] bg-[#EEFBF4] text-[#00874E]"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <QrCode className="h-4 w-4 text-[#00874E]" />
                            <span>Pix (Liberação na hora)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cartao")}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                              paymentMethod === "cartao"
                                ? "border-[#00D37B] bg-[#EEFBF4] text-[#00874E]"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <CreditCard className="h-4 w-4 text-[#00874E]" />
                            <span>Cartão de Crédito</span>
                          </button>
                        </div>
                      </div>

                      {/* Garantias Reais & ICP-Brasil */}
                      <div className="pt-1 text-xs text-slate-500 space-y-1">
                        <p className="flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#00874E] shrink-0" />
                          <span>Receitas e atestados digitais com validação nacional ICP-Brasil.</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-[#00874E] shrink-0" />
                          <span>Sem mensalidade ou fidelidade. Pagamento único por atendimento.</span>
                        </p>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="rounded-full bg-slate-100 hover:bg-slate-200 px-5 py-3 text-xs font-semibold text-slate-700 transition cursor-pointer"
                        >
                          Voltar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#00D37B] py-3.5 px-6 font-display text-sm font-bold text-[#052E16] shadow-sm hover:bg-[#00c572] disabled:opacity-60 transition cursor-pointer"
                        >
                          {isSubmitting ? (
                            <span>Aguarde um instante...</span>
                          ) : (
                            <>
                              <span>Confirmar e Consultar ({price})</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                /* Tela de Sucesso Limpa e Humana */
                <div className="text-center py-4 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEFBF4] text-[#00874E] border border-[#00D37B]/30">
                    <Check className="h-7 w-7 stroke-[2.5]" />
                  </div>

                  <h4 className="font-display text-xl font-bold text-slate-900">
                    Tudo pronto, {patientName || "Paciente"}!
                  </h4>

                  <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    O link de acesso à sua consulta médica foi enviado para o seu WhatsApp (<strong className="text-slate-800">{patientPhone || "cadastrado"}</strong>).
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2 max-w-sm mx-auto text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Atendimento:</span>
                      <strong className="text-slate-900">{typeLabel}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Formato:</span>
                      <span>Chat de texto ou chamada de vídeo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Documentos:</span>
                      <span className="text-[#00874E] font-medium">Assinatura ICP-Brasil inclusa</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center rounded-full bg-[#00D37B] px-6 py-3.5 text-sm font-bold text-[#052E16] shadow-sm hover:bg-[#00c572] transition cursor-pointer"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default TriageModal;
