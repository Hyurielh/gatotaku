import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/database';
import { Plus, Pencil, Trash2, Search, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const paginatedCategories = React.useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, page]);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch {
      toast.error('Error al cargar categorías');
      setError('Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const newItem = { name: newCategory.trim() };
      setCategories(prev => [...prev, { ...newItem, id: 'temp' }]);
      
      const { error } = await supabase
        .from('categories')
        .insert(newItem);

      if (error) throw error;
      
      toast.success('Categoría agregada exitosamente');
      setNewCategory('');
      fetchCategories();
    } catch {
      toast.error('Error al crear categoría');
      setError('Error al crear categoría');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      setCategories(prev => prev.filter(category => category.id !== id));
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Categoría eliminada exitosamente');
    } catch {
      toast.error('Error al eliminar categoría');
      setError('Error al eliminar categoría');
      fetchCategories(); // Revert on error
    }
  }

  async function handleUpdate(id: string, newName: string) {
    if (!newName.trim()) return;

    const originalCategories = [...categories];
    try {
      setCategories(prev => prev.map(category => 
        category.id === id ? { ...category, name: newName } : category
      ));
      
      const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Categoría actualizada exitosamente');
      setEditingId(null);
    } catch {
      setCategories(originalCategories); // Revert on error
      toast.error('Error al actualizar categoría');
      setError('Error al actualizar categoría');
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Gestionar Categorías</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nueva categoría"
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Agregar
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {paginatedCategories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                {editingId === category.id ? (
                  <input
                    type="text"
                    defaultValue={category.name}
                    onBlur={(e) => handleUpdate(category.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdate(category.id, e.currentTarget.value);
                      }
                    }}
                    className="flex-1 p-1 border rounded mr-2"
                    autoFocus
                  />
                ) : (
                  <span>{category.name}</span>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(category.id)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Editar categoría"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Eliminar categoría"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {filteredCategories.length > itemsPerPage && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span>Página {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * itemsPerPage >= filteredCategories.length}
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}