"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

export type CommunityComment = {
  id: string;
  postId: string;
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
};

const KEY = "aligned_community_v0";

const SEED_POSTS: CommunityPost[] = [
  {
    id: "c1",
    authorUserId: "seed-1",
    authorName: "Isabella",
    authorUsername: "@isabella",
    authorImageSrc: "/landing/profile-1.jpg",
    authorVerified: true,
    createdAt: Date.now() - 1000 * 60 * 10,
    text: "Today I’m choosing more silence, less noise, and better boundaries. Grateful for the people building with intention.",
    imageSrc: "/landing/profile-1.jpg",
    tags: ["Meditation", "Intentional", "Growth"],
    comments: [],
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
    imageSrc: "/landing/profile-2.jpg",
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
    comments: [],
  },
];

function seedStore(): Store {
  return { posts: SEED_POSTS };
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
  imageSrc: string;
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
    imageSrc: input.imageSrc,
    tags: [],
    comments: [],
  };
  store.posts.unshift(post);
  writeStore(store);
  return post;
}

export function updateCommunityPost(
  postId: string,
  input: { text: string; imageSrc: string },
): CommunityPost | null {
  const store = readStore();
  const idx = store.posts.findIndex((post) => post.id === postId);
  if (idx < 0) return null;
  store.posts[idx] = {
    ...store.posts[idx],
    text: input.text,
    imageSrc: input.imageSrc,
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
