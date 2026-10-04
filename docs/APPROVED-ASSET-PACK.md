# Approved pixel asset pack

This directory describes the current raw game assets consumed by the Phaser
world. Legacy character v2 masters and placeholder island previews are excluded.

## Contents

- `character-*.png`: 32×48 anchored avatar sheets. Walk uses eight directions
  and eight frames each; idle, wave, sit, stand, and portal reaction are
  separate sheets.
- `island-terrain-tileset.png`: 8×8 atlas of 32×32 terrain cells.
- `water-animation.png` and `foam-animation.png`: four-frame 32×32 loops.
- `island-decoration-tileset.png` and `island-tree-tileset.png`: sparse props
  and tree assets.
- `building-*.png`: five inward-facing portfolio buildings, portal variants,
  shadows, collision masks, and interaction masks.
- `sign-*.png` and `wayfinding-*.png`: five building plaques and five
  single-arrow route signs.

## Guarantees

- Character anchor: `(16, 46)` in every 32×48 frame.
- Exactly five paths: North, Northeast, Southeast, Southwest, Northwest.
- The grass lip is walkable; the cliff, foam, and ocean are blocked.
- Every PNG has alpha and a fixed native dimension.
- Runtime files do not include labels, design-board UI, or Gemini presentation
  backgrounds.

## Rebuild and verify

```bash
npm run assets:approved
npm run assets:verify
```

The v3 character and environment masters under `docs/approved-references/` are
original project artwork. The `scripts/build-approved-assets.*` build turns
them into raw runtime sheets and strips transparent-gutter artifacts from the
shipped atlases.
