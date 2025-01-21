/*
  # Crear tabla de productos y políticas de seguridad

  1. Nueva Tabla
    - `products`
      - `id` (uuid, clave primaria)
      - `name` (texto, no nulo)
      - `price` (decimal, no nulo)
      - `category` (texto, no nulo)
      - `description` (texto)
      - `images` (array de texto)
      - `created_at` (timestamp con zona horaria)
      - `updated_at` (timestamp con zona horaria)

  2. Seguridad
    - Habilitar RLS en la tabla `products`
    - Políticas para:
      - Lectura pública
      - Escritura solo para usuarios autenticados
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  description text,
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Productos visibles para todos" ON products
  FOR SELECT
  USING (true);

-- Política de escritura solo para usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden modificar productos" ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();