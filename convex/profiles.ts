import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const upsertFromOnboarding = mutation({
  args: {
    name: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("non-binary")),
    birthDate: v.string(), // "YYYY-MM-DD"
    location: v.string(),
    photoId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!appUser) throw new Error("User record not found");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", appUser._id))
      .unique();

    const patch = {
      name: args.name,
      gender: args.gender,
      birthDate: args.birthDate,
      currentCity: args.location,
      primaryPhotoId: args.photoId,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return null;
    }

    await ctx.db.insert("profiles", {
      userId: appUser._id,

      name: args.name,
      gender: args.gender,
      birthDate: args.birthDate,
      bio: "",

      relationshipGoal: "",
      sunSign: "",
      mbti: "",

      hasChildren: "",
      wantsChildren: "",
      everMarried: "",
      currentlyMarried: "",
      vaccinationStatus: "",

      practices: [],
      morningRitual: "",
      manifesting: "",
      reflection: "",

      backgroundPhotoUrl: "",
      currentCity: args.location,
      currentCountryCode: "",

      primaryPhotoId: args.photoId,
      photoUrls: [],

      preferences: {
        gender: "any",
        minAge: 21,
        maxAge: 55,
        radius: 30,
      },

      updatedAt: Date.now(),
    });

    return null;
  },
});

export const me = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      name: v.string(),
      gender: v.union(v.literal("male"), v.literal("female"), v.literal("non-binary")),
      birthDate: v.string(),
      currentCity: v.string(),
      primaryPhotoUrl: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!appUser) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", appUser._id))
      .unique();
    if (!profile) return null;

    const primaryPhotoUrl = profile.primaryPhotoId
      ? await ctx.storage.getUrl(profile.primaryPhotoId)
      : null;

    return {
      name: profile.name,
      gender: profile.gender,
      birthDate: profile.birthDate,
      currentCity: profile.currentCity,
      primaryPhotoUrl,
    };
  },
});

