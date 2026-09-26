#!/usr/bin/env bash
# Постер из кадра на 1.5 с: <base>.jpg (q 2) + <base>.webp (quality 82). BW=1 → чёрно-белый.
# usage: scripts/posters.sh out-media/shorts/s01.mp4 out-media/posters/s01 [time=1.5]
#        BW=1 scripts/posters.sh ...
set -euo pipefail
source "$(dirname "$0")/_common.sh"
if [[ $# -lt 2 ]]; then echo "usage: $(basename "$0") <input> <output-base-without-ext> [time]" >&2; exit 64; fi
[[ -f "$1" ]] || { echo "✗ нет файла $1" >&2; exit 66; }
mkdir -p "$(dirname "$2")"
AT="${3:-1.5}"
FILTER="scale='min(${POSTER_W:-1280},iw)':-2"
[[ "${BW:-0}" == "1" ]] && FILTER="$FILTER,hue=s=0"

ffmpeg -hide_banner -y -ss "$AT" -i "$1" -frames:v 1 -vf "$FILTER" -q:v 2 "$2.jpg"
# WebP — только если ffmpeg собран с libwebp (brew-сборка без него); сайт использует JPG
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libwebp; then
  ffmpeg -hide_banner -y -ss "$AT" -i "$1" -frames:v 1 -vf "$FILTER" -c:v libwebp -quality 82 "$2.webp"
fi
echo "✓ $2.jpg"
