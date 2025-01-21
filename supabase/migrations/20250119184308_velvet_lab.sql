/*
  # Add Categories and Anime Management

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `anime`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
  2. Changes to Products Table
    - Add `anime_id` foreign key reference
    - Convert category to use foreign key
    
  3. Security
    - Enable RLS on new tables
    - Add policies for public read access
    - Add policies for authenticated users to manage data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create anime table
CREATE TABLE IF NOT EXISTS anime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key columns to products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    -- Add category_id column
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);
    
    -- Add anime_id column
    ALTER TABLE products ADD COLUMN anime_id uuid REFERENCES anime(id);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Categories visible to all" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Anime visible to all" ON anime
  FOR SELECT USING (true);

-- Authenticated user management policies
CREATE POLICY "Authenticated users can manage categories" ON categories
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage anime" ON anime
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);