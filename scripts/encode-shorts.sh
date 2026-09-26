#!/usr/bin/env bash
# Вертикальный ролик для лайтбокса: 1080×1920 (cover-кроп), 30 fps, H.264 High 4.1, AAC 128k, faststart.
# usage: scripts/encode-shorts.sh raw/reel.mov out-media/shorts/s01.mp4
source "$(dirname "$0")/_common.sh"
usage_io "$@"

ffmpeg -hide_banner -y -i "$1" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709" \
  -c:v libx264 -profile:v high -level 4.1 -preset "${PRESET:-slow}" -crf 23 -maxrate 6M -bufsize 12M \
  -c:a aac -b:a 128k -ac 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart \
  "$2"
