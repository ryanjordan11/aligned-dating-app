"use client";

import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Camera,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { getProfileDraft } from "@/lib/profileDraft";
import {
  addCommunityComment,
  createCommunityPost,
  deleteCommunityComment,
  deleteCommunityPost,
  listCommunityPosts,
  updateCommunityComment,
  updateCommunityPost,
  type CommunityComment,
  type CommunityPost,
} from "@/lib/community";
import { getVerificationDraft } from "@/lib/verification";
import { useMounted } from "@/lib/useMounted";

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

function formatTimeAgo(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
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
}: {
  comment: CommunityComment;
  isOwn: boolean;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onChangeEditText: (text: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <Image src={comment.authorImageSrc} alt="" fill className="object-cover" sizes="40px" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/90">{comment.authorName}</p>
              <p className="text-[11px] text-white/45">{formatTimeAgo(comment.createdAt)}</p>
            </div>
            {isOwn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/10"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>

          {editing ? (
            <div className="mt-3 space-y-3">
              <textarea
                value={comment.text}
                onChange={(e) => onChangeEditText(e.target.value)}
                className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-white/80">{comment.text}</p>
          )}
        </div>
      </div>
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
}) {
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const author = currentAuthor();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image src={post.authorImageSrc} alt="" fill className="object-cover" sizes="48px" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">{post.authorName}</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                {post.authorVerified ? "Verified" : "Unverified"}
              </span>
            </div>
            <p className="truncate text-xs text-white/45">
              {post.authorUsername} · {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="More"
            onClick={() => setMenuOpen((cur) => !cur)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-2xl">
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
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

      <div className="px-4 py-4">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
          <div className="relative aspect-[4/3] w-full">
            <Image src={post.imageSrc} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/82">{post.text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.length ? (
            post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/70">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-sm text-white/45">No tags added</span>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="grid grid-cols-3">
          <button
            type="button"
            onClick={() => setLiked((cur) => !cur)}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              liked ? "bg-rose-500/15 text-rose-300" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-rose-400 text-rose-400" : ""}`} />
            Like
          </button>
          <button
            type="button"
            onClick={onToggleComments}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              commentsOpen ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </button>
          <button
            type="button"
            onClick={() => setSaved((cur) => !cur)}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              saved ? "bg-emerald-500/15 text-emerald-300" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-emerald-400 text-emerald-400" : ""}`} />
            Save
          </button>
        </div>

        {commentsOpen ? (
          <div className="border-t border-white/10 p-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-start gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <Image src={author.imageSrc} alt="" fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0 flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-white/45">Commenting as {author.name}</p>
                    <button
                      type="button"
                      disabled={!commentText.trim()}
                      onClick={() => {
                        onAddComment(commentText.trim());
                        setCommentText("");
                      }}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Post comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {post.comments.length ? (
                post.comments.map((comment) => {
                  const own = comment.authorUserId === author.userId;
                  const isEditing = editingComment?.postId === post.id && editingComment.commentId === comment.id;
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
                    />
                  );
                })
              ) : (
                <p className="text-sm text-white/45">No comments yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
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

  const reload = () => setPosts(listCommunityPosts());

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
    if (!composer.text.trim() || !composer.imageSrc) return;

    if (composer.editPostId) {
      updateCommunityPost(composer.editPostId, {
        text: composer.text.trim(),
        imageSrc: composer.imageSrc,
      });
    } else {
      createCommunityPost({
        authorUserId: author.userId,
        authorName: author.name,
        authorUsername: author.username,
        authorImageSrc: author.imageSrc,
        authorVerified: author.verified,
        text: composer.text.trim(),
        imageSrc: composer.imageSrc,
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

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <Sparkles className="h-5 w-5 text-white/75" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Share what’s alive for you</p>
            <p className="text-xs text-white/45">Reflections, rituals, events, and aligned conversations.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{composer.editPostId ? "Edit post" : "Create post"}</p>
            <p className="text-xs text-white/45">Add an image and a caption.</p>
          </div>
          {composer.editPostId ? (
            <button
              type="button"
              onClick={() => setComposer({ text: "", imageSrc: "", editPostId: null })}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <textarea
              value={composer.text}
              onChange={(e) => setComposer((cur) => ({ ...cur, text: e.target.value }))}
              placeholder="Write your post..."
              className="min-h-40 w-full resize-none rounded-[24px] border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none placeholder:text-white/35"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                <Camera className="h-4 w-4" />
                {composer.imageSrc ? "Change image" : "Add image"}
              </button>
              {composer.imageSrc ? (
                <button
                  type="button"
                  onClick={() => setComposer((cur) => ({ ...cur, imageSrc: "" }))}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
                >
                  Remove image
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSubmitPost}
                disabled={busy || !composer.text.trim() || !composer.imageSrc}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {composer.editPostId ? "Save changes" : "Post"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickImage}
            />
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/25">
              {composer.imageSrc ? (
                <div className="relative aspect-[4/5] w-full">
                  <Image src={composer.imageSrc} alt="Selected image preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="grid aspect-[4/5] place-items-center px-6 text-center text-sm text-white/45">
                  Upload an image to preview it here.
                </div>
              )}
            </div>
          </div>
        </div>
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
            />
          );
        })}
      </div>
    </div>
  );
}
