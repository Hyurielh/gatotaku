import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faEdit, faCopy, faCloudUpload } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import type { Product, ProductInput, Category, Anime } from '../../types/database';
import { CategoryManager } from '../CategoryManager';
import { AnimeManager } from '../AnimeManager';
import { toast } from 'react-toastify';
import { uploadImageToImageKit } from '../../lib/imagekit';

export function InventoryManager() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const isLoadingRef = useRef<boolean>(false);
  const [error, setError] = useState<{
    message: string;
    details?: string;
    code?: string;
  } | null>(null);

  const [products, setProducts] = useState<Product[]>(() => []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [animes, setAnimes] = useState<Anime[]>(() => []);
  const [formData, setFormData] = useState<ProductInput>(() => ({
    name: '',
    price: '',
    category_id: '',
    anime_id: '',
    description: '',
    images: [''],
    stock: 0,
    is_service: false
  }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Selección múltiple para cambiar precios en bloque
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  const handleError = (err: unknown, defaultMessage: string = 'Error desconocido') => {
    if (err instanceof PostgrestError) {
      setError({
        message: err.message || defaultMessage,
        details: err.details,
        code: err.code
      });
    } else if (err instanceof Error) {
      setError({
        message: err.message || defaultMessage,
        details: err.stack
      });
    } else {
      setError({
        message: defaultMessage
      });
    }
  };

  const createFlexibleSearch = useCallback(async (searchTerm: string): Promise<string> => {
    try {
      const cleanSearchTerm = searchTerm.trim().toLowerCase();

      const searchConditions: string[] = [];

      searchConditions.push(`name.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`description.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`category.ilike.%${cleanSearchTerm}%`);

      const { data: animeData } = await supabase
        .from('anime')
        .select('id')
        .ilike('name', `%${cleanSearchTerm}%`)
        .limit(1);

      if (animeData && animeData.length > 0) {
        searchConditions.push(`anime_id.eq.${animeData[0].id}`);
      }

      return searchConditions.length > 0 ? searchConditions.join(',') : '';
    } catch {
      return '';
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    isLoadingRef.current = true;
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category_ref:categories(id, name),
          anime:anime(id, name)
        `, { count: 'exact' });

      if (categoryFilter) {
        query = query.eq('category_id', categoryFilter);
      }

      if (searchTerm.trim()) {
        const searchTerm_lower = searchTerm.toLowerCase().trim();

        try {
          const searchConditions = await createFlexibleSearch(searchTerm_lower);
          if (searchConditions) {
            query = query.or(searchConditions);
          }
        } catch {
        }
      }

      const { data, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, 'Error al cargar productos');
        return;
      }

      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      handleError(error, 'Error inesperado al cargar productos');
    } finally {
      isLoadingRef.current = false;
    }
  }, [searchTerm, page, categoryFilter, createFlexibleSearch]);

  // fetchProducts depends on several stable refs and state; intentionally
  // disabling exhaustive-deps here to avoid re-creating the effect on function identity
   
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

   
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      handleError(error, 'Error al cargar categorías');
    } else {
      setCategories(data || []);
    }
    setCategoriesLoading(false);
  }, []);

  const fetchAnimes = useCallback(async () => {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('name');

    if (error) {
      handleError(error, 'Error al cargar animes');
    } else {
      setAnimes(data || []);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAnimes();
  }, [fetchCategories, fetchAnimes]);

   
  const categoryId = formData.category_id;

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setFormData(prev => ({
        ...prev,
        category_id: categories[0].id
      }));
    }
  }, [categories, categoryId]);


  /** Carpeta de ImageKit según la categoría elegida: INVENTARIO/<CATEGORÍA> (solo [A-Z0-9_]) */
  const buildImageKitFolder = (): string => {
    const categoryName = categories.find(cat => cat.id === formData.category_id)?.name ?? '';
    const normalized = categoryName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    return normalized ? `INVENTARIO/${normalized}` : 'INVENTARIO';
  };

  const handleImageFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) return;

    setIsUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        try {
          const url = await uploadImageToImageKit(file, { folder: buildImageKitFolder() });
          uploadedUrls.push(url);
        } catch (uploadError) {
          const message = uploadError instanceof Error ? uploadError.message : 'error desconocido';
          toast.error(`No se pudo subir ${file.name}: ${message}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images.filter(url => url.trim() !== ''), ...uploadedUrls],
        }));
        toast.success(`${uploadedUrls.length} imagen(es) subida(s) a ImageKit`);
      }
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (categoriesLoading) {
      handleError(new Error('Cargando categorías, por favor espere'));
      return;
    }

    if (categories.length === 0) {
      handleError(new Error('No hay categorías disponibles. Cree una categoría primero.'));
      return;
    }

    isSubmittingRef.current = true;
    setError(null);

    try {
      const selectedCategoryId = formData.category_id || categories[0].id;
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

        if (!selectedCategory) {
        handleError(new Error('Categoría inválida. Por favor seleccione una categoría válida.'));
        isSubmittingRef.current = false;
        return;
      }

      const imageUrls = formData.images.filter(img => img && img.trim() !== '');

      const finalImages = imageUrls.length > 0 
        ? imageUrls 
        : ['https://ik.imagekit.io/gatotaku/default-product-image.png'];

      const productData = {
        name: formData.name || null,
        description: formData.description || null,
        price: parseFloat(formData.price) || null,
        category_id: selectedCategoryId || null,
        category: selectedCategory.name, 
        anime_id: formData.anime_id || null,
        images: finalImages,
        stock: Number(formData.stock) || 0,
        is_service: formData.is_service
      };

      const missingFields = Object.entries(productData)
        .filter(([key, value]) => value === null && key !== 'anime_id' && key !== 'description')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        handleError(new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`));
        isSubmittingRef.current = false;
        return;
      }

      let result;
      try {
        if (editingId) {
          result = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingId)
            .select();
        } else {
          result = await supabase
            .from('products')
            .insert(productData)
            .select();
        }

        if (result.error) {
          handleError(result.error, 'Error al guardar el producto');
          isSubmittingRef.current = false;
          return;
        }

        resetForm();
        fetchProducts();
        
        setError(null);
        
      } catch (unexpectedError) {
        handleError(unexpectedError, 'Error inesperado al guardar el producto');
      }
    } catch (validationError) {
      handleError(validationError, 'Error de validación');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category_id: categories[0]?.id || '',
      anime_id: '',
      description: '',
      images: [''],
      stock: 0,
      is_service: false
    });
    setEditingId(null);
  };

  const handleCopyProduct = (product: Product) => {
    setEditingId(null);

    setFormData({
      name: `${product.name} (Copia)`,
      price: product.price.toString(),
      category_id: product.category_id || '',
      anime_id: product.anime_id || '',
      description: product.description || '',
      images: product.images || [''],
      stock: product.stock || 0,
      is_service: product.is_service ?? false
    });

    const formElement = document.getElementById('product-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // duplicate fetchCategories/fetchAnimes removed; using the stable callbacks defined earlier

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        handleError(error, 'Error al eliminar el producto');
      } else {
        fetchProducts();
      }
    } catch (err) {
      handleError(err, 'Error al eliminar el producto');
    }
  }

  function handleEdit(product: Product) {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category_id: product.category_id || '',
      anime_id: product.anime_id || '',
      description: product.description,
      images: product.images,
      stock: product.stock || 0,
      is_service: product.is_service ?? false
    });
    setEditingId(product.id);
  }

  function handleImageChange(index: number, value: string) {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  }

  function addImageField() {
    setFormData({ ...formData, images: [...formData.images, ''] });
  }

  function removeImageField(index: number) {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  }

  const toggleSelected = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const allVisibleSelected =
    products.length > 0 && products.every((product) => selectedIds.includes(product.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !products.some((p) => p.id === id)));
      return;
    }

    setSelectedIds((current) => [
      ...current,
      ...products.filter((product) => !current.includes(product.id)).map((product) => product.id),
    ]);
  };

  const applyBulkPrice = async () => {
    const price = Number(bulkPrice);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Escribe un precio válido');
      return;
    }

    if (selectedIds.length === 0) return;

    if (
      !window.confirm(
        `¿Cambiar el precio de ${selectedIds.length} producto(s) a C$${price.toFixed(2)}?`,
      )
    ) {
      return;
    }

    setIsApplyingBulk(true);

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ price })
        .in('id', selectedIds);

      if (updateError) throw updateError;

      toast.success(`Precio actualizado en ${selectedIds.length} producto(s)`);
      setSelectedIds([]);
      setBulkPrice('');
      await fetchProducts();
    } catch (error) {
      handleError(error, 'Error al actualizar los precios');
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const renderErrorDetails = () => {
    if (!error) return null;
    return <p className="font-medium">{error.message}</p>;
  };

  return (
    <div className="admin-panel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <CategoryManager />
          <AnimeManager />
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {renderErrorDetails()}
          </div>
        )}
        
        <form onSubmit={handleSubmit} id="product-form" className="panel p-4 sm:p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="field"
                required
              />
            </div>
            
            <div className="mb-4 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">C$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 block w-full pl-8 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-100 sm:text-sm"
                  />
                </div>
              </div>

              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-100 sm:text-sm"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="field"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anime
              </label>
              <select
                value={formData.anime_id}
                onChange={(e) => setFormData({ ...formData, anime_id: e.target.value })}
                className="field"
                required
              >
                <option value="">Selecciona un anime</option>
                {animes.map((anime) => (
                  <option key={anime.id} value={anime.id}>
                    {anime.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50 p-4">
            <label htmlFor="is-service" className="flex cursor-pointer items-start gap-3">
              <input
                id="is-service"
                type="checkbox"
                checked={formData.is_service}
                onChange={(event) => setFormData({ ...formData, is_service: event.target.checked })}
                className="mt-1 h-4 w-4 rounded border-teal-300 accent-teal-600"
              />
              <span>
                <span className="block text-sm font-semibold text-teal-900">Marcar como servicio</span>
                <span className="mt-1 block text-xs text-teal-800">
                  No aparecerá en Productos de anime; se mostrará en la sección Servicios.
                </span>
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="field"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imágenes
            </label>

            <div className="mb-3 rounded-xl border border-dashed border-teal-300 bg-teal-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn-secondary cursor-pointer">
                  <FontAwesomeIcon icon={faCloudUpload} />
                  {isUploadingImages ? 'Subiendo a ImageKit...' : 'Subir imágenes'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploadingImages}
                    onChange={handleImageFilesSelected}
                  />
                </label>
                <p className="text-xs text-teal-800">
                  {isUploadingImages
                    ? 'Comprimiendo y subiendo a ImageKit. Espera...'
                    : 'Se comprime, se sube a ImageKit y la URL se agrega sola al producto.'}
                </p>
              </div>
            </div>

            {formData.images.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                {url ? (
                  <img
                    src={url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
                )}
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="field flex-1"
                  placeholder="URL de la imagen"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  aria-label="Eliminar imagen"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Agregar URL de imagen
            </button>
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    price: '',
                    category_id: '',
                    anime_id: '',
                    description: '',
                    images: [''],
                    stock: 0,
                    is_service: false
                  });
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              {editingId ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>

        <div className="search-bar mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIds([]);
              setPage(1); // Reiniciar página al buscar
            }}
            className="min-w-[14rem] flex-grow rounded-md border p-2"
          />

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSelectedIds([]);
              setPage(1);
            }}
            className="rounded-md border p-2 text-sm"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4">
            <span className="text-sm font-semibold text-teal-900">
              {selectedIds.length} producto(s) seleccionado(s)
            </span>

            <div className="flex items-center gap-2">
              <span className="text-sm text-teal-800">Nuevo precio</span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                  C$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-32 rounded-md border border-teal-300 bg-white py-2 pl-8 pr-3 text-sm"
                  aria-label="Nuevo precio para los seleccionados"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void applyBulkPrice()}
              disabled={isApplyingBulk || !bulkPrice}
              className="btn-primary"
            >
              {isApplyingBulk ? 'Aplicando...' : 'Aplicar precio'}
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-sm font-semibold text-teal-800 hover:text-teal-950"
            >
              Limpiar selección
            </button>
          </div>
        )}

        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full divide-y divide-slate-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                    aria-label="Seleccionar todos los productos de esta página"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={selectedIds.includes(product.id) ? 'bg-teal-50/60' : undefined}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelected(product.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                      aria-label={`Seleccionar ${product.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.is_service && (
                          <span className="mt-1 inline-flex rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Servicio
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      C${product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-50 text-teal-800">
                      {product.category_ref?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.anime?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      aria-label="Editar producto"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleCopyProduct(product)}
                      className="text-green-600 hover:text-green-900 mr-4"
                      aria-label="Copiar producto"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Eliminar producto"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>

        <div className="pagination flex justify-center items-center space-x-4 mt-4">
          <button 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1}
            className="px-4 py-2 bg-teal-600 text-white rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-700">
            Página {page} de {Math.ceil(totalProducts / pageSize)}
          </span>
          <button 
            onClick={() => setPage(page + 1)} 
            disabled={page * pageSize >= totalProducts}
            className="px-4 py-2 bg-teal-600 text-white rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
    </div>
  );
}
