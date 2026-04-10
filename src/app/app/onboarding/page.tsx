"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, LocateFixed, X } from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { getCountryOptions } from "@/lib/countries";
import { completeOnboarding } from "@/lib/session";

const GENDERS = ["male", "female", "non-binary"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 83 }, (_, i) => String(1943 + i));
const LOCATION_HINTS = [
  "New York, United States",
  "Los Angeles, United States",
  "Miami, United States",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Sydney, Australia",
  "Melbourne, Australia",
  "London, United Kingdom",
  "Paris, France",
  "Berlin, Germany",
];

function compressImage(file: File, maxSize = 1400, quality = 0.82) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas unavailable");
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };

    image.src = objectUrl;
  });
}

function Wheel<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const itemHeight = 40;
  const pad = 68;
  const currentIndex = Math.max(0, items.indexOf(value));

  useEffect(() => {
    ref.current?.scrollTo({ top: currentIndex * itemHeight });
  }, [currentIndex]);

  return (
    <div
      ref={ref}
      className="relative h-44 flex-1 overflow-y-auto"
      style={{
        scrollBehavior: "smooth",
        touchAction: "pan-y",
        scrollbarWidth: "none",
        scrollPaddingTop: `${pad}px`,
        scrollPaddingBottom: `${pad}px`,
      }}
      onScroll={(e) => {
        const el = e.currentTarget;
        const nextIndex = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / itemHeight)));
        const nextValue = items[nextIndex];
        if (nextValue && nextValue !== value) onChange(nextValue);
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent" />
      <div className="absolute left-0 right-0 top-1/2 h-10 -translate-y-1/2 bg-transparent" />
      <div aria-hidden="true" style={{ height: pad }} />
      <div className="flex flex-col">
        {items.map((item, idx) => {
          const active = idx === currentIndex;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                ref.current?.scrollTo({ top: idx * itemHeight, behavior: "smooth" });
              }}
              className={`h-10 w-full snap-center rounded-2xl px-4 py-2 text-center text-sm font-semibold transition duration-200 ${
                active ? "text-white" : "text-white/35"
              }`}
              style={{ transform: active ? "scale(1.12)" : "scale(1)" }}
            >
              {item}
            </button>
          );
        })}
      </div>
      <div aria-hidden="true" style={{ height: pad }} />
    </div>
  );
}

function LocationAutocomplete({
  value,
  onChange,
  onPickCurrent,
}: {
  value: string;
  onChange: (value: string) => void;
  onPickCurrent: () => void;
}) {
  const [committed, setCommitted] = useState(false);
  const [lockedFromGps, setLockedFromGps] = useState(false);
  const countryOptions = getCountryOptions();
  const suggestions = [...LOCATION_HINTS, ...countryOptions.map((c) => c.name)]
    .filter((item, idx, arr) => arr.indexOf(item) === idx)
    .filter((item) => item.toLowerCase().includes(value.trim().toLowerCase()))
    .slice(0, 8);
  const showSuggestions = value.trim().length > 0 && !committed && !lockedFromGps;

  return (
    <div className="w-full max-w-xl px-4">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => {
            setCommitted(false);
            onChange(e.target.value);
          }}
          placeholder="Enter location"
          aria-label="Enter location"
          autoComplete="off"
          className="h-16 w-full rounded-3xl bg-white/5 px-5 pr-28 text-base text-white/90 outline-none placeholder:text-white/35"
        />
        <button
          type="button"
          onClick={() => {
            setCommitted(true);
            setLockedFromGps(true);
            onPickCurrent();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-black transition hover:brightness-95"
        >
          <span className="inline-flex items-center gap-2">
            <LocateFixed className="h-3.5 w-3.5" />
            Use GPS
          </span>
        </button>
      </div>

      {showSuggestions ? (
        <div className="mt-3 overflow-hidden rounded-[24px] bg-white/5">
          {suggestions.length ? (
            suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCommitted(true);
                  setLockedFromGps(false);
                  onChange(item);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/10"
              >
                {item}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-white/45">No matches</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("female");
  const [birthMonth, setBirthMonth] = useState<(typeof MONTHS)[number]>("January");
  const [birthDay, setBirthDay] = useState("01");
  const [birthYear, setBirthYear] = useState("2000");
  const [location, setLocation] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const canContinueName = name.trim().length > 0;
  const canContinueLocation = location.trim().length > 0;
  const canFinish = photoPreview.length > 0 && !photoBusy;

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoBusy(true);
    setPhotoName(file.name);

    try {
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
    } catch {
      setPhotoPreview(URL.createObjectURL(file));
    } finally {
      setPhotoBusy(false);
    }
  };

  const finishOnboarding = () => {
    if (!canFinish) return;
    localStorage.setItem(
      "aligned-onboarding-draft",
      JSON.stringify({
        name,
        gender,
        birthDate: `${birthYear}-${MONTHS.indexOf(birthMonth) + 1}-${birthDay}`,
        location,
        photoPreview,
        photoName,
        updatedAt: Date.now(),
      }),
    );
    completeOnboarding();
    router.push("/app");
  };

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_30%_20%,rgba(255,255,255,0.08),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(760px_560px_at_20%_80%,rgba(56,189,248,0.08),transparent_60%)]" />
      </div>

      <button
        type="button"
        onClick={() => router.push("/auth")}
        aria-label="Exit onboarding"
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => {
          if (step === 1) {
            router.push("/auth");
            return;
          }
          setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
        }}
        aria-label="Back"
        className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step-1"
            className="w-full max-w-xl px-4"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              aria-label="Enter your name"
              autoComplete="name"
              className="h-16 w-full rounded-3xl bg-white/5 px-5 text-base text-white/90 outline-none placeholder:text-white/35"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canContinueName}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step-2"
            className="w-full max-w-xl px-4"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Wheel items={GENDERS} value={gender} onChange={setGender} />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : step === 3 ? (
          <motion.div
            key="step-3"
            className="w-full max-w-3xl px-4"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex gap-3">
              <Wheel items={MONTHS} value={birthMonth} onChange={setBirthMonth} />
              <Wheel items={DAYS} value={birthDay} onChange={setBirthDay} />
              <Wheel items={YEARS} value={birthYear} onChange={setBirthYear} />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : step === 4 ? (
          <motion.div
            key="step-4"
            className="w-full max-w-3xl px-4"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              onPickCurrent={() => {
                if (!navigator.geolocation) {
                  setLocation("Location unavailable");
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                      const url = new URL("https://nominatim.openstreetmap.org/reverse");
                      url.searchParams.set("format", "jsonv2");
                      url.searchParams.set("lat", String(latitude));
                      url.searchParams.set("lon", String(longitude));
                      url.searchParams.set("zoom", "10");
                      url.searchParams.set("addressdetails", "1");
                      const res = await fetch(url.toString(), {
                        headers: {
                          Accept: "application/json",
                        },
                      });
                      const data = (await res.json()) as {
                        address?: {
                          city?: string;
                          town?: string;
                          village?: string;
                          state?: string;
                          country?: string;
                        };
                      };
                      const addr = data.address ?? {};
                      const city = addr.city ?? addr.town ?? addr.village ?? "";
                      const parts = [city, addr.state, addr.country].filter(Boolean);
                      setLocation(parts.join(", "));
                    } catch {
                      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                  },
                  () => {
                    setLocation("Location unavailable");
                  },
                  { enableHighAccuracy: true, timeout: 8000 },
                );
              }}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(5)}
                disabled={!canContinueLocation}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step-5"
            className="w-full max-w-xl px-4"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="relative flex h-[26rem] w-full items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-white/5 text-left transition hover:bg-white/10"
            >
              {photoPreview ? (
                <NextImage src={photoPreview} alt="Selected profile photo" fill unoptimized className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4 px-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                    <Camera className="h-9 w-9 text-white/75" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-white">Upload profile photo</div>
                    <div className="text-sm text-white/45">One photo is required</div>
                  </div>
                </div>
              )}
            </button>

            <div className="mt-4 text-center text-sm text-white/55">
              {photoBusy ? "Compressing photo..." : photoName || "Tap to add a profile photo"}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={finishOnboarding}
                disabled={!canFinish}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
              >
                Finish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
