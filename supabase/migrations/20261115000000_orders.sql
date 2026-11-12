/*
  # Pedidos y estados de pedido

  1. Tablas
    - `order_statuses`: catálogo de estados que administra el admin (nombre, descripción
      opcional, icono personalizado y `is_completed` que mueve el pedido a "Completados")
    - `orders`: pedido del cliente con items, totales, cupón y estado actual

  2. Reglas
    - El cliente crea y ve solo sus pedidos; el admin ve y actualiza todos
    - Cada pedido nace con el primer estado no completado (trigger)
    - `code` corto y único para mostrar en el pedido (ej. PD-7F3A9K)
*/

-- ---------------------------------------------------------------------------
-- 1) Estados de pedido
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  is_completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.order_statuses (name, description, icon, is_completed, position)
SELECT v.name, v.description, v.icon, v.is_completed, v.position
FROM (VALUES
  ('Pendiente', 'Recibimos tu pedido y estamos coordinando el pago.', '⏳', false, 1),
  ('En preparación', 'Estamos preparando tu pedido.', '📦', false, 2),
  ('En camino', 'Tu pedido va en camino.', '🚚', false, 3),
  ('Completado', 'Pedido entregado. ¡Gracias por tu compra!', '✅', true, 4)
) AS v(name, description, icon, is_completed, position)
WHERE NOT EXISTS (SELECT 1 FROM public.order_statuses);

-- ---------------------------------------------------------------------------
-- 2) Pedidos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status_id uuid REFERENCES public.order_statuses(id) ON DELETE SET NULL,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_total numeric(10, 2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  total numeric(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  coupon_code text,
  coupon_validation_code text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  customer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_code_unique ON public.orders (code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status_id);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Código corto + estado inicial
CREATE OR REPLACE FUNCTION public.prepare_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := 'PD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  END IF;

  IF NEW.status_id IS NULL THEN
    SELECT id INTO NEW.status_id
    FROM public.order_statuses
    WHERE NOT is_completed
    ORDER BY position
    LIMIT 1;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS prepare_orders ON public.orders;
CREATE TRIGGER prepare_orders
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.prepare_order();

-- ---------------------------------------------------------------------------
-- 3) RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_statuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus pedidos" ON public.orders;
CREATE POLICY "Usuarios ven sus pedidos" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Usuarios crean sus pedidos" ON public.orders;
CREATE POLICY "Usuarios crean sus pedidos" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins gestionan pedidos" ON public.orders;
CREATE POLICY "Admins gestionan pedidos" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Estados visibles" ON public.order_statuses;
CREATE POLICY "Estados visibles" ON public.order_statuses
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins gestionan estados" ON public.order_statuses;
CREATE POLICY "Admins gestionan estados" ON public.order_statuses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
