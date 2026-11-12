/*
  # Add Service Flag to Products

  1. Changes
    - Add `is_service` boolean column to `products`
    - Existing rows default to `false` (regular catalog items)
    - Services are excluded from the anime product catalog and shown on `/servicios`

  2. Security
    - No policy changes required; existing product read/write policies still apply
*/

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_service boolean NOT NULL DEFAULT false;
