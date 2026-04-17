import { mutation, query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("appUsers")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});

export const upsertFromIdentity = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const name = (identity.name ?? identity.email ?? "User").toString();
    const email = identity.email?.toString();
    const usernameSeed = email ? email.split("@")[0] : identity.subject;
    const username = `u_${usernameSeed.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24) || "user"}`;

    const existing = await ctx.db
      .query("appUsers")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name,
        username,
      });
      return {
        tokenIdentifier: existing.tokenIdentifier,
        email,
        name,
        username,
        role: existing.role,
        onboardedAt: existing.onboardedAt,
      };
    }

    await ctx.db.insert("appUsers", {
      tokenIdentifier: identity.tokenIdentifier,
      email,
      name,
      username,
      role: "user",
      createdAt: Date.now(),
      onboardedAt: undefined,
    });

    return {
      tokenIdentifier: identity.tokenIdentifier,
      email,
      name,
      username,
      role: "user" as const,
      onboardedAt: undefined,
    };
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("appUsers")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!existing) throw new Error("User record not found");

    const now = Date.now();
    if (!existing.onboardedAt) {
      await ctx.db.patch(existing._id, { onboardedAt: now });
    }
    return now;
  },
});
