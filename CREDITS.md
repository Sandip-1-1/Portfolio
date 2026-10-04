# Asset credits

All third-party game assets in this repository are free to use. License records
are kept beside the distributed files so that a static deployment preserves the
provenance.

## Pixel art

- **Basic Village Tileset** — Forchild. CC0 1.0. This is the primary source for
  outdoor ground, water, paths, house surfaces, trees, bushes, furniture, and
  interior decoration. Original creator page:
  <https://forchild.itch.io/village-tileset>. The included files are
  `Outdoor_tileset.png`, `House_tileset.png`, `Trees_and_bushes.png`, and
  `Furniture.png`. See `public/assets/pixel/Forchild/LICENSE.txt`.
- **16x16 base sprites** — Unnamed. CC0 1.0. Original creator page:
  <https://opengameart.org/content/16x16-base-sprites>. The earlier reference
  files are retained under `docs/archive-assets/` but are no longer shipped or
  used by the website. See
  `public/assets/pixel/BASE-SPRITE-LICENSE.txt`.
- **Sandip v3 eight-direction character sheet** — original project artwork
  generated with OpenAI image generation from Sandip's approved avatar, then
  deterministically cropped, alpha-cleaned, nearest-neighbor normalized, and
  validated as 32×48 frames. One palette-locked master supplies all directions
  and actions; no third-party character asset is redistributed.
- **Five village building facades** — original project assets generated with
  OpenAI image generation from a project-specific Nepal-inspired pixel-art
  brief, then individually cropped, heavily downsampled, palette-reduced, and
  nearest-neighbor scaled for a consistent game-pixel grid. They contain no
  third-party game artwork. The working sources are retained under
  `docs/approved-references/buildings-v2/` and are excluded from the static
  build.
- Walking poses follow general animation principles from Sandro Maglione's
  freely accessible [Pixel art Character Animations guide](https://www.sandromaglione.com/articles/pixel-art-character-animations-guide): opposing arm/leg poses, contact frames, and a one-pixel body bounce. No guide artwork is redistributed.
- **Approved pixel asset pack** — original project runtime sheets built from
  OpenAI-generated v3 character/environment masters, original building
  masters, and deterministic local source scripts. The
  working references are retained under `docs/approved-references/`; only
  clean raw PNG sheets under `public/assets/pixel/approved/` are intended for
  runtime use. No Pinterest or paid-pack artwork is copied into this pack.

## Audio

- **Park Ambiences** — Thimras. CC0 1.0. Original creator page:
  <https://opengameart.org/content/park-ambiences>. Birds, river, and wind were
  trimmed and compressed to Ogg Vorbis for the web. The portal and footstep
  effects are original transformations of the CC0 wind recording.
- **Chill lofi inspired [loop edit]** — original music by omfgdude, loop edit
  by qubodup. CC0 1.0. Original creator page:
  <https://opengameart.org/content/chill-lofi-inspired-loop-edit>.

The approved Not Jam Music Pack was evaluated and its CC0 license verified at
<https://not-jam.itch.io/not-jam-music-pack>. Its official itch.io zero-price
download flow did not expose a stable distributable file URL during this build,
so the verified CC0 OpenGameArt loop above is used instead. No paid asset is
used.

## Application assets

- Interface icons: Lucide, ISC License.
- **Pixelify Sans** — Pixelify Sans Project Authors. SIL Open Font License 1.1.
  Source: <https://github.com/google/fonts/tree/main/ofl/pixelifysans>. The font
  is self-hosted so game and interface labels remain available on static hosts;
  the complete license is stored at `public/assets/fonts/OFL.txt`.
- Portfolio photography, résumé, and project screenshots: supplied by Sandip
  Sapkota.
- No Pinterest image or paid LimeZu asset is included.
