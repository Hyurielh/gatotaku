/*
  # Sistema de cupones, asignaciones y redenciones

  1. Cambios
    - `public.users` se convierte en perfil de usuario (auth.users) con `is_admin`
    - `coupons`: catálogo de cupones (porcentaje o monto fijo, vigencia, límites)
    - `coupon_products` / `coupon_categories`: productos o categorías elegibles
    - `coupon_assignments`: cupón -> usuario (con revocación individual)
    - `coupon_redemptions`: historial de usos (no se borra)
    - `public.is_admin()` helper + trigger de perfil al registrarse

  2. Seguridad
    - RLS en todas las tablas nuevas
    - Solo admin escribe cupones / asignaciones; el usuario ve lo suyo
    - `coupon_redemptions.coupon_id` es ON DELETE RESTRICT: no se borra historial

  3. Notas
    - El código del cupón es único sin distinguir mayúsculas
    - `uses_count` se incrementa de forma atómica desde el backend (Edge Function)
*/

-- ---------------------------------------------------------------------------
-- 1) Perfiles de usuario (extiende `users`, hoy vacía)
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_id_fkey' AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_fkey FOREIGN KEY (id)
      REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Cupones
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage'
    CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10, 2) NOT NULL CHECK (discount_value > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses integer CHECK (max_uses IS NULL OR max_uses > 0),
  max_uses_per_user integer NOT NULL DEFAULT 1 CHECK (max_uses_per_user > 0),
  assignment_type text NOT NULL DEFAULT 'general'
    CHECK (assignment_type IN ('general', 'specific')),
  applies_to text NOT NULL DEFAULT 'all'
    CHECK (applies_to IN ('all', 'products', 'categories')),
  is_active boolean NOT NULL DEFAULT true,
  is_revoked boolean NOT NULL DEFAULT false,
  uses_count integer NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coupons_percentage_max CHECK (discount_type <> 'percentage' OR discount_value <= 100),
  CONSTRAINT coupons_date_order CHECK (starts_at IS NULL OR expires_at IS NULL OR expires_at > starts_at)
);

-- Código único ignorando mayúsculas/espacios
CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_upper_unique ON public.coupons (upper(btrim(code)));

CREATE INDEX IF NOT EXISTS coupons_active_idx ON public.coupons (is_active, is_revoked);
CREATE INDEX IF NOT EXISTS coupons_expires_idx ON public.coupons (expires_at);

DROP TRIGGER IF EXISTS set_coupons_updated_at ON public.coupons;
CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 3) Elegibilidad por producto / categoría
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupon_products (
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (coupon_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.coupon_categories (
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (coupon_id, category_id)
);

-- ---------------------------------------------------------------------------
-- 4) Asignaciones (cupón -> usuario)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupon_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS coupon_assignments_user_idx ON public.coupon_assignments (user_id);
CREATE INDEX IF NOT EXISTS coupon_assignments_coupon_idx ON public.coupon_assignments (coupon_id);

-- ---------------------------------------------------------------------------
-- 5) Redenciones (histórico inmutable)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
  coupon_code text NOT NULL,
  coupon_name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_ref text,
  code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Código corto y único que el cliente envía en el pedido para que el admin lo valide
ALTER TABLE public.coupon_redemptions
  ADD COLUMN IF NOT EXISTS code text;

CREATE UNIQUE INDEX IF NOT EXISTS coupon_redemptions_code_unique
  ON public.coupon_redemptions (code)
  WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS coupon_redemptions_coupon_idx ON public.coupon_redemptions (coupon_id);
CREATE INDEX IF NOT EXISTS coupon_redemptions_user_idx ON public.coupon_redemptions (user_id);

-- ---------------------------------------------------------------------------
-- 6) Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin
  );
$$;

-- Crea/actualiza el perfil cuando alguien se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 7) Datos iniciales
-- ---------------------------------------------------------------------------
-- Perfiles de los usuarios que ya existen + admins iniciales.
-- Editar la lista de correos para cambiar quién es administrador.
INSERT INTO public.users (id, email, full_name, is_admin)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  (u.email IN ('geraldb1996@gmail.com', 'develophyurielh@gmail.com'))
FROM auth.users u
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- 7) Redención atómica (la ejecuta el backend con service role)
-- ---------------------------------------------------------------------------
-- Bloquea la fila del cupón (FOR UPDATE) para que dos requests simultáneos
-- no superen max_uses ni max_uses_per_user. Todo corre en una transacción.
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_coupon_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_items jsonb,
  p_order_ref text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_user_uses integer;
  v_redemption_id uuid;
  v_code text;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons WHERE id = p_coupon_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'cupon_no_existe';
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.uses_count >= v_coupon.max_uses THEN
    RAISE EXCEPTION 'limite_global';
  END IF;

  SELECT count(*) INTO v_user_uses
  FROM public.coupon_redemptions
  WHERE coupon_id = p_coupon_id AND user_id = p_user_id;

  IF v_user_uses >= v_coupon.max_uses_per_user THEN
    RAISE EXCEPTION 'limite_usuario';
  END IF;

  UPDATE public.coupons
  SET uses_count = uses_count + 1
  WHERE id = p_coupon_id;

  -- Código legible para validar el pedido en el panel (ej. GAT-7F3A9K2B)
  v_code := 'GAT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  INSERT INTO public.coupon_redemptions (
    coupon_id, coupon_code, coupon_name, user_id, amount, items, order_ref, code
  )
  VALUES (
    p_coupon_id, v_coupon.code, v_coupon.name, p_user_id,
    coalesce(p_amount, 0), coalesce(p_items, '[]'::jsonb), p_order_ref, v_code
  )
  RETURNING id INTO v_redemption_id;

  RETURN jsonb_build_object(
    'id', v_redemption_id,
    'code', v_code,
    'uses_count', v_coupon.uses_count + 1,
    'user_uses', v_user_uses + 1
  );
END $$;

-- Solo el backend (service role) puede redimir
REVOKE ALL ON FUNCTION public.redeem_coupon(uuid, uuid, numeric, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(uuid, uuid, numeric, jsonb, text) TO service_role;

-- ---------------------------------------------------------------------------
-- 8) RLS
-- ---------------------------------------------------------------------------ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- users: el usuario lee su perfil, el admin lee/gestiona todos
DROP POLICY IF EXISTS "Usuarios leen su perfil" ON public.users;
CREATE POLICY "Usuarios leen su perfil" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins gestionan usuarios" ON public.users;
CREATE POLICY "Admins gestionan usuarios" ON public.users
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- coupons: el usuario ve los cupones que puede usar (generales o asignados).
-- Los asignados pero retirados también se ven, para poder mostrar "retirado".
DROP POLICY IF EXISTS "Usuarios ven cupones disponibles" ON public.coupons;
CREATE POLICY "Usuarios ven cupones disponibles" ON public.coupons
  FOR SELECT TO authenticated
  USING (
    assignment_type = 'general'
    OR EXISTS (
      SELECT 1 FROM public.coupon_assignments a
      WHERE a.coupon_id = coupons.id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins gestionan cupones" ON public.coupons;
CREATE POLICY "Admins gestionan cupones" ON public.coupons
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- coupon_products / coupon_categories
DROP POLICY IF EXISTS "Usuarios ven elegibilidad" ON public.coupon_products;
CREATE POLICY "Usuarios ven elegibilidad" ON public.coupon_products
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins gestionan elegibilidad de productos" ON public.coupon_products;
CREATE POLICY "Admins gestionan elegibilidad de productos" ON public.coupon_products
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Usuarios ven elegibilidad" ON public.coupon_categories;
CREATE POLICY "Usuarios ven elegibilidad" ON public.coupon_categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins gestionan elegibilidad de categorías" ON public.coupon_categories;
CREATE POLICY "Admins gestionan elegibilidad de categorías" ON public.coupon_categories
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- coupon_assignments: el usuario ve lo suyo, el admin ve todo
DROP POLICY IF EXISTS "Usuarios ven sus asignaciones" ON public.coupon_assignments;
CREATE POLICY "Usuarios ven sus asignaciones" ON public.coupon_assignments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins gestionan asignaciones" ON public.coupon_assignments;
CREATE POLICY "Admins gestionan asignaciones" ON public.coupon_assignments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- coupon_redemptions: solo lectura; las escrituras las hace el backend
DROP POLICY IF EXISTS "Usuarios ven sus redenciones" ON public.coupon_redemptions;
CREATE POLICY "Usuarios ven sus redenciones" ON public.coupon_redemptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
