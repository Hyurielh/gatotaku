import { supabase } from './supabase';
import type { CommentLike, NewsPost, PostComment, PostLike, PublicProfile } from '../types/database';

export class NewsError extends Error {}

export interface PostEngagement {
  postLikes: PostLike[];
  comments: PostComment[];
  commentLikes: CommentLike[];
  profiles: Record<string, PublicProfile>;
}

export interface PostInput {
  title: string;
  excerpt: string;
  body: string;
  image_url: string;
  is_published: boolean;
}

export async function fetchNews(includeUnpublished = false): Promise<NewsPost[]> {
  let query = supabase.from('posts').select('*').order('published_at', { ascending: false });

  if (!includeUnpublished) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) throw new NewsError(error.message);

  return (data ?? []) as NewsPost[];
}

/** Likes y comentarios de todas las novedades (para los resúmenes). */
export async function fetchEngagement(postIds: string[]): Promise<PostEngagement> {
  if (postIds.length === 0) {
    return { postLikes: [], comments: [], commentLikes: [], profiles: {} };
  }

  const [postLikesRes, commentsRes] = await Promise.all([
    supabase.from('post_likes').select('post_id, user_id').in('post_id', postIds),
    supabase
      .from('post_comments')
      .select('id, post_id, user_id, parent_id, body, created_at')
      .in('post_id', postIds)
      .order('created_at', { ascending: true }),
  ]);

  if (postLikesRes.error) throw new NewsError(postLikesRes.error.message);
  if (commentsRes.error) throw new NewsError(commentsRes.error.message);

  const comments = (commentsRes.data ?? []) as PostComment[];
  const commentIds = comments.map((comment) => comment.id);

  const commentLikesRes = commentIds.length
    ? await supabase.from('comment_likes').select('comment_id, user_id').in('comment_id', commentIds)
    : { data: [], error: null };

  if (commentLikesRes.error) throw new NewsError(commentLikesRes.error.message);

  const userIds = [...new Set(comments.map((comment) => comment.user_id))];

  const profilesRes = userIds.length
    ? await supabase
        .from('public_profiles')
        .select('id, display_name, avatar_url, favorite_anime, is_admin')
        .in('id', userIds)
    : { data: [], error: null };

  const profiles: Record<string, PublicProfile> = Object.fromEntries(
    ((profilesRes.data ?? []) as PublicProfile[]).map((profile) => [profile.id, profile]),
  );

  return {
    postLikes: (postLikesRes.data ?? []) as PostLike[],
    comments,
    commentLikes: (commentLikesRes.data ?? []) as CommentLike[],
    profiles,
  };
}

export async function togglePostLike(postId: string, userId: string, liked: boolean): Promise<void> {
  const { error } = liked
    ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
    : await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });

  if (error) throw new NewsError(error.message);
}

export async function toggleCommentLike(
  commentId: string,
  userId: string,
  liked: boolean,
): Promise<void> {
  const { error } = liked
    ? await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId)
    : await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });

  if (error) throw new NewsError(error.message);
}

export async function addComment(input: {
  postId: string;
  userId: string;
  body: string;
  parentId: string | null;
}): Promise<void> {
  const { error } = await supabase.from('post_comments').insert({
    post_id: input.postId,
    user_id: input.userId,
    body: input.body.trim(),
    parent_id: input.parentId,
  });

  if (error) throw new NewsError(error.message);
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
  if (error) throw new NewsError(error.message);
}

/* ------------------------------- Admin ---------------------------------- */

export async function savePost(input: PostInput, postId?: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();

  const payload = {
    title: input.title.trim(),
    excerpt: input.excerpt.trim() || null,
    body: input.body.trim() || null,
    image_url: input.image_url.trim() || null,
    is_published: input.is_published,
    user_id: postId ? undefined : auth.user?.id ?? null,
  };

  const { error } = postId
    ? await supabase.from('posts').update(payload).eq('id', postId)
    : await supabase.from('posts').insert({ ...payload, published_at: new Date().toISOString() });

  if (error) throw new NewsError(error.message);
}

export async function setPostPublished(postId: string, isPublished: boolean): Promise<void> {
  const { error } = await supabase.from('posts').update({ is_published: isPublished }).eq('id', postId);
  if (error) throw new NewsError(error.message);
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw new NewsError(error.message);
}
