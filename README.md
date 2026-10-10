# Choney Chen · Tianyi Chen

A personal homepage built around fourteen chapters in six groups: introduction, spatial research, applied engineering, personal tools, foundations and practice, and contact. Each substantive experience has one complete home. Research directions introduce questions, the learning archive holds education and coursework, and short links connect related work without duplicating its story. Navigation and record destinations are defined together in `src/data/architecture.ts`.

Visit: [Vercel](https://choney-between-states.vercel.app) · [GitHub Pages](https://choneychen.github.io/)

Three research directions have separate visual scenes and gestures: a horizontal task ribbon for LLM agent applications, an upward RGB observation layer that reveals geometry and map correspondences, and a diagonal glass evidence folio for AI in environmental and energy systems. AVPC uses vehicle views, shared landmarks and spatial conflicts to explain collaboration. Each gesture has click or keyboard alternatives. Chapter palettes alternate warm/cool and light/dark surfaces.

Project names, research questions and my role form the first reading layer. All expandable records start closed. Scene entrances reverse when they leave the viewport and replay on return. Open reading layers automatically close near the viewport exit; language preferences remain.

The U-IMPROVE perception interface uses one continuous range control: drag from the three task outputs through semantic-geometric fusion into a rotatable depth scene, or reverse the motion to separate them again. Arrow keys and Home/End offer the same process. Leaving the visual resets it to its closed starting state.

Wheel, trackpad, touch, scrollbar and keyboard scrolling remain entirely native. Page snapping, custom damping, release thresholds and automatic position corrections are disabled. Chapters have natural content heights. Header calibration applies only to explicit directory and chapter links. Mature scroll libraries and CSS alternatives have been researched as future options; none are installed as a replacement controller.

Presentation animations run at 0.6 of the previous speed using shared timing helpers for entrances, reversals, details, CSS transitions and automatic 3D motion. Pointer-controlled movement remains direct. A shared geometric scene observer starts entrances just before arrival, retains partially visible scenes, and cancels pending resets on quick returns. It avoids area-ratio thresholds that change as details expand. Offscreen 3D scenes stop requesting frames; tool books re-arm their entrance on a genuine departure.

Reading layers reveal their intrinsic content through grid tracks without the animation library's `height: auto` scroll-restoration measurement. Leaving layers hide and keep their occupied space until native scrolling finishes, then collapse. Reading gestures and chapter departures close expanded layers. Body copy is generally 16–18px and necessary instructions are at least 14px; decorative illustration details do not carry unique information.

English is the default on a first visit. The EN/ZH control switches the complete content and retains the current reading selections. Language preferences are stored locally. The contact chapter includes WeChat, phone, email, and GitHub links supplied for publication by the author.

## Development

Node.js 24 and npm are recommended.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The static build is generated in `dist/`. React and Motion power the interface and chapter-specific entrance animations. Three.js is loaded on demand for the original research-tool books and the U-IMPROVE concept preview. The dissertation content follows the author's latest PSP305 presentation: a proposed Presence-Aware Metadata Strip, a shared RGB-and-language image-generation backbone for segmentation, metric depth and surface normals, deterministic decoding, and semantic-geometric fusion with camera-intrinsic 3D lifting. The interactive visuals explain this proposed framework and are explicitly labelled as concept demonstrations. FPR, IoU and AbsRel are evaluation plans, not personal results. Native scrolling, chapter deep links, keyboard alternatives, and reduced-motion settings keep the information accessible.

## Content and assets

Chinese source content is in `src/data/content.ts`; the matching English content is in `src/data/content.en.ts`. Chapter prose is translated through `src/i18n.tsx`. Preserve the distinction between personal contributions, team results, engineering prototypes, and ongoing research when editing either language.

Diagrams, paper layouts, character sketches, geometric collage fragments, and tool-book models are original visual explanations. They are not experimental outputs or equipment photographs. No phototherapy-mask 3D model or rendered model image is displayed or included in the published assets.

Fonts are self-hosted. Complete licenses for production dependencies and fonts are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), also distributed at `/project-assets/third-party-notices.txt`. Private research notes, source attachments, account configuration, and retired assets are excluded from publication.

## Vercel

The project is published through Vercel CLI. To update production, run `vercel deploy --prod`. The production domain is public; preview deployments retain authentication. GitHub integration is not currently connected, so pushing `main` does not automatically deploy Vercel.

When connecting [ChoneyChen/ChoneyChen.github.io](https://github.com/ChoneyChen/ChoneyChen.github.io), use Vite, repository root, `npm ci`, `npm run build`, output directory `dist`, and Node.js 24.x. See [Vercel’s Vite documentation](https://vercel.com/docs/frameworks/frontend/vite).

## GitHub Pages

`main` contains source; `gh-pages` contains the static `dist/` build. Pages is configured with **Deploy from a branch → gh-pages → / (root)**. This is a user homepage, so Vite uses the root path.

An optional [GitHub Actions template](deployment/github-actions/deploy-pages.yml) is included. Current GitHub authentication lacks workflow permission, so the template has not been enabled. With that permission, copy it to `.github/workflows/deploy-pages.yml` and select GitHub Actions in Pages settings. See [Vite’s static deployment guide](https://vite.dev/guide/static-deploy.html).
