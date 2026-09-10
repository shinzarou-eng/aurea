# ReadmeFR.md — Aurea

## Projet

Aurea — Studio de lancement pour applications.
Stack : React + Vite + TypeScript + Tailwind CSS v4, servie par un petit serveur Express en dev.
Objectif : analyser des captures d'écran et le code d'une app mobile/web, et produire un kit de lancement complet (ASO, UGC, bench concurrentiel, simulateur CAC/LTV, OKR, audit projet, tests de build, exports PDF/CSV/Markdown, etc.).

## Commandes

- `npm run dev` — lance le serveur de développement (Express + Vite middleware HMR) sur `http://localhost:3000`.
- `npm run build` — build production : `vite build` + `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`.
- `npm run start` — lance le build de production (`node dist/server.cjs`).
- `npm run lint` — `tsc --noEmit`.
- `npm run clean` — supprime `dist` et `server.js`.

> `bun` est installé localement et `bun.lock` existe, mais le lockfile est en version non reconnue par Bun actuel. Préférer `npm run ...` pour les builds/vérifications.

## Configuration clé API

- Le serveur charge les variables via `dotenv.config()` depuis un fichier `.env`.
- `GOOGLE_API_KEY` (ou `GEMINI_API_KEY` pour compatibilité) est requise pour les appels au fournisseur par défaut. Si absente, le serveur démarre mais `/api/marketing/*` renvoie une erreur.
- Les clés OpenAI (`OPENAI_API_KEY`) et Anthropic (`ANTHROPIC_API_KEY`) sont utilisées comme fallback si le fournisseur correspondant est choisi.

## Architecture

- `src/App.tsx` — page racine, état global, gestion de la production du kit.
- `src/components/*` — un composant par module stratégique.
- `src/types.ts` — interfaces TypeScript partagées.
- `src/data/presets.ts` — captures de démo (FitPulse Pro, NovaPay).
- `src/utils/*` — helpers (export Markdown, PDF, historique, etc.).
- `server.ts` — routes API Express (analyse, raffinement, localisation, A/B tests, concurrents, etc.).

## Conventions et points de vigilance

- Tailwind CSS v4 : importé via `@import "tailwindcss";` dans `src/index.css`.
- Les icônes viennent de `lucide-react`.
- `react-markdown` est utilisé pour afficher le contenu produit.
- Le renderer des presets SVG (`src/data/presets.ts`) doit échapper les caractères XML (`&`, `<`, `>`, `"`, `'`) dans les textes injectés, sinon les `<img>` de démo restent cassées.
- L'état `images` contient `UploadedImage` avec `isPreset?: boolean`. Quand l'utilisateur importe ses propres photos, les presets doivent être remplacés, pas ajoutés.

## Vérification d'une modification UI

1. Lancer `npm run lint`.
2. Lancer `npm run build`.
3. Si c'est un changement React visible, capturer un screenshot via Playwright et valider le rendu avant de conclure.
4. Si Playwright affiche encore une ancienne version d'un fichier TSX, mettre à jour la date de modification du fichier pour invalider le cache de transformation Vite, puis recharger la page.

## Fonctionnalités récemment ajoutées

- Historique de sessions (localStorage, modal dans le header).
- Conseiller produit flottant (bas-droite, utilise `/api/marketing/refine`).
- Palette de commandes `Ctrl/Cmd + K`.
- Module *Boîte à outils Growth* (landing page, calendrier 30J, kit de presse).
- Module *Audit Projet* (`ProjectFolderUpload` + `ProjectAuditSection` + endpoint `/api/marketing/audit-project`) : sélection d'un dossier de code, analyse du code, UX, sécurité, performance, marché, positionnement concurrentiel, monétisation, localisation, roadmap et plan de lancement/tests.
- *Test sandbox* (`ProjectTestResults` + endpoint `/api/marketing/test-project`) : création d'un dossier temporaire, `npm install`, `npm run build` et `npm run test` avec compte-rendu des logs/exit codes, diagnostics du framework, fichiers manquants, avertissements et corrections automatiques (ex. création de `index.html` pour Vite).
- PWA : `public/manifest.json`, `public/sw.js`, logo `aurea-icon.svg` et enregistrement du service worker dans `index.html`.
- Branding : nom "Aurea", logo dans `public/`, hero sobre et UI pro.
