# Aligned Product Log

This file logs product questions asked and the answers we locked in.

## 2026-04-08

- Q: When a mutual like happens, should something appear immediately on screen?
  A: Yes. Show an on-screen match moment right when the match happens.

- Q: Keep a running file of what each thing does?
  A: Yes. Added `BEHAVIOR_SPEC.md` as the canonical running behavior document.

- Q: Filters location country picker should allow any country.
  A: Yes. Country picker supports all countries (with a fallback list if `Intl.supportedValuesOf("region")` is missing).

- Q: Where is onboarding (start of profile setup)?
  A: Added `/app/onboarding` and gate new users there until profile is completed (localStorage stub until Convex).
