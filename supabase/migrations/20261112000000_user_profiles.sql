/*
  # Perfil de usuario: foto, nombre, usuario, anime favorito y WhatsApp

  1. Cambios
    - `public.users` gana: avatar_url, display_name, username, favorite_anime, whatsapp
    - `username` único (sin distinguir mayúsculas), opcional
    - Trigger para sincronizar el correo cuando cambia en `auth.users`
    - `public.update_my_profile(...)`: RPC que el cliente usa para editar su perfil
      (SECURITY DEFINER: solo toca su propia fila y solo columnas seguras)

  2. Seguridad
    - El usuario NO puede editar `is_admin` ni su id: la RPC no los expone
    - `username` en uso -> error 'username_en_uso'
*/

-- ---------------------------------------------------------------------------
-- 1) Columnas del perfil
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS favorite_anime text,
  ADD COLUMN IF NOT EXISTS whatsapp text;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique
  ON public.users (lower(btrim(username)))
  WHERE username IS NOT NULL AND btrim(username) <> '';

-- ---------------------------------------------------------------------------
-- 2) Sincronizar correo cuando cambia en auth.users
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.users
    SET email = NEW.email,
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_update();

-- ---------------------------------------------------------------------------
-- 3) Editar el propio perfil (solo columnas seguras)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_display_name text DEFAULT NULL,
  p_username text DEFAULT NULL,
  p_favorite_anime text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_username text := nullif(btrim(coalesce(p_username, '')), '');
  v_profile public.users;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'no_autenticado';
  END IF;

  IF v_username IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users
    WHERE lower(btrim(coalesce(username, ''))) = lower(v_username)
      AND id <> v_user_id
  ) THEN
    RAISE EXCEPTION 'username_en_uso';
  END IF;

  UPDATE public.users
  SET display_name = nullif(btrim(coalesce(p_display_name, '')), ''),
      username = v_username,
      favorite_anime = nullif(btrim(coalesce(p_favorite_anime, '')), ''),
      whatsapp = nullif(btrim(coalesce(p_whatsapp, '')), ''),
      avatar_url = nullif(btrim(coalesce(p_avatar_url, '')), ''),
      updated_at = now()
  WHERE id = v_user_id
  RETURNING * INTO v_profile;

  RETURN v_profile;
END $$;

REVOKE ALL ON FUNCTION public.update_my_profile(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_profile(text, text, text, text, text) TO authenticated, service_role;
