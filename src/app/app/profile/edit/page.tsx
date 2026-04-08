"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";

type Gender = "female" | "male" | "non-binary";
type WantsChildren = "yes" | "no" | "unsure";
type VaccinationStatus = "vax_free" | "vaccinated" | "prefer_not_to_say";
type RelationshipGoal = "friends" | "marriage" | "long_term" | "short_term" | "just_looking";
type PrefGender = "any" | "female" | "male" | "non-binary";
type PrefAnyYesNo = "any" | "yes" | "no";
type PrefAnyYesNoUnsure = "any" | "yes" | "no" | "unsure";
type PrefVerification = "any" | "verified" | "unverified";
type VerificationStatus = "none" | "pending" | "approved" | "rejected";

const DRAFT_KEY = "aligned_profile_edit_draft_v0";

function Row({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">{label}</label>
        {hint ? <span className="text-[11px] text-white/35">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-12 w-full rounded-3xl border border-white/10 bg-white/5 px-4 text-sm text-white/90 outline-none",
        "placeholder:text-white/35 focus:border-white/20",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-12 w-full rounded-3xl border border-white/10 bg-white/5 px-4 text-sm text-white/90 outline-none",
        "focus:border-white/20",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-28 w-full resize-none rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 outline-none",
        "placeholder:text-white/35 focus:border-white/20",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const session = useMemo(() => (typeof window === "undefined" ? null : getSession()), []);

  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<Gender>("female");
  const [locationLabel, setLocationLabel] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentCountryCode, setCurrentCountryCode] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [bio, setBio] = useState("");
  const [photoStorageIds, setPhotoStorageIds] = useState("");
  const [backgroundPhotoStorageId, setBackgroundPhotoStorageId] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [sunSign, setSunSign] = useState("");
  const [moonSign, setMoonSign] = useState("");
  const [risingSign, setRisingSign] = useState("");

  const [mbti, setMbti] = useState("");
  const [hasChildren, setHasChildren] = useState<"unset" | "yes" | "no">("unset");
  const [wantsChildren, setWantsChildren] = useState<"" | WantsChildren>("");
  const [everMarried, setEverMarried] = useState<"unset" | "yes" | "no">("unset");
  const [currentlyMarried, setCurrentlyMarried] = useState<"unset" | "yes" | "no">("unset");
  const [vaccinationStatus, setVaccinationStatus] = useState<"" | VaccinationStatus>("");
  const [relationshipGoal, setRelationshipGoal] = useState<"" | RelationshipGoal>("");

  const [prefGender, setPrefGender] = useState<PrefGender>("any");
  const [prefMinAge, setPrefMinAge] = useState<number>(18);
  const [prefMaxAge, setPrefMaxAge] = useState<number>(40);
  const [prefRadius, setPrefRadius] = useState<number>(100);
  const [prefHasChildren, setPrefHasChildren] = useState<"" | PrefAnyYesNo>("");
  const [prefWantsChildren, setPrefWantsChildren] = useState<"" | PrefAnyYesNoUnsure>("");
  const [prefMbti, setPrefMbti] = useState("");
  const [prefSunSign, setPrefSunSign] = useState("");
  const [prefVerificationStatus, setPrefVerificationStatus] = useState<PrefVerification>("any");

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("none");
  const [verificationPrompt, setVerificationPrompt] = useState("");
  const [verificationSelfieStorageId, setVerificationSelfieStorageId] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");
  const [reviewedAt, setReviewedAt] = useState<number | "">("");

  const saveDraft = () => {
    const payload = {
      name,
      age,
      gender,
      locationLabel,
      currentCity,
      currentCountryCode,
      latitude,
      longitude,
      bio,
      photoStorageIds,
      backgroundPhotoStorageId,
      birthDate,
      birthTime,
      birthCity,
      birthCountry,
      astrology: { sunSign, moonSign, risingSign },
      mbti,
      hasChildren,
      wantsChildren,
      everMarried,
      currentlyMarried,
      vaccinationStatus,
      relationshipGoal,
      preferences: {
        gender: prefGender,
        minAge: prefMinAge,
        maxAge: prefMaxAge,
        radius: prefRadius,
        hasChildren: prefHasChildren,
        wantsChildren: prefWantsChildren,
        mbti: prefMbti,
        sunSign: prefSunSign,
        verificationStatus: prefVerificationStatus,
      },
      verificationStatus,
      verification: {
        prompt: verificationPrompt,
        selfieStorageId: verificationSelfieStorageId,
        reviewerNote,
        reviewedAt,
      },
      savedAt: Date.now(),
    };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  };

  return (
    <div className="w-full">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_30%_20%,rgba(255,255,255,0.08),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(760px_560px_at_20%_80%,rgba(56,189,248,0.08),transparent_60%)]" />
      </div>

      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-lg font-bold tracking-tight text-white">Edit profile</p>
          <p className="mt-0.5 truncate text-xs text-white/55">{session?.email ?? "Local stub"}</p>
        </div>
        <div className="h-11 w-11" />
      </header>

      <main className="mt-4 grid gap-4 pb-24">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Profile</p>
          <div className="mt-4 grid gap-4">
            <Row label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            </Row>
            <Row label="Age" hint="Number">
              <Input
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                placeholder="Age"
                inputMode="numeric"
              />
            </Row>
            <Row label="Gender">
              <Select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
              </Select>
            </Row>
            <Row label="Bio">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
            </Row>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Location</p>
          <div className="mt-4 grid gap-4">
            <Row label="Location label">
              <Input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Location label" />
            </Row>
            <Row label="Current city">
              <Input value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} placeholder="City" />
            </Row>
            <Row label="Current country code" hint="ISO2 (US, CA)">
              <Input value={currentCountryCode} onChange={(e) => setCurrentCountryCode(e.target.value)} placeholder="US" />
            </Row>
            <Row label="Latitude" hint="Optional">
              <Input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : "")}
                placeholder="Latitude"
              />
            </Row>
            <Row label="Longitude" hint="Optional">
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : "")}
                placeholder="Longitude"
              />
            </Row>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Photos</p>
          <div className="mt-4 grid gap-4">
            <Row label="Photo storage ids" hint="Comma separated">
              <Input
                value={photoStorageIds}
                onChange={(e) => setPhotoStorageIds(e.target.value)}
                placeholder="storageId1, storageId2, ..."
              />
            </Row>
            <Row label="Background photo storage id" hint="Optional">
              <Input
                value={backgroundPhotoStorageId}
                onChange={(e) => setBackgroundPhotoStorageId(e.target.value)}
                placeholder="storageId"
              />
            </Row>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Birth / Astrology</p>
          <div className="mt-4 grid gap-4">
            <Row label="Birth date" hint="YYYY-MM-DD">
              <Input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </Row>
            <Row label="Birth time" hint="HH:mm">
              <Input value={birthTime} onChange={(e) => setBirthTime(e.target.value)} placeholder="HH:mm" />
            </Row>
            <Row label="Birth city">
              <Input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} placeholder="Birth city" />
            </Row>
            <Row label="Birth country">
              <Input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} placeholder="Birth country" />
            </Row>
            <Row label="Sun sign">
              <Input value={sunSign} onChange={(e) => setSunSign(e.target.value)} placeholder="Sun sign" />
            </Row>
            <Row label="Moon sign">
              <Input value={moonSign} onChange={(e) => setMoonSign(e.target.value)} placeholder="Moon sign" />
            </Row>
            <Row label="Rising sign">
              <Input value={risingSign} onChange={(e) => setRisingSign(e.target.value)} placeholder="Rising sign" />
            </Row>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Details</p>
          <div className="mt-4 grid gap-4">
            <Row label="MBTI">
              <Input value={mbti} onChange={(e) => setMbti(e.target.value)} placeholder="MBTI" />
            </Row>
            <Row label="Has children">
              <Select value={hasChildren} onChange={(e) => setHasChildren(e.target.value as typeof hasChildren)}>
                <option value="unset">Unset</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Row>
            <Row label="Wants children">
              <Select value={wantsChildren} onChange={(e) => setWantsChildren((e.target.value as WantsChildren) || "")}>
                <option value="">Unset</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unsure">Unsure</option>
              </Select>
            </Row>
            <Row label="Ever married">
              <Select value={everMarried} onChange={(e) => setEverMarried(e.target.value as typeof everMarried)}>
                <option value="unset">Unset</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Row>
            <Row label="Currently married">
              <Select value={currentlyMarried} onChange={(e) => setCurrentlyMarried(e.target.value as typeof currentlyMarried)}>
                <option value="unset">Unset</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Row>
            <Row label="Vaccination status">
              <Select
                value={vaccinationStatus}
                onChange={(e) => setVaccinationStatus((e.target.value as VaccinationStatus) || "")}
              >
                <option value="">Unset</option>
                <option value="vax_free">Vax free</option>
                <option value="vaccinated">Vaccinated</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </Row>
            <Row label="Relationship goal">
              <Select
                value={relationshipGoal}
                onChange={(e) => setRelationshipGoal((e.target.value as RelationshipGoal) || "")}
              >
                <option value="">Unset</option>
                <option value="friends">Friends</option>
                <option value="marriage">Marriage</option>
                <option value="long_term">Long term</option>
                <option value="short_term">Short term</option>
                <option value="just_looking">Just looking</option>
              </Select>
            </Row>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Preferences</p>
          <div className="mt-4 grid gap-4">
            <Row label="Preference gender">
              <Select value={prefGender} onChange={(e) => setPrefGender(e.target.value as PrefGender)}>
                <option value="any">Any</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
              </Select>
            </Row>
            <Row label="Min age">
              <Input
                value={prefMinAge}
                onChange={(e) => setPrefMinAge(Number(e.target.value))}
                inputMode="numeric"
              />
            </Row>
            <Row label="Max age">
              <Input
                value={prefMaxAge}
                onChange={(e) => setPrefMaxAge(Number(e.target.value))}
                inputMode="numeric"
              />
            </Row>
            <Row label="Radius" hint="km">
              <Input
                value={prefRadius}
                onChange={(e) => setPrefRadius(Number(e.target.value))}
                inputMode="numeric"
              />
            </Row>
            <Row label="Has children filter">
              <Select
                value={prefHasChildren}
                onChange={(e) => setPrefHasChildren((e.target.value as PrefAnyYesNo) || "")}
              >
                <option value="">Unset</option>
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Row>
            <Row label="Wants children filter">
              <Select
                value={prefWantsChildren}
                onChange={(e) => setPrefWantsChildren((e.target.value as PrefAnyYesNoUnsure) || "")}
              >
                <option value="">Unset</option>
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unsure">Unsure</option>
              </Select>
            </Row>
            <Row label="MBTI filter">
              <Input value={prefMbti} onChange={(e) => setPrefMbti(e.target.value)} placeholder="MBTI" />
            </Row>
            <Row label="Sun sign filter">
              <Input value={prefSunSign} onChange={(e) => setPrefSunSign(e.target.value)} placeholder="Sun sign" />
            </Row>
            <Row label="Verification filter">
              <Select
                value={prefVerificationStatus}
                onChange={(e) => setPrefVerificationStatus(e.target.value as PrefVerification)}
              >
                <option value="any">Any</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </Select>
            </Row>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Verification</p>
          <div className="mt-4 grid gap-4">
            <Row label="Verification status">
              <Select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
              >
                <option value="none">none</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </Select>
            </Row>
            <Row label="Selfie prompt">
              <Input
                value={verificationPrompt}
                onChange={(e) => setVerificationPrompt(e.target.value)}
                placeholder='e.g. "Touch your nose"'
              />
            </Row>
            <Row label="Selfie storage id">
              <Input
                value={verificationSelfieStorageId}
                onChange={(e) => setVerificationSelfieStorageId(e.target.value)}
                placeholder="storageId"
              />
            </Row>
            <Row label="Reviewed at" hint="epoch ms">
              <Input
                value={reviewedAt}
                onChange={(e) => setReviewedAt(e.target.value ? Number(e.target.value) : "")}
                placeholder="1710000000000"
              />
            </Row>
            <Row label="Reviewer note">
              <Textarea
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="Reviewer note"
              />
            </Row>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/70 backdrop-blur md:left-[calc((100%-72rem)/2)] md:right-[calc((100%-72rem)/2)]">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              saveDraft();
              router.push("/app/profile/me");
            }}
            className="flex-1 rounded-3xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105"
          >
            Save
          </button>
        </div>
      </footer>
    </div>
  );
}

