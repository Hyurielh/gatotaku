/*
  # Fecha de nacimiento del perfil

  - `birthdate` opcional (solo día/mes/año)
  - `birthdate_locked`: el cliente solo puede guardarla UNA vez;
    después solo un administrador puede cambiarla
*/

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS birthdate date,
  ADD COLUMN IF NOT EXISTS birthdate_locked boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS users_birthdate_idx ON public.users (birthdate)
  WHERE birthdate IS NOT NULL;
