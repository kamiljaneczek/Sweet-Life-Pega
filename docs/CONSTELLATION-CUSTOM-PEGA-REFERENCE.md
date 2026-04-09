# Custom Pega Constellation SDK — Reference

## Architecture Overview

This project renders Pega Constellation case forms **without** the SDK's built-in React
rendering tree (`renderUI: false`). Instead, we use PCore APIs directly to extract
PConnect objects and render them with our own React components.

### Key Flow

```
useCustomPegaCase (hook)
  → PCore.getMashupApi().createCase()
  → extractRootPConnect() — polls PCore container routing data
  → returns a root PConnect (typically a 'reference' component)

PConnectRenderer (component router)
  → maps componentName to our custom components (View, Reference, FlowContainer, etc.)

Reference.tsx
  → resolves 'reference' components into their referenced view
  → uses pConnect.createComponent() to create child PConnect

FlowContainer.tsx
  → manages the 'workarea' container (assignment forms)
  → subscribes to PCore Redux store for container item changes
  → delegates to getPConnectOfActiveContainerItem() helper

container-helpers.ts
  → processRootViewDetails() — resolves @P annotations in routing data
  → getPConnectOfActiveContainerItem() — creates child PConnect from routing data
```

---

## The @P Annotation Resolution Problem

### What are @P annotations?

Pega routing data uses `@P .propertyName` annotations for dynamic values:
```json
{
  "config": {
    "name": "@P .pyViewName",
    "context": "@P .pyViewContext"
  }
}
```

These reference case data properties (e.g., `caseInfo.content.pyViewName`).

### How the SDK resolves them

The SDK's React bridge (`react_pconnect`) wraps every component in a Redux-connected
HOC that calls `resolveConfigProps()` on every render. This:
1. Walks the component's config props
2. Resolves `@P` annotations via the Redux store context processor
3. **Caches the resolved values in the Redux store**

After this, `PCore.getStoreValue('.pyViewName', pageReference, context)` returns
the resolved value because the bridge has already put it there.

### Why it fails without the bridge

Without `react_pconnect`, the resolved values are **never cached in the store**.
`getStoreValue()` always returns `undefined` for `@P .pyViewName` — regardless
of what `pageReference` or `contextName` arguments we pass.

**Note:** `@P .pyViewContext` resolves successfully via a different mechanism —
it uses an empty string as `pageReference`, which triggers a direct context-state
lookup rather than a page-reference-based lookup.

### The metadata registration problem

When `createPConnect` receives unresolved `@P` annotations in the metadata name,
it creates a `reference` component instead of a `View`. The reference's
`getReferencedView()` method then looks up the view definition in PCore's
metadata registry — but the registry is **keyed by context name**.

- Context `app/primary_1` — metadata IS registered (populated by `createCase()`)
- Context `app/primary_1/workarea_1` — metadata is NOT registered

So `getReferencedView()` returns `null` for the workarea reference.

---

## The Solution: Parent-Context Metadata Fallback

In `container-helpers.ts → getPConnectOfActiveContainerItem()`:

1. **Try standard resolution** — `processRootViewDetails` + `createPConnect`
2. **Detect the failure** — result is a `reference` whose `getReferencedView()` returns `null`
3. **Create a temp PConnect with the parent context** (`app/primary_1`) where metadata IS registered
4. **Call `getReferencedView()`** on the temp PConnect — returns the View metadata
5. **Use `parentGetPConnect().createComponent(metadata)`** to create the actual View

This mirrors what `Reference.tsx` does for the top-level reference chain, where
the first Reference mount (context `app/primary_1`, pageReference `caseInfo.content`)
successfully resolves the view.

### Key code pattern

```typescript
// Temp PConnect with parent context to access metadata registry
const tempResult = PCore.createPConnect({
  meta: rootView,  // routing data with @P annotations
  options: { context: parentContext, pageReference: 'caseInfo.content' }
});
const metadata = tempResult.getPConnect().getReferencedView();

// Create actual View from resolved metadata
const viewComp = parentPConnect.createComponent(metadata, null, null, {
  pageReference: 'caseInfo.content'
});
const childPConnect = viewComp.props.getPConnect();
// childPConnect.getComponentName() === 'View' ✓
```

---

## PCore API Quick Reference

### Store & Data

| API | Purpose |
|-----|---------|
| `PCore.getStoreValue(prop, pageRef, contextName)` | Look up a property in the Redux store |
| `PCore.getStore().getState()` | Raw Redux state |
| `PCore.getStore().subscribe(callback)` | Subscribe to store changes |
| `PCore.getAnnotationUtils().isProperty(val)` | Check if value is an `@P` annotation |
| `PCore.getAnnotationUtils().getPropertyName(val)` | Extract property name from `@P .prop` → `'prop'` |

### PConnect Creation

| API | Purpose |
|-----|---------|
| `PCore.createPConnect({ meta, options })` | Create a PConnect from metadata + options |
| `pConnect.createComponent(meta, null, null, opts)` | Create a child component (resolves via PConnect's context) |
| `pConnect.getReferencedView()` | Get the view metadata a `reference` component points to |
| `pConnect.resolveConfigProps(configProps)` | Resolve @P annotations in config (when available) |
| `pConnect.getConfigProps()` | Get raw config properties |

### Context & Navigation

| API | Purpose |
|-----|---------|
| `pConnect.getContextName()` | Context name (e.g., `'app/primary_1'`) |
| `pConnect.getPageReference()` | Page reference path (e.g., `'caseInfo.content'` or context name) |
| `pConnect.getComponentName()` | Component type (`'View'`, `'reference'`, `'FlowContainer'`, etc.) |
| `pConnect.getParentPConnect()` | Parent PConnect in the hierarchy |
| `pConnect.getContainerManager()` | Container manager for init/add operations |

### Container Utilities

| API | Purpose |
|-----|---------|
| `PCore.getContainerUtils().getContainerData(path)` | Routing data for a container path |
| `PCore.getContainerUtils().isContainerInitialized(ctx, name)` | Check if container exists |
| `PCore.getContainerUtils().hasContainerItems(path)` | Check if container has items |
| `PCore.getContainerUtils().getActiveContainerItemName(path)` | Active item key |
| `PCore.getContainerUtils().getContainerItemData(target, itemID)` | Item metadata |

### Container Manager (from `pConnect.getContainerManager()`)

| API | Purpose |
|-----|---------|
| `initializeContainers({ type, name })` | Initialize a container (e.g., `{ type: 'single', name: 'workarea' }`) |
| `addContainerItem({ semanticURL, key, flowName, ... })` | Add assignment item to container |

---

## Important Patterns

### Page Reference vs Context Name

- **Page reference** — dot-separated path into the data model: `'caseInfo.content'`
- **Context name** — slash-separated container path: `'app/primary_1'`, `'app/primary_1/workarea_1'`

These are frequently confused. Many PCore APIs accept either, but the behavior
differs. The `findCasePageReference()` helper walks up the PConnect parent chain
to find a proper page reference (contains `.`, no `/`), falling back to
`'caseInfo.content'` — the standard Pega case data path.

### FlowContainer Lifecycle

1. **Initialize container** — `initializeContainers({ type: 'single', name: 'workarea' })`
2. **Add container item** — `addContainerItem({ key, flowName, caseViewMode: 'perform', resourceType: 'ASSIGNMENT', ... })`
3. **Subscribe to store** — watch for `accessedOrder` changes (step transitions add new keys)
4. **Resolve active item** — `getPConnectOfActiveContainerItem()` creates the child PConnect
5. **Render** — pass child PConnect to `PConnectRenderer`

### Reference Resolution Chain

The top-level PConnect from `extractRootPConnect` is typically a `reference`:
```
reference (context: app/primary_1, pageRef: caseInfo.content)
  → getReferencedView() → View metadata
  → createComponent(metadata) → View
    → children include FlowContainer, other Views, etc.
```

When a `reference` is created for a context where metadata isn't registered,
`getReferencedView()` returns `null`. The parent-context fallback in
`container-helpers.ts` handles this case.

---

## File Map

### Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useConstellation.ts` | SDK auth: OAuth via `@pega/auth`, `SdkConstellationReady` listener; exports `useConstellation()` + `ensureConstellationInit()` |
| `src/hooks/useCustomPegaCase.ts` | Case lifecycle: create case, extract root PConnect, pub/sub |
| `src/hooks/usePegaMashup.ts` | Combines auth + mashup lifecycle; calls `startMashup()` post-DOM-render; supports `renderUI: false`; returns `{ isReady, isTimedOut }` |
| `src/hooks/usePegaMashupLite.ts` | Lightweight variant using `startMashupLite()` (no SDK component imports); for custom-pega pages |

### Custom PConnect Renderer

| File | Purpose |
|------|---------|
| `src/lib/custom-pega/PConnectRenderer.tsx` | Component router: maps componentName → React component |
| `src/lib/custom-pega/FallbackComponent.tsx` | Renders unmapped types; yellow dashed debug border in dev, always renders children |
| `src/lib/custom-pega/component-map.ts` | Component type → React component mapping |
| `src/lib/custom-pega/types.ts` | PConnectProxy type definition |

### Containers

| File | Purpose |
|------|---------|
| `src/lib/custom-pega/containers/Reference.tsx` | Resolves `reference` → View via `getReferencedView` + `createComponent` |
| `src/lib/custom-pega/containers/FlowContainer.tsx` | Workarea container: init, addContainerItem, store subscription |
| `src/lib/custom-pega/containers/ViewContainer.tsx` | Renders view containers (non-workarea) |
| `src/lib/custom-pega/containers/Assignment.tsx` | Assignment-level wrapper |
| `src/lib/custom-pega/containers/DeferLoad.tsx` | Lazy-loads a view via `actionsApi.refreshCaseView()`; manages `DeferLoadManager` lifecycle; shows spinner while loading |
| `src/lib/custom-pega/containers/container-helpers.ts` | Shared helpers: @P resolution, active item PConnect creation |

### Fields

| File | Purpose |
|------|---------|
| `src/lib/custom-pega/fields/TextInput.tsx` | Text input field |
| `src/lib/custom-pega/fields/Dropdown.tsx` | Select/dropdown field |
| `src/lib/custom-pega/fields/Checkbox.tsx` | Checkbox field |
| `src/lib/custom-pega/fields/TextArea.tsx` | Multi-line text field |
| `src/lib/custom-pega/fields/Currency.tsx` | Currency input field |
| `src/lib/custom-pega/fields/DateInput.tsx` | Date picker field |
| `src/lib/custom-pega/fields/Email.tsx` | Email input field |
| `src/lib/custom-pega/fields/Phone.tsx` | Phone input field |

### Templates

| File | Purpose |
|------|---------|
| `src/lib/custom-pega/templates/DefaultForm.tsx` | Default form layout |
| `src/lib/custom-pega/templates/OneColumn.tsx` | Single-column layout |
| `src/lib/custom-pega/templates/Region.tsx` | Region container |
| `src/lib/custom-pega/templates/View.tsx` | View template wrapper |
| `src/lib/custom-pega/templates/Group.tsx` | Group layout template |
| `src/lib/custom-pega/templates/SimpleTableSelect.tsx` | Table-based selection template |
