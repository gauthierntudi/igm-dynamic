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

Repo GitHub : `gauthierntudi/igm-dynamic` — branche `main`.

### ⚠️ Root Directory (obligatoire)

Le code Next.js est dans **`igm-next/`**. Sans ce réglage, Vercel déploie la racine du repo en ~5 s et affiche **404 NOT_FOUND**.

1. Vercel → **Project → Settings → Build and Deployment**
2. Descendre jusqu'à **Root Directory** → **Edit** → saisir : `igm-next`
3. **Save** → **Deployments** → **Redeploy**

Le build doit durer **2–5 minutes** (Next.js + Payload), pas 5 secondes.

### Import projet

1. [vercel.com/new](https://vercel.com/new) → importer **igm-dynamic**
2. **Root Directory** : `igm-next`
3. Framework : **Next.js** (détecté automatiquement)
4. `vercel.json` est déjà dans `igm-next/` (build webpack, région `iad1`, API 60s)

### Variables d’environnement

Liste complète : [`igm-next/.env.vercel.example`](./igm-next/.env.vercel.example)

| Variable | Notes |
|----------|--------|
| `DATABASE_URI` | Neon PostgreSQL (pooler) |
| `PAYLOAD_SECRET` | Identique à la prod locale |
| `NEXT_PUBLIC_SERVER_URL` | **`https://votre-projet.vercel.app`** (pas localhost) |
| `S3_*`, `NEXT_PUBLIC_CDN_URL` | Médias CloudFront |
| `PAYLOAD_CLIENT_UPLOADS` | `true` |
| `HOME_STATS_SECTION_VISIBLE` | `false` |
| `HOME_ORG_CHART_UNITS_VISIBLE` | `false` |

**Option A — Dashboard** : Vercel → Settings → Environment Variables → coller depuis `.env.local`.

**Option B — CLI** (après `vercel link` dans `igm-next/`) :

```bash
cd igm-next
chmod +x scripts/vercel-env-push.sh
./scripts/vercel-env-push.sh
# Puis définir NEXT_PUBLIC_SERVER_URL manuellement avec l’URL Vercel
vercel --prod
```

### Après le 1er déploiement

1. Copier l’URL Vercel (ex. `https://igm-dynamic.vercel.app`)
2. Mettre à jour `NEXT_PUBLIC_SERVER_URL` dans Vercel
3. **Redeploy** (Deployments → … → Redeploy)
4. Tester `/`, `/admin`, upload média

### Déploiements suivants

Chaque push sur `main` redéploie automatiquement.

## cPanel (optionnel)

Toujours supporté via `server.js`, `BASE_PATH=/igm`, `npm run build:cpanel`.
