#!/usr/bin/env bash
set -euo pipefail

output_sheet="public/assets/pixel/sandip-eight-direction.png"
node scripts/build-character.mjs
magick -background none /tmp/sandip-eight-direction.svg -define png:color-type=6 "$output_sheet"
