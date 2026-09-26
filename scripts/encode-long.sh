#!/usr/bin/env bash
# Горизонтальный ролик для лайтбокса: 1920×1080 (вписать + поля), H.264 High, AAC 160k, faststart.
# usage: scripts/encode-long.sh raw/film.mov out-media/long/l02.mp4
source "$(dirname "$0")/_common.sh"
usage_io "$@"

ffmpeg -hide_banner -y -i "$1" \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709" \
  -c:v libx264 -profile:v high -level 4.1 -preset "${PRESET:-slow}" -crf 23 -maxrate 2800k -bufsize 5600k \
  -c:a aac -b:a 160k -ac 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart \
  "$2"
