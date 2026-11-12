import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Newspaper } from 'lucide-react';
import { toast } from 'react-toastify';
import { SEO } from '../components/SEO';
import { PostComments } from '../components/PostComments';
import { useAuth } from '../context/AuthContext';
import { fetchEngagement, fetchNews, togglePostLike, type PostEngagement } from '../lib/news';
import type { NewsPost } from '../types/database';

const EMPTY_ENGAGEMENT: PostEngagement = {
  postLikes: [],
  comments: [],
  commentLikes: [],
  profiles: {},
};

export default function NewsPage() {
  const { session, isAdmin } = useAuth();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [engagement, setEngagement] = useState<PostEngagement>(EMPTY_ENGAGEMENT);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchNews();
      setPosts(data);
      setEngagement(data.length ? await fetchEngagement(data.map((post) => post.id)) : EMPTY_ENGAGEMENT);
    } catch {
      toast.error('No se pudieron cargar las novedades');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const likeCount = (postId: string) =>
    engagement.postLikes.filter((like) => like.post_id === postId).length;

  const commentCount = (postId: string) =>
    engagement.comments.filter((comment) => comment.post_id === postId).length;

  const likedByMe = (postId: string) =>
    Boolean(
      session && engagement.postLikes.some((like) => like.post_id === postId && like.user_id === session.user.id),
    );

  const handleLike = async (post: NewsPost) => {
    if (!session) {
      toast.info('Inicia sesión para dar like');
      return;
    }

    try {
      await togglePostLike(post.id, session.user.id, likedByMe(post.id));
      await load();
    } catch {
      toast.error('No se pudo guardar el like');
    }
  };

  const selected = selectedId ? posts.find((post) => post.id === selectedId) ?? null : null;

  const selectedComments = useMemo(
    () => (selected ? engagement.comments.filter((comment) => comment.post_id === selected.id) : []),
    [engagement.comments, selected],
  );

  const openPost = (postId: string) => {
    setSelectedId(postId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Cargando novedades...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <SEO
        title="Novedades - Gatotaku"
        description="Noticias, nuevos productos y promociones de Gatotaku."
      />

      {selected ? (
        /* ---------------------------- Detalle ---------------------------- */
        <article className="panel overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Todas las novedades
            </button>
          </div>

          {selected.image_url && (
            <img
              src={selected.image_url}
              alt={selected.title}
              className="max-h-[420px] w-full bg-slate-100 object-cover"
            />
          )}

          <div className="p-4 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
              {new Date(selected.published_at).toLocaleDateString('es-NI', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{selected.title}</h1>

            {selected.excerpt && (
              <p className="mt-2 text-sm font-medium text-slate-500">{selected.excerpt}</p>
            )}

            <div className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">
              {selected.body}
            </div>

            <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => void handleLike(selected)}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                  likedByMe(selected.id)
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600',
                ].join(' ')}
                aria-pressed={likedByMe(selected.id)}
                aria-label={`Me gusta ${selected.title}`}
              >
                <Heart size={16} className={likedByMe(selected.id) ? 'fill-rose-600' : ''} aria-hidden="true" />
                {likeCount(selected.id)}
              </button>

              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <MessageCircle size={16} aria-hidden="true" />
                {selectedComments.length} comentario(s)
              </span>
            </div>

            <PostComments
              postId={selected.id}
              comments={selectedComments}
              commentLikes={engagement.commentLikes}
              profiles={engagement.profiles}
              currentUserId={session?.user.id ?? null}
              isAdmin={isAdmin}
              onChanged={() => void load()}
            />
          </div>
        </article>
      ) : (
        /* ----------------------------- Lista ----------------------------- */
        <>
          <div className="mb-4 flex items-center gap-2">
            <Newspaper className="text-teal-600" size={22} aria-hidden="true" />
            <h1 className="section-title">Novedades</h1>
          </div>

          {posts.length === 0 ? (
            <div className="panel p-8 text-center">
              <Newspaper className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-700">Muy pronto</p>
              <p className="mt-1 text-sm text-slate-500">
                Aquí publicaremos noticias, nuevos productos y promociones.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openPost(post.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openPost(post.id);
                    }
                  }}
                  aria-label={`Leer ${post.title}`}
                  className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-200 sm:gap-4"
                >
                  <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-32 sm:w-44">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Newspaper size={30} aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                    )}

                    <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleLike(post);
                        }}
                        className={[
                          'inline-flex items-center gap-1 font-semibold transition',
                          likedByMe(post.id) ? 'text-rose-600' : 'hover:text-rose-600',
                        ].join(' ')}
                        aria-pressed={likedByMe(post.id)}
                        aria-label={`Me gusta ${post.title}`}
                      >
                        <Heart size={13} className={likedByMe(post.id) ? 'fill-rose-600' : ''} aria-hidden="true" />
                        {likeCount(post.id)}
                      </button>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle size={13} aria-hidden="true" />
                        {commentCount(post.id)} comentario(s)
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
