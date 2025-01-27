-- Create indexes for frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_anime ON public.products(anime_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- Composite index for more complex queries
CREATE INDEX IF NOT EXISTS idx_products_category_name ON public.products(category_id, name);

-- Full-text search index (if you want more advanced text searching)
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON public.products USING gin(to_tsvector('spanish', name));