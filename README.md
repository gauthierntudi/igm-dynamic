# igm-dynamic

Monorepo du site IGM — front public + back-office CMS.

| Dossier | Rôle | Déploiement |
|---------|------|-------------|
| [`igm-next/`](./igm-next/) | Site public Next.js | Vercel — **Root Directory** : `igm-next` |
| [`igm-cms/`](./igm-cms/) | Payload CMS (admin + API) | Vercel — **Root Directory** : `igm-cms` |

## Développement local

```bash
# Terminal 1 — CMS (port 3001)
cd igm-cms && cp .env.example .env && npm ci && npm run dev

# Terminal 2 — Front (port 3000)
cd igm-next && cp .env.example .env.local && npm ci && npm run dev
```

## Vercel (2 projets, 1 repo Git)

1. Importer le **même** dépôt GitHub deux fois (ou deux projets liés au même repo).
2. Projet **front** : Root Directory → `igm-next`
3. Projet **cms** : Root Directory → `igm-cms`
4. Variables d’environnement distinctes par projet (voir `.env.example` dans chaque dossier).

## Historique Git

Ce dépôt remplace l’ancien repo racine `igm-next` seul. L’historique de `IGM-OFFICIAL` reste sur GitHub si besoin.
