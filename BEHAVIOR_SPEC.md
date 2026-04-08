# Aligned Behavior Spec (Web/PWA)

This is the running, production-intent behavior doc for what each screen and control does. Current build includes UI stubs (localStorage) for likes/matches/requests.

Last updated: 2026-04-08

## Global

- **Mobile-first layout**: pages are designed to fill the viewport edge-to-edge on mobile.
- **Bottom nav**:
  - Visible on main app pages like Home and Messages inbox.
  - Hidden on full-screen pages: message thread (`/app/messages/[threadId]`), profile (`/app/profile/[profileId]`).

## Auth (Stub)

Path: `/auth`

- **Login button**: sets a local demo session and routes into `/app`.

## Home Feed

Path: `/app`

### Top bar

- **Flame icon button**:
  - Toggles view mode:
    - `grid` mode: 2-column feed.
    - `swipe` mode: single-card view.
- **Filters (sliders) button**:
  - Opens full-screen Filters.
  - In swipe mode, discovery scope selection (For You/Local/Global) lives inside Filters (not in the main top bar).

### Grid mode (2-column feed)

- **Discovery pill bar**: `For You`, `Local`, `Global` changes which profiles list is shown.
- **Active now story row**: purely visual placeholder currently.
- **Profile card**:
  - Tap photo: opens profile page `/app/profile/[profileId]`.
  - Heart button:
    - Sends a Like (localStorage).
    - If the other person already liked you, it becomes a Match and triggers the Match overlay immediately.
  - Message button:
    - If not matched: opens "Request chat" modal and sends a chat request (localStorage).
    - If matched: opens the message thread for that match.

### Swipe mode (single-card)

- **Discovery pills and Active now story row**: hidden.
- **Card buttons**:
  - X: pass, advances to next profile.
  - Flame: like, advances to next profile; can trigger mutual match overlay.
  - Message: currently returns to grid mode (placeholder until we choose swipe-mode message behavior).

### Match moment

- **Match overlay**:
  - Appears immediately upon mutual like.
  - Buttons:
    - Keep browsing: closes overlay.
    - Message: navigates to the unlocked thread for that match.

## Filters

Opened from Home via sliders icon.

- Full-screen view.
- Sections:
  - Discovery: For You / Local / Global
  - Gender preference: Men / Women / Non-binary (multi-select)
  - Sexual orientation: Straight / Gay / Lesbian / Bi sexual
  - Age range: dual-thumb slider (18 to 100)
  - Radius: slider (0 to 500 km)
  - Verification: Any / Verified / Unverified
  - Sun sign: Any + 12 signs
  - Location:
    - Country picker (type-to-search; all countries supported. Uses `Intl` when available with a full fallback list).
    - US/CA/AU show state/province dropdown.
    - Other countries: region text input.

## Messages Inbox

Path: `/app/messages`

- Top bar: Messages title + notifications button (placeholder).
- Search input: visual placeholder.
- Stories row: visual placeholder.
- Requests section:
  - Shows outgoing pending chat requests.
  - No withdraw/cancel in v1 (sent requests remain pending until accepted/declined).
- Matches section:
  - Shows mutual matches created via Likes.
  - Tap a match: opens its message thread.
- Conversations section:
  - Demo placeholder threads (static).

## Message Thread

Path: `/app/messages/[threadId]`

- Full-screen chat view.
- Header:
  - Back arrow: returns to inbox.
  - Shows person name and online status (demo); name uses match name when thread is a match thread.
  - Call + video buttons: placeholders.
- Messages:
  - Demo bubbles; includes image attachment example.
- Input bar:
  - Plus button: placeholder.
  - Send button: placeholder.
  - Mic button: placeholder.

## Profile View

Path: `/app/profile/[profileId]`

- Full-screen profile.
- Banner image + avatar at top.
- Avatar: large circular profile photo centered and overlapping the banner.
- Tabs and media grid below (UI stub).
