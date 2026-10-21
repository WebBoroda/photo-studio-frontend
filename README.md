# BRAND Studio — responsive HTML preview v1.5.0

Standalone first-stage HTML/CSS/JS preview. Open `index.html` on static hosting.

This is **not** a WordPress theme or a live booking system. Forms are demonstrational. The route address and contact details are demonstrational. Social URLs are deliberately not configured.

The video tours show an explicit video-unavailable preview because no video was supplied; no photo slideshow is mislabeled as a video. The gallery photos are extracted low-resolution placeholders: provide original high-resolution images before final sign-off.

Automated checks: `npm ci && npm test` in an environment with Playwright's Chromium and Python available. The release was also tested through Chromium with isolated inline assets due to browser-network limits in the authoring environment.
