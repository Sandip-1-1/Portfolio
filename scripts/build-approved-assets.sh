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

# Rich character v2 masters: generated as original reference art, normalized
# locally to transparent 32×48 cells, then assembled deterministically.
normalize_character() {
  local source="$1" destination="$2"
  magick "$source" -alpha on -fuzz 8% -fill none -draw 'color 0,0 floodfill' -trim +repage -filter point -resize '32x48!' "$destination"
}
mkdir -p /tmp/approved-character-v2
normalize_character docs/approved-references/character-v2/character-master-generated.png /tmp/approved-character-v2/south.png
normalize_character docs/approved-references/character-v2/character-back-generated.png /tmp/approved-character-v2/north.png
normalize_character docs/approved-references/character-v2/character-west-generated.png /tmp/approved-character-v2/west.png
normalize_character docs/approved-references/character-v2/character-southwest-generated.png /tmp/approved-character-v2/southwest.png
magick /tmp/approved-character-v2/west.png -flop /tmp/approved-character-v2/east.png
magick /tmp/approved-character-v2/southwest.png -flop /tmp/approved-character-v2/southeast.png
magick /tmp/approved-character-v2/north.png -flop /tmp/approved-character-v2/northwest.png
magick /tmp/approved-character-v2/north.png /tmp/approved-character-v2/northeast.png
cp /tmp/approved-character-v2/south.png public/assets/pixel/approved/character-master-v2.png

frames=(-1 0 1 0 1 0 -1 0)
for direction in south southwest west northwest north northeast east southeast; do
  row_files=()
  for frame in $(seq 0 7); do
    offset="${frames[$frame]}"
    file="/tmp/approved-character-v2/${direction}-${frame}.png"
    magick -size 32x48 xc:none /tmp/approved-character-v2/${direction}.png -geometry +${offset}+$((frame % 2)) -compose over -composite "$file"
    row_files+=("$file")
  done
  magick montage "${row_files[@]}" -background none -tile 8x1 -geometry 32x48+0+0 "/tmp/approved-character-v2/${direction}-row.png"
done
magick montage /tmp/approved-character-v2/{south,southwest,west,northwest,north,northeast,east,southeast}-row.png -background none -tile 1x8 -geometry 256x48+0+0 public/assets/pixel/approved/character-walk-8dir.png

for direction in south southwest west northwest north northeast east southeast; do
  magick montage /tmp/approved-character-v2/${direction}-{0,1,2,3}.png -background none -tile 4x1 -geometry 32x48+0+0 "/tmp/approved-character-v2/${direction}-idle.png"
done
magick montage /tmp/approved-character-v2/{south,southwest,west,northwest,north,northeast,east,southeast}-idle.png -background none -tile 1x8 -geometry 128x48+0+0 public/assets/pixel/approved/character-idle-8dir.png

for frame in $(seq 0 9); do
  arm_y=$((24 - (frame < 3 ? frame * 5 : frame > 6 ? (9 - frame) * 5 : 15)))
  magick -size 32x48 xc:none /tmp/approved-character-v2/south.png -geometry +0+0 -compose over -composite -fill '#6f85b0' -draw "rectangle 3,$arm_y 7,$((arm_y + 12))" -fill '#d99e78' -draw "rectangle 3,$((arm_y - 2)) 7,$((arm_y + 2))" "/tmp/approved-character-v2/wave-$frame.png"
done
magick montage /tmp/approved-character-v2/wave-{0,1,2,3,4,5,6,7,8,9}.png -background none -tile 10x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-wave-south.png

for frame in $(seq 0 5); do
  # A compact seated silhouette keeps the new face, hair and jacket visible.
  magick -size 32x48 xc:none /tmp/approved-character-v2/south.png -crop 32x32+0+0 +repage -geometry +0+1 -compose over -composite -fill '#d8dee9' -draw "rectangle 8,33 24,40" -fill '#eceff4' -draw "rectangle 5,40 27,45" "/tmp/approved-character-v2/sit-down-$frame.png"
  magick -size 32x48 xc:none /tmp/approved-character-v2/south.png -geometry +0+$((frame % 2)) -compose over -composite "/tmp/approved-character-v2/stand-up-$frame.png"
done
magick montage /tmp/approved-character-v2/sit-down-{0,1,2,3,4,5}.png -background none -tile 6x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-sit-down-south.png
magick montage /tmp/approved-character-v2/sit-down-{0,1,2,3}.png -background none -tile 4x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-sit-loop-south.png
magick montage /tmp/approved-character-v2/stand-up-{0,1,2,3,4,5}.png -background none -tile 6x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-stand-up-south.png
for frame in $(seq 0 7); do
  magick -size 32x48 xc:none -fill '#6422ad' -draw "rectangle 4,4 28,44" -fill '#b56cff' -draw "rectangle 8,8 24,40" -compose over /tmp/approved-character-v2/south.png -geometry +0+0 -composite "/tmp/approved-character-v2/portal-$frame.png"
done
magick montage /tmp/approved-character-v2/portal-{0,1,2,3,4,5,6,7}.png -background none -tile 8x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-portal-react.png

# Swap in the richer hand-drawn building masters after the deterministic masks,
# signs and portal support sheets have been created by the Node source build.
for id in home about skills projects contact; do
  magick "docs/approved-references/buildings-v2/$id-source.png" -alpha on -fuzz 8% -fill none -draw 'color 0,0 floodfill' -trim +repage -filter point -resize '192x160!' "public/assets/pixel/approved/building-$id.png"
done

declare -A portal_x=( [home]=84 [about]=118 [skills]=82 [projects]=94 [contact]=96 )
declare -A portal_y=( [home]=102 [about]=100 [skills]=98 [projects]=100 [contact]=100 )
for id in home about skills projects contact; do
  x="${portal_x[$id]}"; y="${portal_y[$id]}"
  magick "public/assets/pixel/approved/building-$id.png" -stroke '#d08cff' -strokewidth 3 -fill '#6422ad' -draw "roundrectangle $x,$y $((x + 24)),$((y + 38)) 5,5" -fill '#b56cff' -draw "rectangle $((x + 7)),$((y + 5)) $((x + 17)),$((y + 33))" "public/assets/pixel/approved/building-$id-portal.png"
done
