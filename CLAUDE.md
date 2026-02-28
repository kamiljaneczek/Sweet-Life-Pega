# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sweet Life Pega is a sample e-commerce storefront ("Sweet Life" candy/confectionery brand) built with the **Pega Constellation React SDK** (v23.1). It connects to a Pega Infinity 24 backend server for case management, mashup UI rendering, and business logic. The frontend replaces Pega's default Constellation UI components with custom-styled ones using Tailwind CSS and ShadCN/Radix UI primitives.

## Build & Development Commands

```bash
npm install                  # Install dependencies
npm run start-dev            # Dev server on localhost:3502 (webpack-dev-server)
npm run start-dev-https      # Dev server with HTTPS
npm run build:dev            # Development build to ./dist (runs lint fix first)
npm run build:prod           # Production build to ./dist (with gzip/brotli compression)
npm run build:dev:ci         # CI build: clean + install + dev build
npm run build:prod:ci        # CI build: clean + install + prod build
npm run start-prod           # Serve production build on port 3502
```

### Linting & Formatting

```bash
npm run lint                 # Run ESLint + Prettier checks in parallel
npm run fix                  # Auto-fix ESLint + Prettier issues
npm run lint:es              # ESLint only
npm run lint:format          # Prettier check only
npm run fix:es               # ESLint auto-fix only
npm run fix:format           # Prettier auto-fix only
```

### Testing

```bash
npm test                     # Playwright e2e tests (chromium, MediaCo portal+embedded)
npm run test:headed          # Playwright with visible browser
npm run test:functional      # Jest functional tests (tests/functional/dxcb)
npm run test-report          # View Playwright HTML report
```

Playwright tests are in `tests/e2e/` organized by app (Digv2, MediaCo). Jest unit tests root is `tests/unit/`. Playwright config: 120s timeout, chromium project by default.

### Storybook

```bash
npm run storybookSDK             # Custom SDK component stories on port 6040
npm run storybookConstellation   # Constellation component stories on port 6050
```

### DX Component Builder (DXCB)

```bash
npm run authenticate         # Auth to Pega server for DXCB
npm run create               # Create a new component
npm run buildComponent       # Build a single component
npm run buildAllComponents   # Build all components
npm run publish              # Publish component to Pega server
npm run publishAll           # Publish all components
```

## Architecture

### Entry Point & Routing

`src/index.tsx` renders a React Router v5 (`BrowserRouter`/`Switch`) app with static pages: Home, Company, Products, Contact, Support, DesignSystem. Each page is a standalone component in `src/app/`. Each page has both clean URL and `.html` routes (e.g., `/products` and `/products.html`).

### Pega Constellation Integration

The app embeds Pega Constellation UI via a "mashup" pattern:

1. **`src/hooks/useConstellation.ts`** — React hook that handles OAuth authentication via `@pega/auth`, listens for `SdkConstellationReady` event, and calls `startMashup()`
2. **`src/lib/constellation.tsx`** — `startMashup()` initializes PCore, loads the SDK component map, and renders the Pega root component into `#pega-root` DOM element
3. **`sdk-config.json`** — Configuration for auth (OAuth client IDs, grant types) and server connection (Infinity REST server URL, app alias "TellUsMoreRef")
4. **`src/components_map.js`** — Maps component names to lazy-loaded implementations; most entries are commented out as the app relies on SDK defaults

`PCore` is a global object (declared in eslint config) provided by Pega's `@pega/constellationjs` bootstrap shell. It manages state, pub/sub events, and component lifecycle.

### Component Layers

**Override SDK components** (`src/components/override-sdk/`) — The main component set. These replace Pega's default Constellation components with custom UI implementations. Organized by type:
- `field/` — Form fields (TextInput, Dropdown, Currency, Date, Email, etc.) using ShadCN-style UI primitives
- `template/` — Layout templates (OneColumn, TwoColumn, CaseView, ListView, AppShell, etc.)
- `widget/` — Widgets (ToDo, FileUtility, CaseHistory, Attachment, etc.)
- `infra/` — Infrastructure (Assignment, FlowContainer, NavBar, ErrorBoundary, etc.)
- `designSystemExtension/` — Extended design system components (Banner, Pulse, RichTextEditor, etc.)

Each override component follows this pattern:
- Receives Pega `PConnFieldProps` (or similar) with `getPConnect()` for accessing Pega APIs
- Uses `getComponentFromMap()` to resolve sub-components (enabling nested overrides)
- Handles Pega events via `handleEvent(actions, 'changeNblur', propName, value)`

**Custom SDK components** (`src/components/custom-sdk/`) — Components created via DXCB for extending Pega functionality (e.g., FeaturedProducts widget).

**Custom Constellation components** (`src/components/custom-constellation/`) — New Constellation DX components (widgets, fields, templates). Each has `index.tsx`, `mock.ts`, `PConnProps.d.ts`, `styles.ts`, and `demo.stories.tsx`. Built and published to the Pega server via the DX Component Builder.

### Design System

- **`src/design-system/ui/`** — ShadCN/Radix-based UI primitives (Button, Input, Calendar, Card, Carousel, Checkbox, Select, etc.)
- **`src/lib/utils.ts`** — `cn()` helper combining `clsx` + `tailwind-merge` for conditional class merging
- **`tailwind.config.js`** — Extends Tailwind with CSS custom properties (HSL-based theming via `--primary`, `--background`, etc.)
- **`src/theme.js`** — Material UI theme (legacy, used by Pega Constellation's internal MUI components)
- **`src/design-system/theme.tsx`** — Light/dark theme toggle using `useLocalStorage`
- Uses `class-variance-authority` for variant styling

### Styling Approach

Tailwind CSS is the primary styling method. Override components use Tailwind utility classes directly in JSX. Some components still have CSS files for complex layouts (NavBar, TwoColumn, etc.). The `cn()` utility from `src/lib/utils.ts` should be used for conditional class composition.

### Build Configuration

- **Webpack 5** bundles the app; entry at `./src/index.tsx`, output to `./dist/`
- Multiple HTML entry points are generated (index, company, products, support, contact) and copied as portal variants (simpleportal, portal, fullportal, embedded)
- Production builds include gzip + brotli compression (quality 11)
- TypeScript target: ES2022, strict mode enabled
- `tsconfig.build.json` is used for DX component builds (outputs to `./lib/`), uses `skipLibCheck: true` to avoid `@pega/pcore-pconnect-typedefs` errors

## Key Configuration Files

- **`sdk-config.json`** — Pega server URL, OAuth client IDs, app alias, DXCB publish settings
- **`sdk-local-component-map.js`** — Generated by DXCB; maps component names to implementations
- **`src/dxcb.config.json`** — Component builder configuration

## Code Conventions

- ESLint extends `@pega` config; Prettier extends `@pega/prettier-config` with `printWidth: 150`
- SonarJS cognitive complexity warn at 20 (50 for Constellation, 45 for SDK overrides)
- `PCore` is a global (no import needed) — configured in `.eslintrc.json` globals
- TypeScript with `noImplicitAny: false` and `strict: true`
- React 17 (no need for `import React` in JSX files — uses `react-jsx` transform)
- Single quotes for strings in Prettier config (Pega default)
- Tailwind: class-based dark mode, Roboto font, custom color tokens
- **npm config**: `legacy-peer-deps=true` (required due to React 17 + newer dependency mix)

## Deployment

- Vercel deployment with SPA rewrite (`vercel.json`: all routes -> `/`)
- HTTPS dev requires SSL certs in `keys/` directory
