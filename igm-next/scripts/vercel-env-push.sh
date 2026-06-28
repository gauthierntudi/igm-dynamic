#!/usr/bin/env bash
# Importe les variables de .env.local vers Vercel (Production).
# Prérequis : npm i -g vercel && vercel login && vercel link (dans igm-next/)
#
# Usage :
#   cd igm-next
#   ./scripts/vercel-env-push.sh
#
# Après le 1er déploiement, mettez NEXT_PUBLIC_SERVER_URL à l’URL Vercel finale
# puis relancez ce script ou modifiez la variable dans le dashboard.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.local"

if ! command -v vercel >/dev/null 2>&1; then
  echo "Installez la CLI : npm i -g vercel"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Fichier introuvable : $ENV_FILE"
  exit 1
fi

cd "$ROOT"

# Clés à ne pas pousser sur Vercel
SKIP='^(BASE_PATH|#|^\s*$)'

echo "→ Import des variables vers Vercel (environment: production)"
echo "  Source : .env.local"
echo ""

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ $SKIP ]] && continue
  [[ "$line" != *=* ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  # Retirer guillemets externes
  value="${value%\"}"
  value="${value#\"}"

  if [[ "$key" == "NEXT_PUBLIC_SERVER_URL" && "$value" == *localhost* ]]; then
    echo "⚠ Ignoré (localhost) : $key — définissez l’URL Vercel dans le dashboard après le 1er deploy"
    continue
  fi

  printf '%s' "$value" | vercel env add "$key" production --force >/dev/null
  echo "✓ $key"
done < "$ENV_FILE"

echo ""
echo "Terminé. Vérifiez : vercel env ls"
echo "Puis : vercel --prod"
