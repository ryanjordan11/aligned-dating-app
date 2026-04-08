"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { getSession } from "@/lib/session";
import { getCountryOptions } from "@/lib/countries";
import { hasCompletedProfile, upsertProfile, type Gender, type Intention } from "@/lib/profile";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];
const CA_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
];
const AU_STATES = [
  "Australian Capital Territory",
  "New South Wales",
  "Northern Territory",
  "Queensland",
  "South Australia",
  "Tasmania",
  "Victoria",
  "Western Australia",
];

export default function OnboardingPage() {
  const router = useRouter();
  const session = useMemo(() => (typeof window === "undefined" ? null : getSession()), []);
  const userId = session?.userId ?? "";

  const countries = useMemo(() => getCountryOptions(), []);
  const countryName = useMemo(() => {
    const map = new Map(countries.map((c) => [c.code, c.name]));
    return (code: string) => map.get(code) ?? code;
  }, [countries]);

  const [name, setName] = useState(session?.name ?? "");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [intention, setIntention] = useState<Intention | "">("");
  const [countryCode, setCountryCode] = useState("US");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (hasCompletedProfile(userId)) router.replace("/app");
  }, [router, userId]);

  const canSubmit =
    name.trim().length >= 2 &&
    birthDate.trim().length === 10 &&
    Boolean(gender) &&
    Boolean(intention) &&
    countryCode.trim().length === 2 &&
    city.trim().length >= 2;

  return (
    <div className="w-full">
      <section className="relative min-h-[100svh] overflow-hidden bg-black md:mx-auto md:max-w-md md:rounded-[32px] md:border md:border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_30%_20%,rgba(255,255,255,0.08),transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_520px_at_80%_40%,rgba(244,63,94,0.10),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(760px_560px_at_20%_80%,rgba(56,189,248,0.08),transparent_60%)]" />
        </div>

        <header className="relative flex items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => router.replace("/auth")}
            aria-label="Back"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-sm font-semibold text-white/90">Create your profile</p>
            <p className="mt-0.5 text-xs text-white/55">Required to start matching</p>
          </div>
          <div className="h-11 w-11" />
        </header>

        <main className="relative px-4 py-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Basics</p>

            <div className="mt-4 grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your real name"
                  className="mt-2 w-full bg-transparent text-sm text-white/85 placeholder:text-white/35 outline-none"
                />
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">Birthdate</label>
                <input
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full bg-transparent text-sm text-white/85 outline-none"
                />
                <p className="mt-2 text-xs text-white/45">18+ only.</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">Gender</label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(
                    [
                      ["male", "Men"],
                      ["female", "Women"],
                      ["non-binary", "Non-binary"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGender(key)}
                      className={`rounded-3xl px-3 py-2 text-sm font-semibold transition ${
                        gender === key
                          ? "bg-white text-black"
                          : "border border-white/10 bg-black/40 text-white/80 hover:bg-black/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">Intentions</label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["friends", "Friends"],
                      ["long_term", "Long term"],
                      ["marriage", "Marriage"],
                      ["short_term", "Short term"],
                      ["just_looking", "Just looking"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIntention(key)}
                      className={`rounded-3xl px-3 py-2 text-sm font-semibold transition ${
                        intention === key
                          ? "bg-white text-black"
                          : "border border-white/10 bg-black/40 text-white/80 hover:bg-black/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Location</p>
            <p className="mt-2 text-xs text-white/45">Used for Local discovery. City fallback if GPS is denied.</p>

            <div className="mt-4 grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">Country</label>
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setRegion("");
                  }}
                  className="mt-2 w-full bg-transparent text-sm text-white/85 outline-none"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {countryCode === "US" || countryCode === "CA" || countryCode === "AU" ? (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
                    {countryCode === "US" ? "State" : countryCode === "CA" ? "Province" : "State / Territory"}
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-2 w-full bg-transparent text-sm text-white/85 outline-none"
                  >
                    <option value="">Select…</option>
                    {(countryCode === "US" ? US_STATES : countryCode === "CA" ? CA_PROVINCES : AU_STATES).map(
                      (r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">Region</label>
                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="State / province / region (optional)"
                    className="mt-2 w-full bg-transparent text-sm text-white/85 placeholder:text-white/35 outline-none"
                  />
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={`City in ${countryName(countryCode)}…`}
                  className="mt-2 w-full bg-transparent text-sm text-white/85 placeholder:text-white/35 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Photos</p>
            <p className="mt-2 text-xs text-white/45">Stub for now. Later: require 3 real face photos (min 3, max 9).</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["/landing/profile-1.jpg", "/landing/profile-2.jpg", "/landing/profile-3.jpg"].map((src) => (
                <div
                  key={src}
                  className="grid aspect-square place-items-center rounded-[22px] border border-white/10 bg-black/30 text-xs font-semibold text-white/60"
                >
                  <span className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-300/80" /> Added
                  </span>
                </div>
              ))}
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="grid aspect-square place-items-center rounded-[22px] border border-white/10 bg-black/20 text-xs font-semibold text-white/40"
                >
                  <X className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              if (!session) {
                router.replace("/auth");
                return;
              }
              if (!canSubmit) {
                setError("Fill out all required fields.");
                return;
              }
              upsertProfile({
                userId: session.userId,
                name: name.trim(),
                username: session.username,
                birthDate,
                gender: gender as Gender,
                intention: intention as Intention,
                location: {
                  countryCode,
                  region: region.trim() ? region.trim() : undefined,
                  city: city.trim(),
                },
                photos: ["/landing/profile-1.jpg", "/landing/profile-2.jpg", "/landing/profile-3.jpg"],
                completedAt: Date.now(),
                updatedAt: Date.now(),
              });
              router.replace("/app");
            }}
            className={`mt-5 w-full rounded-3xl px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition ${
              canSubmit ? "bg-gradient-to-r from-rose-500 to-amber-400 hover:brightness-105" : "bg-white/10 text-white/45 shadow-none cursor-not-allowed"
            }`}
          >
            Finish profile
          </button>
        </main>
      </section>
    </div>
  );
}

