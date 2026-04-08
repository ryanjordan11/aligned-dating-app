"use client";

import type { ReactNode } from "react";

// Initializes i18next for react-i18next hooks used by landing components.
import "@/i18n";

export default function Providers({ children }: { children: ReactNode }) {
  return children;
}

