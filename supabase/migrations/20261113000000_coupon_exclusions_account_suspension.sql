/*
  # Cupones con exclusión + suspensión de cuentas

  1. Cupones
    - `coupons.is_exclusion`: cuando es true, `coupon_products` / `coupon_categories`
      indican lo que NO aplica (el resto sí), evitando marcar todo menos unos pocos

  2. Usuarios
    - `users.is_suspended`, `users.suspension_message`, `users.suspended_at`
    - `update_my_profile` rechaza un WhatsApp ya usado por una cuenta suspendida
    - `coupon_redemptions.user_id` pasa a ON DELETE SET NULL para conservar el historial
      cuando se elimina una cuenta
*/

-- ---------------------------------------------------------------------------
-- 1) Exclusión en cupones
-- ---------------------------------------------------------------------------
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS is_exclusion boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- 2) Suspensión de cuentas
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspension_message text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

-- Historial de cupones sobrevive a la eliminación de la cuenta
ALTER TABLE public.coupon_redemptions
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.coupon_redemptions
  DROP CONSTRAINT IF EXISTS coupon_redemptions_user_id_fkey;

ALTER TABLE public.coupon_redemptions
  ADD CONSTRAINT coupon_redemptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 3) update_my_profile: WhatsApp de cuenta suspendida
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
