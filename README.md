# 3D Developer Portfolio

An immersive, interactive developer portfolio built entirely with vanilla JavaScript — no bundler, no framework. A deep-space WebGL scene serves as the canvas, with project cards floating through the cosmos and a camera that travels as you scroll.

---

## Live Demo

> **[gripexdev.github.io/3d-dev-portfolio](https://gripexdev.github.io/3d-dev-portfolio)** *(deploy via GitHub Pages)*

---

## Preview

| Scene | Card Interaction | Contact Form |
|---|---|---|
| Deep-space star field with floating 3D project cards | Click any card to flip it and reveal project details | Validated contact form with animated success state |

---

## Tech Stack

| Layer | Technology |
|---|---|
| 3D Engine | [Three.js r128](https://threejs.org/) — WebGLRenderer, EdgesGeometry, ShaderMaterial, Raycaster |
| Animation | [GSAP 3.12](https://gsap.com/) + ScrollTrigger — scroll-driven camera travel, card reveals |
| Audio | Web Audio API — procedural ambient drone with breathing oscillators |
| Interaction | Raycaster hover, IntersectionObserver, Konami code listener |
| Fonts | Google Fonts — Inter + Space Grotesk |
| Build | None — pure HTML / CSS / vanilla JS, served as static files |

---

## Features

### Core Scene
- **Deep-space WebGL environment** — star field of 3 000 points with slow parallax rotation
- **6 floating 3D project cards** — each with a glowing accent border matching the project colour
- **Scroll-driven camera travel** — GSAP ScrollTrigger moves the camera from `z = 10` to `z = -55` as you scroll, flying past each card
- **Mouse parallax** — camera drifts subtly with cursor movement for a depth effect
- **Card flip on click** — cards rotate 180° to reveal a back face; click again to return
- **Card info panels** — a frosted-glass sidebar panel fades in with title, description, and tags as each card comes into view
- **Loading screen** — animated progress bar with stage labels before the scene launches
- **Smooth intro animation** — camera push-in from `z = 20 → 10` on load with hero text stagger

### Progressive Features

| # | Feature | Description |
|---|---|---|
| F1 | **Custom Cursor Trail** | Glowing dot + ring cursor with particle burst on click; expands on interactive elements |
| F2 | **Ambient Space Audio** | Toggle button triggers a procedural low-frequency drone built from 3 oscillators via Web Audio API |
| F3 | **Skill Progress Bars** | Animated bars that fill on scroll into view with a live percentage counter |
| F4 | **Contact Form** | Real-time field validation, shake animation on error, spinner on submit, SVG checkmark success state |
| F5 | **Tech Stack Filter** | Sticky filter bar that appears after the hero; pills hide/show 3D cards by technology tag |
| F6 | **Konami Code Easter Egg** | Type `↑ ↑ ↓ ↓ ← → ← → B A` to engage **Hyperdrive** — stars accelerate, card borders cycle through rainbow HSL colours, and the camera shakes |
| F7 | **CV Download** | Hero button generates a PDF via `Blob + URL.createObjectURL` and fires a toast notification |
| F8 | **Scroll Progress Bar** | Gradient progress bar across the top of the viewport tracks reading position |

---

## Getting Started

No install step required.

```bash
# Clone
git clone https://github.com/gripexdev/3d-dev-portfolio.git
cd 3d-dev-portfolio

# Serve locally (any static server works)
npx serve -l 3000 .
```

Then open `http://localhost:3000` in your browser.

> **Note:** The site must be served over HTTP — opening `index.html` directly as a `file://` URL will block the CDN scripts due to CORS.

---

## Project Structure

```
3d-dev-portfolio/
├── index.html      # HTML shell — all DOM structure
├── style.css       # All styles, feature by feature
├── main.js         # Three.js scene, camera, cards, scroll, raycaster
└── features.js     # Progressive features (F1–F8) as self-contained IIFEs
```

All Three.js, GSAP, and ScrollTrigger are loaded from CDN — no `node_modules`, no build step.

---

## Customisation

### Swap project data
Edit the `PROJECTS` array at the top of `main.js`:

```js
const PROJECTS = [
  {
    title:  'Your Project',
    tags:   ['React', 'Node.js'],
    accent: 0x4d9fff,   // hex colour for the glowing border
    pos:    [-3.5, 1.2, -5],  // [x, y, z] position in 3D space
  },
  // ...
];
```

Then update the matching `#card-panels` HTML in `index.html` and the `CARD_TAGS` array in `features.js` (used by the filter bar).

### Change your name / bio
Search for `Alex Chen` in `index.html` and update the hero heading, about bio, and page `<title>`.

### Secret: Hyperdrive
Type the [Konami code](https://en.wikipedia.org/wiki/Konami_Code) on any keyboard:

```
↑  ↑  ↓  ↓  ←  →  ←  →  B  A
```

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome / Edge 90+ | Full support |
| Firefox 88+ | Full support |
| Safari 15+ | Full support (`backdrop-filter` requires prefix, already applied) |
| Mobile | Fallback mode — 3D scene is replaced with a card grid; cursor and audio features are disabled |

---

## License

MIT — feel free to fork, adapt, and ship your own version.
