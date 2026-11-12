import { useState } from 'react';
import { Heart, Reply, Trash2, ShieldCheck, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { addComment, deleteComment, toggleCommentLike } from '../lib/news';
import type { CommentLike, PostComment, PublicProfile } from '../types/database';

interface PostCommentsProps {
  postId: string;
  comments: PostComment[];
  commentLikes: CommentLike[];
  profiles: Record<string, PublicProfile>;
  currentUserId: string | null;
  isAdmin: boolean;
  onChanged: () => void;
}

function displayName(profile: PublicProfile | undefined): string {
  return profile?.display_name?.trim() || 'Usuario';
}

function initials(profile: PublicProfile | undefined): string {
  const name = displayName(profile);
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

function timeAgo(value: string, ): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;

  return new Date(value).toLocaleDateString('es-NI');
}

export function PostComments({
  postId,
  comments,
  commentLikes,
  profiles,
  currentUserId,
  isAdmin,
  onChanged,
}: PostCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const likesFor = (commentId: string) =>
    commentLikes.filter((like) => like.comment_id === commentId);

  const send = async (body: string, parentId: string | null) => {
    if (!currentUserId) {
      toast.info('Inicia sesión para comentar');
      return;
    }

    if (!body.trim()) return;

    setIsSending(true);

    try {
      await addComment({ postId, userId: currentUserId, body, parentId });
      setNewComment('');
      setReplyText('');
      setReplyingTo(null);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo enviar el comentario');
    } finally {
      setIsSending(false);
    }
  };

  const like = async (comment: PostComment) => {
    if (!currentUserId) {
      toast.info('Inicia sesión para dar like');
      return;
    }

    const liked = likesFor(comment.id).some((item) => item.user_id === currentUserId);

    try {
      await toggleCommentLike(comment.id, currentUserId, liked);
      onChanged();
    } catch {
      toast.error('No se pudo guardar el like');
    }
  };

  const remove = async (comment: PostComment) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    try {
      await deleteComment(comment.id);
      onChanged();
    } catch {
      toast.error('No se pudo eliminar el comentario');
    }
  };

  const renderComment = (comment: PostComment, isReply = false) => {
    const profile = profiles[comment.user_id];
    const likes = likesFor(comment.id);
    const likedByMe = Boolean(currentUserId && likes.some((like) => like.user_id === currentUserId));
    const canDelete = Boolean(currentUserId) && (currentUserId === comment.user_id || isAdmin);

    return (
      <div
        key={comment.id}
        className={[
          'rounded-xl border p-3',
          isReply ? 'ml-8 mt-2 border-slate-100 bg-slate-50/60' : 'border-slate-200 bg-white',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
              {initials(profile)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-900">{displayName(profile)}</span>
              {profile?.is_admin && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
                  title="Administrador de Gatotaku"
                >
                  <ShieldCheck size={9} aria-hidden="true" />
                  Admin
                </span>
              )}
              {profile?.favorite_anime && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {profile.favorite_anime}
                </span>
              )}
              <span className="text-[11px] text-slate-400">{timeAgo(comment.created_at)}</span>
            </div>

            <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-700">
              {comment.body}
            </p>

            <div className="mt-1.5 flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => void like(comment)}
                className={[
                  'inline-flex items-center gap-1 font-semibold transition',
                  likedByMe ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600',
                ].join(' ')}
                aria-pressed={likedByMe}
              >
                <Heart size={13} className={likedByMe ? 'fill-rose-600' : ''} aria-hidden="true" />
                {likes.length > 0 ? likes.length : 'Me gusta'}
              </button>

              {!isReply && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyText('');
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-slate-500 transition hover:text-teal-700"
                >
                  <Reply size={13} aria-hidden="true" />
                  Responder
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => void remove(comment)}
                  className="inline-flex items-center gap-1 font-semibold text-slate-400 transition hover:text-red-600"
                >
                  <Trash2 size={12} aria-hidden="true" />
                  Eliminar
                </button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void send(replyText, comment.id);
                    }
                  }}
                  className="field"
                  placeholder="Responder..."
                  aria-label={`Responder a ${displayName(profile)}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => void send(replyText, comment.id)}
                  disabled={isSending || !replyText.trim()}
                  className="btn-primary shrink-0"
                >
                  <Send size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const roots = comments.filter((comment) => !comment.parent_id);

  return (
    <section className="mt-5">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Comentarios ({comments.length})
      </h3>

      {currentUserId ? (
        <div className="mb-4 flex gap-2">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            rows={2}
            className="field"
            placeholder="Escribe un comentario..."
            aria-label="Escribe un comentario"
          />
          <button
            type="button"
            onClick={() => void send(newComment, null)}
            disabled={isSending || !newComment.trim()}
            className="btn-primary shrink-0 self-end"
          >
            <Send size={15} aria-hidden="true" />
            Enviar
          </button>
        </div>
      ) : (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Inicia sesión para comentar y dar like.
        </p>
      )}

      {roots.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay comentarios. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-3">
          {roots.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
              {comments
                .filter((reply) => reply.parent_id === comment.id)
                .map((reply) => renderComment(reply, true))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PostComments;
