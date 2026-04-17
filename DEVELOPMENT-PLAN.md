# Aligned Dating App - Development Plan

## Current Date: April 17, 2026

## Overview
Spiritual dating app for aligned individuals. Free core experience with optional cheap upgrades ($0.99-$1.99). No Tinder-style paywalls. Real users + demo profiles distributed globally.

---

## COMPLETED WORK

### 1. Settings System (Phase 0)
**Status: COMPLETE**

- `/app/settings` - Hub page with links to all sections
- `/app/settings/account` - Placeholder (email, password, login methods)
- `/app/settings/preferences` - Placeholder (discovery filters)
- `/app/settings/privacy` - Placeholder (visibility, messaging settings)
- `/app/settings/support` - Placeholder (help, contact)
- `/app/settings/upgrade` - Placeholder (premium features)
- `/app/settings/layout.tsx` - Shared header with back button

### 2. Profile Overflow Menu
**Status: COMPLETE**

- Added bottom sheet menu on `/app/profile/me`
- Menu items: Account Settings, Preferences, Privacy & Safety, Help / Support, Upgrade, Log out
- Log out calls real `signOut()` from Convex Auth
- Redirects to `/auth` after logout

### 3. Image Configuration
**Status: COMPLETE**

- Updated `next.config.ts` to whitelist Convex storage hosts:
  - `*.convex.cloud`
  - `*.convexsite.com`

### 4. Auth Page Fix
**Status: COMPLETE**

- Wrapped `useSearchParams()` in Suspense boundary
- Fixed build error on `/auth` page

### 5. Community Feed (Previous Work)
**Status: COMPLETE**

- Facebook-style feed UI
- Text-only or text+image posts
- 6 reactions: Like, Love, Haha, Wow, Sad, Angry
- Engagement counts shown
- Threaded comments with replies
- Full timestamp format
- LocalStorage-based data (no Convex backend yet)

---

## PENDING WORK

### Priority 1: Demo Profile Creator (Admin)
**Why: Need users in the app NOW so real users have people to match with**

Create `/app/admin/demo-profiles` page for admins only:

**Convex Backend (`convex/demoProfiles.ts`):**
- `createDemoProfile` mutation
  - Input: photoStorageId, gender (female/male/non-binary), ageMin, ageMax, spiritualPathOverride (optional)
  - Generates random name, bio, city from list of 50+ US cities
  - Assigns random zodiac sign, spiritual path
  - Sets location (latitude/longitude) based on city
  - Creates user + appUser + profile with `isDemo: true`
  - Returns: userId, profileId, name, age, gender, city, email

**Data: Cities List (50+ US cities)**
Los Angeles, New York, Chicago, Houston, Phoenix, San Diego, Dallas, Austin, San Francisco, Seattle, Denver, Nashville, Portland, Las Vegas, Miami, Atlanta, Boston, Minneapolis, Philadelphia, San Jose, Jacksonville, Columbus, Charlotte, Indianapolis, Salt Lake City, Boulder, Asheville, Santa Fe, Sedona, Bend, Taos, Hoboken, Oakland, Brooklyn, Portland (ME), Burlington, Tucson, Albuquerque, Kansas City, New Orleans, Savannah, Charleston, Richmond, Omaha, Boise, Reno, Spokane + international cities

**Demo Profile Behavior:**
- After user likes a demo profile, wait 1-2 minutes
- Demo profile sends ONE message (generic: "Hey! :)")
- Demo profile does NOT continue conversation
- Keeps deck populated for users

**Admin UI (`/app/admin/demo-profiles/page.tsx`):**
- Upload photo button
- Gender selector (female/male/non-binary)
- Age range inputs (min/max)
- "Create Demo Profile" button
- Shows count of existing demo profiles by gender
- "Delete All Demo Profiles" button

---

### Priority 2: Admin Dashboard
**Why: Need to manage growing user base (600+ users in 1.5 weeks)**

**Convex Backend (`convex/adminDashboard.ts`):**
Create queries:

1. `overview` - Returns:
   - totalUsers, totalProfiles, verifiedProfiles, pendingProfiles
   - signupsByDay, profilesByDay (last 7/14/30 days)

2. `listUsers` - Paginated, searchable:
   - Input: paginationOpts, q (search query)
   - Returns: paginated appUsers with profile info
   - Filter by: name, email, role

3. `getUserDetail` - Full user info:
   - Input: userId
   - Returns: appUser, profile, presence (lastSeenAt, lastPage), stats (matches, likesSent, messagesSent)
   - Returns: recent posts, comments, adminMessages

**Pages:**

1. `/app/admin/page.tsx` - Overview dashboard
   - Stats cards: Total Users, Total Profiles, Verified, Pending
   - Chart: Signups over time
   - Quick links to: Users, Verification Queue, Demo Profiles

2. `/app/admin/users/page.tsx` - User list
   - Search bar
   - Paginated table: Name, Email, Role, Joined, Verified Status
   - Click row to go to user detail

3. `/app/admin/users/[userId]/page.tsx` - User detail
   - Account info (User ID, Role, Email, Joined)
   - Profile info (Name, Age, Verification, Location, Bio, Photos)
   - Activity (Last seen, Matches, Likes sent, Messages sent)
   - Admin Direct Message form (send message to user)
   - Danger zone: Delete account button

---

### Priority 3: Verification System
**Why: Need to approve/reject user verification requests**

**Convex Schema Addition (`convex/schema.ts`):**
```typescript
verificationRequests: defineTable({
  userId: v.id("users"),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  selfieUrl: v.string(),
  idPhotoUrl: v.optional(v.string()),
  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
  reviewerId: v.optional(v.id("users")),
}).index("by_status", ["status"])
.index("by_userId", ["userId"])
```

**Convex Mutations (`convex/verification.ts`):**
- `submitVerification` - User submits verification request
- `approveVerification` - Admin approves (sets status: "approved", updates profile)
- `rejectVerification` - Admin rejects with reason

**Admin Page: `/app/admin/verification/page.tsx`**
- Queue of pending verification requests
- Show selfie photo, ID photo (if provided)
- "Approve" and "Reject" buttons
- Approved/Rejected tabs

---

### Priority 4: Settings - Real Implementation
**Why: Users need actual settings functionality, not placeholders**

**Convex Schema Addition:**
```typescript
userSettings: defineTable({
  userId: v.id("users"),
  // Account
  language: v.optional(v.string()),
  region: v.optional(v.string()),
  notifications: v.optional(v.object({
    push: v.boolean(),
    email: v.boolean(),
    sms: v.boolean(),
  })),
  deactivatedAt: v.optional(v.number()),
  deleteRequestedAt: v.optional(v.number()),
  // Preferences
  interestedInGenders: v.optional(v.array(v.string())),
  ageMin: v.optional(v.number()),
  ageMax: v.optional(v.number()),
  distanceRadius: v.optional(v.number()), // miles
  incognitoMode: v.optional(v.boolean()),
  verifiedOnly: v.optional(v.boolean()),
  // Privacy
  profileVisibility: v.optional(v.union(v.literal("public"), v.literal("hidden"))),
  whoCanMessage: v.optional(v.union(v.literal("matches"), v.literal("everyone"))), // DEFAULT: matches
  locationPrecision: v.optional(v.union(v.literal("exact"), v.literal("city"), v.literal("hidden"))),
  profilePaused: v.optional(v.boolean()),
}).index("by_userId", ["userId"])
```

**Convex Queries/Mutations:**
- `getUserSettings` - Get current user's settings
- `updateUserSettings` - Update settings fields

**Settings Pages - Real Implementation:**

1. `/app/settings/account/page.tsx`
   - Email display (read-only from auth)
   - Password change form
   - Login methods (Google connected status)
   - Deactivate account button (with confirmation)
   - Delete account button (with confirmation, type "DELETE")

2. `/app/settings/preferences/page.tsx`
   - Gender preference: multi-select chips (Women, Men, Non-binary)
   - Age range: dual slider (18-100)
   - Distance: slider (5-500 miles)
   - "Verified Only" toggle
   - "Incognito Mode" toggle
   - All save to Convex

3. `/app/settings/privacy/page.tsx`
   - "Profile Visibility": Public / Hidden
   - "Who Can Message": Matches Only / Everyone
   - "Location Precision": Exact / City / Hidden
   - "Pause Profile": toggle (hides from discovery)
   - All save to Convex

4. `/app/settings/notifications/page.tsx` (ADD THIS)
   - Push notifications toggle
   - Email notifications toggle
   - SMS notifications toggle (future)

5. `/app/settings/support/page.tsx`
   - FAQs section (static content)
   - "Contact Support" - opens AI chat (Perplexity integration)
   - "Report a Bug" - form → Convex mutation (create support ticket)
   - "Community Guidelines" link

---

### Priority 5: Quiz System
**Why: AI matching based on quiz answers (voted #1 feature)**

**Reference: Copy from soulful-matches app (`convex/quiz.ts`)**

**Convex Schema:**
```typescript
quizAnswers: defineTable({
  userId: v.id("users"),
  questionId: v.string(),
  answer: v.any(),
  updatedAt: v.number(),
}).index("by_userId_and_questionId", ["userId", "questionId"])

quizUsers: defineTable({
  userId: v.id("users"),
  answersCount: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"])
```

**Quiz Packs:**
1. **Core Compatibility** (required for matching)
   - Relationship style (monogamy, ENM, open to discuss)
   - Do you want kids? (yes, no, unsure)
   - Substances (substance-free, sometimes, often)
   - Conflict style (talk now, cool off, avoid)
   - Spirituality importance (0-10 scale)
   - Interfaith comfort (yes, maybe, no)

2. **Same Path** (optional)
   - Which tradition (Christian, Catholic, Jewish, Muslim, Hindu, Buddhist, Sikh, Pagan, Spiritual, Other)
   - Community involvement (0-10 scale)
   - Must share tradition (must, prefer, no)

3. **Spiritual Compatibility** (optional)
   - Practices (prayer, meditation, yoga, scripture, nature, breathwork, service, ritual, journaling) - pick up to 3
   - Practice frequency (daily, weekly, monthly, rarely)
   - Shared practice desire (0-10 scale)
   - Growth mindset (0-10 scale)
   - Energy work (into it, open-minded, skeptical)

**Convex Functions:**
- `getDefinition` - Returns all packs and questions
- `getMyAnswers` - Returns user's answers
- `upsertMyAnswer` - Save/update an answer
- `clearMyAnswer` - Remove an answer
- `compatibilityWith` - Calculate compatibility % with another user
- `getMyProgress` - Quiz completion by pack

**UI: `/app/quiz/page.tsx`**
- Tab navigation: Core, Same Path, Spiritual
- Each question with appropriate input (single select, multi select, scale, text)
- Shows which questions are used for matching
- Progress indicator

---

### Priority 6: Wire Real Data to Discovery
**Why: Currently using fake placeholder data**

**Convex Queries Needed:**
- `listProfiles` - Returns profiles based on:
  - User's preferences (gender, age, distance)
  - Location filtering
  - Exclude already swiped/liked
  - Include demo profiles + real verified profiles
  - Sort by: For You (compatibility), Local, Global

- `swipeProfile` - Record a swipe (like/pass)
- `getCompatibility` - Get compatibility % with a profile

**Update `/app/page.tsx` and `/app/vibes/page.tsx`:**
- Replace hardcoded `PROFILES` array with Convex query
- Wire filters to Convex queries
- Wire like/pass buttons to Convex mutations
- Show real compatibility % from quiz answers

---

### Priority 7: Real Messaging System
**Why: Currently using fake placeholder data**

**Convex Schema Already Exists:**
- `threads` table
- `messages` table
- `chatRequests` table

**Need to Implement:**
- `createThread` - When both users like each other
- `sendMessage` - Add message to thread
- `getMessages` - Get messages for a thread
- `getThreads` - Get all user's threads with last message

**UI Updates:**
- `/app/messages/page.tsx` - Real thread list from Convex
- `/app/messages/[threadId]/page.tsx` - Real messages from Convex

---

### Priority 8: "How It Works" Page
**Why: Transparency on matching algorithm (user trust)**

**Page: `/app/how-it-works` AND `/how-it-works` (public)**

Content:
1. **Discovery**
   - We show you profiles based on your location and preferences
   - Demo profiles help populate your deck until real users join your area

2. **Matching**
   - You like someone, they like you back = it's a match
   - Messages only happen when both people like each other
   - No paywalls to send messages

3. **Quiz**
   - Answer questions about your values, lifestyle, and spirituality
   - We use your answers to calculate compatibility scores
   - The more you answer, the better your matches

4. **Verification**
   - Users can submit a selfie + ID for verification
   - Verified users get a badge
   - Helps reduce fake profiles and bots

5. **Demo Profiles**
   - We add fake profiles to ensure there's always someone in your city
   - Demo profiles send ONE first message after you like them
   - They don't continue conversations
   - Clearly marked in some way (or remove after launch)

---

### Priority 9: Premium/Upgrade System
**Why: Revenue generation with cheap impulse purchases**

**Pricing (decided):**
| Feature | Price |
|---------|-------|
| Super Likes (pack of 10) | $0.99 |
| Read Receipts | $0.99/month |
| Incognito Mode | $1.99/month |
| Profile Boost | $1.99/week |
| AI Compatibility Report | $1.99 (one-time per match) |

**Free Features:**
- Unlimited likes
- Unlimited matches
- Unlimited messages
- Basic quiz
- Basic discovery

**Convex Schema:**
```typescript
userUpgrades: defineTable({
  userId: v.id("users"),
  superLikes: v.number(),
  readReceiptsEnabled: v.boolean(),
  readReceiptsExpiresAt: v.optional(v.number()),
  incognitoEnabled: v.boolean(),
  incognitoExpiresAt: v.optional(v.number()),
  profileBoostedAt: v.optional(v.number()),
  profileBoostExpiresAt: v.optional(v.number()),
  purchasedAt: v.number(),
})

featureVotes: defineTable({
  userId: v.id("users"),
  feature: v.union(v.literal("profile_boost"), v.literal("incognito_mode"), v.literal("ai_compatibility"), v.literal("virtual_gifts"), v.literal("read_receipts")),
  createdAt: v.number(),
}).index("by_userId", ["userId"])
```

**UI: `/app/settings/upgrade/page.tsx`**
- Cards for each premium feature
- Price prominently displayed
- "Coming Soon" badge until Stripe connected

---

### Priority 10: Push Notifications
**Why: Re-engagement and real-time updates**

**Implementation:**
1. Service worker registration
2. Web Push VAPID keys in Convex
3. Push subscription storage
4. UI toggle in `/app/settings/notifications`

---

### Priority 11: PWA / Installable App
**Why: Mobile-first experience, add to home screen**

**Check if already configured:**
- `next-pwa` or similar
- `manifest.json`
- Service worker for offline

**If not configured, add:**
- PWA manifest with app icons
- Service worker for caching
- "Add to Home Screen" prompt

---

## DATA MODELS SUMMARY

### Existing Convex Tables
- `users` (auth built-in)
- `appUsers` (userId, name, email, role, createdAt)
- `profiles` (userId, name, age, gender, location, bio, photos, verificationStatus, etc.)
- `swipes` (userId, targetUserId, direction, createdAt)
- `matches` (userId, matchedUserId, createdAt)
- `threads` (userId, matchedUserId, createdAt)
- `messages` (threadId, senderId, body, createdAt)
- `chatRequests` (fromUserId, toUserId, status, createdAt)

### Missing Convex Tables to Add
1. `verificationRequests` - Verification queue
2. `userSettings` - Per-user settings
3. `quizAnswers` - Quiz answers
4. `quizUsers` - Quiz progress tracking
5. `userUpgrades` - Premium features
6. `featureVotes` - Feature poll votes
7. `presence` - Online status tracking (optional)
8. `notifications` - Push notification storage (optional)

---

## REFERENCE APP
`soulful-matches` at `/Users/ryanjordan/IdeaProjects/soulful-matches`

Contains working implementations of:
- Quiz system (Core, Same Path, Spiritual)
- Demo profile creator
- Admin dashboard (overview, users, detail)
- Email with Resend
- Compatibility scoring algorithm

---

## DOMAIN & SETUP
- Domain: alignedating.online
- Email: Resend configured in soulful-matches (copy setup)
- Convex deployment: `dev:watchful-cardinal-6`

---

## DEPLOYMENT NOTES
- `.env.local` contains `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT`
- `.env.local` is NOT committed to git (gitignored)
- Vercel needs `NEXT_PUBLIC_CONVEX_URL` set in environment variables
- Current build error: Missing Suspense boundary on `/auth` - FIXED

---

## CURRENT ISSUES
1. `/auth` page had useSearchParams without Suspense - FIXED
2. Vercel build needs `NEXT_PUBLIC_CONVEX_URL` env var set
3. All discovery/messaging/activity pages use fake placeholder data

---

## TESTING CHECKLIST
After each feature:
1. Feature works as expected
2. No TypeScript errors
3. No lint errors
4. Build succeeds
5. Tested on mobile viewport

---

## DECISIONS MADE
1. **Menu label**: "Privacy & Safety" (with ampersand)
2. **Distance units**: Miles (US-based app)
3. **"Who can message" default**: "Matches only"
4. **Premium pricing**: Super Likes $0.99/10pack, Read Receipts $0.99/mo, Incognito $1.99/mo, Boost $1.99/wk
5. **Demo profiles**: Send ONE message after user likes, then stop (no conversation continuation)
