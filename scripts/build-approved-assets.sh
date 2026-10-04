#!/usr/bin/env bash
set -euo pipefail

# Raw PNG build for the approved visual direction. The board is stored only as
# user-approved source reference; the resulting atlas contains no board UI.
node scripts/build-approved-assets.mjs

find /tmp/portfolio-approved-assets-svg -maxdepth 1 -name '*.svg' -print0 |
  xargs -0 -n1 -P4 sh -c 'name=$(basename "$0" .svg); magick -background none "$0" -define png:color-type=6 "public/assets/pixel/approved/$name.png"'

# Normalize the v3 terrain atlas. The source is a presentation-free asset
# sheet with 16 columns; select 64 cells into the compact runtime 8x8 atlas.
mkdir -p /tmp/approved-terrain-cells
terrain_source=docs/approved-references/island-v3/environment-atlas-source.png
terrain_rows=(550 628 706 784 862 940)
terrain_index=0
for row in $(seq 0 5); do
  for column in $(seq 0 7); do
    x=$((column * 96))
    y="${terrain_rows[$row]}"
    magick "$terrain_source" -crop 96x76+"$x"+"$y" +repage -filter point -resize '32x32!' "/tmp/approved-terrain-cells/t-$(printf '%02d' "$terrain_index").png"
    terrain_index=$((terrain_index + 1))
  done
done
for column in $(seq 8 15); do
  x=$((column * 96))
  magick "$terrain_source" -crop 96x76+"$x"+550 +repage -filter point -resize '32x32!' "/tmp/approved-terrain-cells/t-$(printf '%02d' "$terrain_index").png"
  terrain_index=$((terrain_index + 1))
done
for column in $(seq 8 15); do
  x=$((column * 96))
  magick "$terrain_source" -crop 96x76+"$x"+628 +repage -filter point -resize '32x32!' "/tmp/approved-terrain-cells/t-$(printf '%02d' "$terrain_index").png"
  terrain_index=$((terrain_index + 1))
done

magick montage /tmp/approved-terrain-cells/t-{00..63}.png \
  -background none -tile 8x8 -geometry 32x32+0+0 public/assets/pixel/approved/island-terrain-tileset.png

# Water and shoreline animation frames are taken from the same v3 palette.
water_files=()
foam_files=()
for frame in $(seq 0 3); do
  x=$((frame * 96))
  water="/tmp/approved-terrain-cells/water-$frame.png"
  foam="/tmp/approved-terrain-cells/foam-$frame.png"
  magick "$terrain_source" -crop 96x76+"$x"+862 +repage -filter point -resize '32x32!' "$water"
  magick "$terrain_source" -crop 96x76+"$((x + 288))"+940 +repage -filter point -resize '32x32!' "$foam"
  water_files+=("$water")
  foam_files+=("$foam")
done
magick montage "${water_files[@]}" -background none -tile 4x1 -geometry 32x32+0+0 public/assets/pixel/approved/water-animation.png
magick montage "${foam_files[@]}" -background none -tile 4x1 -geometry 32x32+0+0 public/assets/pixel/approved/foam-animation.png

# Extract eight organic v3 trees. Low-alpha atmosphere between sprites is
# removed before trimming, leaving transparent assets with consistent anchors.
tree_tmp=/tmp/approved-tree-v3
mkdir -p "$tree_tmp/raw"
magick "$terrain_source" -crop 8x1@ +repage "$tree_tmp/raw/tree-%02d.png"
tree_files=()
for frame in $(seq 0 7); do
  source="$tree_tmp/raw/tree-$(printf '%02d' "$frame").png"
  destination="$tree_tmp/tree-$frame.png"
  magick "$source" -crop 192x280+0+0 +repage -channel A -threshold 10% +channel \
    -trim +repage -filter point -resize '60x90' -gravity south -background none -extent 64x96 "$destination"
  tree_files+=("$destination")
done
magick montage "${tree_files[@]}" -background none -tile 8x1 -geometry 64x96+0+0 public/assets/pixel/approved/island-tree-tileset.png

# Props are extracted from the same v3 environment master, removing the old
# geometric placeholder decorations from the approved directory.
normalize_prop() {
  local geometry="$1" destination="$2"
  magick "$terrain_source" -crop "$geometry" +repage -channel A -threshold 10% +channel \
    -trim +repage -filter point -resize '28x28' -gravity south -background none -extent 32x32 "$destination"
}
prop_geometries=(
  '120x150+0+315' '120x150+110+315' '120x150+220+315' '120x150+330+315'
  '150x150+500+300' '150x150+630+300' '150x150+750+300' '210x160+865+285'
  '130x145+1070+300' '130x145+1190+300' '130x145+1310+300' '130x145+1410+300'
  '120x120+0+430' '120x120+120+430' '120x120+390+430' '120x120+640+430'
)
prop_files=()
for frame in $(seq 0 15); do
  destination="/tmp/approved-terrain-cells/prop-$frame.png"
  normalize_prop "${prop_geometries[$frame]}" "$destination"
  prop_files+=("$destination")
done
magick montage "${prop_files[@]}" -background none -tile 8x2 -geometry 32x32+0+0 public/assets/pixel/approved/island-decoration-tileset.png

# Character v3 uses real, independently drawn poses from one palette-locked
# master sheet. Never synthesize walking by shifting a static body.
normalize_character_cell() {
  local source="$1" destination="$2"
  # Image generation can leave opaque fragments from a neighbouring grid cell
  # at an outer gutter. Select the largest connected alpha component so those
  # fragments never distort the character scale.
  local bounds
  bounds=$(magick "$source" -alpha extract -threshold 10% \
    -define connected-components:verbose=true -connected-components 8 null: 2>&1 | \
    awk '$5 ~ /255/ && $4 > area { area=$4; box=$2 } END { print box }')
  if [[ -z "$bounds" ]]; then
    echo "Could not isolate character in $source" >&2
    exit 1
  fi
  magick "$source" -crop "$bounds" +repage -filter point -resize '28x44' -gravity south \
    -background none -extent 32x48 -define png:color-type=6 "$destination"
}
character_tmp=/tmp/approved-character-v3
mkdir -p "$character_tmp/walk-raw" "$character_tmp/action-raw"
magick docs/approved-references/character-v3/walk-8dir-source.png -crop 8x8@ +repage "$character_tmp/walk-raw/frame-%02d.png"

directions=(south southwest west northwest north northeast east southeast)
for row in $(seq 0 7); do
  direction="${directions[$row]}"
  row_files=()
  idle_files=()
  for column in $(seq 0 7); do
    index=$((row * 8 + column))
    file="$character_tmp/${direction}-${column}.png"
    normalize_character_cell "$character_tmp/walk-raw/frame-$(printf '%02d' "$index").png" "$file"
    row_files+=("$file")
  done
  magick montage "${row_files[@]}" -background none -tile 8x1 -geometry 32x48+0+0 "$character_tmp/${direction}-row.png"
  # A restrained two-pixel breathing loop keeps the stopped pose alive without
  # reusing walking strides as idle motion.
  for column in $(seq 0 3); do
    idle="$character_tmp/${direction}-idle-${column}.png"
    y_offset=$((column == 1 || column == 2 ? 1 : 0))
    magick -size 32x48 xc:none "$character_tmp/${direction}-0.png" -geometry +0+$y_offset -compose over -composite "$idle"
    idle_files+=("$idle")
  done
  magick montage "${idle_files[@]}" -background none -tile 4x1 -geometry 32x48+0+0 "$character_tmp/${direction}-idle.png"
done
magick montage "$character_tmp"/{south,southwest,west,northwest,north,northeast,east,southeast}-row.png -background none -tile 1x8 -geometry 256x48+0+0 public/assets/pixel/approved/character-walk-8dir.png
magick montage "$character_tmp"/{south,southwest,west,northwest,north,northeast,east,southeast}-idle.png -background none -tile 1x8 -geometry 128x48+0+0 public/assets/pixel/approved/character-idle-8dir.png
cp "$character_tmp/south-0.png" public/assets/pixel/approved/character-master-v3.png

# The action master is a 6×3 grid: wave, sit-down, then a four-frame seated
# loop. Empty cells in the last row are intentionally ignored.
magick docs/approved-references/character-v3/actions-source.png -crop 6x3@ +repage "$character_tmp/action-raw/frame-%02d.png"
# The outer source cells are clipped by the generator canvas. Build complete
# motion arcs from the intact central cells only.
wave_sources=(1 2 3 4 3 2)
sit_sources=(7 7 8 9 10 10)
for frame in $(seq 0 5); do
  normalize_character_cell "$character_tmp/action-raw/frame-$(printf '%02d' "${wave_sources[$frame]}").png" "$character_tmp/wave-$frame.png"
  normalize_character_cell "$character_tmp/action-raw/frame-$(printf '%02d' "${sit_sources[$frame]}").png" "$character_tmp/sit-down-$frame.png"
done
sit_loop_sources=(14 15 14 15)
for frame in $(seq 0 3); do
  normalize_character_cell "$character_tmp/action-raw/frame-$(printf '%02d' "${sit_loop_sources[$frame]}").png" "$character_tmp/sit-loop-$frame.png"
done
magick montage "$character_tmp"/wave-{0,1,2,3,4,5}.png -background none -tile 6x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-wave-south.png
magick montage "$character_tmp"/sit-down-{0,1,2,3,4,5}.png -background none -tile 6x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-sit-down-south.png
magick montage "$character_tmp"/sit-loop-{0,1,2,3}.png -background none -tile 4x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-sit-loop-south.png
magick montage "$character_tmp"/sit-down-{5,4,3,2,1,0}.png -background none -tile 6x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-stand-up-south.png

# Reject regressions to duplicate/static frames before publishing the atlas.
for direction in "${directions[@]}"; do
  distinct=$(sha256sum "$character_tmp/$direction"-{0,1,2,3,4,5,6,7}.png | awk '{print $1}' | sort -u | wc -l)
  if (( distinct < 6 )); then
    echo "$direction walk cycle has only $distinct distinct frames" >&2
    exit 1
  fi
done
for pattern in 'wave-{0,1,2,3,4,5}' 'sit-down-{0,1,2,3,4,5}' 'sit-loop-{0,1,2,3}'; do
  # Brace expansion cannot be stored as data; enumerate through eval after
  # constraining the pattern to the constants above.
  distinct=$(eval "sha256sum $character_tmp/$pattern.png" | awk '{print $1}' | sort -u | wc -l)
  if (( distinct < 2 )); then
    echo "$pattern does not contain meaningful frame changes" >&2
    exit 1
  fi
done
for frame in $(seq 0 7); do
  magick -size 32x48 xc:none -fill '#6422ad' -draw "rectangle 4,4 28,44" -fill '#b56cff' -draw "rectangle 8,8 24,40" -compose over "$character_tmp/south-0.png" -geometry +0+0 -composite "$character_tmp/portal-$frame.png"
done
magick montage "$character_tmp"/portal-{0,1,2,3,4,5,6,7}.png -background none -tile 8x1 -geometry 32x48+0+0 public/assets/pixel/approved/character-portal-react.png

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
