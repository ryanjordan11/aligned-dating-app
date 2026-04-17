import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  appUsers: defineTable({
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    username: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("support"),
      v.literal("moderator"),
      v.literal("admin"),
      v.literal("superadmin"),
    ),
    createdAt: v.number(),
    onboardedAt: v.optional(v.number()),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_role", ["role"]),

  profiles: defineTable({
    userId: v.id("appUsers"),

    name: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("non-binary")),
    birthDate: v.string(), // ISO date string "YYYY-MM-DD"
    bio: v.string(),

    relationshipGoal: v.union(
      v.literal(""),
      v.literal("friends"),
      v.literal("marriage"),
      v.literal("long_term"),
      v.literal("short_term"),
      v.literal("just_looking"),
    ),
    sunSign: v.string(),
    mbti: v.string(),

    hasChildren: v.union(v.boolean(), v.literal("")),
    wantsChildren: v.union(v.literal(""), v.literal("yes"), v.literal("no"), v.literal("unsure")),
    everMarried: v.union(v.boolean(), v.literal("")),
    currentlyMarried: v.union(v.boolean(), v.literal("")),
    vaccinationStatus: v.union(
      v.literal(""),
      v.literal("vax_free"),
      v.literal("vaccinated"),
      v.literal("prefer_not_to_say"),
    ),

    practices: v.array(v.string()),
    morningRitual: v.string(),
    manifesting: v.string(),
    reflection: v.string(),

    backgroundPhotoUrl: v.string(),
    currentCity: v.string(),
    currentCountryCode: v.string(),

    // Primary profile photo stored in Convex file storage.
    primaryPhotoId: v.optional(v.id("_storage")),
    photoUrls: v.array(v.string()),

    preferences: v.object({
      gender: v.union(v.literal("any"), v.literal("male"), v.literal("female"), v.literal("non-binary")),
      minAge: v.number(),
      maxAge: v.number(),
      radius: v.number(),
    }),

    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  swipes: defineTable({
    fromUserId: v.id("appUsers"),
    toUserId: v.id("appUsers"),
    action: v.union(v.literal("left"), v.literal("right"), v.literal("super")),
    createdAt: v.number(),
  })
    .index("by_from_createdAt", ["fromUserId", "createdAt"])
    .index("by_to_createdAt", ["toUserId", "createdAt"])
    .index("by_pair", ["fromUserId", "toUserId"]),

  matches: defineTable({
    // Deterministic key (e.g. `${minUserId}:${maxUserId}`) to enforce one match per pair.
    pairKey: v.string(),
    user1Id: v.id("appUsers"),
    user2Id: v.id("appUsers"),
    createdAt: v.number(),
  })
    .index("by_pairKey", ["pairKey"])
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"]),

  threads: defineTable({
    matchId: v.optional(v.id("matches")),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  threadMembers: defineTable({
    threadId: v.id("threads"),
    userId: v.id("appUsers"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_threadId", ["threadId"])
    .index("by_thread_user", ["threadId", "userId"]),

  messages: defineTable({
    threadId: v.id("threads"),
    senderUserId: v.id("appUsers"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_thread_createdAt", ["threadId", "createdAt"]),

  chatRequests: defineTable({
    fromUserId: v.id("appUsers"),
    toUserId: v.id("appUsers"),
    note: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_to_status", ["toUserId", "status"])
    .index("by_from_status", ["fromUserId", "status"])
    .index("by_from_to", ["fromUserId", "toUserId"]),
});
