# Approved pixel asset pack

This directory describes the raw game assets prepared before the Phaser world is
rewired. They are intentionally kept separate from the currently running
prototype until the full pack has passed validation.

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
- `closed-island-example.png` and `island-collision-preview.png`: a five-route
  closed-island composition and its debug-only walkability proof.

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

The source design board under `docs/approved-references/` is user-provided art
direction. The `scripts/build-approved-assets.*` build turns the approved
direction into raw runtime sheets and strips all board chrome from the shipped
terrain atlas.
