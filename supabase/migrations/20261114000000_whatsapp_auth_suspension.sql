/*
  # Login con WhatsApp o correo + bloqueo de cuentas suspendidas

  1. Registro
    - El trigger `handle_new_user` copia el WhatsApp de `raw_user_meta_data`
      (las cuentas creadas con número usan un correo sintético `<digitos>@wa.gatotaku.local`)

  2. Suspensión
    - `update_my_profile` rechaza cambios si la cuenta está suspendida (`cuenta_suspendida`)
*/

-- ---------------------------------------------------------------------------
-- 1) Perfil al registrarse (incluye whatsapp)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, whatsapp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', '')), '')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();
  RETURN NEW;
END $$;

-- ---------------------------------------------------------------------------
-- 2) update_my_profile: cuenta suspendida no puede editar su perfil
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
  v_whatsapp_digits text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  v_suspended boolean;
  v_profile public.users;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'no_autenticado';
  END IF;

  SELECT is_suspended INTO v_suspended FROM public.users WHERE id = v_user_id;

  IF coalesce(v_suspended, false) THEN
    RAISE EXCEPTION 'cuenta_suspendida';
  END IF;

  IF v_username IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users
    WHERE lower(btrim(coalesce(username, ''))) = lower(v_username)
      AND id <> v_user_id
  ) THEN
    RAISE EXCEPTION 'username_en_uso';
  END IF;

  -- Evita que una cuenta suspendida vuelva con el mismo WhatsApp
  IF length(v_whatsapp_digits) >= 8 AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id <> v_user_id
      AND is_suspended
      AND regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g') = v_whatsapp_digits
  ) THEN
    RAISE EXCEPTION 'whatsapp_suspendido';
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
