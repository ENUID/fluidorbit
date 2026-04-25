import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new user (password is already hashed on the API side)
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    return await ctx.db.insert("users", {
      name: args.name.trim(),
      email: args.email.toLowerCase().trim(),
      passwordHash: args.passwordHash,
      createdAt: Date.now(),
    });
  },
});

// Get user by email (used by NextAuth CredentialsProvider)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
  },
});
