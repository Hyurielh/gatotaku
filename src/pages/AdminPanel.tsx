import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import type { Product, ProductInput, Category, Anime } from '../types/database';
import { CategoryManager } from '../components/CategoryManager';
import { AnimeManager } from '../components/AnimeManager';
import { SEO } from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { convertImageToWebP, compressImage } from '../utils/imageOptimization';

export default function AdminPanel() {
  const { session, loading: authLoading } = useAuth();

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<{
    message: string;
    details?: string;
    code?: string;
  } | null>(null);

  // Estados existentes
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
    stock: 0
  }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleError = (error: any, defaultMessage: string = 'Error desconocido') => {
    if (error instanceof PostgrestError) {
      setError({
        message: error.message || defaultMessage,
        details: error.details,
        code: error.code
      });
    } else if (error instanceof Error) {
      setError({
        message: error.message || defaultMessage,
        details: error.stack
      });
    } else {
      setError({
        message: defaultMessage
      });
    }
    console.error('Error detallado:', error);
  };

  // Función auxiliar para búsqueda flexible
  const createFlexibleSearch = async (searchTerm: string): Promise<string> => {
    try {
      // Limpiar y preparar el término de búsqueda
      const cleanSearchTerm = searchTerm.trim().toLowerCase();
      
      // Condiciones de búsqueda
      const searchConditions: string[] = [];

      // Agregar condiciones de búsqueda
      searchConditions.push(`name.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`description.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`category.ilike.%${cleanSearchTerm}%`);

      // Buscar ID de anime de manera más segura
      const { data: animeData } = await supabase
        .from('anime')
        .select('id')
        .ilike('name', `%${cleanSearchTerm}%`)
        .limit(1);  

      // Si hay un anime encontrado, agregar su ID a las condiciones
      if (animeData && animeData.length > 0) {
        searchConditions.push(`anime_id.eq.${animeData[0].id}`);
      }

      // Devolver las condiciones como un string, o un string vacío si no hay condiciones
      return searchConditions.length > 0 ? searchConditions.join(',') : '';
    } catch (error) {
      console.error('Error en búsqueda flexible:', error);
      return '';
    }
  };

  // Función de búsqueda y paginación de productos
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category_ref:categories(id, name),
          anime:anime(id, name)
        `, { count: 'exact' });

      // Añadir búsqueda si hay término
      if (searchTerm.trim()) {
        const searchTerm_lower = searchTerm.toLowerCase().trim();
        
        try {
          const searchConditions = await createFlexibleSearch(searchTerm_lower);
          if (searchConditions) {
            query = query.or(searchConditions);
          }
        } catch (error) {
          console.error('Error en búsqueda de productos:', error);
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
      setIsLoading(false);
    }
  };

  // Efecto para cargar productos con búsqueda y paginación
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, page]);

  // Resto de tu código existente...

  // Redirect or show error if not authenticated
  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Unauthorized Access</div>;
  }

  useEffect(() => {
    fetchCategories();
    fetchAnimes();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({
        ...prev,
        category_id: categories[0].id
      }));
    }
  }, [categories]);

  // Image file handling
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const processedImages: File[] = [];
      for (let i = 0; i < files.length; i++) {
        // Compress image first
        const compressedImage = await compressImage(files[i]);
        processedImages.push(compressedImage);
      }

      setImageFiles(processedImages);
    } catch (error) {
      handleError(error, 'Error procesando imágenes');
    }
  };

  // Upload images to Supabase storage
  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = imageFiles.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        handleError(uploadError, 'Error al subir imágenes');
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Check if categories are still loading
    if (categoriesLoading) {
      handleError(new Error('Cargando categorías, por favor espere'));
      return;
    }

    // Ensure there are categories
    if (categories.length === 0) {
      handleError(new Error('No hay categorías disponibles. Cree una categoría primero.'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate category_id explicitly
      const selectedCategoryId = formData.category_id || categories[0].id;
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

      if (!selectedCategory) {
        handleError(new Error('Categoría inválida. Por favor seleccione una categoría válida.'));
        setIsSubmitting(false);
        return;
      }

      // Ensure images are not empty
      const imageUrls = imageFiles.length > 0 
        ? await uploadImages() 
        : formData.images.filter(img => img && img.trim() !== '');

      // Fallback image if no images provided
      const finalImages = imageUrls.length > 0 
        ? imageUrls 
        : ['https://ik.imagekit.io/gatotaku/default-product-image.png'];

      // Prepare product data with explicit type casting and null checks
      const productData = {
        name: formData.name || null,
        description: formData.description || null,
        price: parseFloat(formData.price) || null,
        category_id: selectedCategoryId || null,
        category: selectedCategory.name, 
        anime_id: formData.anime_id || null,
        images: finalImages,
        stock: Number(formData.stock) || 0
      };

      // Validate productData before submission
      const missingFields = Object.entries(productData)
        .filter(([key, value]) => value === null && key !== 'anime_id' && key !== 'description')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        handleError(new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`));
        setIsSubmitting(false);
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
          setIsSubmitting(false);
          return;
        }

        // Limpiar formulario y recargar productos
        resetForm();
        fetchProducts();
        
        // Notificación de éxito
        setError(null);
        
      } catch (unexpectedError) {
        handleError(unexpectedError, 'Error inesperado al guardar el producto');
      }
    } catch (validationError) {
      handleError(validationError, 'Error de validación');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category_id: categories[0]?.id || '',
      anime_id: '',
      description: '',
      images: [''],
      stock: 0
    });
    setEditingId(null);
    setImageFiles([]);
  };

  // Añadir nueva función de copiar producto
  const handleCopyProduct = (product: Product) => {
    // Resetear el estado de edición
    setEditingId(null);

    // Copiar los datos del producto al formulario
    setFormData({
      name: `${product.name} (Copia)`,
      price: product.price.toString(),
      category_id: product.category_id || '',
      anime_id: product.anime_id || '',
      description: product.description || '',
      images: product.images || [''],
      stock: product.stock || 0
    });

    // Opcional: Desplazar la vista hacia el formulario
    const formElement = document.getElementById('product-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  async function fetchCategories() {
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
  }

  async function fetchAnimes() {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('name');

    if (error) {
      handleError(error, 'Error al cargar animes');
    } else {
      setAnimes(data || []);
    }
  }

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
    } catch (err: any) {
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
      stock: product.stock || 0
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

  const renderErrorDetails = () => {
    if (!error) return null;
    return (
      <div className="error-details">
        <p className="error-message">{error.message}</p>
        {error.details && (
          <details>
            <summary>Detalles del error</summary>
            <pre>{error.details}</pre>
          </details>
        )}
        {error.code && <p>Código de error: {error.code}</p>}
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <SEO 
        title="Panel de Administración"
        description="Panel de administración de GATOTAKU"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <CategoryManager />
          <AnimeManager />
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {renderErrorDetails()}
          </div>
        )}
        
        <form onSubmit={handleSubmit} id="product-form" className="bg-white p-6 rounded-lg shadow-md mb-8">
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
                className="w-full p-2 border rounded"
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
                    className="mt-1 block w-full pl-8 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            {formData.images.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="URL de la imagen"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  aria-label="Eliminar imagen"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <i className="fas fa-plus mr-2"></i>
              Agregar imagen
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
                    stock: 0
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
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              {editingId ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>

        <div className="search-bar mb-4 flex items-center space-x-4">
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reiniciar página al buscar
            }}
            className="flex-grow p-2 border rounded-md"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <tr key={product.id}>
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
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
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleCopyProduct(product)}
                      className="text-green-600 hover:text-green-900 mr-4"
                      aria-label="Copiar producto"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Eliminar producto"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination flex justify-center items-center space-x-4 mt-4">
          <button 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1}
            className="px-4 py-2 bg-orange-500 text-white rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-700">
            Página {page} de {Math.ceil(totalProducts / pageSize)}
          </span>
          <button 
            onClick={() => setPage(page + 1)} 
            disabled={page * pageSize >= totalProducts}
            className="px-4 py-2 bg-orange-500 text-white rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}