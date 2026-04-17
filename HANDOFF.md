# Handoff (April 16, 2026)

This file is a quick handoff snapshot for a new dev/agent.

## Key Plan Files

- `next-steps-april-16.md`: Settings/menu workstream plan (original).
- `master-plan-april-16.md`: Verbatim notes capture (user + assistant messages).

## Current Project State (What Exists Now)

### Auth

- Email/password sign up and sign in via Convex Auth.
- Google sign-in wired (env required).
- `/auth?mode=signup` drives the UI mode via URL (no hydration desync).
- Redirect flow: after auth, signup targets `/app/onboarding`; login targets `/app`.
- Common auth error: `InvalidSecret` means wrong password for an existing account (or running sign-in against an already-created email with wrong password).

### Onboarding

- Onboarding is full-screen and the app shell header/nav is hidden on `/app/onboarding`.
- Back button only shows after step 1; logout is available in onboarding header.
- Gender and birthdate wheels were stabilized: guard against programmatic scroll + RAF throttle + scroll snap.

### Profile Sync (Convex-backed)

- Onboarding now syncs to Convex:
  1. Client compresses image.
  2. Uploads image to Convex file storage via a generated upload URL.
  3. Saves `name`, `gender`, `birthDate`, `location`, and `photoId` to Convex `profiles`.
  4. Marks onboarding complete.
- `/app/profile/me` now reads from Convex (`api.profiles.me`) and displays the stored primary photo URL.

### Navigation/UI

- Bottom nav now shows on `/app/profile/me`.
- The duplicate lower `…` button next to “Edit profile / Verify now” on profile was removed. The top-right `…` is the intended overflow menu entrypoint (not yet wired).

## Admin Requirements (Verbatim Source)

The detailed Admin spec is captured verbatim in `master-plan-april-16.md` under “User Message (Verbatim)”. It includes:
- Overview metrics (users, profiles created, verified approved/pending, signup vs profile graph).
- Verification queue with approve/reject, view all submitted data, open Google Lens, show prompt used, location/GPS/IP if available, flags/missing fields.
- Admin inbox to message users (admin-to-user).
- User list table with search, last seen, joined, role, email, userId, profile info, stats (matches/likes/messages/community posts/comments), online list.
- Ability to open a user’s public profile and “backend profile”.
- Moderation actions: delete/block, and open their messages.

## Immediate Next Workstream (Agreed Direction)

Settings + overflow menu work should be done step-by-step with explicit approval gates.

Planned Settings sections (no Facebook login):
- Account Settings
- Preferences
- Privacy & Safety
- Help / Support
- Upgrade (page for later)

## Known Gaps / Must-Fix Next

- Mobile logout: currently no good logout entrypoint in normal mobile UI; should be exposed via the top-right `…` menu on `/app/profile/me` (not in the bottom nav).
- Build the settings routes/pages under `/app/settings/*` and wire the overflow menu to them.
- Implement Convex `userSettings` data model + queries/mutations and wire controls on those pages (no dead buttons).
- Admin area: needs full design + implementation per spec, gated by role (admin/superadmin), with real metrics and queues.

## Files Changed Recently (High Signal)

- `src/app/auth/page.tsx` (auth UI, URL mode, redirects, error handling)
- `src/app/app/onboarding/page.tsx` (wheel stability + upload/sync to Convex)
- `src/app/app/layout.tsx` (hide shell on onboarding; bottom nav shown on profile/me)
- `src/app/app/profile/[profileId]/page.tsx` (reads profile/me from Convex; removed duplicate `…`)
- `convex/profiles.ts` (upload URL + upsert profile from onboarding + query me)
- `convex/schema.ts` (added `profiles.primaryPhotoId`)

## Environment Notes

- Convex deployment is configured in `.env.local` (`NEXT_PUBLIC_CONVEX_URL` etc.).
- Google OAuth requires `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Convex env.
- Custom domain mentioned: `alignedsingles.online`.

## Working Style Constraint (Critical)

- “One thing at a time”, no autonomous decisions, and no code changes without explicit approval.
- Each step should be testable and verified before moving on.

