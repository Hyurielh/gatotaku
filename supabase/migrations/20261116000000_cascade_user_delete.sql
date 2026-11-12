/*
  # Borrado en cascada al eliminar cuentas

  1. Cambios
    - `coupon_redemptions.user_id` -> ON DELETE CASCADE (antes SET NULL)
    - `orders.user_id` -> ON DELETE CASCADE (antes SET NULL)
    - Trigger que descuenta `coupons.uses_count` al borrar una redención

  2. Motivo
    - Al eliminar un usuario se borran sus cupones asignados, sus redenciones,
      sus pedidos y su perfil (ahorro de almacenamiento en el plan gratuito)
*/

-- ---------------------------------------------------------------------------
-- 1) Cascadas
-- ---------------------------------------------------------------------------
ALTER TABLE public.coupon_redemptions
  DROP CONSTRAINT IF EXISTS coupon_redemptions_user_id_fkey;

ALTER TABLE public.coupon_redemptions
  ADD CONSTRAINT coupon_redemptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- 2) Contador de usos consistente
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_coupon_uses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET uses_count = greatest(uses_count - 1, 0)
  WHERE id = OLD.coupon_id;

  RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS decrement_coupon_uses_on_delete ON public.coupon_redemptions;
CREATE TRIGGER decrement_coupon_uses_on_delete
  AFTER DELETE ON public.coupon_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.decrement_coupon_uses();
