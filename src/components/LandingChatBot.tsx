"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type ChatRole = "assistant" | "user";
type ChatMessage = { role: ChatRole; text: string };

type LandingChatBotProps = {
  onCreateAccount: () => void;
};

function answerFor(inputRaw: string, lang: "en" | "es") {
  const input = inputRaw.toLowerCase();
  const contains = (...parts: string[]) => parts.some((p) => input.includes(p));

  if (contains("verify", "verification", "selfie", "real", "fake", "catfish")) {
    return lang === "es"
      ? [
          "La verificación está diseñada para que la confianza sea obvia, no una adivinanza.",
          "Puedes navegar sin verificarte, pero los perfiles verificados destacan y la experiencia se siente más tranquila cuando la gente es real.",
          "Si estás listo, crea tu cuenta y completa tu perfil en un minuto.",
        ].join("\n\n")
      : [
          "Verification is designed to make trust obvious, not guesswork.",
          "You can browse without it, but verified profiles stand out and the experience is calmer when people are real.",
          "If you’re ready, create your account and complete your profile in a minute.",
        ].join("\n\n");
  }

  if (contains("safe", "safety", "scam", "report", "harass", "harassment")) {
    return lang === "es"
      ? [
          "Aligned está construido con defaults más seguros: señales claras de verificación, reportes y moderación.",
          "El chat solo se abre cuando ambos aceptan, así no te fuerzan a conversar.",
          "Si algo se siente raro, puedes reportarlo y alejarte.",
        ].join("\n\n")
      : [
          "Aligned is built around safer defaults: clear verification signals, reporting, and moderation.",
          "Chat unlocks only when both people opt in, so you’re not forced into conversations.",
          "If something feels off, you can report it and step away.",
        ].join("\n\n");
  }

  if (contains("how", "work", "match", "matching", "like", "vibe")) {
    return lang === "es"
      ? [
          "Crea tu perfil, define tus preferencias y luego desliza entre matches que encajen.",
          "Los likes mutuos se vuelven un match. Desde ahí, el chat es por consentimiento para mantenerlo intencional.",
        ].join("\n\n")
      : [
          "Make a profile, set your preferences, then swipe through matches that fit.",
          "Mutual likes become a match. From there, chat is consent-based so it stays intentional.",
        ].join("\n\n");
  }

  if (contains("free", "price", "cost", "subscription")) {
    return lang === "es"
      ? [
          "Ahora mismo, Aligned está en desarrollo activo.",
          "Estamos enfocados en que lo básico se sienta increíble primero: perfiles reales, matching intencional y mensajes más tranquilos.",
        ].join("\n\n")
      : [
          "Right now, Aligned is in active development.",
          "We’re focused on making the core experience feel great first: real profiles, intentional matching, and calmer messaging.",
        ].join("\n\n");
  }

  return lang === "es"
    ? [
        "Pregúntame lo que sea sobre cómo funciona Aligned: verificación, matching, seguridad o mensajes.",
        "Si quieres probarlo, crea tu cuenta y te guío con los primeros pasos.",
      ].join("\n\n")
    : [
        "Ask me anything about how Aligned works: verification, matching, safety, or messaging.",
        "If you want to try it, create your account and I’ll walk you through the first steps.",
      ].join("\n\n");
}

const LandingChatBot = ({ onCreateAccount }: LandingChatBotProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: i18n.language.startsWith("es")
        ? "Hola. Puedo responder preguntas sobre Aligned y ayudarte a empezar."
        : "Hi. I can answer questions about Aligned, then help you get set up.",
    },
  ]);

  const quickPrompts = useMemo(
    () => [t("chat.quick.q1"), t("chat.quick.q2"), t("chat.quick.q3"), t("chat.quick.q4")],
    [t],
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const send = (textRaw: string) => {
    const text = textRaw.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    const reply = answerFor(text, i18n.language.startsWith("es") ? "es" : "en");
    setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[320px] overflow-hidden border border-white/10 bg-black/60 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">{t("chat.headerKicker")}</p>
              <p className="text-sm font-semibold text-white">{t("chat.headerTitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[340px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[88%] border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/90"
                      : "max-w-[88%] border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80"
                  }
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            <div className="pt-1">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 hover:bg-white/10 hover:text-white transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  send(input);
                  setInput("");
                }}
                placeholder={t("chat.placeholder")}
                className="h-10 flex-1 border border-white/10 bg-black/50 px-3 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-white/25"
              />
              <button
                type="button"
                onClick={() => {
                  send(input);
                  setInput("");
                }}
                className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-white/10 text-white hover:bg-white/15 transition"
                aria-label={t("chat.send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onCreateAccount}
              className="mt-3 w-full bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105"
            >
              {t("common.createAccount")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 border border-white/10 bg-black/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/85 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur transition hover:bg-black/60 hover:text-white"
          aria-label="Open chat"
        >
          <MessageCircle className="h-4 w-4" />
          {t("chat.open")}
        </button>
      )}
    </div>
  );
};

export default LandingChatBot;

