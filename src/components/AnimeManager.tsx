 
import React, { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Anime } from '../types/database';
import { Plus, Pencil, Trash2, Search, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

export function AnimeManager() {
  const [animes, setAnimes] = React.useState<Anime[]>([]);
  const [newAnime, setNewAnime] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 12;

  // fetchAnimes is stable enough here; include deps intentionally handled
   
  const fetchAnimes = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('anime')
        .select('*')
        .order('name');
        
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnimes(data || []); // Store all results
    } catch {
      toast.error('Error al cargar animes');
      setError('Error al cargar animes');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  React.useEffect(() => {
    fetchAnimes();
  }, [fetchAnimes]);

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // duplicate function removed; using the stable `fetchAnimes` callback above

  const filteredAnimes = React.useMemo(() => {
    return animes.filter(anime => 
      anime.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [animes, searchTerm]);
  
  const paginatedAnimes = React.useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredAnimes.slice(start, start + itemsPerPage);
  }, [filteredAnimes, page]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newAnime.trim()) return;

    try {
      const newItem = { name: newAnime.trim() };
      setAnimes(prev => [...prev, { ...newItem, id: 'temp' }]);
      
      const { error } = await supabase
        .from('anime')
        .insert(newItem);

      if (error) throw error;
      
      toast.success('Anime agregado exitosamente');
      setNewAnime('');
      fetchAnimes();
    } catch {
      toast.error('Error al crear anime');
      setError('Error al crear anime');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Estás seguro de eliminar este anime?')) return;

    try {
      setAnimes(prev => prev.filter(anime => anime.id !== id));
      
      const { error } = await supabase
        .from('anime')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Anime eliminado exitosamente');
    } catch {
      toast.error('Error al eliminar anime');
      setError('Error al eliminar anime');
      fetchAnimes(); // Revert on error
    }
  }

  async function handleUpdate(id: string, newName: string) {
    if (!newName.trim()) return;

    const originalAnimes = [...animes];
    try {
      setAnimes(prev => prev.map(anime => 
        anime.id === id ? { ...anime, name: newName } : anime
      ));
      
      const { error } = await supabase
        .from('anime')
        .update({ name: newName })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Anime actualizado exitosamente');
      setEditingId(null);
    } catch {
      setAnimes(originalAnimes); // Revert on error
      toast.error('Error al actualizar anime');
      setError('Error al actualizar anime');
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Gestionar Animes</h2>

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
            placeholder="Buscar anime..."
            className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

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

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {paginatedAnimes.map((anime) => (
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
              disabled={page * itemsPerPage >= filteredAnimes.length}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}