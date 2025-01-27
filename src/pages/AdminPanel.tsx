import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ProductInput, Category, Anime } from '../types/database';
import { CategoryManager } from '../components/CategoryManager';
import { AnimeManager } from '../components/AnimeManager';
import { SEO } from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { convertImageToWebP, compressImage } from '../utils/imageOptimization';

export default function AdminPanel() {
  const { session, loading: authLoading } = useAuth();

  // Defensive initialization with useMemo to ensure consistent initialization
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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Redirect or show error if not authenticated
  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Unauthorized Access</div>;
  }

  useEffect(() => {
    fetchProducts();
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
      console.error('Image processing error:', error);
      setError('Error procesando imágenes');
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
        console.error('Upload error:', uploadError);
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
      setError('Cargando categorías, por favor espere');
      return;
    }

    // Ensure there are categories
    if (categories.length === 0) {
      setError('No hay categorías disponibles. Cree una categoría primero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate category_id explicitly
      const selectedCategoryId = formData.category_id || categories[0].id;
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

      if (!selectedCategory) {
        console.error('Invalid category selection');
        setError('Categoría inválida. Por favor seleccione una categoría válida.');
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

      // Extremely verbose logging
      console.group('Product Insertion Debug');
      console.log('Raw Form Data:', formData);
      console.log('Selected Category:', selectedCategory);
      console.log('Prepared Product Data:', productData);
      
      // Validate each field explicitly
      Object.entries(productData).forEach(([key, value]) => {
        console.log(`Field ${key}:`, 
          value === null ? 'NULL' : 
          value === undefined ? 'UNDEFINED' : 
          value);
      });
      console.groupEnd();

      // Validate productData before submission
      const missingFields = Object.entries(productData)
        .filter(([key, value]) => value === null && key !== 'anime_id' && key !== 'description')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setError(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
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

        // More detailed error handling
        if (result.error) {
          console.error('Supabase Error Object:', result.error);
          
          // Log full error details
          console.error('Full Error Details:', {
            code: result.error.code,
            message: result.error.message,
            details: result.error.details,
            hint: result.error.hint
          });

          // Additional context logging
          console.error('Product Data Sent:', JSON.stringify(productData, null, 2));
          console.error('Categories at time of error:', JSON.stringify(categories, null, 2));
          
          // More specific error message
          const errorMessage = result.error.message || 'Error desconocido al guardar producto';
          setError(`Error guardando producto: ${errorMessage}`);
          setIsSubmitting(false);
          return;
        }

        // Log successful insertion
        console.log('Product Inserted Successfully:', result.data);

        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category_id: categories[0].id,
          anime_id: '',
          images: [''],
          stock: 0
        });
        setImageFiles([]);
        setEditingId(null);
        fetchProducts();
      } catch (supabaseError) {
        console.error('Supabase Catch Block Error:', supabaseError);
        setError(`Error de Supabase: ${supabaseError.message}`);
      }
    } catch (error) {
      console.error('Unexpected Error submitting product:', error);
      setError('Error inesperado al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category_ref:categories(id, name),
        anime:anime(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar los productos');
      return;
    }

    setProducts(data || []);
  }

  async function fetchCategories() {
    setCategoriesLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    setCategories(data || []);
    setCategoriesLoading(false);
  }

  async function fetchAnimes() {
    const { data } = await supabase
      .from('anime')
      .select('*')
      .order('name');
    setAnimes(data || []);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      setError(err.message || 'Error al eliminar el producto');
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
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
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
      </div>
    </div>
  );
}