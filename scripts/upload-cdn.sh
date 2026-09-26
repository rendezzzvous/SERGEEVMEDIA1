#!/usr/bin/env bash
# Заливка ./out-media на CDN через rclone (R2 / Bunny / любой S3). Файлы immutable → версионируйте имена.
# usage: RCLONE_REMOTE=r2:sergeev-media scripts/upload-cdn.sh [local_dir=out-media]
set -euo pipefail
command -v rclone >/dev/null 2>&1 || { echo "✗ нужен rclone (brew install rclone, затем rclone config)" >&2; exit 1; }
SRC="${1:-out-media}"
DEST="${RCLONE_REMOTE:-r2:sergeev-media}"
[[ -d "$SRC" ]] || { echo "✗ нет папки $SRC" >&2; exit 66; }

rclone copy "$SRC" "$DEST" --checksum -P \
  --header-upload "Cache-Control: public, max-age=31536000, immutable"
echo "✓ залито в $DEST — пути в content/videos.ts указывайте относительно NEXT_PUBLIC_CDN_BASE"
