#!/usr/bin/env bash
set -euo pipefail

# Raw PNG build for the approved visual direction. The board is stored only as
# user-approved source reference; the resulting atlas contains no board UI.
node scripts/build-approved-assets.mjs

find /tmp/portfolio-approved-assets-svg -maxdepth 1 -name '*.svg' -print0 |
  xargs -0 -n1 -P4 sh -c 'name=$(basename "$0" .svg); magick -background none "$0" -define png:color-type=6 "public/assets/pixel/approved/$name.png"'

mkdir -p /tmp/approved-terrain-cells
for row in $(seq 0 7); do
  for column in $(seq 0 7); do
    x=$((28 + column * 47))
    y=$((86 + row * 52))
    magick docs/approved-references/phase3-approved-board.png -crop 36x36+"$x"+"$y" +repage -filter point -resize '32x32!' "/tmp/approved-terrain-cells/t-$row-$column.png"
  done
done

magick montage /tmp/approved-terrain-cells/t-{0,1,2,3,4,5,6,7}-{0,1,2,3,4,5,6,7}.png \
  -background none -tile 8x8 -geometry 32x32+0+0 public/assets/pixel/approved/island-terrain-tileset.png
