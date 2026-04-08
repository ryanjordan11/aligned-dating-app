"use client";

import type { ReactNode } from "react";

type RevealFrom = "left" | "right" | "up" | "down" | "scale";

type RevealProps = {
  children: ReactNode;
  from?: RevealFrom;
  delay?: number;
  className?: string;
};

const Reveal = ({ children, from = "up", delay = 0, className }: RevealProps) => {
  void from;
  void delay;
  return <div className={className}>{children}</div>;
};

export default Reveal;
