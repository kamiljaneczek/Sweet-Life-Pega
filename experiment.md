# Custom Case & Assignment Rendering: From-Scratch with ConstellationJS + React

## Context

Render Pega cases and assignments with **full control over the UX flow** — navigation, transitions, multi-case views — by bootstrapping ConstellationJS manually in a custom React app. No legacy Mashup API. No pre-built SDK scaffolding (react-sdk). You wire the engine, containers, and components yourself.

---

## Architecture Overview

```
Your React App (full UX control)
  ├── Custom Containers (FlowContainer, Assignment, CaseView)
  ├── Custom Field Components (TextInput, Dropdown, etc.)
  ├── Custom Navigation & Transitions
  │
  ↓ PConnect bridge (per-component instance)
  ↓ PCore singleton (global store, env, data pages)
  ↓ ConstellationJS Engine (orchestration, DX API calls)
  ↓ @pega/auth (OAuth 2.0 PKCE, token lifecycle)
  ↓ DX API v2 (REST) → Pega Infinity Server
```

**What ConstellationJS handles for you:** DX API orchestration, state hydration, validation propagation, assignment sequencing, data page caching, refresh cycles.

**What you build:** Every React component, the container hierarchy, navigation, transitions, layout, styling — the entire UX.

---

## NPM Packages

| Package | Purpose |
|---------|---------|
| `@pega/auth` | OAuth 2.0 PKCE + ConstellationJS bootstrap trigger |
| `@pega/constellationjs` | Orchestration engine (DX API abstraction, state) |
| `@pega/pcore-pconnect` | PCore/PConnect APIs (props, actions, validation, children) |
| `@pega/pcore-pconnect-typedefs` | TypeScript types for PCore/PConnect |

You do **NOT** need `@pega/react-sdk-components` or `@pega/react-sdk-overrides` — those are the pre-built Material UI layer you're replacing.

---

## Phase 1: Bootstrap ConstellationJS From Scratch

### 1.1 Configuration — `sdk-config.json`

Place in your app's `public/` directory:

```json
{
  "authConfig": {
    "authService": "pega",
    "mashupClientId": "<OAuth-Client-ID-from-Pega>",
    "mashupUserIdentifier": "",
    "mashupPassword": ""
  },
  "serverConfig": {
    "infinityRestServerUrl": "https://<pega-server>/prweb",
    "appAlias": "<app-alias>",
    "appPortal": "<portal-name>",
    "appMashupCaseType": "<Work-Class-Name>"
  }
}
```

### 1.2 Static Auth Assets

Copy from `node_modules/@pega/auth/lib/oauth-client/` to `public/auth/`:
- `authDone.html`
- `authDone.js`

These handle the OAuth redirect callback.

### 1.3 Bootstrap Sequence

```
Page Load
  → import @pega/auth/lib/sdk-auth-manager
  → document.addEventListener('SdkConstellationReady', ...)
  → loginIfNecessary({ appName: 'embedded', mainRedirect: false })
  → OAuth flow completes
  → SdkConstellationReady event fires (PCore now available globally)
  → PCore.onPCoreReady((renderObj) => { ... })
  → Register component creator + component map
  → Ready to create/open cases
```

### 1.4 React Bootstrap Code

```tsx
// bootstrap.ts
export async function bootstrapConstellation(): Promise<void> {
  const { loginIfNecessary, sdkSetAuthHeader } = await import(
    '@pega/auth/lib/sdk-auth-manager'
  );

  return new Promise((resolve) => {
    document.addEventListener('SdkConstellationReady', () => {
      PCore.onPCoreReady((renderObj) => {
        // renderObj contains the root PConnect and target info
        resolve();
      });
    });

    loginIfNecessary({
      appName: 'embedded',
      mainRedirect: false,
    });
  });
}
```

Use in your React app entry:

```tsx
function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrapConstellation().then(() => setReady(true));
  }, []);

  if (!ready) return <LoadingScreen />;
  return <YourCustomShell />;
}
```

---

## Phase 2: Understanding the PConnect Tree

When you create or open a case, ConstellationJS builds a **PConnect tree** — a hierarchy of component metadata objects. Each node is a PConnect instance with:

| Method | What It Returns |
|--------|----------------|
| `getComponentName()` | Component type string: `"FlowContainer"`, `"Assignment"`, `"View"`, `"TextInput"` |
| `getChildren()` | Array of child PConnect instances |
| `resolveConfigProps()` | Resolved property values (label, value, required, visibility, etc.) |
| `getActionsApi()` | Actions: `finishAssignment()`, `cancelAssignment()`, `saveAssignment()` |
| `getValidationApi()` | Validation state for fields |
| `getCaseInfo()` | Case metadata (ID, status, stages) |
| `getContextName()` | Context identifier for store lookups |
| `getDataObject(contextName)` | Data associated with this context |
| `getValue(propertyPath)` | Get specific property value |
| `setValue(propertyPath, value)` | Update property value |

### The Container Hierarchy

```
RootContainer
  └─ FlowContainer          ← orchestrates assignment sequence
       └─ Assignment         ← single work item (the form)
            └─ View          ← UI rule (layout/sections)
                 ├─ Region   ← layout region (column, group)
                 │    ├─ TextInput
                 │    ├─ Dropdown
                 │    └─ DateTime
                 └─ Region
                      └─ CheckBox
```

**Key insight:** You traverse this tree with `getChildren()` and decide how to render each node. ConstellationJS manages the data/state — you manage the UI.

---

## Phase 3: Build the Component Map & Renderer

### 3.1 Component Map

Map Pega component type strings to your React components:

```tsx
// componentMap.ts
import { CustomFlowContainer } from './containers/FlowContainer';
import { CustomAssignment } from './containers/Assignment';
import { CustomView } from './containers/View';
import { CustomRegion } from './layouts/Region';
import { CustomTextInput } from './fields/TextInput';
import { CustomDropdown } from './fields/Dropdown';
import { CustomCheckbox } from './fields/Checkbox';
// ... etc

export const componentMap: Record<string, React.ComponentType<{ pConnect: any }>> = {
  FlowContainer: CustomFlowContainer,
  Assignment: CustomAssignment,
  View: CustomView,
  Region: CustomRegion,
  TextInput: CustomTextInput,
  Dropdown: CustomDropdown,
  Checkbox: CustomCheckbox,
  CaseView: CustomCaseView,
  CaseSummary: CustomCaseSummary,
  // Add as needed for your case types
};
```

### 3.2 Recursive Renderer

The core of your custom rendering — walks the PConnect tree:

```tsx
// PConnectRenderer.tsx
export function PConnectRenderer({ pConnect }: { pConnect: any }) {
  const componentName = pConnect.getComponentName();
  const Component = componentMap[componentName];

  if (!Component) {
    console.warn(`No component mapped for: ${componentName}`);
    return null; // or a fallback/debug component
  }

  return <Component pConnect={pConnect} />;
}
```

### 3.3 Container Example — Assignment

```tsx
// containers/Assignment.tsx
export function CustomAssignment({ pConnect }: { pConnect: any }) {
  const children = pConnect.getChildren();
  const actionsApi = pConnect.getActionsApi();
  const containerItemID = pConnect.getContextName();

  const handleSubmit = () => {
    actionsApi.finishAssignment(containerItemID);
  };

  const handleCancel = () => {
    actionsApi.cancelAssignment(containerItemID);
  };

  return (
    <div className="your-assignment-wrapper">
      {/* Render child views/regions/fields recursively */}
      {children.map((childPConnect, idx) => (
        <PConnectRenderer key={idx} pConnect={childPConnect} />
      ))}

      <div className="your-action-bar">
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
```

### 3.4 Field Example — TextInput

```tsx
// fields/TextInput.tsx
export function CustomTextInput({ pConnect }: { pConnect: any }) {
  const props = pConnect.resolveConfigProps();
  // props contains: value, label, required, disabled, readOnly, placeholder, etc.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pConnect.setValue(props.propertyPath, e.target.value);
  };

  return (
    <div className="your-field">
      <label>{props.label} {props.required && '*'}</label>
      <input
        type="text"
        value={props.value || ''}
        onChange={handleChange}
        disabled={props.disabled}
        readOnly={props.readOnly}
      />
      {/* Validation errors from pConnect.getValidationApi() */}
    </div>
  );
}
```

---

## Phase 4: Case & Assignment Lifecycle

### 4.1 Creating a Case

```tsx
const mashupApi = PCore.getMashupApi();

// Creates case and returns root PConnect for the first assignment
const caseResponse = await mashupApi.createCase(
  'YourApp-Work-CaseType',        // case class
  { pageName: 'pyEmbedAssignment' }, // target context
  {
    startingFields: {               // optional initial data
      CustomerName: 'John Doe',
    }
  }
);
// caseResponse provides: caseID, nextAssignmentInfo, uiResources
```

### 4.2 Opening an Existing Case

```tsx
const caseResponse = await mashupApi.openCase(
  'CASE-12345',
  { pageName: 'pyEmbedAssignment' }
);
```

### 4.3 Full UX Flow Control

This is where your approach shines — **you control what happens between assignments**:

```tsx
function CaseWorkflow() {
  const [rootPConnect, setRootPConnect] = useState(null);
  const [caseState, setCaseState] = useState<'idle' | 'working' | 'completed'>('idle');

  // Subscribe to assignment lifecycle events
  useEffect(() => {
    const pubsub = PCore.getPubSubUtils();

    pubsub.subscribe('assignmentFinished', (data) => {
      // YOUR custom transition logic here
      // e.g., animate out, show progress, load next view
      handleAssignmentComplete(data);
    });

    pubsub.subscribe('caseEvent', (data) => {
      if (data.caseStatus === 'Resolved-Completed') {
        setCaseState('completed');
      }
    });

    return () => {
      pubsub.unsubscribe('assignmentFinished');
      pubsub.unsubscribe('caseEvent');
    };
  }, []);

  const startCase = async () => {
    const mashupApi = PCore.getMashupApi();
    const response = await mashupApi.createCase('YourCaseType', ...);
    // Get root PConnect from the response/engine
    setCaseState('working');
  };

  // You decide the UX: wizard steps, slide transitions, multi-panel, etc.
  return (
    <YourCustomLayout>
      {caseState === 'idle' && <StartButton onClick={startCase} />}
      {caseState === 'working' && rootPConnect && (
        <PConnectRenderer pConnect={rootPConnect} />
      )}
      {caseState === 'completed' && <YourCompletionScreen />}
    </YourCustomLayout>
  );
}
```

### 4.4 Action Flow

```
User fills fields → pConnect.setValue() updates store
User clicks Submit → actionsApi.finishAssignment(containerItemID)
  → ConstellationJS validates & sends to DX API
  → Server processes, returns next assignment or confirmation
  → PubSub fires 'assignmentFinished'
  → ConstellationJS updates PConnect tree with new assignment
  → Your FlowContainer re-renders with new children
```

---

## Phase 5: PubSub Events (Your UX Control Points)

These events are where you inject custom UX behavior:

| Event | When It Fires | Your Use |
|-------|--------------|----------|
| `assignmentFinished` | Assignment submitted successfully | Custom transitions, progress update |
| `assignmentCancelled` | Assignment cancelled | Navigate away, show confirmation |
| `caseCreated` | New case created | Update case list, show toast |
| `caseEvent` | Case status change (resolved, etc.) | Completion screen, redirect |

```tsx
const pubsub = PCore.getPubSubUtils();
pubsub.subscribe('eventName', handlerFn, contextName, subscriberId);
pubsub.unsubscribe('eventName', subscriberId);
pubsub.publish('eventName', payload);
```

---

## Key Challenges & Mitigations

### 1. Component Coverage
The PConnect tree can produce 80+ component types. If your map misses one, rendering breaks.
**Mitigation:** Start with a `FallbackComponent` that logs the missing type and renders children. Add components incrementally as your case types need them.

### 2. Getting the Root PConnect After Case Creation
The exact mechanism for receiving the root PConnect from `createCase()` / `openCase()` requires studying how the react-sdk's `MashupMain` component hooks into `PCore.onPCoreReady` and the render callback.
**Mitigation:** Use `pegasystems/react-sdk` source as reference — specifically `src/samples/Embedded/EmbeddedTopLevel.tsx` and `src/bridge/react_pconnect.jsx`.

### 3. Refresh Cycles
When a field change triggers visibility/validation updates, ConstellationJS fires a refresh to the server. Your components must handle the re-render gracefully.
**Mitigation:** Treat PConnect props as reactive — re-read `resolveConfigProps()` on every render.

### 4. ConstellationJS Version Pinning
`@pega/constellationjs` must match your Pega Infinity server version.
**Mitigation:** Pin exact versions. Test against your specific server.

### 5. ConstellationJS Engine Is Proprietary
You can't debug into it. When orchestration-level issues arise, you're limited to PConnect API surface.
**Mitigation:** Heavy logging at the PConnect boundary. Use react-sdk source as behavioral reference.

---

## Reference Files (from pegasystems/react-sdk — study, don't fork)

| File | What to Learn |
|------|---------------|
| `src/samples/Embedded/EmbeddedTopLevel.tsx` | How root PConnect is obtained after case creation |
| `src/bridge/react_pconnect.jsx` | How PConnect objects are bridged to React components |
| `src/components/override-sdk/infra/Assignment/Assignment.tsx` | Assignment container: children rendering, submit flow |
| `src/components/override-sdk/infra/FlowContainer/FlowContainer.tsx` | FlowContainer: assignment sequencing |
| `src/components/override-sdk/template/DefaultForm/DefaultForm.tsx` | Recursive child rendering pattern |
| `src/sdk-local-component-map.js` | Component type → implementation mapping |

---

## Implementation Phases

### Phase 1: Bootstrap (1 week)
- [ ] Set up React app (Vite or CRA)
- [ ] Install `@pega/auth`, `@pega/constellationjs`, `@pega/pcore-pconnect`
- [ ] Configure `sdk-config.json` with OAuth + server details
- [ ] Copy auth callback files to `public/auth/`
- [ ] Implement bootstrap sequence (auth → SdkConstellationReady → PCore.onPCoreReady)
- [ ] Verify: PCore is available, OAuth token retrieved, can reach Pega server

### Phase 2: Minimal Case Render (1-2 weeks)
- [ ] Call `PCore.getMashupApi().createCase()` — verify case appears in Pega
- [ ] Capture root PConnect from the engine callback
- [ ] Build `PConnectRenderer` (recursive tree walker)
- [ ] Build `FallbackComponent` for unmapped types (logs + renders children)
- [ ] Build minimal containers: FlowContainer, Assignment, View, Region
- [ ] Verify: assignment form renders with field labels visible

### Phase 3: Field Interaction (1-2 weeks)
- [ ] Implement field components: TextInput, Dropdown, Checkbox, DateTime, TextArea, Currency, RadioButtons
- [ ] Wire `pConnect.setValue()` on change
- [ ] Wire `actionsApi.finishAssignment()` on submit
- [ ] Wire validation display via `pConnect.getValidationApi()`
- [ ] Verify: can fill form → submit → case advances to next assignment

### Phase 4: Full UX Flow Control (1-2 weeks)
- [ ] Hook PubSub events (assignmentFinished, caseEvent)
- [ ] Build custom transitions between assignments
- [ ] Build custom navigation (wizard steps, progress bar, breadcrumbs — your design)
- [ ] Handle case completion (resolved/completed state)
- [ ] Handle cancel/save-for-later flows
- [ ] Verify: full case lifecycle with your custom UX

### Phase 5: Completeness & Hardening (2-3 weeks)
- [ ] Add remaining field types as your case types require
- [ ] Attachment upload/download
- [ ] Repeat/table layouts (SimpleTable, ListView)
- [ ] Modal/confirmation views
- [ ] Error boundaries, loading states
- [ ] Session timeout & re-auth handling
- [ ] Multi-case scenarios if needed

---

## Verification Plan

1. **Auth:** Bootstrap fires `SdkConstellationReady`, PCore available in console
2. **Case creation:** `PCore.getMashupApi().createCase()` returns caseID, case visible in Pega portal
3. **Tree rendering:** `PConnectRenderer` walks tree, all component types either render or hit fallback
4. **Field interaction:** Fill TextInput, select Dropdown — values propagate via `setValue()`
5. **Submit:** `finishAssignment()` completes, next assignment loads
6. **Full lifecycle:** Create → fill → submit → (repeat) → case resolved → your completion screen
7. **Custom UX:** Transitions, navigation, progress indicators work as designed between assignments


Plan
 Plan: Custom ConstellationJS Rendering on /support-custom

 Context

 The project has Pega case management integrated via the SDK bridge (@pega/react-sdk-components), which owns all rendering into #pega-root. The experiment.md describes an alternative: bypass the SDK bridge, get raw PConnect objects from ConstellationJS, and render everything with
 custom React components for full UX control.

 This plan adds a new /support-custom route implementing the experiment.md approach without modifying any existing files. The existing /support/new mashup route continues to work unchanged.

 Why coexistence is safe

 - useConstellation() is auth-only (OAuth + SdkConstellationReady). It does NOT call startMashup().
 - startMashup() / myLoadMashup() are only invoked by usePegaMashup, which the custom route never uses.
 - Both paths share the PCore singleton. createCase() calls are independent.
 - PubSub subscriber IDs are prefixed CustomPega_ to avoid collision with existing CaseComplete/CaseCancel subscribers.

 New files (16 total, zero modifications to existing files)

 src/
   routes/support-custom.tsx              # TanStack Router route definition
   app/support-custom.tsx                 # Page component (parallels support-new.tsx)
   hooks/useCustomPegaCase.ts             # Case lifecycle hook (auth + createCase + PConnect extraction)
   lib/custom-pega/
     types.ts                             # TypeScript interfaces (PConnectProxy, CasePhase, etc.)
     component-map.ts                     # componentName → React component registry
     PConnectRenderer.tsx                 # Recursive PConnect tree walker
     FallbackComponent.tsx                # Renders unmapped types (yellow border in dev, renders children)
     containers/
       FlowContainer.tsx                  # Assignment sequencing wrapper
       Assignment.tsx                     # Submit/cancel/back actions + refresh manager registration
     templates/
       View.tsx                           # Template dispatch + label/visibility
       Region.tsx                         # Children grouping with spacing
       DefaultForm.tsx                    # Grid layout (1/2/3 columns) for form fields
       OneColumn.tsx                      # Single-column layout
     fields/
       TextInput.tsx                      # Uses design-system Input (label, helperText, error props)
       Dropdown.tsx                       # Uses design-system Select (@base-ui/react, NOT radix)
       Checkbox.tsx                       # Uses design-system Checkbox + Label
       TextArea.tsx                       # Uses design-system Textarea

 Only auto-generated file that changes: src/routeTree.gen.ts (TanStack Router detects support-custom.tsx).

 Implementation steps

 Step 1: Types + renderer scaffolding

 Create src/lib/custom-pega/types.ts with:
 - PConnectProxy interface — documents the PConnect API surface we use (getComponentName, getChildren, resolveConfigProps, getConfigProps, getStateProps, getActionsApi, getValidationApi, getCaseInfo, getContextName, getDataObject, getValue, setValue)
 - PConnectActionsApi — finishAssignment, cancelAssignment, saveAssignment, navigateToStep, refreshCaseView, cancelCreateStageAssignment
 - CustomPConnectProps — { pConnect: PConnectProxy }
 - CasePhase — 'idle' | 'creating' | 'active' | 'completed' | 'error'

 Create src/lib/custom-pega/FallbackComponent.tsx:
 - Logs warning once per unmapped type (uses a Set)
 - Renders children recursively via renderChildren(pConnect)
 - Yellow dashed border for dev visibility

 Create src/lib/custom-pega/PConnectRenderer.tsx:
 - PConnectRenderer({ pConnect }) — looks up component from map, renders it
 - renderChildren(pConnect) — helper that maps pConnect.getChildren() to <PConnectRenderer> elements

 Create src/lib/custom-pega/component-map.ts:
 - Initially maps all types to FallbackComponent
 - getCustomComponent(name) returns mapped component or FallbackComponent

 Step 2: Route + page shell

 Create src/routes/support-custom.tsx:
 - createFileRoute('/support-custom')({ component: SupportCustom }) — same pattern as other routes

 Create src/app/support-custom.tsx:
 - Uses useConstellation() directly to show PCore readiness
 - Placeholder UI with loading skeleton, heading "Create incident (Custom)"
 - Later wired to useCustomPegaCase + PConnectRenderer

 Verify: Navigate to /support-custom — PCore reports ready. Navigate to /support/new — existing mashup still works.

 Step 3: Case lifecycle hook (useCustomPegaCase)

 Create src/hooks/useCustomPegaCase.ts:
 - Depends on useConstellation() for auth readiness
 - After PCore ready, reads case type from getSdkConfig().serverConfig.appMashupCaseType
 - Calls PCore.getMashupApi().createCase(caseType, appConstants, { pageName: 'pyEmbedAssignment', startingFields: {} })
 - Extracts short case ID via PCore.getStoreValue('.pyID', 'caseInfo.content', workareaContainer) — same pattern as existing support-new.tsx:64-66
 - Root PConnect extraction: After createCase() resolves, get the active container PConnect via PCore container utilities. This is the highest-risk integration point — must be tested at runtime. Approaches in order of preference:
   a. PCore.getContainerUtils() to navigate app/primary → workarea → active item
   b. Subscribe to a PCore store change to detect when the assignment is rendered
   c. If needed, use PCore.registerComponentCreator() callback to capture root PConnect
 - PubSub subscriptions (prefixed CustomPega_):
   - END_OF_ASSIGNMENT_PROCESSING → set phase to completed, extract caseId
   - EVENT_CANCEL → set phase to idle, clear rootPConnect
   - assignmentFinished → re-extract rootPConnect for next assignment
 - Returns { phase, caseId, rootPConnect, error, isPegaReady }

 Step 4: Container components

 containers/FlowContainer.tsx — Renders children. Shows caseMessages if present (completion text).

 containers/Assignment.tsx — Key responsibilities:
 - Read action buttons from pConnect.getDataObject('').caseInfo.actionButtons (main + secondary)
 - Map button jsAction to handler: finishAssignment, cancelAssignment, navigateToStep, saveAssignment
 - Register with PCore.getRefreshManager() for field-change refresh (pattern from existing Assignment.tsx:282-305)
 - Uses design-system Button component
 - Snackbar toast for validation errors (same pattern as existing Assignment)

 Update component-map.ts to register both.

 Step 5: Template components

 templates/View.tsx — Reads label, showLabel, visibility from config props + inherited props. Hides if visibility === false. Renders children.

 templates/Region.tsx — Simple wrapper: renders children with space-y-4 spacing.

 templates/DefaultForm.tsx — Reads NumCols from config. Applies grid class: grid-cols-1 / md:grid-cols-2 / md:grid-cols-3. Renders children.

 templates/OneColumn.tsx — Renders children vertically.

 Update component-map.ts.

 Step 6: Field components

 All fields follow this pattern:
 1. Read config via pConnect.resolveConfigProps(pConnect.getConfigProps())
 2. Read propName via (pConnect.getStateProps() as any).value
 3. Local state synced with PConnect value
 4. On blur: call pConnect.setValue(propName, localValue) to update PCore store
 5. Use design-system primitives for rendering

 fields/TextInput.tsx — Uses Input from design-system/ui/input (props: label, helperText, error, onChange, onBlur, value, disabled, required).

 fields/Dropdown.tsx — Uses Select, SelectTrigger, SelectContent, SelectItem, SelectValue from design-system/ui/select (NOTE: uses @base-ui/react/select, not radix). Reads datasource from configProps for inline options. onValueChange calls pConnect.setValue().

 fields/Checkbox.tsx — Uses Checkbox + Label from design-system. onCheckedChange calls pConnect.setValue().

 fields/TextArea.tsx — Uses Textarea from design-system. Same blur-to-setValue pattern as TextInput.

 Update component-map.ts.

 Step 7: Wire page + end-to-end test

 Wire useCustomPegaCase into support-custom.tsx:
 - idle/creating → show SupportIncidentSkeleton (reuse from app/components/skeletons)
 - active + rootPConnect → <PConnectRenderer pConnect={rootPConnect} />
 - error → error message + link back to /support
 - completed → confirmation message with caseId + link to /support

 Key files to reference during implementation

 ┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                            File                             │                                                                   Why                                                                   │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/hooks/useConstellation.ts                               │ Auth bootstrap singleton we reuse                                                                                                       │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/app/support-new.tsx                                     │ Reference for createCase/openCase patterns, PubSub subscriptions, case ID extraction                                                    │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/components/override-sdk/infra/Assignment/Assignment.tsx │ Reference for action buttons, refresh manager, finishAssignment/cancelAssignment error handling                                         │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/design-system/ui/input.tsx                              │ Input interface: label, helperText, error, InputProps + standard HTML attrs                                                             │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/design-system/ui/select.tsx                             │ Select uses @base-ui/react/select — Select, SelectTrigger (extended with label, required, helperText, error), SelectContent, SelectItem │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/design-system/ui/checkbox.tsx                           │ Checkbox primitive                                                                                                                      │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/design-system/ui/textarea.tsx                           │ Textarea primitive                                                                                                                      │
 ├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ src/lib/constellation.tsx                                   │ Study (NOT modify) — understand PCore.onPCoreReady, container rendering                                                                 │
 └─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

 Risk: Root PConnect extraction

 The biggest unknown is getting the root PConnect object after createCase(). The SDK bridge gets it via PCore.onPCoreReady(renderObj => renderObj.props.getPConnect()), but that callback may already be registered by the existing mashup path.

 Mitigation: We try container utilities first (PCore.getContainerUtils()). If that doesn't expose PConnect directly, we fall back to PCore.registerComponentCreator() or store subscription. This will be resolved empirically during Step 3 implementation.

 Verification

 1. Navigate to /support-custom — page loads, PCore reports ready
 2. Navigate to /support/new — existing mashup works unchanged
 3. On /support-custom — case is created in Pega (verify in portal)
 4. PConnect tree renders — containers and templates show correctly (unmapped types show yellow fallback)
 5. Field components render with correct labels and values
 6. Fill fields → values persist via setValue()
 7. Click Submit → finishAssignment() fires → case advances or completes
 8. Completion state shows case ID and "Back to Support" link
 9. Cancel flow works — navigates back to /support
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
