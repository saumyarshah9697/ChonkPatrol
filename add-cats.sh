#!/bin/sh
# Add new cats to the Chonk Patrol pool (additive — nothing is archived
# or removed; the game cats only ever grow).
#
# Usage:
#   ./add-cats.sh /path/to/new/photos
#
# What it does:
#   1. Clears raw-cats/ and imports the new photos with date-stamped names
#      (jpg/jpeg/png/webp; HEIC is converted to jpg via sips)
#   2. Runs cut-cats.cjs to cut the cats out and MERGES them into the
#      catImages list in config.js (existing cats stay)
#
# Nothing is committed or pushed: review the new cutouts, delete any bad
# ones (and their config.js line), then ./publish.sh.

set -eu

SRC="${1:?usage: ./add-cats.sh /path/to/new/photos}"
cd "$(dirname "$0")"

if [ ! -d "$SRC" ]; then
  echo "Source folder not found: $SRC" >&2
  exit 1
fi

count=$(find "$SRC" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.heic' \) | wc -l | tr -d ' ')
if [ "$count" -eq 0 ]; then
  echo "No photos (jpg/jpeg/png/webp/heic) found in $SRC" >&2
  exit 1
fi
echo "$count new photo(s) in $SRC"

day=$(date +%Y%m%d)
rm -rf raw-cats
mkdir -p raw-cats
i=1
find "$SRC" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.heic' \) | sort | while IFS= read -r f; do
  case "$f" in
    *.heic|*.HEIC)
      sips -s format jpeg "$f" --out "raw-cats/cat-$day-$(printf '%02d' "$i").jpg" >/dev/null
      ;;
    *)
      ext=$(printf '%s' "$f" | sed 's/.*\.//' | tr '[:upper:]' '[:lower:]')
      cp "$f" "raw-cats/cat-$day-$(printf '%02d' "$i").$ext"
      ;;
  esac
  i=$((i + 1))
done
echo "Imported $(ls raw-cats | wc -l | tr -d ' ') photo(s) into raw-cats/"

node cut-cats.cjs --write-config

echo ""
echo "Done. Review the new cutouts in assets/cats/, then ./publish.sh to ship."
