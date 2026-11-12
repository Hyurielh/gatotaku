/*
  # Favoritos del cliente

  - `favorites`: producto marcado con el corazón por un usuario
  - Un usuario solo puede tener una fila por producto
  - RLS: cada usuario ve/crea/borra solo lo suyo; el admin puede ver todo
*/

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_idx ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS favorites_product_idx ON public.favorites (product_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus favoritos" ON public.favorites;
CREATE POLICY "Usuarios ven sus favoritos" ON public.favorites
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Usuarios crean sus favoritos" ON public.favorites;
CREATE POLICY "Usuarios crean sus favoritos" ON public.favorites
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios borran sus favoritos" ON public.favorites;
CREATE POLICY "Usuarios borran sus favoritos" ON public.favorites
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
