# igm-dynamic

Application **IGM** — site public + back-office Payload dans **un seul projet Next.js**.

| URL | Rôle |
|-----|------|
| `/` | Site public |
| `/admin` | Back-office Payload |
| `/api/*` | API Payload (+ `/api/signalement` métier) |

## Dossier

Tout vit dans [`igm-next/`](./igm-next/) — un seul déploiement Vercel.

## Démarrage local

```bash
cd igm-next
cp .env.example .env.local
# Renseigner DATABASE_URI (Neon) + PAYLOAD_SECRET

npm ci
npm run dev
```

- Site : http://localhost:3000  
- Admin : http://localhost:3000/admin  

## Vercel

- **Un projet**, Root Directory : `igm-next`
- Variables : voir `igm-next/.env.example`

## cPanel (optionnel)

Toujours supporté via `server.js`, `BASE_PATH=/igm`, `npm run build:cpanel`.
