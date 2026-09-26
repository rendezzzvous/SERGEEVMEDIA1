# shellcheck shell=bash
# Все выходы помечаются как SDR BT.709: iPhone-исходники бывают HLG/Dolby Vision, а браузеры рисуют HDR-теги по-разному.
# Общие проверки для скриптов кодирования. Подключается через `source`.
set -euo pipefail

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "✗ нужен $1 (${2:-brew install $1})" >&2; exit 1; }
}

need ffmpeg

usage_io() {
  if [[ $# -lt 2 ]]; then
    echo "usage: $(basename "$0") <input> <output>" >&2
    exit 64
  fi
  [[ -f "$1" ]] || { echo "✗ нет файла $1" >&2; exit 66; }
  mkdir -p "$(dirname "$2")"
}
