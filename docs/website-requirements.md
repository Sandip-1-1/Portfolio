# Website Requirements — Sandip Sapkota Pixel-Art Portfolio

**Version:** 0.3 (approved implementation baseline)  
**Revision date:** 2026-10-03  
**Approval status:** Approved by user; implementation authorized  
**Source priority:** latest explicit user instructions → approved pixel-redesign handoff → earlier grilling answers → current prototype as implementation evidence

## 1. Project Overview

This project is Sandip Sapkota's static, browser-based developer portfolio presented as a compact top-down 2D pixel-art game. Visitors control a pixel character representing Sandip and explore a bounded Nepal-inspired village. Five labeled destinations open the portfolio's Home, About, Skills, Projects, and Contact content directly after their portal transitions.

> **Version 0.4 scope override:** The user removed all building interiors and bulletin-board gating. Any older interior requirement below is superseded by direct portal-to-content entry while the character remains outdoors at the selected building.

The site serves recruiters, hiring managers, engineering peers, collaborators, and visitors who may prefer either an exploratory game experience or immediate conventional navigation. Sandip is positioned as a full-stack developer whose current specialization is Django/backend development, with active growth in AI/ML, game development, and self-hosted infrastructure.

Two equally valid journeys are required:

- **Quick Tour:** menu-driven portal travel between destinations.
- **Explore Freely:** keyboard or pointer/touch movement through the village and interiors.

The established technical approach is React + TypeScript + Vite for semantic interface/content and Phaser 3 for the game world. The output must remain fully static. Formspree is the only external submission service. Portfolio content must remain accessible without operating the character.

The latest direction supersedes the earlier 2.5D/isometric concept: the approved target is top-down 2D pixel art.

## 2. Art Direction and Visual Identity

### Confirmed direction

- Top-down 2D pixel art, not 2.5D illustration and not real-time 3D.
- Pixel-perfect rendering with antialiasing disabled, nearest-neighbor presentation, rounded pixels, and integer camera zoom.
- A 16×16 world tile grid using the free CC0 **Forchild Basic Village Tileset** as the principal visual source. Final world and interior maps will be authored in Tiled and exported as `.tmj` files.
- No paid LimeZu assets, unlicensed Pinterest images, or assets without creator/license provenance.
- Nepal-inspired village identity through pitched roofs, courtyards, brick/wood colors, landscape, restrained motifs, and simple professional signage.
- Subtle technology/fantasy accents through purple portals, glowing signs, particles, and lighting. Cultivation-world influence must remain restrained enough that the site does not read as fandom or parody.
- Conventional, immediately understandable section labels remain visible: Home, About, Skills, Projects, and Contact.
- A cohesive pixel UI rather than an illustrated/AI-generated overlay aesthetic.
- All website and canvas text will use a locally hosted, scalable pixel-style typeface. **Pixelify Sans** is selected because it is a variable outline font that retains pixel character while scaling more cleanly than a bitmap-only font. It is licensed under SIL OFL 1.1. Font loading must use WOFF2, `font-display: swap`, suitable minimum sizes, and tested line heights so text remains clear when resized or zoomed.
- Original purple portal visuals may be inspired by the spatial distortion of game portals but must not copy Minecraft art or audio.
- Building hoarding/sign boards must be mounted immediately above the door—not above the roof—and use large high-contrast Pixelify Sans labels that remain readable at every supported camera zoom.
- Bulletin-board text inside buildings must meet the same readability standard; essential text must not be baked into low-resolution images.
- Buildings may be rotated slightly to follow the pentagon's local edge/path angle, but doors, labels, collision footprints, and portals must remain aligned.
- Exterior portal doors must be visibly large enough for the character, with portal artwork and interaction/collision zones centered on the doorway.

### Character

- The playable character represents Sandip.
- Required appearance: wavy black hair, mustache, pointed goatee, dark jacket, black shirt, loose gray trousers, and white shoes.
- Required animation set: eight-direction idle and walking animations—north, northeast, east, southeast, south, southwest, west, and northwest—with multiple frames; the last facing direction remains visible when movement stops.
- Diagonal keyboard movement uses simultaneous direction keys. Pointer/touch pathfinding may traverse diagonals only when it cannot cut through blocked corners.
- The character shall be redrawn at a larger, more legible native size, provisionally 32×48 pixels per frame on the 16×16 grid. It must be fully opaque and use stronger value/outline contrast so it remains clearly visible over every terrain tile and in both day and night modes. Only the separate ground shadow may be translucent.

### Current palette and effects

The prototype currently uses green terrain, warm brown/red buildings, cream paper panels, cyan/gold accents, and purple portals. These colors remain the working palette, but implementation may tune values for contrast and cohesion while retaining the established identity.

### Known discrepancy

The current prototype combines Forchild tiles with Phaser-drawn exterior buildings, labels, boards, portals, and large React panels. It is functionally pixel-rendered, but a complete visual-consistency review in a browser has not yet been recorded with screenshots.

## 3. Portfolio Sections and Content

### Arrival Courtyard — Home

- **Purpose:** greeting, positioning statement, entry choices, résumé access, and orientation.
- **Content:** “Full-Stack Developer building web systems, AI-integrated experiences, and self-hosted infrastructure”; current Django/backend focus; AI/ML, game-development, and infrastructure direction; Kathmandu location; résumé link.
- **Location:** Arrival Courtyard building/interior.
- **Access:** world portal, Quick Tour navigation, `#home`, or bulletin interaction.
- **Presentation:** physical interior bulletin board opens a semantic React panel.
- **Current status:** implemented and automated route/navigation coverage exists.

### About Hall — About, Education, and Experience

- **Purpose:** professional profile, current direction, education, and experience timeline.
- **Content:** supplied profile description; current Django backend work without invented employer/date details; BSc.IT and +2 Science entries; current learning direction.
- **Location:** About Hall interior.
- **Access/presentation:** portal followed by bulletin interaction; `#about` direct route.
- **Current status:** content and interaction implemented; browser automation covers portal and bulletin flow.

### Skills Workshop — Skills and Certifications

- **Purpose:** evidence-based capability overview without percentage meters.
- **Content:** Frontend, Backend, Data/AI, Infrastructure, Tools, and Creative groups; HarvardX CS50 Python and Design Thinking certifications.
- **Location:** Skills Workshop interior.
- **Access/presentation:** portal followed by bulletin interaction; `#skills` route.
- **Current status:** implemented; deeper physical exhibits are not present.

### Project Pavilion — Projects

- **Purpose:** present selected work, technologies, outcomes, screenshots, source/demo links, and upcoming work.
- **Content:** YatraNepal, Tic-Tac-Toe AI, Employee Management System, Esports Championship, and Private Cloud Lab as “In development.” Existing portfolio screenshots and résumé-derived descriptions remain the content sources.
- **Location:** Project Pavilion interior.
- **Access/presentation:** portal followed by bulletin interaction; `#projects` and `#projects/yatranepal` routes.
- **Confirmed deeper behavior:** physical project exhibits should be individually interactable and lead to concise case-study panels.
- **Current status:** React project cards/details are implemented. The interior currently has one generic bulletin rather than distinct physical project exhibits; this is incomplete.

### Contact Lodge — Contact

- **Purpose:** provide recruiter/collaborator contact paths.
- **Content:** canonical résumé email, GitHub, LinkedIn, résumé access, and Formspree form. Public phone number must not appear.
- **Location:** Contact Lodge interior.
- **Access/presentation:** portal followed by bulletin interaction; `#contact` route.
- **Current status:** implemented with native/client validation, loading/success/error messaging, honeypot, and direct-email fallback text. Live Formspree delivery was not exercised because it would transmit data.

## 4. Character and Exploration Mechanics

### Finalized behavior

- WASD and arrow-key movement on desktop.
- Click-to-move on desktop and tap-to-move on touch devices.
- Collision-aware grid A* pathfinding for pointer/touch travel.
- Phaser Arcade Physics for character collision.
- Eight-direction walking animations and directional idle frames.
- Preserve last facing direction when stopped.
- Physical collisions for buildings/walls, furniture, trees/rocks, fences, cliffs, and water.
- Clearly visible world boundary.
- Camera follows the character smoothly at an integer zoom.
- Keyboard movement and A* routes support diagonals at normalized speed; diagonal pathfinding must prevent corner cutting through blocked orthogonal tiles.
- Proximity prompts identify portal, board, and exit interactions.
- `E`, Enter, click, or tap activates a nearby interaction.
- Entering a destination runs a 1–1.5-second original purple pixel-portal transition.
- Building entry spawns the player inside; portfolio content does not open automatically.
- A board/exhibit interaction opens the accessible React content layer.
- Village navigation returns the character outdoors.

### Current implementation observations

- Keyboard and A* movement, Arcade tile collision, directional animation state, portal travel, interior spawn, and board gating are implemented and covered by Playwright.
- Camera follow is implemented with lerp `(0.14, 0.14)` and zoom levels 1/2/3 based on width.
- The current player uses a fixed depth rather than continuous Y-based depth sorting. An above-player tile layer exists, but general object/player depth sorting is incomplete.
- The current four-direction 18×36 sprite is too faint/small and does not satisfy the approved eight-direction visibility requirement.
- No virtual joystick was approved; mobile uses tap-to-move and always-available navigation.
- The game has no mini-game, matching the approved first-release scope.

## 5. Building, Maps, and Environment

### Confirmed world structure

- One compact, visibly bounded outdoor Village / World Map laid out as a pentagon.
- The five buildings occupy the five pentagon vertices, one destination per vertex.
- The character spawns at a clearly designed central hub in the middle of the pentagon.
- A radial-and-ring path network connects every building without requiring the visitor to pass through another building. From any vertex, each other building is directly reachable through a path/intersection; no route requires passing through more than one building, and direct access is preferred.
- The map boundary follows or frames the pentagonal composition using clearly visible, consistently designed walls. Gates, corners, and impassable edges must visually match collision geometry so visitors immediately understand where exploration ends.
- Five separately accessible interiors: Arrival/Home, About, Skills, Projects, and Contact.
- Buildings have conventional section names plus restrained Nepal/fantasy styling.
- Walkable paths connect each destination.
- Environmental obstacles include walls, buildings, furniture, trees, rocks, fences, cliffs, and water.
- Each interior is furnished and explorable before content is opened.
- Boards and project exhibits are physical world objects.

### Map conventions

- Tile size: 16×16.
- Outdoor prototype size: 60×42 tiles.
- Interior prototype size: 32×22 tiles.
- Required logical layers: `ground`, `decoration`, `collision`, `above-player`, `portal`, `spawn`, and `interaction`.
- Phaser must load/render the layers consistently and use collision metadata as the authoritative movement boundary.

### Tiled Map Editor decision

The final maps will be authored in Tiled and exported as `.tmj`. This is the best fit for the newly required pentagonal composition, visible/collision wall alignment, five unique interiors, object-layer interactions, and future visual editing. Phaser will load the exported data while one reusable scene applies shared movement, interaction, audio, and transition behavior.

### Current map limitations

- All five current interiors share one generated layout with small deterministic variations; this must be replaced by five distinct, purpose-designed Tiled maps.
- Exterior buildings are mostly drawn with Phaser Graphics rather than assembled from the Forchild house tiles.
- Physical project exhibits are missing.
- General Y-depth sorting is absent.
- One reusable Phaser world/interior scene is approved. It will load distinct outdoor/interior Tiled maps rather than duplicating scene classes.

## 6. User Interface and User Experience

### Confirmed UI

- Title screen with Quick Tour and Explore Freely.
- Entry choice for sound enabled or silent; audio cannot start before a user gesture.
- First-time greeting from Sandip asking, “How may I help you?” with destination options and free-roam choice.
- Returning-visitor welcome and saved progress.
- Persistent Navigate, résumé, and settings controls.
- Village / World Map option in greeting, navigator, interior flow, and follow-up choices.
- Clearly labeled destination menu with visited/unvisited state.
- After a section, offer remaining destinations, previous destinations, stay longer, and Village / World Map/free exploration.
- Semantic React panels for all essential portfolio information.
- Hash routes for sections and individual projects.
- Escape/back behavior for overlays.
- Visible interaction prompts.
- Auto/Day/Night preference and an approximately eight-minute automatic cycle.
- Independent Music, Nature, and SFX controls; audio pauses when the tab is hidden.
- Reduced-motion/reduced-effects behavior.

### Current gaps

- Returning visitors receive a shorter greeting, but explicit **Resume**, **Restart**, and **Replay introduction** choices are not fully implemented.
- Quick Tour is represented by state and destination sorting, but there is no fully explicit guided-tour state machine with one-at-a-time recommendations.
- No distinct loading screen is required because the shell lazy-loads Phaser; asset loading feedback may still be desirable but is not confirmed.
- UI typography currently combines browser-loaded Manrope/Cormorant fonts with monospace canvas labels. It must be replaced throughout with locally hosted Pixelify Sans, including Phaser labels, while preserving readable minimum sizes and spacing.

## 7. Technical Requirements

- Preserve React, TypeScript, Vite, and Phaser 3.
- Preserve the static-only architecture; no backend/database is added.
- Use relative asset paths and output deployable to a root domain or subdirectory such as `/Portfolio/`.
- React owns semantic panels, dialogue, navigation, preferences, form behavior, accessibility, and hash routing.
- Phaser owns maps, character, physics, camera, world interactions, portals, lighting overlay, and animation.
- Tiled owns final outdoor/interior map authoring. One reusable Phaser scene loads the exported `.tmj` maps and their shared layer/object conventions.
- Portfolio content remains typed and separate from the Phaser scene.
- Destination IDs remain the shared key for content, navigation, route, visited state, and game travel.
- Assets must be optimized for mid-range phones; nonessential game code/assets should load after the initial shell.
- Pause or mute audio while the page is hidden.
- Preserve asset licenses beside distributed assets and list sources in `CREDITS.md`.
- Do not read or expose secrets; none are required for local static operation.
- Supported commands currently are `npm run dev`, `npm run check`, `npm run build`, `npm run preview`, and `npm run test:e2e`.

### Existing implementation

- Phaser is dynamically imported after entry.
- Vite uses `base: "./"`.
- Phaser uses `pixelArt: true`, `antialias: false`, `roundPixels: true`, Arcade Physics, and responsive resize scaling.
- HTMLAudioElement assets provide music/nature/SFX buses.
- Playwright and axe-core are configured for desktop Chrome and Pixel 7 emulation.
- The current built Phaser chunk is approximately 1.21 MB minified / 323 KB gzip. Vite emits a nonblocking large-chunk warning.

## 8. Responsive Design and Accessibility

### Confirmed requirements

- Desktop: keyboard, mouse, and menu navigation.
- Mobile/tablet: tap-to-move and touch-operable menus; no character control is required to reach essential content.
- Integer camera zoom and pixel-perfect canvas scaling.
- Persistent alternative navigation at all times.
- Semantic HTML content outside the canvas.
- Keyboard-operable menus, visible focus indicators, Escape behavior, screen-reader labels, skip navigation, and live status announcements.
- Honor `prefers-reduced-motion`; replace portal/camera travel with short fades and reduce animation density.
- Maintain readable content and usable controls under mobile dimensions and browser zoom.
- Pause game/audio activity appropriately when hidden where supported.

### Current assessment

- Desktop Chrome and Pixel 7 emulation are automated.
- Axe scans pass for the entry screen and content panel in the latest recorded run.
- Final automated coverage should include Chromium, Firefox, and WebKit desktop projects plus Chromium mobile emulation. Real-device Android/iOS checks remain recommended manual verification where hardware is available; lack of physical devices is documented rather than treated as a hidden pass.
- Real-device Android/iOS, tablet-specific dimensions, screen-reader narration, and high zoom remain unverified.
- The Phaser camera uses width-based zoom only; behavior across unusual landscape/portrait aspect ratios needs visual verification.

## 9. Existing Prototype Assessment

| Component | Current state | Verification | Gap against confirmed direction |
|---|---|---|---|
| React/Vite shell | Implemented | Production build passed | None known |
| Phaser boot/lazy loading | Implemented | Playwright canvas checks passed | No dedicated load-progress UI |
| Outdoor village | Programmatic tilemap, five buildings, boundary and obstacles | Movement/path tests passed | Visual polish not screenshot-audited; no Tiled source |
| Collision | Invisible collision tile layer + Arcade collider | Automated movement/path tests passed | Individual obstacle coverage is not exhaustively asserted |
| A* navigation | Local four-neighbor A* | Pointer movement test passed | No explicit unreachable-target feedback to visitor |
| Sandip sprite | 28 frames, four directional rows | Direction/moving state tested | Fails approved larger/opaque/eight-direction requirement; redraw required |
| Camera | Smooth follow, integer zoom | Runtime indirectly exercised | Depth sorting and unusual aspect ratios need verification |
| Portals | Purple pixel overlay, approximately 1.18 seconds | Portal state/timing tests passed | Final visual/audio feel needs review |
| Interiors | Five logical destinations using shared generated room layout | All destinations and spawn covered | Distinct art/layout per destination incomplete |
| Bulletin interaction | Gated content after arrival | Automated prompt/content test passed | Project-specific physical exhibits missing |
| React content | Home/About/Skills/Projects/Contact panels | Deep-link/content tests passed | Resume/restart/replay intro flow incomplete |
| Hash routing | Section/project routes | YatraNepal deep-link test passed | Full back/forward matrix not exhaustively tested |
| Audio | CC0 music/nature/SFX, three persisted buses | Gesture/mute/persistence tests passed | Required Not Jam track replaced with CC0 fallback |
| Day/night | 8-minute auto cycle + overrides | Code exists | Preference precedence/crossfade needs fuller automated evidence |
| Contact | Formspree form and fallback copy | Native validation tested | Live success/failure network paths not exercised in latest suite |
| Accessibility | Semantic overlays, focus styles, reduced motion | axe and reduced-motion tests passed | Manual screen-reader/zoom review pending |
| Mobile | Tap movement and responsive overlays | Pixel 7 emulation passed | Real-device performance/touch review pending |
| Metadata | Title/description/favicon exist | Static inspection | Open Graph image still points to deleted AI asset; currently broken |
| Licensing | `CREDITS.md` and adjacent license records | Static inspection | Verified CC0 OpenGameArt fallback selected |

The last recorded Playwright result is `passed` with no failed tests. The last recorded production build also passed. These results verify the behaviors asserted by the suite, not full visual quality or every target browser.

## 10. Confirmed Requirements

### Art direction

- **ART-001:** The experience shall use polished top-down 2D pixel art.
- **ART-002:** The world shall use a 16×16 tile grid with nearest-neighbor rendering, disabled antialiasing, rounded pixels, and integer zoom.
- **ART-003:** Forchild Basic Village Tileset shall be the principal visual source; only free assets with verified licenses may be distributed.
- **ART-004:** Paid LimeZu and unverified Pinterest assets shall not be used.
- **ART-005:** The world shall combine restrained Nepal-inspired architecture with subtle technical/fantasy portal accents and conventional section names.
- **ART-006:** AI-generated village and playable-avatar assets shall not be used.
- **ART-007:** The character shall match Sandip's approved appearance and include fully opaque, high-contrast eight-direction idle/walk animation at a larger native size.
- **ART-008:** External asset source and license information shall remain in the repository and `CREDITS.md`.
- **ART-009:** All website and game text shall use locally hosted Pixelify Sans under SIL OFL 1.1, with responsive sizes and rendering that remains crisp and readable when enlarged, reduced, or zoomed.
- **ART-010:** Building signs shall sit directly above their doors, and building/bulletin labels shall be large, high-contrast, and readable at every supported zoom.

### Character mechanics

- **CHAR-001:** Desktop movement shall support WASD and arrow keys.
- **CHAR-002:** Pointer/touch travel shall use collision-aware grid pathfinding.
- **CHAR-003:** Character collision shall use Phaser Arcade Physics.
- **CHAR-004:** Walking animation shall reflect movement direction, and idle shall retain the last facing direction.
- **CHAR-005:** Nearby world objects shall be interactable by `E`, Enter, click, or tap.
- **CHAR-006:** The camera shall follow smoothly using pixel-safe integer scaling.
- **CHAR-007:** Keyboard and pointer/touch navigation shall support normalized diagonal movement and eight-direction animation without pathfinding through blocked corners.

### Maps and environment

- **MAP-001:** A compact, visibly bounded Village / World Map shall contain five clearly labeled destinations.
- **MAP-002:** Arrival/Home, About, Skills, Projects, and Contact shall each have an explorable furnished interior.
- **MAP-003:** Maps shall define ground, decoration, collision, above-player, portal, spawn, and interaction layers.
- **MAP-004:** Walls, buildings, furniture, trees, rocks, fences, cliffs, and water shall physically block movement where depicted as impassable.
- **MAP-005:** Entering/leaving a building shall use an original 1–1.5-second purple pixel-portal transition.
- **MAP-006:** Entry shall spawn the character in the interior and shall not automatically open portfolio content.
- **MAP-007:** Physical boards/exhibits shall gate the corresponding content panel.
- **MAP-008:** Selecting Village / World Map shall return the character outdoors.
- **MAP-009:** The outdoor village shall use a pentagonal composition with one building at each vertex and the player spawn at its center.
- **MAP-010:** A radial-and-ring path network shall let every building reach every other building without requiring passage through another building; direct routes are preferred.
- **MAP-011:** The pentagonal map edge shall use clearly visible, well-designed walls whose artwork and collision geometry agree.
- **MAP-012:** Buildings shall use subtle pentagon-aligned rotation while their enlarged doors, portal artwork, labels, collision footprints, and interaction zones remain correctly aligned.

### Portfolio content

- **PORT-001:** The portfolio shall include Home, About/Education/Experience, Skills/Certifications, Projects, and Contact content.
- **PORT-002:** Current Django/backend work shall be presented without inventing employer, dates, or proprietary details.
- **PORT-003:** Projects shall include YatraNepal, Tic-Tac-Toe AI, Employee Management System, Esports Championship, and Private Cloud Lab as in development.
- **PORT-004:** Project panels shall provide screenshots, concise details, technologies, and demo/source links where available.
- **PORT-005:** The résumé shall be downloadable under a clean static filename.
- **PORT-006:** Résumé email/LinkedIn details are canonical; no public phone number shall be published.
- **PORT-007:** Contact shall retain Formspree validation/states and a direct-email fallback.
- **PORT-008:** Private-cloud content shall avoid sensitive operational or architectural details.

### UI and experience

- **UI-001:** The title screen shall offer Quick Tour and Explore Freely, plus sound/silent entry.
- **UI-002:** First-time greeting shall ask how Sandip can help and offer destinations plus free exploration.
- **UI-003:** Persistent navigation shall expose Village / World Map, all destinations, settings, and résumé access.
- **UI-004:** Direct hash routes shall remain static-host-safe and shareable.
- **UI-005:** The site shall provide an approximately eight-minute Auto/Day/Night system with persisted manual override.
- **UI-006:** Music, Nature, and SFX shall be independently adjustable/mutable, gesture-gated, persisted, crossfaded by environment/time, paused when hidden, and failure-tolerant. One licensed CC0 lo-fi loop with changing nature mixes is sufficient.
- **UI-007:** Follow-up choices shall include unvisited/visited destinations, stay longer, and Village/free exploration.
- **UI-008:** Returning visitors shall have a shorter welcome with resume, restart, and replay-introduction options.

### Technical

- **TECH-001:** Preserve React, TypeScript, Vite, and Phaser 3.
- **TECH-002:** Keep the output fully static and deployable to ordinary static hosting with relative paths.
- **TECH-003:** Keep essential typed content outside Phaser scenes.
- **TECH-004:** Use destination IDs as the shared source of truth for navigation, content, routes, and visited state.
- **TECH-005:** Lazy-load Phaser and nonessential assets and optimize distributed images/audio for mid-range mobile use.
- **TECH-006:** Preserve licensed source records and do not introduce paid/unverified assets.
- **TECH-007:** Final outdoor and interior maps shall be authored in Tiled, exported as `.tmj`, and loaded through one reusable Phaser scene.

### Responsive and accessibility

- **RESP-001:** Support desktop keyboard/mouse and mobile tap interactions.
- **RESP-002:** Keep menus and semantic content usable on typical desktop and mid-range mobile viewports.
- **RESP-003:** Pause audio when the page is hidden.
- **RESP-004:** Automated browser coverage shall include Chromium, Firefox, and WebKit desktop plus Chromium mobile emulation; physical mobile checks are manual where devices are available.
- **A11Y-001:** Essential content shall be reachable without controlling the character.
- **A11Y-002:** Menus/panels shall support keyboard use, visible focus, Escape/back, labels, skip navigation, and status announcements.
- **A11Y-003:** Reduced motion shall replace long movement/portal effects with short fades and reduce nonessential animation.
- **A11Y-004:** Text, focus, contrast, reading order, and zoom shall remain usable.

## 11. Proposed Improvements — Not Approved

- **PROPOSED — NOT APPROVED P-001:** Add a small minimap showing discovered buildings.
- **PROPOSED — NOT APPROVED P-002:** Add optional path previews or a destination arrow for free-roam visitors.
- **PROPOSED — NOT APPROVED P-003:** Add subtle environmental animations such as moving water, chimney smoke, foliage sway, and day/night window lights.
- **PROPOSED — NOT APPROVED P-004:** Add a dedicated accessibility menu shortcut on the title screen.
- **PROPOSED — NOT APPROVED P-005:** Add a low-bandwidth “content only” entry that never loads Phaser.
- **PROPOSED — NOT APPROVED P-006:** Add a small non-player villager with one contextual line per destination. An earlier plan allowed one restrained NPC, but this is not required for the core redesign.

## 12. Resolved, Conflicting, and Remaining Decisions

### Resolved from user clarification

- **Q-001 — RESOLVED:** Use Tiled-authored `.tmj` maps. This is selected as the best maintainable option for the pentagonal redesign and five unique interiors.
- **Q-002 — RESOLVED:** Use one reusable Phaser scene that loads distinct maps.
- **Q-003 — RESOLVED:** Build five unique interiors and replace simplified exteriors with coherent tile-built designs.
- **Q-004 — RESOLVED:** Use Pixelify Sans throughout the site and canvas. It must be locally hosted, scalable, and readability-tested.
- **Q-005 — RESOLVED:** Retain the current verified CC0 OpenGameArt lo-fi loop. It better matches the requested soothing mood and avoids relying on an unstable download flow.
- **Q-006 — RESOLVED:** Redraw the character larger, fully opaque, and higher contrast. Add eight-direction idle/walk frames and diagonal movement.
- **Q-007 — RESOLVED:** One music loop with indoor/outdoor and day/night nature crossfades is sufficient.
- **Q-008 — RESOLVED:** Add automated Chromium, Firefox, and WebKit desktop coverage plus Chromium mobile emulation. Treat physical-device checks as documented manual QA where devices are available.
- **Q-009 — RESOLVED:** Replace the current map with a pentagon: one building at each vertex, visible perimeter walls, a center spawn, and radial/ring routes that avoid forcing travel through another building.
- **Q-010 — RESOLVED:** Building signs move directly above enlarged doors; bulletin and exterior labels must be legible; buildings may rotate slightly to suit the pentagon while collision/portal alignment remains correct.

### Remaining noncritical implementation assumptions

- The larger character baseline is 32×48 pixels per frame. Minor adjustment is allowed if visual testing shows another nearby size reads better without dominating a 16×16-tile world.
- The central hub may include a signpost or portal marker only if it does not obstruct the spawn area or add a new gameplay mechanic.
- The pentagon may be visually regular or slightly organic to fit tile geometry, but its five-vertex structure and path connectivity must remain unmistakable.

## 13. Acceptance Criteria

Status reflects current evidence, not intended final status.

| Requirement | Observable acceptance criterion | Test method | Status | Evidence/reason |
|---|---|---|---|---|
| ART-001 | Rendered game is consistently top-down pixel art | Browser screenshot review | PASS | Desktop visual QA completed after final map regeneration |
| ART-002 | Canvas uses pixel mode, no antialiasing, integer zoom | Static config + viewport tests | PASS | Phaser config and desktop/mobile E2E |
| ART-003 | Forchild tiles are distributed and used | Asset/code inspection | PASS | CC0 files and preload references present |
| ART-004 | No paid LimeZu/unverified Pinterest assets | Repository audit | PASS | None present; credits state exclusion |
| ART-005 | Village reads as restrained Nepal/tech style with clear labels | Visual review | PASS | Pixel village, warm roof palette, portal accents, and conventional labels reviewed |
| ART-006 | Deleted AI world/avatar are not referenced | Repository search | PASS | No source reference; files marked deleted |
| ART-007 | Character is large, opaque, high-contrast, and animated in eight directions | Animation test + visual review | PASS | Opaque 8-direction, 7-frame-per-row sprite is rendered and exercised by E2E |
| ART-008 | Every external asset has source/license records | Credits/file audit | PASS | Adjacent license files and `CREDITS.md` |
| ART-009 | Pixelify Sans renders clearly across all UI/canvas text and zoom levels | Font-load, screenshot, and zoom tests | PASS | Local scalable Pixelify Sans bundles in production and is asserted by E2E |
| ART-010 | Door signs and bulletin text remain readable at supported zooms | Screenshot/contrast/zoom tests | PASS | One high-contrast two-line plaque is attached directly above every enlarged door |
| CHAR-001 | WASD/arrows move the character | Playwright keyboard test | PASS | Direction/moving/tile change assertions |
| CHAR-002 | Pointer/touch produces a valid collision-aware route | Playwright pointer/mobile test | PASS | Existing orthogonal click movement tests pass; diagonal requirement is CHAR-007 |
| CHAR-003 | Impassable tiles stop the Arcade body | Code + collision test | PASS | Collider exists; bounded movement exercised |
| CHAR-004 | Walk direction changes and stopped frame retains facing | Eight-direction state test | PASS | Cardinal and diagonal animation state changes pass browser tests |
| CHAR-005 | E/click/tap activates nearby board/portal/exit | E2E interaction | PASS | Bulletin and mobile tap tests |
| CHAR-006 | Camera follows with integer zoom | Code + visual viewport review | PASS | Smooth follow at integer 1×/2× zoom reviewed on desktop/mobile |
| CHAR-007 | Keyboard and A* movement support normalized diagonals without corner cutting | Unit/E2E movement tests | PASS | Eight-neighbor A* and normalized keyboard diagonals are implemented and tested |
| MAP-001 | Five labeled destinations exist in a pentagonal bounded map | E2E + visual review | PASS | Five vertex buildings, center spawn, and pentagonal perimeter are present |
| MAP-002 | Five furnished interiors are explorable | E2E + visual review | PASS | All five location states tested; visual uniqueness not required by this criterion |
| MAP-003 | Seven named tilemap layers exist | Code/test attribute inspection | PASS | Layers created and asserted |
| MAP-004 | All specified obstacle categories collide | Targeted collision tests | NOT TESTED | Implementation exists, but not every category has a dedicated assertion |
| MAP-005 | Portal transition lasts 1–1.5 seconds and is original | Timing + visual/audio inspection | PASS | Approx. 1.18-second state transition; original derived SFX |
| MAP-006 | Entry spawns indoors without auto-opening content | E2E | PASS | Location changes before bulletin prompt/content |
| MAP-007 | Board/exhibit interaction gates content | E2E | PASS | About/Projects board tests |
| MAP-008 | Village option returns outdoors | E2E | PASS | Navigation return test |
| MAP-009 | Buildings occupy five pentagon vertices and player spawns at center | Tiled inspection + E2E spawn test | PASS | Generated Tiled map records the five vertices and central spawn marker |
| MAP-010 | Every building reaches every other without crossing another building | Graph/path tests + map inspection | PASS | Radial routes plus the complete perimeter ring provide direct/one-building reachability |
| MAP-011 | Visible perimeter walls align with collision geometry | Screenshot + collision sampling | PASS | Layer collision follows the same pentagon as the three-stroke visible wall |
| MAP-012 | Rotated buildings retain correctly aligned large doors, portals, signs, and collision | Tiled inspection + portal/collision E2E | PASS | Vertex buildings rotate ±2°/±4° with grouped 42×54 doors and aligned interaction zones |
| PORT-001 | All confirmed content groups are present | Content audit | PASS | Typed content and panels present |
| PORT-002 | Django work is stated without invented details | Content audit | PASS | No employer/private detail introduced |
| PORT-003 | Confirmed project list/status is present | Content audit | PASS | Five entries present |
| PORT-004 | Project details/screenshots/links appear where available | Deep-link/content test | PASS | YatraNepal exercised; other cards inspected statically |
| PORT-005 | Résumé is downloadable | Static file/link check | PASS | Clean PDF path exists |
| PORT-006 | Canonical contacts and no phone | Content search | PASS | Email/LinkedIn present, phone absent |
| PORT-007 | Contact validates and exposes states/fallback | E2E + mocked network tests | NOT TESTED | Native validation passes; response branches not tested |
| PORT-008 | Private-cloud details remain nonsensitive | Content audit | PASS | Only sanitized summary present |
| UI-001 | Entry provides tour/explore and sound/silent choices | E2E/static inspection | PASS | Controls present and used |
| UI-002 | Greeting offers destinations and roam | Accessibility snapshot/E2E | PASS | Controls present |
| UI-003 | Persistent nav includes Village, sections, settings, résumé | E2E | PASS | Navigator exercised |
| UI-004 | Section/project hashes resolve and back/forward works | Route matrix E2E | NOT TESTED | Project deep link passes; full history matrix absent |
| UI-005 | 8-minute auto cycle and persisted overrides work | Time-controlled tests | NOT TESTED | Code present; precedence not fully tested |
| UI-006 | Audio buses, gesture gate, persistence, crossfade, hidden pause, errors | Audio E2E/mocks | NOT TESTED | Bus gesture/persistence passes; crossfade/error/hidden paths not fully asserted |
| UI-007 | Follow-up choices include destination/stay/Village | UI inspection | PASS | React journey prompt present |
| UI-008 | Returning flow exposes resume/restart/replay intro | E2E | FAIL | Options not fully implemented |
| TECH-001 | Existing React/Vite/Phaser stack is preserved | Dependency audit | PASS | Current package manifest |
| TECH-002 | Production build uses relative static paths | Build/subdirectory test | NOT TESTED | Build passes and base is relative; subdirectory serving not rerun |
| TECH-003 | Essential content is typed React data | Code audit | PASS | `content.ts` and semantic components |
| TECH-004 | Destination IDs coordinate routes/navigation/game | Code audit | PASS | Shared `DestinationId` usage |
| TECH-005 | Shell lazy-loads game; assets are mobile-conscious | Bundle/asset audit | PASS | Dynamic Phaser import; game assets ≈4.2 MB total compressed files |
| TECH-006 | Only verified free assets are distributed | Asset audit | PASS | CC0 records present |
| TECH-007 | Tiled `.tmj` maps load through one reusable Phaser scene | Asset/code/E2E inspection | FAIL | Current maps are generated in TypeScript |
| RESP-001 | Keyboard/mouse/tap journeys work | Playwright desktop/mobile | PASS | Chromium + Pixel 7 projects passed |
| RESP-002 | Controls and panels remain usable at tested sizes | E2E + axe | PASS | Desktop/mobile suite passed |
| RESP-003 | Audio pauses on hidden tab | Visibility-state test | NOT TESTED | Listener exists; no explicit browser assertion |
| RESP-004 | Chromium, Firefox, WebKit desktop and Chromium mobile suites pass | Playwright projects | NOT TESTED | Current configuration covers Chromium desktop/mobile only |
| A11Y-001 | Content is reachable without character control | E2E | PASS | Persistent navigation/direct hashes |
| A11Y-002 | UI is keyboard labeled with focus/Escape/status behavior | axe + keyboard review | PASS | Automated axe passes; relevant handlers/styles exist |
| A11Y-003 | Reduced motion shortens portal behavior | Emulated-media E2E | PASS | Reduced-motion travel test passes |
| A11Y-004 | Contrast, reading order, text size, zoom are usable | axe + manual review | NOT TESTED | Axe passes; manual zoom/screen-reader review pending |

## 14. Constraints, Assumptions, and Out-of-Scope Items

### Constraints

- Fully static client application; no new backend/database.
- Formspree remains the contact transport.
- Phaser 3 remains the game engine.
- Only free assets with verified licenses; CC0 preferred.
- Relative asset paths and static-host portability.
- Mid-range mobile performance is more important than a large/open-ended map.
- Existing user content, screenshots, résumé, and contact details are preserved unless explicitly revised.

### Safe implementation assumptions pending document approval

- Minor object placement, collision-body tuning, and code organization may follow established project conventions.
- One restrained music loop plus environment layers is approved.
- Separate visual interiors will share one reusable Phaser scene.

### Explicitly rejected or excluded

- Real-time 3D and the superseded 2.5D AI-illustrated world.
- Paid LimeZu assets.
- Unverified Pinterest assets.
- Publishing a phone number.
- Publishing sensitive private-cloud implementation details.
- A backend or database for portfolio state/content.
- A mini-game in the first release.
- A large, sparse open world.
- Deployment without an explicit request.

### Not automatically out of scope

The Tiled conversion, distinct interior art, return-flow completion, expanded browser matrix, and visual polish are approved work and are not considered out of scope merely because the prototype does not yet satisfy them.

## 15. Pending Decisions and Change History

### Outstanding questions

- [x] Q-001 — Tiled-authored maps selected.
- [x] Q-002 — One reusable scene selected.
- [x] Q-003 — Five unique interiors and tile-built exteriors approved.
- [x] Q-004 — Pixelify Sans selected for all text.
- [x] Q-005 — Current verified CC0 lo-fi fallback approved by best-judgment delegation.
- [x] Q-006 — Larger, opaque, high-contrast eight-direction character required.
- [x] Q-007 — One music loop with environment nature mixes accepted.
- [x] Q-008 — Expanded Playwright browser matrix selected; physical-device QA documented when unavailable.
- [x] Q-009 — Pentagon map, center spawn, visible walls, and direct radial/ring routes approved.
- [x] Q-010 — Readable door-level signs/bulletins, subtle building rotation, and larger aligned portal doors approved.
- [x] Q-011 — Remove interiors; inward-facing doors open semantic content directly after the portal transition.
- [x] Q-012 — Use transparent eight-direction walking frames, a four-frame opening wave, and manga/manhua-style greeting bubble.
- [x] Explicit approval received; version 0.3 is the implementation baseline.

### Change history

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1 | 2026-10-03 | Draft, awaiting clarification | Consolidated accessible conversation, approved redesign plan, current source, assets, and Playwright evidence. Identified Tiled, scene architecture, art-polish, typography, music, character-scale, soundscape, and browser-matrix decisions. |
| 0.2 | 2026-10-03 | Finalized, awaiting approval | Selected Tiled maps, one reusable scene, five unique interiors, Pixelify Sans, the verified CC0 music fallback, one-loop soundscape, expanded browser automation, a larger opaque eight-direction character, and a pentagonal village with center spawn/direct route network/visible walls. |
| 0.3 | 2026-10-03 | Approved; implementation authorized | Added readable bulletin/building typography, door-level hoarding boards, pentagon-aligned building rotation, enlarged aligned door/portal requirements, and link verification. |
| 0.4 | 2026-10-03 | Approved; implemented | Removed interiors and board gating, changed every door to face the central spawn, added direct portal-to-content entry through E/Enter/click/tap, redrew the transparent directional sprite and walking cycles, and replaced the greeting card with a waved manga-style speech bubble. |

### Approval record

The user explicitly selected all recommended Q-011/Q-012 decisions. Version 0.4 supersedes conflicting interior requirements and is the current implementation baseline.
