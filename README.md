# Choney Chen · Tianyi Chen

A personal homepage about my work, built around a continuous reading thread and thirteen independently designed chapters. Pixel research cartridges, isometric simulation layers, a two-dimensional systems diagram, document files, glass research blueprints, overprinted perspectives, hand-drawn working notes, original 3D tool books, and a cubist collage each reveal real experiences through different interactions.

Visit: [Vercel](https://choney-between-states.vercel.app) · [GitHub Pages](https://choneychen.github.io/)

English is the default on a first visit. The EN/ZH control switches the complete content and retains the current reading selections. Language preferences are stored locally. The contact chapter includes WeChat, phone, email, and GitHub links supplied for publication by the author.

## Development

Node.js 24 and npm are recommended.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The static build is generated in `dist/`. React and Motion power the interface and chapter-specific entrance animations. Three.js is loaded on demand for the original research-tool books. Native scrolling, chapter deep links, keyboard alternatives, and reduced-motion settings keep the information accessible.

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
