import React from 'react';
import { supabase } from '../lib/supabase';
import type { Anime } from '../types/database';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function AnimeManager() {
  const [animes, setAnimes] = React.useState<Anime[]>([]);
  const [newAnime, setNewAnime] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAnimes();
  }, []);

  async function fetchAnimes() {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('name');

    if (error) {
      setError('Error al cargar animes');
      return;
    }

    setAnimes(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newAnime.trim()) return;

    const { error } = await supabase
      .from('anime')
      .insert({ name: newAnime.trim() });

    if (error) {
      setError('Error al crear anime');
      return;
    }

    setNewAnime('');
    fetchAnimes();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('anime')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Error al eliminar anime');
      return;
    }

    fetchAnimes();
  }

  async function handleUpdate(id: string, newName: string) {
    const { error } = await supabase
      .from('anime')
      .update({ name: newName })
      .eq('id', id);

    if (error) {
      setError('Error al actualizar anime');
      return;
    }

    setEditingId(null);
    fetchAnimes();
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Gestionar Animes</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newAnime}
          onChange={(e) => setNewAnime(e.target.value)}
          placeholder="Nuevo anime"
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
        {animes.map((anime) => (
          <li
            key={anime.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          >
            {editingId === anime.id ? (
              <input
                type="text"
                defaultValue={anime.name}
                onBlur={(e) => handleUpdate(anime.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdate(anime.id, e.currentTarget.value);
                  }
                }}
                className="flex-1 p-1 border rounded mr-2"
                autoFocus
              />
            ) : (
              <span>{anime.name}</span>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(anime.id)}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Editar anime"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(anime.id)}
                className="text-red-600 hover:text-red-800"
                aria-label="Eliminar anime"
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