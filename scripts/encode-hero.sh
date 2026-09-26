#!/usr/bin/env bash
# Немой фон hero: первые 25 секунд шоурила, 1280px, 24 fps, Main profile (старые iOS), GOP 2 с.
# usage: scripts/encode-hero.sh raw/showreel.mov out-media/hero/showreel.mp4 [start_seconds=0]
source "$(dirname "$0")/_common.sh"
usage_io "$@"
START="${3:-0}"

ffmpeg -hide_banner -y -ss "$START" -t 25 -i "$1" \
  -an \
  -vf "scale=1280:-2,fps=24,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709" \
  -c:v libx264 -profile:v main -preset "${PRESET:-slow}" -crf 28 -g 48 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart \
  "$2"
