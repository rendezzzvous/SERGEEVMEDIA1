#!/usr/bin/env bash
# Всё портфолио одним заходом: исходники → out-media/ в структуре, которую ждёт content/videos.ts.
# usage: scripts/encode-portfolio.sh ~/Downloads/Видео [out-media]
#   PRESET=medium — быстрее (по умолчанию slow: меньше файлы при том же качестве)
#   ONLY=lebo-recipe — перекодировать один ролик
# Уже готовые файлы пропускаются — удалите нужный, чтобы пересобрать.
source "$(dirname "$0")/_common.sh"
SRC="${1:?usage: encode-portfolio.sh <папка с исходниками> [out-media]}"
OUT="${2:-out-media}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OUT"/{shorts,long,previews,posters,hero,intro}

# id | файл | начало превью (с) | кадр постера (с)
SHORTS=(
  "lebo-recipe|LEBOREPEATRECIPECINEMATOGRAPHY.MOV|6|4"
  "baran-yacht|BARANSNIPETYACHT.mov|8|6"
  "inresta-villa|INRESTALUXVILLA.mov|4|3"
  "toma-street-math|TOMANILIYAS.mov|10|8"
  "lebo-box|LEBOHARDFASHIONXD.MOV|1|2.5"
  "cyprus-life-horizon|CYPRUSLIFEHORIZON.mov|6|5"
  "lebo-top3|LEBOTOP3MOSTEXPENSIVESORTOFCOFFEE.MOV|8|10"
  "baran-sea|BARANSNIPETSEA.mov|5|6"
  "toma-sims|TOMATREND.mov|3|3"
  "lebo-artfact|LEBOARTNFCT14FEBCAMPAIGN.MOV|2|10"
  "inresta-ny2025|INRESTAPNY2025TARGET.mp4|12|14"
  "lebo-march8|LEBO8MARCHV1.mov|0|6"
  "luxbeauty-before-after|BEFOREAFTEREBEAUTYSALOON.MOV|3|13"
)
LONGS=(
  "cyprus-life-loyalty|CYPRUSLIFEPROGRAMLOYALTY.mp4|4|3"
  "my-blog|MYBLOGV1.MOV|40|44"
)

run() { # id file previewAt posterAt kind
  local id="$1" file="$SRC/$2" pv="$3" po="$4" kind="$5"
  [[ -n "${ONLY:-}" && "$ONLY" != "$id" ]] && return
  [[ -f "$file" ]] || { echo "✗ нет $file" >&2; return 1; }
  echo "── $id ($kind)"
  [[ -f "$OUT/$kind/$id.mp4" ]] || "$HERE/encode-$kind.sh" "$file" "$OUT/$kind/$id.mp4" >/dev/null 2>&1
  [[ -f "$OUT/previews/$id.mp4" ]] || "$HERE/encode-previews.sh" "$file" "$OUT/previews/$id.mp4" "$pv" >/dev/null 2>&1
  if [[ ! -f "$OUT/posters/$id.jpg" ]]; then
    local w=1280; [[ "$kind" == "shorts" ]] && w=720
    POSTER_W=$w "$HERE/posters.sh" "$OUT/$kind/$id.mp4" "$OUT/posters/$id" "$po" >/dev/null 2>&1
  fi
}

for row in "${SHORTS[@]}"; do IFS='|' read -r id f pv po <<<"$row"; run "$id" "$f" "$pv" "$po" shorts; done
for row in "${LONGS[@]}"; do IFS='|' read -r id f pv po <<<"$row"; run "$id" "$f" "$pv" "$po" long; done

# Интро «Обо мне»: родное 4:3, без полей
if [[ -z "${ONLY:-}" || "$ONLY" == "intro" ]] && [[ ! -f "$OUT/intro/intro.mp4" ]]; then
  echo "── intro"
  ffmpeg -hide_banner -v error -y -i "$SRC/MYINTRO.mov" \
    -vf "scale=-2:1080,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709" -c:v libx264 -profile:v high -preset "${PRESET:-slow}" -crf 22 -maxrate 6M -bufsize 12M \
    -c:a aac -b:a 160k -ac 2 -movflags +faststart "$OUT/intro/intro.mp4"
  POSTER_W=1280 "$HERE/posters.sh" "$OUT/intro/intro.mp4" "$OUT/posters/intro" 3 >/dev/null 2>&1
fi

# Hero без шоурила: три колонки вертикалок, каждая режется в своём ритме (2 / 3 / 4 с),
# поэтому склейки не совпадают. Цикл 12 с, немой, 1280×720.
if [[ -z "${ONLY:-}" || "$ONLY" == "hero" ]] && [[ ! -f "$OUT/hero/montage.mp4" ]]; then
  echo "── hero montage"
  # колонка | файл | старт | длительность
  SEGS=(
    "0|LEBOREPEATRECIPECINEMATOGRAPHY.MOV|14|2" "0|BARANSNIPETYACHT.mov|10|2" "0|INRESTALUXVILLA.mov|6|2"
    "0|LEBOHARDFASHIONXD.MOV|2|2" "0|TOMANILIYAS.mov|20|2" "0|BEFOREAFTEREBEAUTYSALOON.MOV|11|2"
    "1|CYPRUSLIFEHORIZON.mov|8|3" "1|LEBOARTNFCT14FEBCAMPAIGN.MOV|4|3" "1|BARANSNIPETSEA.mov|6|3" "1|LEBOEXCURSION.MOV|6|3"
    "2|LEBOSTSTYLEV2.MOV|3|4" "2|INRESTAPNY2025TARGET.mp4|16|4" "2|LEBOREPEATRECIPECINEMATOGRAPHY.MOV|30|4"
  )
  inputs=(); filters=""; cols=("" "" ""); i=0
  for s in "${SEGS[@]}"; do
    IFS='|' read -r col f ss dur <<<"$s"
    inputs+=(-ss "$ss" -t "$dur" -i "$SRC/$f")
    filters+="[$i:v]scale=640:1138:force_original_aspect_ratio=increase,crop=640:1138,fps=24,setsar=1,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v$i];"
    cols[$col]+="[v$i]"
    i=$((i + 1))
  done
  n0=$(grep -o '\[v' <<<"${cols[0]}" | wc -l | tr -d ' ')
  n1=$(grep -o '\[v' <<<"${cols[1]}" | wc -l | tr -d ' ')
  n2=$(grep -o '\[v' <<<"${cols[2]}" | wc -l | tr -d ' ')
  filters+="${cols[0]}concat=n=$n0:v=1:a=0[c0];${cols[1]}concat=n=$n1:v=1:a=0[c1];${cols[2]}concat=n=$n2:v=1:a=0[c2];"
  filters+="[c0][c1][c2]hstack=3,crop=1920:1080,scale=1280:720[out]"
  ffmpeg -hide_banner -v error -y "${inputs[@]}" -filter_complex "$filters" -map "[out]" -an \
    -c:v libx264 -profile:v main -preset "${PRESET:-slow}" -crf 27 -g 48 -movflags +faststart "$OUT/hero/montage.mp4"
  POSTER_W=1280 "$HERE/posters.sh" "$OUT/hero/montage.mp4" "$OUT/posters/hero" 0.5 >/dev/null 2>&1
fi

echo "✓ готово: $(du -sh "$OUT" | cut -f1) в $OUT"
