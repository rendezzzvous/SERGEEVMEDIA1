#!/usr/bin/env bash
# Немое 8-секундное превью шириной 640px (автоплей карточек шортов и hover-превью long-form), ~1–2 MB.
# usage: scripts/encode-previews.sh raw/film.mov out-media/previews/l02.mp4 [start_seconds=5]
source "$(dirname "$0")/_common.sh"
usage_io "$@"
START="${3:-5}"

ffmpeg -hide_banner -y -ss "$START" -t 8 -i "$1" \
  -an \
  -vf "scale=640:-2,fps=24,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709" \
  -c:v libx264 -profile:v high -preset "${PRESET:-slow}" -crf 30 -g 48 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart \
  "$2"
