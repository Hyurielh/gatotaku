/**
 * Borra de ImageKit una imagen a partir de su URL pública (best effort).
 * Se usa al eliminar una cuenta para no dejar archivos huérfanos.
 */
export async function deleteImageKitFileByUrl(url: string | null | undefined): Promise<boolean> {
  if (!url) return false;

  const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
  if (!privateKey) return false;

  try {
    const fileName = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() ?? '');
    if (!fileName) return false;

    const authHeader = { Authorization: `Basic ${btoa(`${privateKey}:`)}` };

    const listResponse = await fetch(
      `https://api.imagekit.io/v1/files?name=${encodeURIComponent(fileName)}`,
      { headers: authHeader },
    );
    const files = await listResponse.json();

    if (!Array.isArray(files) || files.length === 0) return false;

    const fileId = files[0].fileId ?? files[0].id;
    const deleteResponse = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: authHeader,
    });

    return deleteResponse.ok;
  } catch (error) {
    console.error('deleteImageKitFileByUrl error', error);
    return false;
  }
}
