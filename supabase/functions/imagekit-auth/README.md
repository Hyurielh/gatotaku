# Edge Function: `imagekit-auth`

Genera credenciales de subida de un solo uso para ImageKit (Upload API v1, token-based auth).

El navegador nunca conoce la private key: pide un token a esta función y sube el archivo directo a
`https://upload.imagekit.io/api/v1/files/upload`. La función valida la sesión de Supabase antes de responder.

## Secrets requeridos

| Secret | Valor | Origen |
|---|---|---|
| `IMAGEKIT_PRIVATE_KEY` | `private_xxx` | Dashboard → Developer Options → API Keys |
| `IMAGEKIT_PUBLIC_KEY` | `public_xxx` | Dashboard → Developer Options → API Keys |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/gatotakunic` | Dashboard → URL Endpoints |

> El url endpoint de la cuenta de Gatotaku es `gatotakunic` (no `gatotaku`). ImageKit devuelve siempre las URLs
> con su endpoint real, pero el secret debe coincidir con el del dashboard.

Los secrets se guardan en Supabase, nunca en el repo ni en `.env` del front.

## Deploy

```bash
npm i -g supabase
supabase login
supabase link --project-ref qpxjmkwebtehwbxbsefs
supabase secrets set --yes IMAGEKIT_PRIVATE_KEY=private_xxx IMAGEKIT_PUBLIC_KEY=public_xxx IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/gatotakunic
supabase functions deploy imagekit-auth
```

## Local

```bash
supabase functions serve imagekit-auth --env-file supabase/functions/.env.local
```

## Contrato

`POST /functions/v1/imagekit-auth` →

```json
{
  "token": "uuid",
  "expire": 1762800000,
  "signature": "hmac-sha1-hex",
  "publicKey": "public_xxx",
  "urlEndpoint": "https://ik.imagekit.io/gatotakunic"
}
```

- `signature = HMAC-SHA1(privateKey, token + expire)` en hexadecimal minúscula.
- `expire` es unix timestamp en segundos, máximo 1 hora en el futuro (la función usa 30 min).
- `token` es de un solo uso: ImageKit rechaza reintentos con el mismo token.
