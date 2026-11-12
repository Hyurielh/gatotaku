/*
  # Novedades: posts, comentarios y likes

  1. Cambios
    - `posts` se reutiliza como tabla de novedades (título, resumen, cuerpo, imagen,
      publicado, fecha de publicación)
    - `post_likes`, `post_comments` (con respuestas) y `comment_likes`
    - Vista `public_profiles`: solo datos públicos del perfil (nombre, foto, anime
      favorito, is_admin) para mostrar autores de comentarios sin exponer correo/teléfono

  2. Seguridad
    - Cualquiera (incluido visitante) lee novedades publicadas y comentarios
    - Solo autenticados comentan / dan like (con su propio user_id)
    - Solo admins crean, editan y borran novedades
*/

-- ---------------------------------------------------------------------------
-- 1) Posts -> Novedades
-- ---------------------------------------------------------------------------
-- La tabla vieja no tenía default en el id
ALTER TABLE public.posts ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS published_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.posts ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts (is_published, published_at DESC);

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2) Likes y comentarios
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(btrim(body)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS post_likes_post_idx ON public.post_likes (post_id);
CREATE INDEX IF NOT EXISTS post_comments_post_idx ON public.post_comments (post_id);
CREATE INDEX IF NOT EXISTS comment_likes_comment_idx ON public.comment_likes (comment_id);

-- ---------------------------------------------------------------------------
-- 3) Perfiles públicos (sin datos sensibles)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, display_name, avatar_url, favorite_anime, is_admin
FROM public.users;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- posts
DROP POLICY IF EXISTS "Novedades publicadas visibles" ON public.posts;
CREATE POLICY "Novedades publicadas visibles" ON public.posts
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_admin());

DROP POLICY IF EXISTS "Admins gestionan novedades" ON public.posts;
CREATE POLICY "Admins gestionan novedades" ON public.posts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- post_likes
DROP POLICY IF EXISTS "Likes visibles" ON public.post_likes;
CREATE POLICY "Likes visibles" ON public.post_likes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Usuarios dan like" ON public.post_likes;
CREATE POLICY "Usuarios dan like" ON public.post_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios quitan su like" ON public.post_likes;
CREATE POLICY "Usuarios quitan su like" ON public.post_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- post_comments
DROP POLICY IF EXISTS "Comentarios visibles" ON public.post_comments;
CREATE POLICY "Comentarios visibles" ON public.post_comments
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Usuarios comentan" ON public.post_comments;
CREATE POLICY "Usuarios comentan" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Autores y admins borran comentarios" ON public.post_comments;
CREATE POLICY "Autores y admins borran comentarios" ON public.post_comments
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- comment_likes
DROP POLICY IF EXISTS "Likes de comentarios visibles" ON public.comment_likes;
CREATE POLICY "Likes de comentarios visibles" ON public.comment_likes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Usuarios dan like a comentarios" ON public.comment_likes;
CREATE POLICY "Usuarios dan like a comentarios" ON public.comment_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios quitan su like de comentario" ON public.comment_likes;
CREATE POLICY "Usuarios quitan su like de comentario" ON public.comment_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());
