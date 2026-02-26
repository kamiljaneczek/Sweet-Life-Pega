# SDK Upgrade Plan: 23.1.x → 25.1.10 (Pega 24 → Pega 25)

## Context

The Sweet Life Pega project is a custom e-commerce storefront built on the Pega Constellation React SDK (version 23.1.10) with 97 override components. It needs to be upgraded to SDK 25.1.10 for Pega Infinity 25 compatibility. This is a two-major-version jump with breaking changes across React, React Router, Material UI, TypeScript, ESLint, and Pega SDK APIs. The MUI→Tailwind/ShadCN migration is part of this upgrade since SDK 25.1 ships with zero MUI dependencies.

---

## Phase 0: Preparation & Backup

### 0.1 Create upgrade branch
```bash
git checkout -b sdk-upgrade-25.1.10
```

### 0.2 Backup critical config files
Save copies of these files before the merge (they'll conflict):
- `sdk-config.json` — OAuth client IDs, server URLs
- `package.json` — custom dependencies (Radix, Tailwind, Embla, Lucide, etc.)
- `.eslintrc.json` — custom rules
- `tsconfig.json` — type roots
- `webpack.config.js` — custom copy patterns, CSS includes

### 0.3 Add upstream remote and fetch
```bash
git remote add upstream https://github.com/pegasystems/react-sdk.git
git fetch upstream
```

---

## Phase 1: Merge Upstream SDK 25.1.10

### 1.1 Merge upstream release branch
```bash
git merge upstream/release/25.1.10 --allow-unrelated-histories
```

### 1.2 Resolve merge conflicts
Priority order for conflict resolution:
1. **`package.json`** — Accept upstream SDK versions, re-add project-specific deps (Radix, Tailwind, Embla, Lucide, usehooks-ts, date-fns, etc.)
2. **`sdk-config.json`** — Keep our auth config (clientIds, grantType, serverUrl, appAlias)
3. **`webpack.config.js`** — Accept upstream structural changes, preserve our custom config
4. **`tsconfig.json`** — Accept upstream, keep custom settings
5. **`.eslintrc.json`** — Will be replaced by flat config (see Phase 3)
6. **`sdk-local-component-map.js`** — Keep our override mappings, update import paths if needed
7. **Override components** — Keep ours (they'll be updated in Phases 4-5)

### 1.3 Update package.json dependencies

Target versions (from SDK 25.1.10):
| Package | From | To |
|---------|------|----|
| `react` | ^17.0.2 | ^18.3.1 |
| `react-dom` | ^17.0.2 | ^18.3.1 |
| `react-router-dom` | ^5.3.4 | **remove** (replaced by `react-router`) |
| `react-router` | — | ^7.8.1 |
| `@types/react` | ^17.0.83 | ^18.3.23 |
| `@types/react-dom` | — | ^18.3.7 |
| `typescript` | ^4.9.5 | ^5.9.2 |
| `eslint` | ^8.56.0 | ^9.36.0 |
| `@pega/react-sdk-components` | ~23.1.11 | ~25.1.10 |
| `@pega/react-sdk-overrides` | ~23.1.11 | ~25.1.10 |
| `@pega/constellationjs` | ~23.1.1 | ~25.1.0 |
| `@pega/dx-component-builder-sdk` | ~23.1.14 | ~25.1.11 |
| `@pega/pcore-pconnect-typedefs` | ~2.1.1 | ~4.1.0 |
| `@pega/auth` | ^0.2.9 | ^0.2.34 |
| `@pega/cosmos-react-core` | ^4.2.0 | ^8.4.1 |
| `@pega/cosmos-react-work` | ^4.2.0 | ^8.4.1 |
| `@pega/cosmos-react-condition-builder` | ^4.2.0 | ^8.4.1 |
| `@pega/configs` | ^0.6.0 | ^0.17.0 |

**Remove** (no longer in SDK 25.1):
- `@material-ui/core`, `@material-ui/icons`, `@material-ui/lab`, `@material-ui/pickers`
- `@date-io/dayjs`, `@unicef/material-ui-currency-textfield`, `material-ui-phone-number`
- `react-router-dom` (replaced by `react-router`)
- `react-datepicker` (if no longer needed after SDK update)

**Keep** (project-specific, verify React 18 compat):
- All `@radix-ui/*` packages — React 18 compatible
- `tailwindcss`, `tailwind-merge`, `tailwindcss-animate` — framework-agnostic
- `class-variance-authority`, `clsx` — framework-agnostic
- `embla-carousel-react` — verify React 18 compat
- `lucide-react` — React 18 compatible
- `usehooks-ts`, `react-day-picker`, `date-fns` — React 18 compatible
- `wrangler` — unrelated to React

### 1.4 Clean install
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Phase 2: React 18 Migration

### 2.1 Update ReactDOM.render → createRoot

**File: `src/index.tsx`** (entry point)
```tsx
// Before (React 17):
import { render } from 'react-dom';
render(<BrowserRouter>...</BrowserRouter>, document.getElementById('outlet'));

// After (React 18):
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('outlet')!);
root.render(<BrowserRouter>...</BrowserRouter>);
```

**File: `src/lib/constellation.tsx`** (mashup render)
```tsx
// Before:
import { render } from 'react-dom';
render(<>{theComponent}</>, target);

// After:
import { createRoot } from 'react-dom/client';
const root = createRoot(target);
root.render(<>{theComponent}</>);
```

### 2.2 Update React Router v5 → v7

**File: `src/index.tsx`** — Only file using React Router
```tsx
// Before (v5):
import { Switch, Route, BrowserRouter } from 'react-router-dom';
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/company" component={Company} />
  <Route path="*" component={Home} />
</Switch>

// After (v7):
import { BrowserRouter, Routes, Route } from 'react-router';
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/company" element={<Company />} />
  <Route path="*" element={<Home />} />
</Routes>
```

Changes:
- `Switch` → `Routes`
- `component={X}` → `element={<X />}`
- Remove `exact` (v7 matches exactly by default)
- Remove duplicate `.html` routes (unnecessary)

---

## Phase 3: Build & Config Tooling Updates

### 3.1 ESLint 8 → 9 (Flat Config Migration)

**Delete:** `.eslintrc.json`
**Create:** `eslint.config.mjs`

The new flat config should:
- Use `@pega/configs` (^0.17.0) which provides ESLint 9-compatible configs
- Preserve custom rules (PCore global, cognitive complexity limits, DXCB overrides)
- Use `typescript-eslint` ^8.44.1 (replaces `@typescript-eslint/*` v6)

### 3.2 TypeScript 5.9 adjustments

**File: `tsconfig.json`** — Minimal changes expected:
- Keep `target: ES2022`, `module: ES2022`
- Keep `jsx: react-jsx` (works with React 18)
- Update `types` array if `pcore-pconnect-typedefs` package name changed
- Keep `noImplicitAny: false` (matches project convention)

### 3.3 Webpack config updates

**File: `webpack.config.js`**
- Update `@pega/constellationjs` dist paths if file names changed in 25.1
- Update `@pega/auth` oauth-client paths if restructured
- Verify `css-loader` include paths for new SDK component library structure
- Update `copy-webpack-plugin` patterns to match 25.1 package structure
- Verify `url-loader` / asset handling for webpack 5.101

### 3.4 Node.js version check

**File: `scripts/check-node-version.js`**
- Update minimum version check if SDK 25.1 requires Node 20+

### 3.5 Prettier & Stylelint

**File: `.prettierrc.js`** — Keep custom `printWidth: 150`, update base config import if `@pega/prettier-config` changed to `@pega/configs`

---

## Phase 4: Material UI → Tailwind/ShadCN Migration (57+ files)

This is the largest workstream. Components are grouped by complexity.

### 4.1 Simple replacements (MUI → existing ShadCN primitives)

These MUI components have direct ShadCN/Radix equivalents already in `src/design-system/ui/`:

| MUI Component | ShadCN Replacement | Design System Path |
|---------------|-------------------|-------------------|
| `Button` | `Button` | `design-system/ui/button.tsx` |
| `Card`, `CardHeader`, `CardContent` | `Card`, `CardHeader`, `CardContent` | `design-system/ui/card.tsx` |
| `Checkbox` | `Checkbox` | `design-system/ui/checkbox.tsx` |
| `Select`, `MenuItem` | `Select` | `design-system/ui/select.tsx` |
| `TextField`, `Input` | `Input` | `design-system/ui/input.tsx` |
| `Dialog` | `Dialog` | `design-system/ui/dialog.tsx` |
| `Avatar` | `Avatar` | `design-system/ui/avatar.tsx` |
| `Badge` | `Badge` | `design-system/ui/badge.tsx` |
| `Tabs`, `Tab` | `Tabs` | `design-system/ui/tabs.tsx` |
| `Divider` | `Separator` | `design-system/ui/separator.tsx` |

### 4.2 Layout replacements

| MUI Component | Tailwind Replacement |
|---------------|---------------------|
| `Grid` | Tailwind `grid` / `flex` utilities |
| `Box` | `div` with Tailwind classes |
| `Container` | `div` with `max-w-*` + `mx-auto` |
| `Typography` | Semantic HTML (`h1`-`h6`, `p`, `span`) with Tailwind text classes |
| `Paper` | `div` with `bg-card rounded-lg border shadow-sm` |

### 4.3 Complex component replacements

| MUI Component | Approach |
|---------------|----------|
| `makeStyles()` / `withStyles()` | Remove entirely, replace with Tailwind utility classes |
| `useTheme()` / `useMediaQuery()` | Tailwind responsive classes (`sm:`, `md:`, `lg:`) |
| `AppBar` / `Toolbar` | Custom header with Tailwind flex layout |
| `Drawer` | ShadCN Sheet component or custom sidebar |
| `Table` / `TableBody` / `TableHead` / `TableRow` / `TableCell` | ShadCN Table (`design-system/ui/table.tsx`) |
| `TablePagination` / `TableSortLabel` | Custom pagination with Tailwind + existing Button |
| `List` / `ListItem` / `ListItemText` | Semantic HTML `ul`/`li` with Tailwind |
| `Menu` / `MenuItem` | ShadCN DropdownMenu (`design-system/ui/dropdown-menu.tsx`) |
| `Snackbar` | ShadCN Toast / Sonner (`design-system/ui/sonner.tsx`) |
| `CircularProgress` | Tailwind spinner animation or Lucide `Loader2` icon |
| `Collapse` | ShadCN Collapsible or Radix Collapsible |
| `IconButton` | `Button variant="ghost" size="icon"` |

### 4.4 MUI Icons → Lucide React

Replace all `@material-ui/icons` imports with `lucide-react` equivalents:
| MUI Icon | Lucide Equivalent |
|----------|-------------------|
| `CloseIcon` | `X` |
| `MoreVert` | `MoreVertical` |
| `FilterList` | `Filter` |
| `Search` | `Search` |
| `Add` | `Plus` |
| `ArrowForwardIos` | `ChevronRight` |
| `ChevronLeft`/`Right` | `ChevronLeft`/`ChevronRight` |
| `PersonOutline` | `User` |
| `HomeOutlined` | `Home` |
| `FlagOutlined` | `Flag` |
| `WorkOutline` | `Briefcase` |
| `ExpandLess`/`More` | `ChevronUp`/`ChevronDown` |
| `ArrowBack` | `ArrowLeft` |
| `Subject` | `FileText` |
| `MenuIcon` | `Menu` |

### 4.5 Delete MUI theme file

**Delete:** `src/theme.js` — No longer needed after MUI removal
**Update:** `src/lib/constellation.tsx` — Remove `ThemeProvider` and `CssBaseline` MUI imports

### 4.6 Files to migrate (by priority)

**Critical Path (blocks basic functionality):**
1. `src/lib/constellation.tsx` — Remove MUI ThemeProvider/CssBaseline
2. `src/components/override-sdk/infra/Assignment/Assignment.tsx` — Core workflow
3. `src/components/override-sdk/infra/FlowContainer/FlowContainer.tsx` — Core workflow
4. `src/components/override-sdk/infra/NavBar/NavBar.tsx` — Navigation
5. `src/components/override-sdk/template/CaseView/CaseView.tsx` — Case display
6. `src/components/override-sdk/widget/ToDo/ToDo.tsx` — Task list

**High Priority (common components):**
7. `src/components/override-sdk/template/ListView/ListView.tsx` — Heaviest MUI user
8. `src/components/override-sdk/template/SimpleTableManual/SimpleTableManual.tsx`
9. `src/components/override-sdk/template/AppShell/AppShell.tsx`
10. `src/components/override-sdk/template/CaseViewActionsMenu/CaseViewActionsMenu.tsx`
11. `src/components/override-sdk/template/Confirmation/Confirmation.tsx`
12. `src/components/override-sdk/template/WssNavBar/WssNavBar.tsx`

**Medium Priority (layout templates):**
13. Templates using MUI Grid: Details, DetailsTwoColumn, DetailsThreeColumn, TwoColumn, TwoColumnTab, NarrowWideDetails, WideNarrowDetails, InlineDashboard
14. Templates using MUI Tabs: DetailsSubTabs, SubTabs

**Lower Priority (widgets & design system extensions):**
15. Widgets: CaseHistory, FileUtility, ActionButtonsForFileUtil, Followers, SummaryItem, AppAnnouncement
16. Infra: DeferLoad, DashboardFilter, Stages, VerticalTabs, LeftAlignVerticalTabs
17. Design System Extensions: AlertBanner, Banner, and others using MUI Grid

---

## Phase 5: Pega SDK API Updates

### 5.1 Review @pega import paths

All 26 unique `@pega/react-sdk-components/lib/*` import paths must be verified against SDK 25.1.10. Key imports to check:
- `@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map` → `getComponentFromMap()`
- `@pega/react-sdk-components/lib/bridge/react_pconnect` → `createPConnectComponent`
- `@pega/react-sdk-components/lib/components/helpers/event-utils` → `handleEvent()`
- `@pega/react-sdk-components/lib/components/helpers/versionHelpers` → `compareSdkPCoreVersions()`
- `@pega/react-sdk-components/lib/components/helpers/common-utils` → `isInfinity23OrHigher()`
- `@pega/react-sdk-components/lib/types/PConnProps` → type definitions

### 5.2 Update version checks

**File: `src/components/override-sdk/widget/Attachment/Attachment.tsx`**
- `isInfinity23OrHigher()` — verify this still exists and behaves correctly for Infinity 25
- If removed in SDK 25.1, replace with direct `PCore.getPCoreVersion()` comparison

### 5.3 Update PCore type definitions

With `@pega/pcore-pconnect-typedefs` jumping from ~2.1.1 to ~4.1.0:
- Review TypeScript compilation errors after install
- Update type annotations that no longer match
- Check if any PCore API methods were renamed/removed

### 5.4 Update sdk-local-component-map.js

- Verify all import paths still resolve correctly
- Check if SDK 25.1 added new component types that need mapping
- Update any component names that were renamed

### 5.5 Update Constellation startup

**File: `src/lib/constellation.tsx`**
- Verify `PCore.onPCoreReady()` callback signature unchanged
- Verify `getSdkComponentMap()` API unchanged
- Verify `StoreContext` provider still required
- Remove MUI ThemeProvider wrapping (Phase 4.5)

### 5.6 Update auth flow

**File: `src/hooks/useConstellation.ts`**
- Verify `@pega/auth` API compatibility (loginIfNecessary, sdkSetAuthHeader, getSdkConfig)
- Verify `SdkConstellationReady` event name unchanged
- Check if new auth config options are needed in sdk-config.json

---

## Phase 6: Cleanup & Verification

### 6.1 Remove unused dependencies
- Delete `src/theme.js` (MUI theme)
- Remove all `@material-ui/*` and `@mui/*` from package.json
- Remove any orphaned CSS files that were MUI-specific
- Run `npm prune` to clean node_modules

### 6.2 Update design system theme
**File: `src/design-system/theme.tsx`** — Verify light/dark toggle still works without MUI ThemeProvider

### 6.3 Storybook compatibility
- Update Storybook if needed for React 18
- Verify custom-sdk and custom-constellation stories still work

### 6.4 Update project version
- `package.json` version: update to `25.1.10` to match SDK

---

## Verification Plan

### Build verification
```bash
npm run build:dev          # Development build compiles without errors
npm run build:prod         # Production build compiles without errors
```

### Lint verification
```bash
npm run lint               # ESLint + Prettier pass
npm run fix                # Auto-fix any fixable issues
```

### TypeScript verification
```bash
npx tsc --noEmit           # Type checking passes
```

### Runtime verification (requires Pega Infinity 25 server)
1. `npm run start-dev` — Dev server starts on localhost:3502
2. OAuth login flow completes successfully
3. `SdkConstellationReady` event fires, mashup renders
4. Navigate all static pages (Home, Company, Products, Contact, Support, DesignSystem)
5. Open a case — CaseView renders with correct layout
6. Complete an assignment — Assignment/FlowContainer work
7. Test ToDo widget — assignments list and navigation
8. Test file upload — Attachment/FileUtility work
9. Test tables — ListView and SimpleTable render data
10. Test navigation — NavBar drawer and menu items work
11. Verify no MUI-related console errors or missing styles

### Automated tests
```bash
npm test                   # Playwright e2e tests
npm run test:functional    # Jest functional tests
```

---

## Execution Order Summary

| Step | Phase | Description | Estimated Files |
|------|-------|-------------|-----------------|
| 1 | 0 | Create branch, backup configs | 0 |
| 2 | 1 | Merge upstream, resolve conflicts, update deps | 5-8 |
| 3 | 1.4 | Clean install, verify node_modules | 0 |
| 4 | 2.1 | React 18 createRoot migration | 2 |
| 5 | 2.2 | React Router v5→v7 | 1 |
| 6 | 3.1 | ESLint flat config migration | 2 (delete+create) |
| 7 | 3.2-3.5 | TS, webpack, prettier, node version | 4 |
| 8 | 4.5 | Remove MUI theme from constellation.tsx | 2 |
| 9 | 4.1-4.4 | MUI→Tailwind migration (57+ components) | 57+ |
| 10 | 5 | SDK API path verification & fixes | varies |
| 11 | 6 | Cleanup, verification, testing | varies |

---

## Risk Mitigation

- **Git tags** before and after merge for easy rollback
- **Incremental commits** per phase so each change is isolated
- **Build check** after each phase before proceeding
- **The MUI migration (Phase 4)** is the largest workstream and can be done component-by-component with build verification between batches
