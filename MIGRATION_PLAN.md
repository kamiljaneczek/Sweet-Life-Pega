# Migration Plan: React Router v5 + Webpack → TanStack Router + Vite

## Context

The Sweet Life Pega project uses React Router v5 with Webpack 5 as its build system. The routing is minimal (6 static pages, no params, no nested routes) and navigation uses plain `<a href>` tags. The project integrates with Pega Constellation SDK via a mashup pattern that loads external scripts (`bootstrap-shell.js`, `constellation-core`) and renders into a `#pega-root` DOM element.

**Goals**: Replace Webpack with Vite for faster dev/build experience, and replace React Router v5 with TanStack Router for type-safe routing. Stay on React 17 (Pega SDK constraint). DXCB and Storybook migration are out of scope.

---

## Phase 1: Webpack → Vite Migration

### 1.1 Install Vite dependencies

```
npm install --save-dev vite @vitejs/plugin-react vite-plugin-compression2
```

Remove later (after verification): `webpack`, `webpack-cli`, `webpack-dev-server`, `html-webpack-plugin`, `clean-webpack-plugin`, `copy-webpack-plugin`, `compression-webpack-plugin`, `ts-loader`, `css-loader`, `style-loader`, `sass-loader`, `file-loader`, `url-loader`, `null-loader`, `@kooneko/livereload-webpack-plugin`

### 1.2 Create `vite.config.ts`

**File: `vite.config.ts`** (new, project root)

Key configuration:
- **Plugin**: `@vitejs/plugin-react` (supports React 17 with `jsxRuntime: 'automatic'`)
- **Port**: 3502 (match current dev server)
- **Static assets**: Vite's `public/` directory replaces CopyWebpackPlugin
- **Resolve extensions**: `.tsx`, `.ts`, `.js`, `.jsx`
- **CSS**: Vite handles Tailwind/PostCSS natively (need `postcss.config.js`)
- **Build compression**: `vite-plugin-compression2` for gzip + brotli
- **`define`**: Add `global: 'window'` if needed for Pega SDK compatibility

### 1.3 Create `postcss.config.js`

**File: `postcss.config.js`** (new, project root)

Currently Tailwind is processed through webpack's css-loader. Vite uses PostCSS natively, so we need:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 1.4 Move `index.html` to project root

Vite expects `index.html` at the project root (not `src/`).

**File: `index.html`** (move from `src/index.html`)

Changes to the HTML:
- Add `<script type="module" src="/src/index.tsx"></script>` before `</body>`
- Remove `<base href="/" />` (Vite handles this)
- Keep the `#outlet` div, font links, and Material Icons links
- Remove the other HTML files (`company.html`, `support.html`, `products.html`, `contact.html`) — TanStack Router handles all routes from single entry point

### 1.5 Migrate static assets to `public/` directory

Create `public/` directory and move/copy assets that CopyWebpackPlugin currently handles:

| Current Source | Vite `public/` Target |
|---|---|
| `assets/icons/*` | `public/constellation/icons/` |
| `assets/css/*` | `public/assets/css/` |
| `assets/img/*` | `public/assets/img/` |
| `sdk-config.json` | `public/sdk-config.json` |
| `sdk-local-component-map.js` | `public/sdk-local-component-map.js` |
| `node_modules/@pega/auth/lib/oauth-client/authDone.html` | `public/auth.html` |
| `node_modules/@pega/auth/lib/oauth-client/authDone.js` | `public/authDone.js` |
| `node_modules/tinymce` | `public/tinymce/` |
| `node_modules/@pega/constellationjs/dist/bootstrap-shell.js` | `public/constellation/bootstrap-shell.js` |
| `node_modules/@pega/constellationjs/dist/bootstrap-shell.*.*` | `public/constellation/` |
| `node_modules/@pega/constellationjs/dist/lib_asset.json` | `public/constellation/lib_asset.json` |
| `node_modules/@pega/constellationjs/dist/constellation-core.*.*` | `public/constellation/prerequisite/` |

**Note**: For files from `node_modules`, create a build script (`scripts/copy-pega-assets.js`) that copies these on `npm install` / `postinstall`, since they shouldn't be committed to the repo. Add a `postinstall` npm script.

### 1.6 Handle portal HTML variants

Current post-build step copies `index.html` to `simpleportal.html`, `portal.html`, `fullportal.html`, `embedded.html`. Create a Vite plugin or post-build script to replicate this for production builds.

### 1.7 Update `tsconfig.json`

Add/modify for Vite compatibility:
- Add `"types": ["vite/client"]` (alongside existing types)
- Ensure `"moduleResolution": "bundler"` or keep `"Node"` (both work with Vite)
- Add path aliases if desired (e.g., `"~/*": ["./src/*"]`)

### 1.8 Update npm scripts in `package.json`

| Old Script | New Script |
|---|---|
| `"start-dev": "webpack serve"` | `"start-dev": "vite --port 3502"` |
| `"start-dev-https": "webpack serve --https"` | `"start-dev-https": "vite --port 3502 --https"` |
| `"_internal-build-dev-only": "webpack --mode=development ..."` | `"_internal-build-dev-only": "vite build --mode development ..."` |
| `"_internal-build-prod-only": "webpack --mode=production ..."` | `"_internal-build-prod-only": "vite build ..."` |
| `"start-prod": "http-server ./dist ..."` | `"start-prod": "vite preview --port 3502"` (or keep http-server) |

---

## Phase 2: React Router v5 → TanStack Router

### 2.1 Install TanStack Router

```
npm install @tanstack/react-router @tanstack/react-router-devtools
npm install --save-dev @tanstack/router-plugin
```

Remove later: `react-router-dom`

### 2.2 Configure TanStack Router Vite plugin

Update `vite.config.ts` to add the TanStack Router plugin for automatic route tree generation:

```ts
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// Add to plugins array (BEFORE @vitejs/plugin-react):
TanStackRouterVite({
  routesDirectory: './src/routes',
  generatedRouteTree: './src/routeTree.gen.ts',
}),
```

### 2.3 Create route structure

Create file-based routes under `src/routes/`:

```
src/routes/
├── __root.tsx          # Root layout (Header + Outlet + Footer)
├── index.tsx           # Home page (/)
├── company.tsx         # Company page (/company)
├── products.tsx        # Products page (/products)
├── support.tsx         # Support page (/support)
├── contact.tsx         # Contact page (/contact)
└── desingsystem.tsx    # Design system page (/desingsystem)
```

### 2.4 Create root route: `src/routes/__root.tsx`

This replaces the per-page `<Header />` / `<Footer />` pattern. Every page currently imports Header and Footer individually — the root route centralizes this.

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import Header from '../app/components/header'
import Footer from '../app/components/footer'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}
```

**Note**: The `SdkLoggedOut` event listener currently in `src/index.tsx` (lines 41-52) will be moved here or to a top-level effect.

### 2.5 Create individual route files

Each route file uses `createFileRoute`. The page components from `src/app/` are reused but modified to remove their individual `<Header />` and `<Footer />` imports (now in root layout).

**Example: `src/routes/index.tsx`**
```tsx
import { createFileRoute } from '@tanstack/react-router'
import Home from '../app/home'

export const Route = createFileRoute('/')({
  component: Home,
})
```

Each page component (`home.tsx`, `company.tsx`, `products.tsx`, `support.tsx`, `contact.tsx`, `desingsystem.tsx`) will be updated to:
1. Remove `<Header />` and `<Footer />` imports and JSX
2. Keep their Pega integration logic intact
3. Keep the `#pega-root` div rendering

### 2.6 Create router instance: `src/router.tsx`

```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <div>Page not found</div>,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

### 2.7 Update entry point: `src/index.tsx`

Replace BrowserRouter/Switch/Route with TanStack RouterProvider:

```tsx
import { render } from 'react-dom'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './common.css'

const outletElement = document.getElementById('outlet')
if (outletElement) {
  render(<RouterProvider router={router} />, outletElement)
}

// Keep the SdkLoggedOut listener
document.addEventListener('SdkLoggedOut', () => { ... })
```

### 2.8 Handle `.html` suffix routes

The current routes support both `/company` and `/company.html`. With TanStack Router, we can handle this via:
- **Option A**: Create redirect routes for `.html` variants (cleanest)
- **Option B**: Use a `beforeLoad` hook on the root route to strip `.html` suffixes
- **Recommended**: Option B — add a `beforeLoad` in `__root.tsx` that redirects `*.html` to the clean URL

### 2.9 Update navigation links (optional but recommended)

Replace `<a href>` with TanStack Router `<Link>` in:
- `src/app/components/header.tsx` — 5 nav links (desktop) + 5 (mobile)
- `src/app/components/footer.tsx` — 7 footer links

Benefits: client-side navigation (no full page reload), type-safe routes, active link styling via `activeProps`.

**Files to modify:**
- `src/app/components/header.tsx`
- `src/app/components/footer.tsx`

---

## Phase 3: Pega-Specific Concerns

### 3.1 External script loading

`bootstrap-shell.js` is currently loaded by Pega SDK internals (via `@pega/auth`'s `loginIfNecessary`). It's served as a static file. With Vite, as long as it's in `public/constellation/`, it will be accessible at `/constellation/bootstrap-shell.js` — same as current behavior.

### 3.2 `myLoadMashup` global

`myLoadMashup` is declared in `src/lib/constellation.tsx` as `declare const myLoadMashup: any`. It's injected globally by `bootstrap-shell.js`. No changes needed — it will continue to work.

### 3.3 `PCore` global

`PCore` is a global provided by Pega's runtime. ESLint config already has it as a global. No changes needed.

### 3.4 `#pega-root` DOM element

Each page that uses Pega renders a `<div id="pega-root" />`. This pattern stays exactly the same — it's within the React component tree, not in the HTML template.

### 3.5 `sdk-config.json` loading

`@pega/auth`'s `getSdkConfig()` fetches `/sdk-config.json` at runtime. Moving it to `public/sdk-config.json` ensures it's served at the root URL.

### 3.6 Material UI theme provider

`src/lib/constellation.tsx` wraps Pega components in `<ThemeProvider theme={theme}>`. This is independent of routing — no changes needed.

---

## Files Summary

### New files to create:
| File | Purpose |
|---|---|
| `vite.config.ts` | Vite configuration (replaces webpack.config.js) |
| `postcss.config.js` | PostCSS config for Tailwind |
| `src/router.tsx` | TanStack Router instance |
| `src/routes/__root.tsx` | Root layout route |
| `src/routes/index.tsx` | Home route |
| `src/routes/company.tsx` | Company route |
| `src/routes/products.tsx` | Products route |
| `src/routes/support.tsx` | Support route |
| `src/routes/contact.tsx` | Contact route |
| `src/routes/desingsystem.tsx` | Design system route |
| `scripts/copy-pega-assets.js` | Script to copy Pega node_module assets to public/ |
| `public/` directory structure | Static assets |

### Files to modify:
| File | Changes |
|---|---|
| `index.html` | Move to root, add module script tag |
| `src/index.tsx` | Replace React Router with RouterProvider |
| `src/app/home.tsx` | Remove Header/Footer wrapping |
| `src/app/company.tsx` | Remove Header/Footer wrapping |
| `src/app/products.tsx` | Remove Header/Footer wrapping |
| `src/app/support.tsx` | Remove Header/Footer wrapping |
| `src/app/contact.tsx` | Remove Header/Footer wrapping |
| `src/app/desingsystem.tsx` | (no Header/Footer to remove — only has pega-root) |
| `src/app/components/header.tsx` | Replace `<a href>` with `<Link>` |
| `src/app/components/footer.tsx` | Replace `<a href>` with `<Link>` |
| `package.json` | Update scripts, dependencies |
| `tsconfig.json` | Add Vite types |

### Files to delete (after verification):
| File | Reason |
|---|---|
| `webpack.config.js` | Replaced by vite.config.ts |
| `src/company.html` | Single entry point with Vite |
| `src/support.html` | Single entry point with Vite |
| `src/products.html` | Single entry point with Vite |
| `src/contact.html` | Single entry point with Vite |
| `src/index.html` | Moved to project root |

---

## Implementation Order

1. **Create `public/` directory and `scripts/copy-pega-assets.js`** — set up static asset serving
2. **Create `postcss.config.js`**
3. **Create `vite.config.ts`** with TanStack Router plugin
4. **Move `index.html`** to project root, add module script
5. **Install dependencies** (vite, tanstack-router, remove webpack deps)
6. **Create `src/router.tsx`** and route files (`src/routes/`)
7. **Update `src/index.tsx`** — replace BrowserRouter with RouterProvider
8. **Update page components** — remove Header/Footer wrapping
9. **Update Header/Footer** — replace `<a href>` with `<Link>`
10. **Update `package.json` scripts**
11. **Update `tsconfig.json`**
12. **Test** dev server starts, all routes work, Pega integration works
13. **Clean up** — delete webpack.config.js, unused HTML files, old dependencies

---

## Verification

1. `npm run start-dev` — dev server starts on port 3502
2. Navigate to `/`, `/company`, `/products`, `/support`, `/contact`, `/desingsystem` — all render correctly
3. Navigation links work as client-side transitions (no full page reload)
4. Pega Constellation initializes correctly (check console for `PCore ready!`)
5. Product listing loads on `/products`
6. Case creation works on `/support`
7. Contact form works on `/contact`
8. Dark mode toggle works
9. `npm run build:prod` — production build succeeds
10. Portal HTML variants are generated (simpleportal.html, portal.html, etc.)
11. Production server serves compressed assets
