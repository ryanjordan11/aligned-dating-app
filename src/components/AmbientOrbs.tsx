"use client";

import { useMounted } from "@/lib/useMounted";

type AmbientOrbsProps = {
  variant?: "warm" | "cool" | "rose";
};

const AmbientOrbs = ({ variant = "warm" }: AmbientOrbsProps) => {
  const mounted = useMounted();
  const a =
    variant === "cool"
      ? "bg-sky-400/10"
      : variant === "rose"
        ? "bg-rose-400/10"
        : "bg-amber-300/10";
  const b =
    variant === "cool"
      ? "bg-indigo-500/10"
      : variant === "rose"
        ? "bg-fuchsia-500/10"
        : "bg-rose-500/10";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute -left-16 top-14 h-56 w-56 rounded-full blur-3xl ${a} ${
          mounted ? "animate-float" : ""
        }`}
      />
      <div
        className={`absolute -right-24 bottom-10 h-72 w-72 rounded-full blur-3xl ${b} ${
          mounted ? "animate-pulse-glow" : ""
        }`}
      />
    </div>
  );
};

export default AmbientOrbs;
