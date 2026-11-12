/*
  # WhatsApp único como identificador de acceso

  - Índice único por dígitos del WhatsApp (así dos cuentas no comparten número,
    que ahora sirve para iniciar sesión)
*/

CREATE UNIQUE INDEX IF NOT EXISTS users_whatsapp_digits_unique
  ON public.users ((regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g')))
  WHERE whatsapp IS NOT NULL AND btrim(whatsapp) <> '';
