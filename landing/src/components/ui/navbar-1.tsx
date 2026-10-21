"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"

export type NavItem = { label: string; href: string }

export interface Navbar1Props {
  items?: NavItem[]
  loginHref?: string
  loginLabel?: string
}

const defaultItems: NavItem[] = [
  { label: "Consulta Imediata", href: "#consulta-imediata" },
  { label: "Consulta Agendada", href: "#consulta-agendada" },
  { label: "Especialidades", href: "#especialidades" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Dúvidas", href: "#faq" },
]

// Liquid glass luminoso e leve (padrão Apple / Linear em modo claro)
const glassBase =
  "bg-white/80 backdrop-blur-xl backdrop-saturate-[1.8] border border-slate-200/80 " +
  "shadow-[0_6px_28px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]"

const glassScrolled =
  "bg-white/92 backdrop-blur-2xl backdrop-saturate-[1.9] border border-slate-200 " +
  "shadow-[0_10px_36px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.9)]"

const Navbar1 = ({
  items = defaultItems,
  loginHref = "#consulta-imediata",
  loginLabel = "Consultar agora",
}: Navbar1Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleMenu = () => setIsOpen((v) => !v)

  // Com o menu aberto: trava a rolagem, mantém o Tab dentro dele e devolve o
  // foco ao botão que o abriu ao fechar
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    if (!isOpen) return
    const trigger = document.activeElement as HTMLElement | null
    menuRef.current?.querySelector<HTMLElement>("button, a")?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setIsOpen(false)
      if (e.key !== "Tab" || !menuRef.current) return
      const focusable = menuRef.current.querySelectorAll<HTMLElement>("button, a")
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      // Se o menu fechou porque abriu outro diálogo (a triagem), o foco fica com ele
      if (!document.querySelector('[role="dialog"]:not([data-mobile-menu])')) trigger?.focus()
    }
  }, [isOpen])

  // O menu móvel some no layout de desktop: fecha junto para não travar a rolagem
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const onChange = (e: MediaQueryListEvent) => e.matches && setIsOpen(false)
    desktop.addEventListener("change", onChange)
    return () => desktop.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex w-full justify-center px-4 pt-3 pb-2 md:pt-4 md:pb-2.5">
      <div
        className={`relative z-10 flex w-full max-w-5xl items-center justify-between overflow-hidden rounded-full px-5 py-2.5 md:px-7 md:py-3 transition-all duration-300 ${
          isScrolled ? glassScrolled : glassBase
        }`}
      >
        {/* Specular sheen (reflexo vítreo leve) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/60 via-transparent to-white/20"
        />

        {/* Ambient glow sutil */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-8 left-1/4 h-16 w-1/2 rounded-full bg-[#00D37B]/10 blur-2xl"
        />

        {/* Brand Jopi Saúde */}
        <motion.a
          href="/"
          className="relative flex items-center gap-2.5 font-display text-lg font-bold text-slate-900 group"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00D37B] text-[#052E16] font-black text-sm shadow-[0_2px_10px_rgba(0,211,123,0.35)] transition-transform group-hover:scale-105">
            <svg
              className="w-4 h-4 text-[#052E16]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Jopi<span className="text-[#00874E]">Saúde</span>
          </span>
        </motion.a>

        {/* Navegação Desktop com pills suaves */}
        <nav className="relative hidden items-center gap-1 lg:gap-1.5 lg:flex" aria-label="Principal">
          {items.map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -1 }}
            >
              <a
                href={item.href}
                className="font-sans text-[13px] lg:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
              >
                {item.label}
              </a>
            </motion.div>
          ))}
        </nav>

        {/* CTA Button */}
        <motion.div
          className="relative hidden items-center gap-2 lg:flex"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        >
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            href={loginHref}
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("open-triage", { detail: { type: "imediata" } }),
                );
              }
            }}
            className="inline-flex items-center justify-center rounded-full bg-[#00D37B] px-5 py-2.5 font-sans text-xs lg:text-sm font-bold text-[#052E16] shadow-[0_2px_12px_rgba(0,211,123,0.32)] transition-all hover:bg-[#00c572] hover:shadow-[0_4px_16px_rgba(0,211,123,0.45)] whitespace-nowrap cursor-pointer"
          >
            {loginLabel}
          </motion.a>
        </motion.div>

        {/* Botão Mobile */}
        <motion.button
          className="relative flex items-center rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
          aria-label="Abrir menu"
          aria-expanded={isOpen}
        >
          <Menu className="h-6 w-6 text-slate-800" />
        </motion.button>
      </div>

      {/* Menu Mobile Fullscreen Light Liquid Glass */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            data-mobile-menu
            className="fixed inset-0 z-50 overflow-y-auto bg-white/95 px-6 pt-24 pb-10 backdrop-blur-3xl backdrop-saturate-200 lg:hidden text-slate-900"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute right-6 top-6 p-2 rounded-full bg-slate-100 text-slate-700 shadow-2xs border border-slate-200"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6 text-slate-800" />
            </motion.button>
            <div className="flex flex-col space-y-5">
              {items.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + 0.08 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <a
                    href={item.href}
                    className="font-display text-xl font-bold text-slate-800 hover:text-[#00874E] transition-colors"
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <a
                  href={loginHref}
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("open-triage", { detail: { type: "imediata" } }),
                      );
                    }
                    toggleMenu();
                  }}
                  className="inline-flex items-center justify-center w-full rounded-full bg-[#00D37B] px-6 py-4 font-sans text-base font-bold text-[#052E16] shadow-md cursor-pointer"
                >
                  {loginLabel}
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
