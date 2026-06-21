# igm-cms

Back-office **Payload CMS 3** pour le site IGM.

- **PostgreSQL** : Neon (`DATABASE_URI`)
- **Médias** : AWS S3 (+ CloudFront via `NEXT_PUBLIC_CDN_URL`)
- **Déploiement** : Vercel (`admin.igm…` ou projet dédié)

## Collections

| Slug | Usage |
|------|--------|
| `pages` | Pages du site (slug, hero, SEO) |
| `news` | Actualités |
| `stats` | Chiffres clés (`data-stat-key` côté front) |
| `media` | Médias publics → S3 `public/` |
| `signalements` | Signalements (création publique, lecture admin) |
| `signalement-files` | Pièces jointes privées → S3 `private/signalements/` |

## Global

- `site-settings` — téléphone, email, logo, etc.

## Démarrage local

```bash
cp .env.example .env
# Renseigner DATABASE_URI (Neon), PAYLOAD_SECRET, optionnel S3

npm ci
npm run dev
```

Admin : [http://localhost:3001/admin](http://localhost:3001/admin)

## Variables Vercel

Voir `.env.example`. Obligatoires en prod :

- `DATABASE_URI` (pooler Neon)
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `S3_*` + `NEXT_PUBLIC_CDN_URL` pour les uploads
- `FRONT_REVALIDATE_URL` + `FRONT_REVALIDATE_SECRET` (webhook vers `igm-next`)

## Clés chiffres (exemple seed)

| key | label |
|-----|--------|
| `provinces-presence` | Provinces de présence |
| `missions` | Missions de contrôle |
| `fraude` | Réseaux démantelés |
| `provinces` | Déploiement national |
| `inspecteurs` | Inspecteurs formés |
| `mandat` | Mois de réformes |
| `audits` | Entités auditées |

## Lien avec igm-next

Le front lit l’API REST Payload (`CMS_API_URL`) et invalide son cache via `POST /api/revalidate` à chaque publication.
