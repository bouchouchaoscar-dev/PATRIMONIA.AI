#!/usr/bin/env bash
# deploy.sh — commit + push + vérification Vercel
# Usage : ./deploy.sh "message de commit"
set -e

export PATH="$HOME/.npm-global/bin:$PATH"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

MSG="${1:-mise à jour}"

echo "▶ Git status..."
git status --short

echo ""
echo "▶ Staging..."
git add -A

if git diff --cached --quiet; then
  echo "  Rien à committer — arbre de travail propre."
else
  echo "▶ Commit : $MSG"
  git commit -m "$MSG"
fi

echo "▶ Push → origin/main..."
git push origin main

echo ""
echo "▶ Dernier déploiement Vercel..."
DEPLOY_URL=$(vercel ls patrimonia-ai 2>/dev/null | grep -E 'patrimonia-' | awk '{print $3}' | head -1)
STATUS=$(vercel ls patrimonia-ai 2>/dev/null | grep -E 'patrimonia-' | head -1)

echo "  $STATUS"
echo ""

if echo "$STATUS" | grep -q "● Ready"; then
  echo "✅ Commit OK  |  Push OK  |  Vercel Ready  |  Aucune erreur build"
  echo "   URL : $DEPLOY_URL"
else
  echo "⏳ Déploiement en cours — vérifier sur vercel.com/dashboard"
fi
