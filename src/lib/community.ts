"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export type CommunityReaction = {
  id: string;
  postId: string;
  userId: string;
  reaction: ReactionType;
};

export type CommunityComment = {
  id: string;
  postId: string;
  parentId: string | null;
  authorUserId: string;
  authorName: string;
  authorImageSrc: string;
  text: string;
  createdAt: number;
};

export type CommunityPost = {
  id: string;
  authorUserId: string;
  authorName: string;
  authorUsername: string;
  authorImageSrc: string;
  authorVerified: boolean;
  createdAt: number;
  text: string;
  imageSrc: string;
  tags: string[];
  comments: CommunityComment[];
};

type Store = {
  posts: CommunityPost[];
  reactions: CommunityReaction[];
};

const KEY = "aligned_community_v0";

const SEED_REACTIONS: CommunityReaction[] = [
  { id: "r1", postId: "c1", userId: "seed-2", reaction: "love" },
  { id: "r2", postId: "c1", userId: "seed-3", reaction: "like" },
  { id: "r3", postId: "c2", userId: "seed-1", reaction: "haha" },
  { id: "r4", postId: "c3", userId: "seed-1", reaction: "love" },
  { id: "r5", postId: "c3", userId: "seed-2", reaction: "wow" },
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: "c1",
    authorUserId: "seed-1",
    authorName: "Isabella",
    authorUsername: "@isabella",
    authorImageSrc: "/landing/profile-1.jpg",
    authorVerified: true,
    createdAt: Date.now() - 1000 * 60 * 10,
    text: "Today I'm choosing more silence, less noise, and better boundaries. Grateful for the people building with intention.",
    imageSrc: "/landing/profile-1.jpg",
    tags: ["Meditation", "Intentional", "Growth"],
    comments: [
      {
        id: "cm1",
        postId: "c1",
        parentId: null,
        authorUserId: "seed-2",
        authorName: "Savannah",
        authorImageSrc: "/landing/profile-2.jpg",
        text: "This resonates so much. Boundaries are self-respect.",
        createdAt: Date.now() - 1000 * 60 * 5,
      },
      {
        id: "cm1r1",
        postId: "c1",
        parentId: "cm1",
        authorUserId: "seed-1",
        authorName: "Isabella",
        authorImageSrc: "/landing/profile-1.jpg",
        text: "Exactly! It's been a journey but I'm getting better at it.",
        createdAt: Date.now() - 1000 * 60 * 3,
      },
      {
        id: "cm1r2",
        postId: "c1",
        parentId: "cm1",
        authorUserId: "seed-3",
        authorName: "Olivia",
        authorImageSrc: "/landing/profile-3.jpg",
        text: "Would love to hear more about your practice",
        createdAt: Date.now() - 1000 * 60 * 2,
      },
    ],
  },
  {
    id: "c2",
    authorUserId: "seed-2",
    authorName: "Savannah",
    authorUsername: "@savannah",
    authorImageSrc: "/landing/profile-2.jpg",
    authorVerified: true,
    createdAt: Date.now() - 1000 * 60 * 60,
    text: "Shared a long walk, some breathwork, and a really honest conversation. This is the energy I want more of.",
    imageSrc: "",
    tags: ["Breathwork", "Honesty", "Connection"],
    comments: [],
  },
  {
    id: "c3",
    authorUserId: "seed-3",
    authorName: "Olivia",
    authorUsername: "@olivia",
    authorImageSrc: "/landing/profile-3.jpg",
    authorVerified: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    text: "Manifesting softer mornings, stronger habits, and people who mean what they say.",
    imageSrc: "/landing/profile-3.jpg",
    tags: ["Manifesting", "Rituals", "Alignment"],
    comments: [
      {
        id: "cm2",
        postId: "c3",
        parentId: null,
        authorUserId: "seed-1",
        authorName: "Isabella",
        authorImageSrc: "/landing/profile-1.jpg",
        text: "Manifesting this with you!",
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
      },
    ],
  },
];

function seedStore(): Store {
  return { posts: SEED_POSTS, reactions: SEED_REACTIONS };
}

function readStore(): Store {
  return lsGetJson<Store>(KEY, seedStore());
}

function writeStore(store: Store) {
  lsSetJson(KEY, store);
}

export function listCommunityPosts(): CommunityPost[] {
  return readStore().posts;
}

export function getCommunityPost(postId: string): CommunityPost | null {
  return listCommunityPosts().find((post) => post.id === postId) ?? null;
}

export function createCommunityPost(input: {
  authorUserId: string;
  authorName: string;
  authorUsername: string;
  authorImageSrc: string;
  authorVerified: boolean;
  text: string;
  imageSrc?: string;
}): CommunityPost {
  const store = readStore();
  const post: CommunityPost = {
    id: crypto.randomUUID(),
    authorUserId: input.authorUserId,
    authorName: input.authorName,
    authorUsername: input.authorUsername,
    authorImageSrc: input.authorImageSrc,
    authorVerified: input.authorVerified,
    createdAt: Date.now(),
    text: input.text,
    imageSrc: input.imageSrc ?? "",
    tags: [],
    comments: [],
  };
  store.posts.unshift(post);
  writeStore(store);
  return post;
}

export function updateCommunityPost(
  postId: string,
  input: { text: string; imageSrc?: string },
): CommunityPost | null {
  const store = readStore();
  const idx = store.posts.findIndex((post) => post.id === postId);
  if (idx < 0) return null;
  store.posts[idx] = {
    ...store.posts[idx],
    text: input.text,
    imageSrc: input.imageSrc ?? store.posts[idx].imageSrc,
  };
  writeStore(store);
  return store.posts[idx];
}

export function deleteCommunityPost(postId: string): boolean {
  const store = readStore();
  const next = store.posts.filter((post) => post.id !== postId);
  if (next.length === store.posts.length) return false;
  store.posts = next;
  writeStore(store);
  return true;
}

export function addCommunityComment(input: {
  postId: string;
  parentId?: string | null;
  authorUserId: string;
  authorName: string;
  authorImageSrc: string;
  text: string;
}): CommunityComment | null {
  const store = readStore();
  const post = store.posts.find((item) => item.id === input.postId);
  if (!post) return null;
  const comment: CommunityComment = {
    id: crypto.randomUUID(),
    postId: input.postId,
    parentId: input.parentId ?? null,
    authorUserId: input.authorUserId,
    authorName: input.authorName,
    authorImageSrc: input.authorImageSrc,
    text: input.text,
    createdAt: Date.now(),
  };
  post.comments.unshift(comment);
  writeStore(store);
  return comment;
}

export function updateCommunityComment(
  postId: string,
  commentId: string,
  text: string,
): CommunityComment | null {
  const store = readStore();
  const post = store.posts.find((item) => item.id === postId);
  if (!post) return null;
  const comment = post.comments.find((item) => item.id === commentId);
  if (!comment) return null;
  comment.text = text;
  comment.createdAt = Date.now();
  writeStore(store);
  return comment;
}

export function deleteCommunityComment(postId: string, commentId: string): boolean {
  const store = readStore();
  const post = store.posts.find((item) => item.id === postId);
  if (!post) return false;
  const next = post.comments.filter((item) => item.id !== commentId);
  if (next.length === post.comments.length) return false;
  post.comments = next;
  writeStore(store);
  return true;
}

export function listReactions(postId: string): CommunityReaction[] {
  return readStore().reactions.filter((r) => r.postId === postId);
}

export function getUserReaction(postId: string, userId: string): CommunityReaction | null {
  return readStore().reactions.find((r) => r.postId === postId && r.userId === userId) ?? null;
}

export function getReactionCounts(postId: string): Record<ReactionType, number> {
  const counts: Record<ReactionType, number> = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  for (const r of listReactions(postId)) {
    counts[r.reaction]++;
  }
  return counts;
}

export function getTotalReactionCount(postId: string): number {
  return listReactions(postId).length;
}

export function addReaction(postId: string, userId: string, reaction: ReactionType): CommunityReaction {
  const store = readStore();
  const existing = store.reactions.find((r) => r.postId === postId && r.userId === userId);
  if (existing) {
    existing.reaction = reaction;
    writeStore(store);
    return existing;
  }
  const newReaction: CommunityReaction = {
    id: crypto.randomUUID(),
    postId,
    userId,
    reaction,
  };
  store.reactions.push(newReaction);
  writeStore(store);
  return newReaction;
}

export function removeReaction(postId: string, userId: string): boolean {
  const store = readStore();
  const idx = store.reactions.findIndex((r) => r.postId === postId && r.userId === userId);
  if (idx < 0) return false;
  store.reactions.splice(idx, 1);
  writeStore(store);
  return true;
}

export function toggleReaction(postId: string, userId: string, reaction: ReactionType): "added" | "removed" | "changed" {
  const store = readStore();
  const existing = store.reactions.find((r) => r.postId === postId && r.userId === userId);
  if (existing) {
    if (existing.reaction === reaction) {
      store.reactions = store.reactions.filter((r) => r.id !== existing.id);
      writeStore(store);
      return "removed";
    } else {
      existing.reaction = reaction;
      writeStore(store);
      return "changed";
    }
  }
  store.reactions.push({ id: crypto.randomUUID(), postId, userId, reaction });
  writeStore(store);
  return "added";
}
