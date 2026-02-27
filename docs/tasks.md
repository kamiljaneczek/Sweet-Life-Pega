# Implementation Plan: Webpack + React Router v5 to Vite + TanStack Router Migration

## Progress Summary
- **Total Tasks**: 20
- **Completed**: 20
- **Remaining**: 0
- **Progress**: 100%

---

## Completed Tasks

### Phase 1: Foundation -- Static Assets and Build Configuration

- [x] 1. Create the Pega asset copy script and `public/` directory structure
- [x] 2. Create `postcss.config.js` for Tailwind CSS processing
- [x] 3. Create `vite.config.ts` with React plugin, compression, and dev server settings
- [x] 4. Move `index.html` to project root and update for Vite
- [x] 5. Create the portal HTML variant post-build script
- [x] 6. Update `tsconfig.json` for Vite compatibility
- [x] 7. Install Vite dependencies and update `package.json` scripts

### Phase 2: Vite Build Verification

- [x] 8. Verify Vite dev server starts and serves the existing app
- [x] 9. Verify Vite production build succeeds

### Phase 3: TanStack Router -- Route Structure

- [x] 10. Add TanStack Router Vite plugin to `vite.config.ts`
- [x] 11. Create the root route layout at `src/routes/__root.tsx`
- [x] 12. Create all individual route files under `src/routes/`
- [x] 13. Create the router instance at `src/router.tsx`

### Phase 4: TanStack Router -- Integration

- [x] 14. Update `src/index.tsx` to use TanStack RouterProvider
- [x] 15. Remove Header and Footer from page components
- [x] 16. Replace `<a href>` with TanStack Router `<Link>` in Header component
- [x] 17. Replace `<a href>` with TanStack Router `<Link>` in Footer component

### Phase 5: Full Integration Verification

- [x] 18. Verify all routes and navigation with TanStack Router
- [x] 19. Verify production build with TanStack Router

### Phase 6: Cleanup

- [x] 20. Remove webpack files, old HTML files, and unused dependencies

---

## Migration Summary

### Files Created
- `vite.config.ts` -- Vite configuration with TanStack Router plugin, React plugin, compression
- `postcss.config.js` -- PostCSS config for Tailwind + autoprefixer
- `index.html` -- Root HTML entry point (moved from src/)
- `scripts/copy-pega-assets.js` -- Copies Pega SDK assets to public/ on postinstall
- `scripts/copy-portal-variants.js` -- Copies index.html to portal variants after build
- `src/router.tsx` -- TanStack Router instance with type registration
- `src/routes/__root.tsx` -- Root layout (Header + Outlet + Footer) with .html redirect
- `src/routes/index.tsx` -- Home route (/)
- `src/routes/company.tsx` -- Company route (/company)
- `src/routes/products.tsx` -- Products route (/products)
- `src/routes/support.tsx` -- Support route (/support)
- `src/routes/contact.tsx` -- Contact route (/contact)
- `src/routes/desingsystem.tsx` -- Design system route (/desingsystem)
- `src/routeTree.gen.ts` -- Auto-generated route tree (by TanStack Router plugin)

### Files Modified
- `package.json` -- Updated scripts (vite commands), added new deps, removed webpack/react-router deps
- `tsconfig.json` -- Added "vite/client" to types
- `.gitignore` -- Added /public
- `src/index.tsx` -- Replaced BrowserRouter/Switch with RouterProvider
- `src/app/home.tsx` -- Removed Header/Footer imports and wrapping
- `src/app/company.tsx` -- Removed Header/Footer imports and wrapping
- `src/app/products.tsx` -- Removed Header/Footer imports and wrapping
- `src/app/support.tsx` -- Removed Header/Footer imports and wrapping
- `src/app/contact.tsx` -- Removed Header/Footer imports and wrapping
- `src/app/components/header.tsx` -- Replaced <a href> with TanStack <Link>, added activeProps
- `src/app/components/footer.tsx` -- Replaced <a href> with TanStack <Link>

### Files Deleted
- `webpack.config.js`
- `src/index.html`
- `src/company.html`
- `src/support.html`
- `src/products.html`
- `src/contact.html`

### Dependencies Added
- `@tanstack/react-router` (dependency)
- `@tanstack/react-router-devtools` (devDependency)
- `@tanstack/router-plugin` (devDependency)
- `@vitejs/plugin-react` (devDependency)
- `autoprefixer` (devDependency)
- `vite` (devDependency)
- `vite-plugin-compression2` (devDependency)

### Dependencies Removed
- `react-router-dom`
- `webpack`, `webpack-cli`, `webpack-dev-server`
- `html-webpack-plugin`, `clean-webpack-plugin`, `copy-webpack-plugin`, `compression-webpack-plugin`
- `ts-loader`, `css-loader`, `style-loader`, `sass-loader`
- `file-loader`, `null-loader`
- `@kooneko/livereload-webpack-plugin`
- `http-server`
