# Media Studio Evolution Plan

## Goal
Transform the basic `MediaEditor` into a robust "Canva-Lite" tool for social media campaigns.

## Phases

### Phase 1: Aspect Ratio & Platform Sizing 📐
**Objective:** Allow users to crop/resize images for specific platforms (Instagram Square, TikTok Vertical, Twitter Horizontal).
- [ ] Add Aspect Ratio state (`1:1`, `16:9`, `9:16`, `4:5`).
- [ ] Add Toolbar buttons to select ratio.
- [ ] Update Preview container to enforce aspect ratio (CSS).
- [ ] Update "Bake" logic to crop the output image to the selected ratio.

### Phase 2: Smart Templates 🎨
**Objective:** One-click layouts for common post types.
- [ ] **Meme Mode:** Auto-position text at top/bottom with Impact font.
- [ ] **Quote Mode:** Darken background, center text, serif font.
- [ ] **Promo Mode:** Split screen (Image Left / Text Right).

### Phase 3: Brand Kits 🖌️
**Objective:** Enforce consistency with saved colors and fonts.
- [ ] Fetch `WorkspaceSettings` for brand colors.
- [ ] Add "Brand Colors" palette to the Text Color picker.
- [ ] Add Font selector (Inter, Roboto, Playfair).

### Phase 4: AI Image Generation ✨
**Objective:** Generate backgrounds on the fly.
- [ ] Add "Generate Background" button.
- [ ] Create Backend Endpoint `/api/ai/generate-image` (Mocked or connected to DALL-E/OpenAI).
- [ ] Handle async loading state.

## Implementation Details (Phase 1)

### UI Changes
- Add a new row in the toolbar for "Canvas Size".
- Buttons: `Square (1:1)`, `Story (9:16)`, `Landscape (16:9)`.

### Logic Changes
- **State:** `aspectRatio` (number).
- **Preview:** The `div` wrapping the image needs `style={{ aspectRatio: ... }}` and `overflow: hidden`.
- **Image Positioning:** We might need basic "Pan/Zoom" if the image doesn't fit perfectly. For MVP, `object-cover` (center crop) is the easiest start.
- **Baking:** The canvas size must match the *target* ratio, not the *source image* size. `ctx.drawImage` will need source/destination coordinates to perform the center crop.
