"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Plus, X } from "lucide-react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { getCountryOptions } from "@/lib/countries";
import { getSession, updateSession } from "@/lib/session";
import { defaultProfileDraft, getProfileDraft, saveProfileDraft, type ProfileDraft } from "@/lib/profileDraft";

const GENDER_OPTIONS: ProfileDraft["gender"][] = ["female", "male", "non-binary"];
const PREFERENCE_GENDER_OPTIONS: ProfileDraft["preferences"]["gender"][] = ["any", "female", "male", "non-binary"];
const RELATIONSHIP_GOALS: Array<NonNullable<ProfileDraft["relationshipGoal"]>> = [
  "friends",
  "marriage",
  "long_term",
  "short_term",
  "just_looking",
];
const SUN_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;
const VACCINATION_OPTIONS: Array<NonNullable<ProfileDraft["vaccinationStatus"]>> = [
  "vax_free",
  "vaccinated",
  "prefer_not_to_say",
];
const PRACTICE_OPTIONS = [
  "Meditation",
  "Vipassana",
  "Tarot",
  "Astrology",
  "Breathwork",
  "Yoga",
  "Reiki",
  "Sound Healing",
  "Nature",
  "Soul Prompts",
] as const;

function compressImage(file: File, maxSize = 1400, quality = 0.82) {
  return new Promise<string>((resolve, reject) => {
    const image = new window.Image();
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

        if (!context) throw new Error("Canvas unavailable");

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

let faceDetectorPromise: Promise<FaceDetector> | null = null;

async function withSuppressedMediaPipeInfo<T>(fn: () => Promise<T>): Promise<T> {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = args
      .map((part) => (typeof part === "string" ? part : part instanceof Error ? part.message : ""))
      .join(" ");
    if (message.includes("INFO: Created TensorFlow Lite XNNPACK delegate for CPU.")) return;
    originalError(...args);
  };

  try {
    return await fn();
  } finally {
    console.error = originalError;
  }
}

async function getFaceDetector() {
  if (!faceDetectorPromise) {
    faceDetectorPromise = withSuppressedMediaPipeInfo(async () => {
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
      return FaceDetector.createFromModelPath(
        vision,
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      );
    });
  }
  return faceDetectorPromise;
}

async function detectSingleFace(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const detector = await getFaceDetector();
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    const faces = await new Promise<number>((resolve, reject) => {
      image.onload = () => {
        withSuppressedMediaPipeInfo(async () => {
          try {
            const result = detector.detect(image);
            resolve(result.detections.length);
          } catch (error) {
            reject(error);
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        }).catch(reject);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load failed"));
      };
      image.src = objectUrl;
    });

    if (faces === 0) return { ok: false, error: "Please upload a clear face photo." };
    if (faces > 1) return { ok: false, error: "Only one face is allowed in the photo." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not verify this photo right now." };
  }
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-white">{label}</span>
        {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const backgroundRef = useRef<HTMLInputElement | null>(null);
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [draggingPhotoIndex, setDraggingPhotoIndex] = useState<number | null>(null);
  const [hasFacePhoto, setHasFacePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [form, setForm] = useState<ProfileDraft>(defaultProfileDraft());

  const updateBooleanish = (
    key: "hasChildren" | "everMarried" | "currentlyMarried",
    value: "" | "true" | "false",
  ) => {
    setForm((cur) => ({
      ...cur,
      [key]: value === "" ? "" : value === "true",
    }));
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/auth");
      return;
    }

    setUserId(session.userId);
    const draft = getProfileDraft(session.userId);
    setForm({
      ...draft,
      name: draft.name || session.name || "",
    });
    setMounted(true);
  }, [router]);

  const handlePhotoFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setPhotoBusy(true);
    setPhotoError("");
    try {
      for (const file of files) {
        const faceCheck = await detectSingleFace(file);
        if (!faceCheck.ok) {
          setPhotoError(faceCheck.error);
          return;
        }
      }
      const converted = await Promise.all(files.map((file) => compressImage(file)));
      setForm((cur) => ({
        ...cur,
        photoUrls: [...cur.photoUrls, ...converted],
      }));
      setHasFacePhoto(true);
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleBackgroundFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBackgroundBusy(true);
    setPhotoError("");
    try {
      const compressed = await compressImage(file, 1800, 0.85);
      setForm((cur) => ({
        ...cur,
        backgroundPhotoUrl: compressed,
      }));
    } finally {
      setBackgroundBusy(false);
    }
  };

  const removePhoto = (idx: number) => {
    setForm((cur) => {
      const next = cur.photoUrls.filter((_, i) => i !== idx);
      setHasFacePhoto(next.length > 0);
      return { ...cur, photoUrls: next };
    });
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setForm((cur) => {
      const next = [...cur.photoUrls];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return { ...cur, photoUrls: next };
    });
  };

  const save = () => {
    if (!userId || saving) return;
    if (!hasFacePhoto || form.photoUrls.length === 0) return;
    setSaving(true);
    try {
      saveProfileDraft(userId, form);
      updateSession({ name: form.name || "Ryan Jordan" });
      router.push("/app/profile/me");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[100svh] bg-black text-white">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-2xl flex-col px-4 pb-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/85 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-white">Edit profile</h1>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
          >
            Save
          </button>
        </header>

        <main className="flex-1 pt-4">
          <div className="space-y-6">
            <section className="pt-1">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">Background photo</h2>
                <span className="text-xs text-white/40">Separate from profile photos</span>
              </div>
              <input
                ref={backgroundRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleBackgroundFile}
              />
              <button
                type="button"
                onClick={() => backgroundRef.current?.click()}
                className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                {form.backgroundPhotoUrl ? (
                  <Image
                    src={form.backgroundPhotoUrl}
                    alt="Background preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/65">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Camera className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                      {backgroundBusy ? "Processing" : "Add background"}
                    </span>
                  </div>
                )}
              </button>
              {form.backgroundPhotoUrl ? (
                <button
                  type="button"
                  onClick={() => setForm((cur) => ({ ...cur, backgroundPhotoUrl: "" }))}
                  className="mt-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10"
                >
                  Remove background
                </button>
              ) : null}
            </section>

            <section className="pt-1">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">Photos</h2>
                <span className="text-xs text-white/40">Upload at least one</span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                capture="user"
                className="hidden"
                onChange={handlePhotoFiles}
              />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {form.photoUrls.length ? (
                  form.photoUrls.map((src, idx) => (
                    <div
                      key={`${src}-${idx}`}
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={() => setDraggingPhotoIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggingPhotoIndex === null) return;
                        movePhoto(draggingPhotoIndex, idx);
                        setDraggingPhotoIndex(null);
                      }}
                      onDragEnd={() => setDraggingPhotoIndex(null)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border bg-white/5 transition ${
                        idx === 0 ? "border-emerald-400/60 ring-1 ring-emerald-400/40" : "border-white/10"
                      } ${draggingPhotoIndex === idx ? "scale-[0.98] opacity-70" : "hover:bg-white/10"}`}
                    >
                      <Image src={src} alt={`Profile photo ${idx + 1}`} fill unoptimized className="object-cover" />
                      <div className="absolute left-2 top-2 flex items-center gap-2">
                        {idx === 0 ? (
                          <span className="rounded-full bg-emerald-400 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black">
                            Main
                          </span>
                        ) : null}
                        <span className="rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-white/80">
                          Drag
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove photo ${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(idx);
                        }}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black"
                        >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : null}

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/5 transition hover:bg-white/10"
                >
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="flex flex-col items-center gap-2 text-white/65">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <Camera className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                        {photoBusy ? "Processing" : "Add"}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
              <div className="mt-3 text-sm text-white/45">
                {hasFacePhoto ? "Face photo required: satisfied" : "Face photo required: add your first clear face photo."}
              </div>
              {photoError ? <div className="mt-2 text-sm text-rose-200">{photoError}</div> : null}
            </section>

            <Field label="Name">
              <input
                value={form.name}
                onChange={(e) => setForm((cur) => ({ ...cur, name: e.target.value }))}
                placeholder="Enter your name"
                className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
              />
            </Field>

            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => setForm((cur) => ({ ...cur, gender: e.target.value as ProfileDraft["gender"] }))}
                className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
              >
                {GENDER_OPTIONS.map((item) => (
                  <option key={item} value={item} className="bg-black text-white">
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Birthdate" hint="Locked after onboarding">
              <input
                type="date"
                value={form.birthDate}
                readOnly
                className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white/60 outline-none [color-scheme:dark]"
              />
            </Field>

            <Field label="Bio">
              <textarea
                value={form.bio}
                onChange={(e) => setForm((cur) => ({ ...cur, bio: e.target.value }))}
                placeholder="Write something about yourself"
                rows={4}
                className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
              />
            </Field>

            <section className="pt-2">
              <div className="mb-2">
                <h2 className="text-sm font-semibold text-white">Intentions & identity</h2>
              </div>
              <div className="space-y-5">
                <Field label="Intentions">
                  <select
                    value={form.relationshipGoal}
                    onChange={(e) =>
                      setForm((cur) => ({
                        ...cur,
                        relationshipGoal: e.target.value as ProfileDraft["relationshipGoal"],
                      }))
                    }
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">
                      Select intention
                    </option>
                    {RELATIONSHIP_GOALS.map((item) => (
                      <option key={item} value={item} className="bg-black text-white">
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Sun sign">
                  <select
                    value={form.sunSign}
                    onChange={(e) => setForm((cur) => ({ ...cur, sunSign: e.target.value }))}
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">
                      Select sun sign
                    </option>
                    {SUN_SIGNS.map((item) => (
                      <option key={item} value={item} className="bg-black text-white">
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="MBTI">
                  <input
                    value={form.mbti}
                    onChange={(e) => setForm((cur) => ({ ...cur, mbti: e.target.value }))}
                    placeholder="INTJ"
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                  />
                </Field>

                <Field label="Has children">
                  <select
                    value={form.hasChildren === "" ? "" : form.hasChildren ? "true" : "false"}
                    onChange={(e) => updateBooleanish("hasChildren", e.target.value as "" | "true" | "false")}
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">
                      Select
                    </option>
                    <option value="true" className="bg-black text-white">
                      yes
                    </option>
                    <option value="false" className="bg-black text-white">
                      no
                    </option>
                  </select>
                </Field>

                <Field label="Wants children">
                  <select
                    value={form.wantsChildren}
                    onChange={(e) =>
                      setForm((cur) => ({
                        ...cur,
                        wantsChildren: e.target.value as ProfileDraft["wantsChildren"],
                      }))
                    }
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">
                      Select
                    </option>
                    {["yes", "no", "unsure"].map((item) => (
                      <option key={item} value={item} className="bg-black text-white">
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Ever married">
                  <select
                    value={form.everMarried === "" ? "" : form.everMarried ? "true" : "false"}
                    onChange={(e) => updateBooleanish("everMarried", e.target.value as "" | "true" | "false")}
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">
                      Select
                    </option>
                    <option value="true" className="bg-black text-white">
                      yes
                    </option>
                    <option value="false" className="bg-black text-white">
                      no
                    </option>
                  </select>
                </Field>

                <Field label="Currently married">
                  <select
                    value={form.currentlyMarried === "" ? "" : form.currentlyMarried ? "true" : "false"}
                    onChange={(e) => updateBooleanish("currentlyMarried", e.target.value as "" | "true" | "false")}
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">
                      Select
                    </option>
                    <option value="true" className="bg-black text-white">
                      yes
                    </option>
                    <option value="false" className="bg-black text-white">
                      no
                    </option>
                  </select>
                </Field>

                <Field label="Vaccination status">
                  <select
                    value={form.vaccinationStatus}
                    onChange={(e) =>
                      setForm((cur) => ({
                        ...cur,
                        vaccinationStatus: e.target.value as ProfileDraft["vaccinationStatus"],
                      }))
                    }
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    <option value="" className="bg-black text-white">
                      Select
                    </option>
                    {VACCINATION_OPTIONS.map((item) => (
                      <option key={item} value={item} className="bg-black text-white">
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className="pt-2">
              <div className="mb-2">
                <h2 className="text-sm font-semibold text-white">Practices & rituals</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRACTICE_OPTIONS.map((item) => {
                  const active = form.practices.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setForm((cur) => {
                          const next = cur.practices.includes(item)
                            ? cur.practices.filter((value) => value !== item)
                            : [...cur.practices, item];
                          return { ...cur, practices: next };
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-5">
                <Field label="My morning ritual looks like...">
                  <textarea
                    value={form.morningRitual}
                    onChange={(e) => setForm((cur) => ({ ...cur, morningRitual: e.target.value }))}
                    placeholder="Burning palo santo, 20 minutes of silence, and sun-gazing."
                    rows={4}
                    className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                  />
                </Field>

                <Field label="What I'm manifesting right now...">
                  <textarea
                    value={form.manifesting}
                    onChange={(e) => setForm((cur) => ({ ...cur, manifesting: e.target.value }))}
                    placeholder="A conscious partnership built on radical honesty and shared growth."
                    rows={4}
                    className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                  />
                </Field>

                <Field label="Add a reflection">
                  <textarea
                    value={form.reflection}
                    onChange={(e) => setForm((cur) => ({ ...cur, reflection: e.target.value }))}
                    placeholder="Write a reflection here..."
                    rows={3}
                    className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                  />
                </Field>
              </div>
            </section>

            <Field label="City">
              <input
                value={form.currentCity}
                onChange={(e) => setForm((cur) => ({ ...cur, currentCity: e.target.value }))}
                placeholder="Enter your city"
                className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
              />
            </Field>

            <Field label="Country">
              <select
                value={form.currentCountryCode}
                onChange={(e) => setForm((cur) => ({ ...cur, currentCountryCode: e.target.value }))}
                className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
              >
                <option value="" className="bg-black text-white">
                  Select country
                </option>
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code} className="bg-black text-white">
                    {country.name}
                  </option>
                ))}
              </select>
            </Field>

            <section className="pt-2">
              <div className="mb-2">
                <h2 className="text-sm font-semibold text-white">Preferences</h2>
              </div>

              <div className="space-y-5">
                <Field label="Gender preference">
                  <select
                    value={form.preferences.gender}
                    onChange={(e) =>
                      setForm((cur) => ({
                        ...cur,
                        preferences: { ...cur.preferences, gender: e.target.value as ProfileDraft["preferences"]["gender"] },
                      }))
                    }
                    className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                  >
                    {PREFERENCE_GENDER_OPTIONS.map((item) => (
                      <option key={item} value={item} className="bg-black text-white">
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-white">Age range</span>
                    <span className="text-xs text-white/40">
                      {form.preferences.minAge} - {form.preferences.maxAge}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-xs text-white/40">From</span>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        value={form.preferences.minAge}
                        onChange={(e) =>
                          setForm((cur) => ({
                            ...cur,
                            preferences: { ...cur.preferences, minAge: Number(e.target.value || 18) },
                          }))
                        }
                        className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs text-white/40">To</span>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        value={form.preferences.maxAge}
                        onChange={(e) =>
                          setForm((cur) => ({
                            ...cur,
                            preferences: { ...cur.preferences, maxAge: Number(e.target.value || 100) },
                          }))
                        }
                        className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none"
                      />
                    </label>
                  </div>
                </div>

                <Field label="Radius" hint="km">
                  <input
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={form.preferences.radius}
                    onChange={(e) =>
                      setForm((cur) => ({
                        ...cur,
                        preferences: { ...cur.preferences, radius: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-white"
                  />
                  <div className="mt-2 text-sm text-white/55">{form.preferences.radius} km</div>
                </Field>
              </div>
            </section>
          </div>
        </main>

        <footer className="sticky bottom-0 border-t border-white/10 bg-black/90 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/app/profile/me"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={saving || !hasFacePhoto || form.photoUrls.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
            >
              <Plus className="h-4 w-4" />
              Save changes
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
