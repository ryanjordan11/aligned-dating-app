"use client";

import LandingHero from "@/components/LandingHero";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <LandingHero
      onCreateAccount={() => router.push("/auth?mode=signup")}
      onLogin={() => router.push("/auth?mode=login")}
    />
  );
}
