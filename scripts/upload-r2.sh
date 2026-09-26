#!/usr/bin/env bash
# Заливка out-media/ в Cloudflare R2 через wrangler (вход: npx wrangler login — ключи S3 не нужны).
# Создаёт бакет и публичный r2.dev-URL, если их ещё нет, и печатает URL для NEXT_PUBLIC_CDN_BASE.
# usage: scripts/upload-r2.sh [bucket=sergeev-media] [local_dir=out-media]
set -euo pipefail
BUCKET="${1:-sergeev-media}"
SRC="${2:-out-media}"
WRANGLER="${WRANGLER:-npx -y wrangler@4}"
[[ -d "$SRC" ]] || { echo "✗ нет папки $SRC" >&2; exit 66; }

if ! $WRANGLER r2 bucket info "$BUCKET" >/dev/null 2>&1; then
  echo "── создаю бакет $BUCKET"
  $WRANGLER r2 bucket create "$BUCKET"
fi
# Публичный доступ через r2.dev (для продакшна лучше свой домен: r2 bucket domain add)
$WRANGLER r2 bucket dev-url enable "$BUCKET" --force >/dev/null 2>&1 || true

FAILED="$(mktemp)"
cd "$SRC"
find . -type f \( -name '*.mp4' -o -name '*.jpg' -o -name '*.webp' \) | sed 's|^\./||' | sort | while read -r key; do
  case "$key" in
    *.mp4) type=video/mp4 ;;
    *.jpg) type=image/jpeg ;;
    *.webp) type=image/webp ;;
  esac
  ok=0
  for attempt in 1 2 3 4; do
    if $WRANGLER r2 object put "$BUCKET/$key" --file "$key" --remote --content-type "$type" \
      --cache-control "public, max-age=31536000, immutable" >/dev/null 2>&1; then
      ok=1
      break
    fi
    sleep $((attempt * 3)) # сеть моргнула — повторяем с паузой
  done
  if [[ $ok == 1 ]]; then echo "↑ $key"; else echo "✗ $key" && echo "$key" >>"$FAILED"; fi
done
[[ -s "$FAILED" ]] && { echo "✗ не залиты:"; cat "$FAILED"; exit 1; }

echo "✓ залито. Публичный URL:"
$WRANGLER r2 bucket dev-url get "$BUCKET"
