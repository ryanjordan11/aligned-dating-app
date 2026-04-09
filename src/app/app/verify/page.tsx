"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { getSession } from "@/lib/session";
import { getVerificationDraft, saveVerificationDraft, type VerificationDraft } from "@/lib/verification";
import { useMounted } from "@/lib/useMounted";

const PROMPTS = [
  "Hold up the peace sign",
  "Touch your nose",
  "Show three fingers",
  "Wave at the camera",
] as const;

function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 1280;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function VerifyPage() {
  const router = useRouter();
  const mounted = useMounted();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const session = getSession();
  const verification = session ? getVerificationDraft(session.userId) : null;
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [captured, setCaptured] = useState(verification?.selfieUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<VerificationDraft | null>(
    verification?.status && verification.status !== "none" ? verification : null,
  );
  const prompt = verification?.prompt || PROMPTS[0];
  const cameraUnavailable =
    mounted && !!session && (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    if (!mounted) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
  }, [mounted, router, session]);

  useEffect(() => {
    if (!mounted || !session) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
      } catch {
        setCameraError("Camera permission was denied.");
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [mounted, session]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    setCaptured(captureFrame(videoRef.current));
  };

  const handleSubmit = () => {
    if (!session || !captured) return;
    setSaving(true);
    const next = saveVerificationDraft(session.userId, {
      status: "pending",
      selfieUrl: captured,
      prompt,
      updatedAt: Date.now(),
    });
    setSubmitted(next);
    setSaving(false);
  };

  if (!mounted) return null;
  if (!session) return null;

  return (
    <div className="min-h-[100svh] bg-black text-white">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-2xl flex-col px-4 pb-6">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-black/85 py-4 backdrop-blur">
          <Link
            href="/app/profile/me"
            aria-label="Back"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold">Verify profile</h1>
          <div className="h-11 w-11" />
        </header>

        <main className="flex flex-1 flex-col justify-center gap-6 py-4">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/75">Selfie check</p>
                <p className="text-xs text-white/45">Use the camera to verify it&apos;s really you.</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Prompt</p>
              <p className="mt-2 text-lg font-semibold text-white">{prompt}</p>
            </div>

            <div className="mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-black/70">
              {captured ? (
                <div className="relative aspect-[3/4] w-full">
                  <Image src={captured} alt="Captured selfie preview" fill className="object-cover" sizes="100vw" />
                </div>
              ) : (
                <div className="relative aspect-[3/4] w-full">
                  <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.2)_100%)]" />
                </div>
              )}
            </div>

            {cameraUnavailable ? <p className="mt-3 text-sm text-amber-300">Camera is not available in this browser.</p> : null}
            {cameraError ? <p className="mt-3 text-sm text-amber-300">{cameraError}</p> : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCapture}
                disabled={!cameraReady}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Camera className="h-4 w-4" />
                Capture selfie
              </button>
              {captured ? (
                <button
                  type="button"
                  onClick={() => setCaptured("")}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Retake
                </button>
              ) : null}
            </div>

          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/15 text-sky-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/75">Status</p>
                <p className="text-xs text-white/45">
                  {submitted?.status === "pending" ? "Pending review" : "Not submitted yet"}
                </p>
              </div>
            </div>

            {submitted?.selfieUrl ? (
              <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">Saved selfie</p>
                <p className="mt-2 text-sm text-white/70">{submitted.prompt}</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!captured || saving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitted?.status === "pending" ? "Submitted for review" : "Submit for review"}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
