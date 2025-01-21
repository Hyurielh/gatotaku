import React from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/database';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function CategoryManager() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [newCategory, setNewCategory] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      setError('Error al cargar categorías');
      return;
    }

    setCategories(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newCategory.trim()) return;

    const { error } = await supabase
      .from('categories')
      .insert({ name: newCategory.trim() });

    if (error) {
      setError('Error al crear categoría');
      return;
    }

    setNewCategory('');
    fetchCategories();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Error al eliminar categoría');
      return;
    }

    fetchCategories();
  }

  async function handleUpdate(id: string, newName: string) {
    const { error } = await supabase
      .from('categories')
      .update({ name: newName })
      .eq('id', id);

    if (error) {
      setError('Error al actualizar categoría');
      return;
    }

    setEditingId(null);
    fetchCategories();
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Gestionar Categorías</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

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

      <ul className="space-y-2">
        {categories.map((category) => (
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
    </div>
  );
}