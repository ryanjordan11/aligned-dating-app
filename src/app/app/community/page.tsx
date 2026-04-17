"use client";

import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Camera,
  Globe,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { getProfileDraft } from "@/lib/profileDraft";
import {
  addCommunityComment,
  addReaction,
  createCommunityPost,
  deleteCommunityComment,
  deleteCommunityPost,
  getReactionCounts,
  getTotalReactionCount,
  getUserReaction,
  listCommunityPosts,
  removeReaction,
  toggleReaction,
  type CommunityComment,
  type CommunityPost,
  type ReactionType,
  updateCommunityComment,
  updateCommunityPost,
} from "@/lib/community";
import { getVerificationDraft } from "@/lib/verification";
import { useMounted } from "@/lib/useMounted";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
];

type ComposerState = {
  text: string;
  imageSrc: string;
  editPostId: string | null;
};

type EditingCommentState = {
  postId: string;
  commentId: string;
  text: string;
} | null;

function formatTimestamp(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const date = new Date(createdAt);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hour = date.getHours();
  const minutesStr = date.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${months[date.getMonth()]} ${date.getDate()} at ${hour12}:${minutesStr} ${ampm}`;
}

function compressImage(file: File, maxSize = 1600, quality = 0.84) {
  return new Promise<string>((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Canvas unavailable");

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };

    image.src = objectUrl;
  });
}

function currentAuthor() {
  const session = getSession();
  if (!session) {
    return {
      userId: "",
      name: "You",
      username: "@you",
      imageSrc: "/landing/profile-1.jpg",
      verified: false,
    };
  }

  const draft = getProfileDraft(session.userId);
  const verification = getVerificationDraft(session.userId);
  return {
    userId: session.userId,
    name: draft.name?.trim() || session.name || "You",
    username: session.username ? `@${session.username}` : "@you",
    imageSrc: draft.photoUrls[0] || "/landing/profile-1.jpg",
    verified: verification.status === "approved",
  };
}

function CommentRow({
  comment,
  isOwn,
  editing,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onChangeEditText,
  replies,
  onReply,
  replyingTo,
  onCancelReply,
  replyText,
  onChangeReplyText,
  onSubmitReply,
  isReply,
}: {
  comment: CommunityComment;
  isOwn: boolean;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onChangeEditText: (text: string) => void;
  replies?: CommunityComment[];
  onReply?: () => void;
  replyingTo?: string | null;
  onCancelReply?: () => void;
  replyText?: string;
  onChangeReplyText?: (text: string) => void;
  onSubmitReply?: () => void;
  isReply?: boolean;
}) {
  const author = currentAuthor();
  const isReplying = replyingTo === comment.id;

  return (
    <div className={isReply ? "ml-10 mt-2" : ""}>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="flex items-start gap-3">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image src={comment.authorImageSrc} alt="" fill className="object-cover" sizes="32px" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white/90">{comment.authorName}</p>
                <p className="text-[11px] text-white/45">{formatTimestamp(comment.createdAt)}</p>
              </div>
              {isOwn ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-full px-2 py-1 text-[11px] font-semibold text-white/55 hover:bg-white/10 hover:text-white/70"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-full px-2 py-1 text-[11px] font-semibold text-white/55 hover:bg-white/10 hover:text-white/70"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>

            {editing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={comment.text}
                  onChange={(e) => onChangeEditText(e.target.value)}
                  className="min-h-16 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    className="rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">{comment.text}</p>
            )}

            {!editing && onReply && (
              <button
                type="button"
                onClick={onReply}
                className="mt-1.5 text-xs font-semibold text-white/45 hover:text-white/70"
              >
                Reply
              </button>
            )}
          </div>
        </div>

        {isReplying && (
          <div className="mt-3 flex items-start gap-2">
            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <Image src={author.imageSrc} alt="" fill className="object-cover" sizes="24px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div className="flex items-center">
                  <textarea
                    value={replyText}
                    onChange={(e) => onChangeReplyText?.(e.target.value)}
                    placeholder={`Reply to ${comment.authorName.split(" ")[0]}...`}
                    className="min-h-9 w-full resize-none bg-transparent px-3 py-2 pr-16 text-sm text-white outline-none placeholder:text-white/45"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={!replyText?.trim()}
                    onClick={onSubmitReply}
                    className="mr-1.5 shrink-0 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reply
                  </button>
                </div>
              </div>
              {onCancelReply && (
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="mt-1 text-xs text-white/45 hover:text-white/70"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {replies && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              isOwn={reply.authorUserId === author.userId}
              editing={false}
              onEdit={() => {}}
              onDelete={() => {}}
              onSaveEdit={() => {}}
              onCancelEdit={() => {}}
              onChangeEditText={() => {}}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  isOwn,
  onEdit,
  onDelete,
  commentsOpen,
  onToggleComments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  editingComment,
  setEditingComment,
  onReactionChange,
  onAddReply,
}: {
  post: CommunityPost;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  commentsOpen: boolean;
  onToggleComments: () => void;
  onAddComment: (text: string) => void;
  onEditComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  editingComment: EditingCommentState;
  setEditingComment: (value: EditingCommentState) => void;
  onReactionChange: () => void;
  onAddReply: (parentId: string, text: string) => void;
}) {
  const [commentText, setCommentText] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const author = currentAuthor();
  const [menuOpen, setMenuOpen] = useState(false);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const reactionCounts = getReactionCounts(post.id);
  const totalReactions = getTotalReactionCount(post.id);
  const userReact = getUserReaction(post.id, author.userId);

  const displayReactions = REACTIONS.filter((r) => reactionCounts[r.type] > 0);

  const topLevelComments = post.comments.filter((c) => c.parentId === null);
  const commentCount = topLevelComments.length;
  const repliesMap = new Map<string, CommunityComment[]>();
  for (const comment of post.comments) {
    if (comment.parentId) {
      const existing = repliesMap.get(comment.parentId) || [];
      existing.push(comment);
      repliesMap.set(comment.parentId, existing);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image src={post.authorImageSrc} alt="" fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">{post.authorName}</p>
              {post.authorVerified && (
                <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <span>{post.authorUsername}</span>
              <span>·</span>
              <span>{formatTimestamp(post.createdAt)}</span>
              <span>·</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="More"
            onClick={() => setMenuOpen((cur) => !cur)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-xl border border-white/10 bg-black/95 shadow-2xl">
              {isOwn ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{post.text}</p>
      </div>

      {post.imageSrc ? (
        <div className="relative w-full">
          <div className="relative aspect-square w-full">
            <Image src={post.imageSrc} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-1">
          {displayReactions.slice(0, 3).map((r) => (
            <span key={r.type} className="-ml-1 first:ml-0">{r.emoji}</span>
          ))}
          {totalReactions > 0 && (
            <span className="ml-2 text-sm text-white/60">{totalReactions}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleComments}
          className="text-sm text-white/60 hover:text-white"
        >
          {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? "s" : ""}` : "Comment"}
        </button>
      </div>

      <div className="relative border-b border-white/10">
        <div className="flex">
          <div className="relative">
            <button
              ref={reactionButtonRef}
              type="button"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              onClick={() => {
                if (userReact) {
                  removeReaction(post.id, author.userId);
                  onReactionChange();
                } else {
                  addReaction(post.id, author.userId, "like");
                  onReactionChange();
                }
              }}
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/5"
            >
              {userReact ? (
                <span className="flex items-center gap-1.5">
                  <span>{REACTIONS.find((r) => r.type === userReact.reaction)?.emoji}</span>
                  <span className="text-blue-500">{REACTIONS.find((r) => r.type === userReact.reaction)?.label}</span>
                </span>
              ) : (
                <span className="text-white/70">👍 Like</span>
              )}
            </button>
            {showReactions && (
              <div
                className="absolute bottom-full left-0 z-30 mb-1 flex gap-1 rounded-full border border-white/20 bg-black/95 p-1.5 shadow-xl"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => {
                      toggleReaction(post.id, author.userId, r.type);
                      setShowReactions(false);
                      onReactionChange();
                    }}
                    className="group relative rounded-full p-1.5 transition hover:bg-white/10"
                    title={r.label}
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleComments}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/5"
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </button>
        </div>
      </div>

      {commentsOpen ? (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <Image src={author.imageSrc} alt="" fill className="object-cover" sizes="32px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div className="flex items-center">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-10 w-full resize-none bg-transparent px-4 py-2.5 pr-14 text-sm text-white outline-none placeholder:text-white/45"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                  />
                  <button
                    type="button"
                    disabled={!commentText.trim()}
                    onClick={() => {
                      onAddComment(commentText.trim());
                      setCommentText("");
                    }}
                    className="mr-2 shrink-0 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {topLevelComments.map((comment) => {
              const own = comment.authorUserId === author.userId;
              const isEditing = editingComment?.postId === post.id && editingComment.commentId === comment.id;
              const replies = repliesMap.get(comment.id) || [];
              return (
                <CommentRow
                  key={comment.id}
                  comment={isEditing ? { ...comment, text: editingComment?.text ?? comment.text } : comment}
                  isOwn={own}
                  editing={isEditing}
                  onEdit={() => setEditingComment({ postId: post.id, commentId: comment.id, text: comment.text })}
                  onDelete={() => onDeleteComment(comment.id)}
                  onSaveEdit={() => {
                    if (!editingComment) return;
                    onEditComment(comment.id, editingComment.text.trim());
                    setEditingComment(null);
                  }}
                  onCancelEdit={() => setEditingComment(null)}
                  onChangeEditText={(text) =>
                    setEditingComment(editingComment ? { ...editingComment, text } : null)
                  }
                  replies={replies}
                  onReply={() => setReplyingTo(comment.id)}
                  replyingTo={replyingTo}
                  onCancelReply={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                  replyText={replyText}
                  onChangeReplyText={setReplyText}
                  onSubmitReply={() => {
                    if (replyText.trim()) {
                      onAddReply(comment.id, replyText.trim());
                      setReplyText("");
                      setReplyingTo(null);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function CommunityPage() {
  const mounted = useMounted();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [composer, setComposer] = useState<ComposerState>({
    text: "",
    imageSrc: "",
    editPostId: null,
  });
  const [editingComment, setEditingComment] = useState<EditingCommentState>(null);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const author = currentAuthor();
  const visiblePosts = posts;

  const reload = () => {
    setPosts(listCommunityPosts());
  };

  useEffect(() => {
    if (!mounted) return;
    reload();
    const onStorage = () => reload();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  if (!mounted) return null;

  const handlePickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImage(file);
      setComposer((cur) => ({ ...cur, imageSrc: compressed }));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitPost = () => {
    if (!author.userId) return;
    if (!composer.text.trim()) return;

    if (composer.editPostId) {
      updateCommunityPost(composer.editPostId, {
        text: composer.text.trim(),
        imageSrc: composer.imageSrc || undefined,
      });
    } else {
      createCommunityPost({
        authorUserId: author.userId,
        authorName: author.name,
        authorUsername: author.username,
        authorImageSrc: author.imageSrc,
        authorVerified: author.verified,
        text: composer.text.trim(),
        imageSrc: composer.imageSrc || undefined,
      });
    }

    reload();
    setComposer({ text: "", imageSrc: "", editPostId: null });
  };

  const startEditPost = (post: CommunityPost) => {
    setComposer({
      text: post.text,
      imageSrc: post.imageSrc,
      editPostId: post.id,
    });
    setActiveCommentsPostId(null);
  };

  const deletePost = (postId: string) => {
    deleteCommunityPost(postId);
    if (composer.editPostId === postId) {
      setComposer({ text: "", imageSrc: "", editPostId: null });
    }
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
    }
    reload();
  };

  const addComment = (postId: string, text: string) => {
    if (!author.userId) return;
    addCommunityComment({
      postId,
      authorUserId: author.userId,
      authorName: author.name,
      authorImageSrc: author.imageSrc,
      text,
    });
    reload();
    setActiveCommentsPostId(postId);
  };

  const addReply = (postId: string, parentId: string, text: string) => {
    if (!author.userId) return;
    addCommunityComment({
      postId,
      parentId,
      authorUserId: author.userId,
      authorName: author.name,
      authorImageSrc: author.imageSrc,
      text,
    });
    reload();
    setActiveCommentsPostId(postId);
  };

  const editComment = (postId: string, commentId: string, text: string) => {
    updateCommunityComment(postId, commentId, text);
    reload();
  };

  const removeComment = (postId: string, commentId: string) => {
    deleteCommunityComment(postId, commentId);
    if (editingComment?.commentId === commentId) {
      setEditingComment(null);
    }
    reload();
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">Community</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Feed</h1>
          <p className="mt-2 text-sm text-white/55">Post images, write updates, and comment inline.</p>
        </div>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image src={author.imageSrc} alt="" fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={composer.text}
              onChange={(e) => setComposer((cur) => ({ ...cur, text: e.target.value }))}
              placeholder={`What's on your mind, ${author.name.split(" ")[0]}?`}
              className="min-h-16 w-full resize-none bg-transparent text-[15px] text-white outline-none placeholder:text-white/45"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            {composer.imageSrc && (
              <div className="relative mt-3 overflow-hidden rounded-xl">
                <div className="relative aspect-video w-full">
                  <Image src={composer.imageSrc} alt="Selected image preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setComposer((cur) => ({ ...cur, imageSrc: "" }))}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white/80 transition hover:bg-black/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
            >
              <Camera className="h-5 w-5" />
              <span>Photo</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleSubmitPost}
            disabled={busy || !composer.text.trim()}
            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {composer.editPostId ? "Save" : "Post"}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePickImage}
        />
      </section>

      <div className="space-y-4">
        {visiblePosts.map((post) => {
          const isOwn = post.authorUserId === author.userId;
          const commentsOpen = activeCommentsPostId === post.id;
          return (
            <PostCard
              key={post.id}
              post={post}
              isOwn={isOwn}
              onEdit={() => startEditPost(post)}
              onDelete={() => deletePost(post.id)}
              commentsOpen={commentsOpen}
              onToggleComments={() =>
                setActiveCommentsPostId((cur) => (cur === post.id ? null : post.id))
              }
              onAddComment={(text) => addComment(post.id, text)}
              onEditComment={(commentId, text) => editComment(post.id, commentId, text)}
              onDeleteComment={(commentId) => removeComment(post.id, commentId)}
              editingComment={editingComment}
              setEditingComment={setEditingComment}
              onReactionChange={reload}
              onAddReply={(parentId, text) => addReply(post.id, parentId, text)}
            />
          );
        })}
      </div>
    </div>
  );
}
