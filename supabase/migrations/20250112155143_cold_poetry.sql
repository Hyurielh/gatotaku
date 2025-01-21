/*
  # Actualización de políticas RLS para productos

  1. Cambios
    - Actualizar políticas RLS para permitir operaciones CRUD a usuarios autenticados
    - Mantener lectura pública para todos los usuarios

  2. Seguridad
    - Permitir lectura pública
    - Permitir escritura, actualización y eliminación solo a usuarios autenticados
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Productos visibles para todos" ON products;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden modificar productos" ON products;

-- Política de lectura pública
CREATE POLICY "Productos visibles para todos"
ON products FOR SELECT
USING (true);

-- Política de inserción para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear productos"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de actualización para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar productos"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política de eliminación para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar productos"
ON products FOR DELETE
TO authenticated
USING (true);