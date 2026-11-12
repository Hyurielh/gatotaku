import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, ImagePlus, Loader, Eye, EyeOff, Newspaper } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadImageToImageKit } from '../../lib/imagekit';
import { deletePost, fetchNews, savePost, setPostPublished, type PostInput } from '../../lib/news';
import type { NewsPost } from '../../types/database';

const EMPTY_POST: PostInput = {
  title: '',
  excerpt: '',
  body: '',
  image_url: '',
  is_published: true,
};

export function PostManager() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostInput>(EMPTY_POST);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      setPosts(await fetchNews(true));
    } catch {
      toast.error('No se pudieron cargar las novedades');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const openCreate = () => {
    setForm(EMPTY_POST);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (post: NewsPost) => {
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? '',
      body: post.body ?? '',
      image_url: post.image_url ?? '',
      is_published: post.is_published,
    });
    setEditingId(post.id);
    setIsFormOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setIsUploading(true);

    try {
      const url = await uploadImageToImageKit(file, { folder: 'NOVEDADES' });
      setForm((current) => ({ ...current, image_url: url }));
      toast.success('Imagen subida');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Escribe un título');
      return;
    }

    setIsSaving(true);

    try {
      await savePost(form, editingId ?? undefined);
      toast.success(editingId ? 'Novedad actualizada' : 'Novedad publicada');
      setIsFormOpen(false);
      setEditingId(null);
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la novedad');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublished = async (post: NewsPost) => {
    try {
      await setPostPublished(post.id, !post.is_published);
      await loadAll();
    } catch {
      toast.error('No se pudo cambiar la visibilidad');
    }
  };

  const remove = async (post: NewsPost) => {
    if (!window.confirm(`¿Eliminar la novedad "${post.title}"?`)) return;

    try {
      await deletePost(post.id);
      toast.success('Novedad eliminada');
      await loadAll();
    } catch {
      toast.error('No se pudo eliminar la novedad');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Novedades</h2>
          <p className="text-sm text-slate-500">
            Publica noticias, nuevos productos o promociones para los clientes.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus size={16} aria-hidden="true" />
          Nueva novedad
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={submit} className="panel space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Editar novedad' : 'Nueva novedad'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Cerrar formulario"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div>
            <label className="field-label" htmlFor="post-title">Título</label>
            <input
              id="post-title"
              type="text"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="field"
              placeholder="Nuevos peluches de One Piece"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="post-excerpt">Resumen corto</label>
            <input
              id="post-excerpt"
              type="text"
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              className="field"
              placeholder="Una línea que se ve en la tarjeta"
              maxLength={180}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="post-body">Contenido</label>
            <textarea
              id="post-body"
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              className="field"
              rows={8}
              placeholder={'Escribe la novedad...\n\nPuedes usar saltos de línea.'}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="post-image">Imagen</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="post-image"
                type="url"
                value={form.image_url}
                onChange={(event) => setForm({ ...form, image_url: event.target.value })}
                className="field flex-1"
                placeholder="https://... (o sube una imagen)"
              />
              <label className="btn-secondary cursor-pointer shrink-0">
                {isUploading ? (
                  <Loader className="animate-spin" size={15} aria-hidden="true" />
                ) : (
                  <ImagePlus size={15} aria-hidden="true" />
                )}
                Subir
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Puedes usar una URL externa (no consume tu cuenta de ImageKit) o subirla a ImageKit.
            </p>

            {form.image_url && (
              <img
                src={form.image_url}
                alt="Vista previa"
                className="mt-2 h-32 w-full max-w-xs rounded-lg border border-slate-200 object-cover"
              />
            )}
          </div>

          <label htmlFor="post-published" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              id="post-published"
              type="checkbox"
              checked={form.is_published}
              onChange={(event) => setForm({ ...form, is_published: event.target.checked })}
              className="h-4 w-4 rounded border-teal-300 accent-teal-600"
            />
            Visible para los clientes
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              <Save size={15} aria-hidden="true" />
              {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Publicar novedad'}
            </button>
          </div>
        </form>
      )}

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full divide-y divide-slate-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Novedad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500">
                    Cargando novedades...
                  </td>
                </tr>
              )}

              {!isLoading && posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500">
                    <Newspaper className="mx-auto mb-2 h-6 w-6 text-slate-300" aria-hidden="true" />
                    Aún no hay novedades.
                  </td>
                </tr>
              )}

              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt=""
                          className="h-11 w-16 shrink-0 rounded-md border border-slate-200 object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-300">
                          <Newspaper size={18} aria-hidden="true" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{post.title}</p>
                        {post.excerpt && (
                          <p className="truncate text-xs text-slate-500">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600">
                    {new Date(post.published_at).toLocaleDateString('es-NI')}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        post.is_published ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600',
                      ].join(' ')}
                    >
                      {post.is_published ? 'Publicada' : 'Oculta'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void togglePublished(post)}
                        className="text-amber-600 hover:text-amber-800"
                        aria-label={post.is_published ? `Ocultar ${post.title}` : `Publicar ${post.title}`}
                        title={post.is_published ? 'Ocultar' : 'Publicar'}
                      >
                        {post.is_published ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        className="text-slate-600 hover:text-slate-900"
                        aria-label={`Editar ${post.title}`}
                        title="Editar"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(post)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Eliminar ${post.title}`}
                        title="Eliminar"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
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
