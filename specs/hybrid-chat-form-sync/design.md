# Design Document

## Overview

The Hybrid Chat-Form Sync feature wires the Pega Constellation custom-rendered case form (left side of `/support/new/$caseId`) and the globally-mounted Pega GenAI chat (`ChatLauncher` in `src/routes/__root.tsx`) into one bidirectional state graph backed by the existing PCore store. The chat gains read access to the form via an inline `[Current form state: {...}]` snapshot prepended to outgoing messages [R1], and write access via `<form-update field='X' value='Y'/>` self-closing tags emitted by the agent and parsed client-side [R2]. PCore remains the single source of truth — both UIs are views.

The architectural keystone is a small Zustand store (`usePegaCaseStore`) that holds the current `rootPConnect` and `caseId` [R3]. `useCustomPegaCase` (already extracts and owns `rootPConnect` at `src/hooks/useCustomPegaCase.ts:38-130`) publishes to it on phase transition; `usePegaAgentRuntime` reads from it at send/receive time. This avoids prop-drilling across the route tree and keeps `ChatLauncher`'s position in `__root.tsx` unchanged. No backend change is required for the MVP — the agent prompt instruction is the only Pega-side configuration.

Two pure helpers (`getCaseSnapshot`, `applyFormUpdate`) and one pure parser (`parseFormUpdates`) carry the cross-surface logic, isolated from React for unit testability. Field-level reconciliation [R4] is solved by a reusable `usePCoreFieldSubscription` hook that keeps locally-buffered inputs (`TextInput`, `TextArea`, `Currency`, `Email`, `Phone`, `DateInput`) in sync with external store mutations while respecting last-write-wins on focus. Two `import.meta.env` flags (`VITE_PEGA_CHAT_SNAPSHOT_ENABLED`, `VITE_PEGA_CHAT_FORM_UPDATES_ENABLED`) gate each direction independently for incremental rollout [R11].

## Architecture

### Component diagram

```
src/routes/__root.tsx
└── RootComponent
    ├── <Outlet />                                                (route content)
    │   └── /support/new/$caseId  ─→ src/app/support-new.tsx
    │       └── usePegaMashup() + useCustomPegaCase()
    │              │       (already exists, src/hooks/useCustomPegaCase.ts)
    │              │       extracts rootPConnect from PCore container utils
    │              ▼
    │           ┌──────────────────────────────────────────┐
    │           │  usePegaCaseStore  (Zustand singleton)   │   ◄── NEW
    │           │  { caseId, rootPConnect,                 │
    │           │    setCase, clearCase }                  │
    │           └──────────────────────────────────────────┘
    │              ▲                                  ▲
    │              │ publishes on                     │ subscribes
    │              │ phase === 'active'               │ for form updates
    │              │                                  │
    │           PConnectRenderer                      │
    │              └─ fields/* (TextInput, Dropdown, …)
    │                    └─ usePCoreFieldSubscription   ◄── NEW
    │                       (reconciles local buffer
    │                        with PCore on external write)
    │
    └── <ChatLauncher />                              (src/components/genai/ChatLauncher.tsx)
        └── <ChatPanel />                             (src/components/genai/ChatPanel.tsx)
            └── usePegaAgentRuntime()                 (src/lib/genai/usePegaAgentRuntime.ts)
                  ├─ pre-send  : getCaseSnapshot()        ──► reads usePegaCaseStore + PCore
                  └─ post-recv : parseFormUpdates(text)   ──► applyFormUpdate(field, value)
                                                                ──► reads usePegaCaseStore.rootPConnect
                                                                ──► actionsApi.updateFieldValue + triggerFieldChange
```

### Data flow — Form → Chat (R1, R5)

```
User clicks send in ChatPanel composer
  │
  ▼  onNew(message) in usePegaAgentRuntime
  │
  ├─► usePegaCaseStore.getState() ──► { rootPConnect, caseId }
  │
  ├─► getCaseSnapshot(rootPConnect)
  │     ├─ PCore.getStoreValue('.', 'caseInfo.content', context)
  │     ├─ filterByWhitelist(content, config.fieldWhitelist)
  │     ├─ buildFieldsMap(rootPConnect)         ──► _fields: { propName: { label, type } }
  │     ├─ enforceSizeCap(json, config.maxBytes) [R1.6]
  │     └─ returns { caseID, fields, _fields } | null
  │
  ├─► if snapshot && VITE_PEGA_CHAT_SNAPSHOT_ENABLED:
  │     enriched = `[Current form state: ${json}]\n\nUser: ${userText}`
  │   else:
  │     enriched = userText
  │
  ├─► transcript stores user message as { content: userText }   ◄── R1.7 (no prefix shown)
  └─► sendMessage({ message: enriched, ... })
```

### Data flow — Chat → Form (R2, R6, R7)

```
sendMessage() resolves ──► data.response: string
  │
  ├─► parseFormUpdates(data.response)
  │     │   (pure, src/lib/genai/formUpdateParser.ts)
  │     ├─ regex sweep (tolerant of single/double quotes, HTML entities)
  │     ├─ cap at 50 tags [R6.5]
  │     ├─ skip malformed [R6.1] / empty field|value [R6.2]
  │     └─ returns { updates: FormUpdate[], cleanText: string }
  │
  ├─► if VITE_PEGA_CHAT_FORM_UPDATES_ENABLED:
  │     queueMicrotask(() => updates.forEach(applyFormUpdate))   [R7.3]
  │
  ├─► applyFormUpdate(field, value):
  │     ├─ rootPConnect = usePegaCaseStore.getState().rootPConnect
  │     ├─ if !rootPConnect → no-op + debug log [R8.4]
  │     ├─ if !knownField(field) → warn + skip [R5.2]
  │     ├─ rootPConnect.getActionsApi().updateFieldValue(field, value)
  │     ├─ rootPConnect.getActionsApi().triggerFieldChange(field, value)
  │     └─ structured log: [Pega GenAI][form-update] {field, value, caseId, outcome} [R9.2]
  │
  └─► transcript renders cleanText (or "Updated the form for you." if empty) [R8.3]
      + aria-live announcement summarizing applied updates [R10.2]
```

### External dependencies

- `@pega/constellationjs` (already a devDependency) — global `PCore` providing `getStoreValue`, `getStore`, `getGenAIAssistantUtils`, container utils, mashup api.
- `@assistant-ui/react` (already installed) — `useExternalStoreRuntime`, primitives.
- `zustand` — **NEW** dependency. Not currently in `package.json`; design proposes adding it. Rationale: the store is a singleton accessed both inside React render (subscribers) and outside React (helpers called from `usePegaAgentRuntime`'s async handlers). Zustand's `getState()` non-reactive accessor cleanly serves the latter without forcing React Context plumbing through `__root.tsx`. Bundle impact ≈ 1 kB gzipped.

### Scalability and performance

- Snapshot is read **on demand** (per send) via `PCore.getStoreValue`; no extra subscription needed for the chat side.
- Snapshot size cap (default 8 KB JSON) prevents prompt bloat [R1.6].
- Tag parser caps at 50 matches [R6.5]; regex is single-pass non-backtracking.
- Field subscription (`usePCoreFieldSubscription`) does a shallow comparison and only updates state on actual divergence to avoid render storms.
- `applyFormUpdate` is dispatched via `queueMicrotask` so React flushes the new assistant message synchronously, then PCore updates fire on the next tick [R7.3].

## Components and Interfaces

### 1. Shared store — `src/lib/genai/usePegaCaseStore.ts` (NEW)

Zustand store, singleton at module scope. Holds the active case PConnect and id.

```ts
import { create } from 'zustand';
import type { PConnectProxy } from '../custom-pega/types';

export interface PegaCaseStoreState {
  caseId: string | null;
  rootPConnect: PConnectProxy | null;
  setCase: (caseId: string, rootPConnect: PConnectProxy) => void;
  clearCase: () => void;
}

export const usePegaCaseStore = create<PegaCaseStoreState>((set) => ({
  caseId: null,
  rootPConnect: null,
  setCase: (caseId, rootPConnect) => set({ caseId, rootPConnect }),
  clearCase: () => set({ caseId: null, rootPConnect: null })
}));
```

Outside React: `usePegaCaseStore.getState()` returns the current snapshot. Used by `getCaseSnapshot` and `applyFormUpdate`.

Inside React: `usePegaCaseStore((s) => s.rootPConnect)` for components that need to re-render on case change.

**Race handling [R3.6]**: `setCase` simply overwrites; the previous reference is dropped. Callers MUST call `clearCase()` before `setCase()` only when they want a transitional null window (rarely needed). For incremental case-to-case navigation, a single `setCase` call is sufficient.

### 2. `useCustomPegaCase` integration (MODIFY)

File: `src/hooks/useCustomPegaCase.ts`. The existing hook already drives `phase` and `rootPConnect`. Add two `useEffect` hooks:

```ts
// Publish to shared store when entering 'active'
useEffect(() => {
  if (phase === 'active' && rootPConnect && caseId) {
    usePegaCaseStore.getState().setCase(caseId, rootPConnect);   // [R3.2]
  }
}, [phase, rootPConnect, caseId]);

// Clear store on idle/completed/error or unmount
useEffect(() => {
  if (phase === 'idle' || phase === 'completed' || phase === 'error') {
    usePegaCaseStore.getState().clearCase();                      // [R3.3]
  }
}, [phase]);

useEffect(() => {
  return () => {
    // unmount: case route left
    usePegaCaseStore.getState().clearCase();                      // [R3.5]
  };
}, []);
```

Insertion site: after the existing `useEffect` block ending at `useCustomPegaCase.ts:302`.

### 3. Snapshot helper — `src/lib/genai/snapshot.ts` (NEW)

Pure function. Reads from PCore + `rootPConnect` and applies whitelist/cap.

```ts
import type { CaseSnapshot } from './types';
import type { PConnectProxy } from '../custom-pega/types';
import { genaiConfig } from './config';

declare const PCore: any;

export function getCaseSnapshot(rootPConnect: PConnectProxy | null): CaseSnapshot | null {
  if (!rootPConnect) return null;                                           // [R1.3]
  try {
    const context = rootPConnect.getContextName();
    const content = PCore.getStoreValue('.', 'caseInfo.content', context); // [R1.2]
    if (!content || typeof content !== 'object') return null;

    const filtered = filterFields(content, genaiConfig.fieldWhitelist, genaiConfig.fieldDenylist); // [R1.5]
    const _fields = buildFieldsMap(rootPConnect);                          // [R5.1]
    const caseID = content.pyID ?? content.caseID ?? null;

    let snapshot: CaseSnapshot = { caseID, fields: filtered, _fields };
    snapshot = enforceSizeCap(snapshot, genaiConfig.maxSnapshotBytes);     // [R1.6]
    return snapshot;
  } catch (err) {
    logSnapshotWarn('snapshot read failed', err);                          // [R1.4]
    return null;
  }
}
```

`buildFieldsMap` walks `rootPConnect.getReferencedView()` (or the configured registry in `case-schemas.ts` — see section 14) to produce `{ propertyName: { label, type } }`. If the metadata is unavailable, returns `{}` and the snapshot still ships without `_fields` [R5.3].

`enforceSizeCap` serializes, measures byte length, and if over cap drops keys in priority order (denylisted internal first, then largest-value strings) until under cap. Logs a single warning naming the dropped keys [R1.6, R9.4].

### 4. Apply form update — `src/lib/genai/applyFormUpdate.ts` (NEW)

```ts
import type { FormUpdate } from './types';
import { usePegaCaseStore } from './usePegaCaseStore';
import { logFormUpdate, logFormUpdateWarn } from './logger';

const seenUnknownFields = new Set<string>(); // session-level dedup [R9.4]

export function applyFormUpdate({ field, value }: FormUpdate): void {
  const { rootPConnect, caseId } = usePegaCaseStore.getState();
  if (!rootPConnect) {
    logFormUpdate({ field, value, caseId: null, outcome: 'skipped:no-case' }); // [R8.4]
    return;
  }
  if (!isKnownField(rootPConnect, field)) {
    if (!seenUnknownFields.has(field)) {
      seenUnknownFields.add(field);
      logFormUpdateWarn({ field, value, caseId, outcome: 'skipped:unknown-field' }); // [R5.2]
    }
    return;
  }
  try {
    const actions = rootPConnect.getActionsApi();
    actions.updateFieldValue(field, value);     // [R2.2]
    actions.triggerFieldChange(field, value);
    logFormUpdate({ field, value, caseId, outcome: 'applied' }); // [R2.6, R9.2]
  } catch (err) {
    logFormUpdateWarn({ field, value, caseId, outcome: 'error', err });
  }
}
```

`isKnownField` consults the same source as `_fields` in the snapshot (`buildFieldsMap`) plus the registry in `case-schemas.ts`. The function never throws.

**Nested PConnect contexts (limitation)**: MVP routes all updates through `rootPConnect`. Fields living under non-root contexts (e.g. embedded data pages) will fail the `isKnownField` check and be logged as unknown rather than silently mis-routed. See section 14.

### 5. Tag parser — `src/lib/genai/formUpdateParser.ts` (NEW)

Pure, framework-agnostic, fully unit-testable.

```ts
export interface ParseResult {
  updates: FormUpdate[];
  cleanText: string;
}

const TAG_RE =
  /<form-update\s+([^>]*?)\/?>/gi;
const ATTR_RE =
  /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const HTML_ENTITIES: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };

export function parseFormUpdates(text: string): ParseResult {
  if (typeof text !== 'string' || !text) return { updates: [], cleanText: text ?? '' };

  const updates: FormUpdate[] = [];
  const matchSpans: Array<[number, number]> = [];
  let match: RegExpExecArray | null;
  let count = 0;

  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(text)) !== null) {
    if (count >= 50) {                                          // [R6.5]
      logParserWarn('tag-cap', { capped: true });
      break;
    }
    const attrs = parseAttrs(match[1]);
    const field = decodeEntities(attrs.field);
    const value = decodeEntities(attrs.value);
    if (!field || value === undefined) {                        // [R6.2]
      logParserWarn('skipped:missing-attr', { raw: match[0] });
      continue;                                                 // leave tag in text per R6.1
    }
    updates.push({ field, value });
    matchSpans.push([match.index, match.index + match[0].length]);
    count++;
  }

  const cleanText = stripSpans(text, matchSpans).replace(/\n{3,}/g, '\n\n'); // [R6.6]
  return { updates, cleanText };
}
```

Properties (verified by unit tests in section 12):

- Pure (no I/O outside the optional logger).
- Tolerant: malformed tags are left in text rather than raised [R6.1].
- Never operates on user input — caller (`usePegaAgentRuntime`) only feeds `data.response` [R6.4].
- Bounded work: max 50 tags, regex non-backtracking on `[^>]*?`.

### 6. Field-level reconciliation — `src/lib/custom-pega/hooks/usePCoreFieldSubscription.ts` (NEW) and field updates [R4]

Reusable hook subscribed to `PCore.getStore()`:

```ts
export function usePCoreFieldSubscription(
  propName: string,
  context: string,
  externalValue: unknown,
  setLocal: (v: any) => void,
  isFocused: () => boolean
): void {
  useEffect(() => {
    if (!propName) return;
    const store = PCore.getStore();
    let lastSeen = externalValue;
    const unsub = store.subscribe(() => {
      const next = PCore.getStoreValue(`.${propName}`, 'caseInfo.content', context);
      if (next !== lastSeen) {
        lastSeen = next;
        if (!isFocused()) {
          setLocal(next);                  // [R4.1]
        } else {
          setLocal(next);                  // last-write-wins on focus [R4.2, R7.1]
        }
      }
    });
    return () => unsub();                  // [R4.4]
  }, [propName, context, externalValue, setLocal, isFocused]);
}
```

Each buffered field gets a `useRef<HTMLInputElement>(null)` and passes `() => document.activeElement === ref.current` as `isFocused`.

**Files to modify (each gets 1 ref, 1 hook call, no other behavior change):**

| File | Lines (current) | Change |
|---|---|---|
| `src/lib/custom-pega/fields/TextInput.tsx` | 22-26 | Add `inputRef`, replace effect at 24-26 with `usePCoreFieldSubscription` |
| `src/lib/custom-pega/fields/TextArea.tsx` | 22-26 | Same pattern |
| `src/lib/custom-pega/fields/Currency.tsx` | 22-26 | Same pattern |
| `src/lib/custom-pega/fields/Email.tsx` | 22-26 | Same pattern |
| `src/lib/custom-pega/fields/Phone.tsx` | 22-26 | Same pattern |
| `src/lib/custom-pega/fields/DateInput.tsx` | 21-25 | Same pattern |
| `src/lib/custom-pega/fields/Dropdown.tsx` | 80-86 | Already re-renders on `value` prop change but does not subscribe externally; add subscription so external changes during open menu reflect [R4.3]. Also: if external value not in `options`, write through and warn [R4.5] |
| `src/lib/custom-pega/fields/Checkbox.tsx` | 19-23 | Similar reconciliation; bool casting preserved [R4.3] |

`Dropdown` unmatched-option behavior [R4.5]:

```ts
if (!options.find((o) => o.key === localValue) && localValue) {
  console.warn('[Pega GenAI][form-update] dropdown value not in options', { propName, localValue });
  // still render: SelectValue will display localValue as raw text
}
```

### 7. `usePegaAgentRuntime` modifications

File: `src/lib/genai/usePegaAgentRuntime.ts`. Three diff points:

**(a) Prepend snapshot before `sendMessage` (current line 56)** [R1.1, R11.1]:

```ts
const userText = part.text;
setError(null);
setMessages((prev) => [...prev, { id: newId(), role: 'user', content: userText }]); // [R1.7]
setIsRunning(true);

try {
  const convId = await ensureConversation();
  const enriched = buildOutgoing(userText);   // helper that consults config + snapshot
  const data = await sendMessage({ agentID, conversationID: convId, message: enriched, context });
  ...
}
```

`buildOutgoing` lives in this file or in `snapshot.ts`:

```ts
function buildOutgoing(userText: string): string {
  if (!genaiConfig.snapshotEnabled) return userText;                         // [R11.1]
  const snapshot = getCaseSnapshot(usePegaCaseStore.getState().rootPConnect);
  if (!snapshot) return userText;                                            // [R1.3]
  return `[Current form state: ${JSON.stringify(snapshot)}]\n\nUser: ${userText}`;
}
```

**(b) Parse + apply on response (current line 57)** [R2.1, R2.3, R2.4, R8.3, R10.2]:

```ts
const data = await sendMessage(...);
const { updates, cleanText } = parseFormUpdates(data.response);

if (genaiConfig.formUpdatesEnabled && updates.length > 0) {                 // [R11.2]
  queueMicrotask(() => {
    for (const u of updates) applyFormUpdate(u);                            // [R7.3]
  });
}

const visible = cleanText.trim() || 'Updated the form for you.';            // [R8.3]
const announcement = updates.length > 0
  ? `Updated ${updates.map((u) => `${u.field} to ${u.value}`).join(', ')}.` // [R10.2]
  : null;

setMessages((prev) => [
  ...prev,
  { id: data.messageID ?? newId(), role: 'assistant', content: visible, announcement }
]);
```

`PegaMessage` gains an optional `announcement` field (see section 8).

**(c) `isRunning` already guards re-entry (line 24)** [R7.2]: no change needed; `useExternalStoreRuntime` honors it.

**(d) `resetConversation` (line 76) does NOT clear the form** [R8.5]: confirmed — it only clears local message state. No PCore mutation.

### 8. Type additions — `src/lib/genai/types.ts` (MODIFY)

```ts
export type PegaMessageRole = 'user' | 'assistant';

export interface PegaMessage {
  id: string;
  role: PegaMessageRole;
  content: string;
  announcement?: string;        // NEW — surfaced via aria-live region
}

export interface FormUpdate {
  field: string;
  value: string;
}

export interface CaseSnapshot {
  caseID: string | null;
  fields: Record<string, unknown>;
  _fields?: Record<string, { label: string; type?: string }>;
}

export interface ParseResult {
  updates: FormUpdate[];
  cleanText: string;
}

export interface GenAIRuntimeConfig {
  snapshotEnabled: boolean;
  formUpdatesEnabled: boolean;
  maxSnapshotBytes: number;       // default 8192
  maxTagsPerResponse: number;     // default 50
  fieldWhitelist: string[] | null; // null = no whitelist
  fieldDenylist: string[];         // default ['pxObjClass','pzInsKey','pxCreateDateTime', ...]
}
```

### 9. Configuration — `src/lib/genai/config.ts` (NEW) [R11.3]

Single module reading `import.meta.env`. All call sites import from here.

```ts
import type { GenAIRuntimeConfig } from './types';

const env = import.meta.env;

const truthy = (v: unknown, fallback: boolean): boolean => {
  if (v === undefined || v === null || v === '') return fallback;
  return String(v).toLowerCase() !== 'false' && v !== '0';
};

export const genaiConfig: GenAIRuntimeConfig = {
  snapshotEnabled: truthy(env.VITE_PEGA_CHAT_SNAPSHOT_ENABLED, true),
  formUpdatesEnabled: truthy(env.VITE_PEGA_CHAT_FORM_UPDATES_ENABLED, true),
  maxSnapshotBytes: Number(env.VITE_PEGA_CHAT_SNAPSHOT_MAX_BYTES) || 8192,
  maxTagsPerResponse: 50,
  fieldWhitelist: null,
  fieldDenylist: [
    'pxObjClass', 'pzInsKey', 'pxCreateDateTime', 'pxCreateOpName',
    'pxCreateOperator', 'pxUpdateOpName', 'pxUpdateOperator', 'pxUpdateDateTime',
    'pyAttachmentCategory', 'pyAttachmentList'
  ]
};
```

`.env.example` additions (do **not** modify `.env`):

```
VITE_PEGA_CHAT_SNAPSHOT_ENABLED=true
VITE_PEGA_CHAT_FORM_UPDATES_ENABLED=true
VITE_PEGA_CHAT_SNAPSHOT_MAX_BYTES=8192
```

### 10. Observability — `src/lib/genai/logger.ts` (NEW) [R9]

Reuses the `decorateError` pattern from `pegaGenAIClient.ts:22-31`. Adds tag-prefixed structured logs.

```ts
const isDev = import.meta.env.DEV;

export function logFormUpdate(entry: { field: string; value: unknown; caseId: string | null; outcome: string }) {
  const fn = isDev ? console.info : console.debug;
  fn('[Pega GenAI][form-update]', entry);                            // [R9.2]
}

export function logFormUpdateWarn(entry: Record<string, unknown>) {
  console.warn('[Pega GenAI][form-update]', entry);
}

export function logSnapshot(entry: { bytes: number; fieldCount: number; truncated?: boolean; dropped?: string[] }) {
  const fn = isDev ? console.info : console.debug;
  fn('[Pega GenAI][snapshot]', entry);                               // [R9.3, R11.4]
}

export function logSnapshotWarn(msg: string, ...rest: unknown[]) {
  console.warn('[Pega GenAI][snapshot]', msg, ...rest);              // [R1.4]
}

export function logParserWarn(reason: string, detail: Record<string, unknown>) {
  console.warn('[Pega GenAI][parser]', reason, detail);              // [R6.2, R6.5]
}
```

Rate limiting [R9.4]:
- Unknown-field warnings deduplicated per session via `seenUnknownFields` Set in `applyFormUpdate.ts`.
- Snapshot truncation: one warn per send (the `enforceSizeCap` itself logs).
- Tag-cap: one warn per parser invocation (loop break point).

PII safety [R9.5]: snapshot logger emits only `bytes` and `fieldCount`, never raw values. Form-update logger emits `field` + `value`; the value passes through the same denylist before being logged when the field name matches a denylisted prefix (defense in depth).

### 11. Accessibility [R10]

**Focus preservation [R10.1]**: `applyFormUpdate` does not call `focus()` on any element. Field components re-render via state — focus stays in the chat composer (where the user just hit Send).

**Screen reader announcements [R10.2]**: `ChatPanel` adds an `aria-live="polite"` region inside the transcript. When an `assistant` message has `announcement`, render it there:

```tsx
{/* in ChatPanel.tsx, inside ThreadPrimitive.Viewport */}
<div role='status' aria-live='polite' aria-atomic='true' className='sr-only'>
  {lastAnnouncement}
</div>
```

`lastAnnouncement` comes from a `useState` updated when a new assistant message with `announcement` is appended.

**Synthetic change events for AT [R10.5]**: Pega's `triggerFieldChange` updates the store; React re-renders `Dropdown`/`Checkbox` etc. with new `value`. The Radix `Select` component already announces selection changes via its own `aria-live` machinery, so no extra dispatch is needed for the dropdown. For the buffered text inputs, the controlled `value` prop change re-renders the `<input>`; screen readers announce changes only via `aria-live` regions, not on input value mutation, which is why we surface the change via the polite region in the chat panel rather than relying on the input itself.

**Non-empty visible message [R10.3]**: enforced in section 7 (b) by the fallback "Updated the form for you."

**Focus trap and labels [R10.4]**: no change to `ChatLauncher`'s Radix `Popover`; existing behavior preserved.

**Existing `aria-invalid` / `aria-describedby` [R10.5]**: preserved — field components continue to compute `errorState` and `errorMessage` from the same `configProps`/`stateProps` pattern after subscription-driven re-render.

### 12. Testing strategy

**Unit (Jest + ts-jest)** — `tests/unit/`:

| Suite | File | Coverage |
|---|---|---|
| Tag parser | `tests/unit/genai/formUpdateParser.test.ts` | (1) single tag, (2) multiple in order, (3) double quotes, (4) single quotes, (5) HTML entities `&amp; &quot; &apos;`, (6) malformed: missing slash, missing field, mismatched quotes, nested — each leaves text intact, no throw, (7) 50-tag cap with warn, (8) blank-line collapse [R6.6], (9) empty/non-string input, (10) tag with whitespace around `=` |
| Snapshot | `tests/unit/genai/snapshot.test.ts` | Mock `PCore.getStoreValue`. Verify: whitelist filter, denylist removes pxObjClass etc., null-safe when no rootPConnect, size cap drops in priority order, `_fields` omitted when builder fails [R5.3] |
| Apply form update | `tests/unit/genai/applyFormUpdate.test.ts` | Mock `usePegaCaseStore`. Verify: no-op when `rootPConnect` null [R8.4], unknown field warn-and-skip with dedup [R5.2, R9.4], known field calls `updateFieldValue` + `triggerFieldChange` in order [R2.2], try/catch wraps [R8.4] |
| Store transitions | `tests/unit/genai/usePegaCaseStore.test.ts` | `setCase` → `clearCase` → `setCase` (replace), no listener leaks |

**Component (RTL + jsdom)** — `tests/unit/components/`:

- `ChatPanel.test.tsx`: render with mocked `usePegaAgentRuntime`. Cases: (1) message with `<form-update>` tags is rendered without raw tags, (2) empty cleanText shows fallback, (3) `aria-live` region updates with announcement, (4) composer disabled when `enabled=false` [R8.1].
- `TextInput.test.tsx`: external store change re-renders without focus → buffer replaced; with focus → buffer also replaced (last-write-wins) [R4.1, R4.2].
- `Dropdown.test.tsx`: external value not in options → renders raw + warn [R4.5].

**Integration / E2E (Playwright)** — `tests/e2e/`:

- New project `tests/e2e/sweet-life/` (separate from existing MediaCo/Digv2 because backend differs). Pattern: open `/support/new/<id>` in dev mode with Vite, mock `PCore.getGenAIAssistantUtils`, `PCore.getStoreValue`, `PCore.getStore` via a Playwright page-init script that overrides the global before the SDK loads.
- Scenarios:
  1. **Form → Chat**: select a value in `Dropdown`, send "what did I select?", assert outgoing payload (intercepted via the mocked `sendMessageForAgent`) contains `[Current form state:` with the chosen value.
  2. **Chat → Form**: empty form, mock agent response with `<form-update field='IncidentType' value='Product faulty'/>Will do.`, assert dropdown reflects the change and assistant message text is "Will do." (no raw tag).
  3. **Loop**: chain (1) after (2) — snapshot reflects chat-driven mutation.
  4. **No case open**: navigate to `/`, send a message, assert no snapshot prefix and no errors.
  5. **Tag cap**: response with 60 tags → exactly 50 applied, warn logged.
  6. **Race**: trigger 5 `<form-update>` in one response with `Promise.resolve().then` interleaving — assert no React warnings.

Real Pega backend integration tests are out of scope for the MVP suite given runtime cost; the mocked Playwright path gives meaningful E2E confidence over the React + parser + applyFormUpdate seam.

### 13. Migration / rollout

**Phase 0 — feature-flagged dev**: ship code with `VITE_PEGA_CHAT_SNAPSHOT_ENABLED=true`, `VITE_PEGA_CHAT_FORM_UPDATES_ENABLED=false` defaults in `.env.local`. Snapshot direction tested first; chat→form invisible to users.

**Phase 1 — internal QA**: enable form updates in dev. Validate against the Incident case type (the only schema initially in `case-schemas.ts`).

**Phase 2 — production rollout**: flip both flags to `true` in production env vars. No code change.

**Backend**: the Pega Agent rule `Incident-support` is updated separately (out-of-repo) with the prompt instruction documented in `HYBRID-CHAT-FORM-PLAN.md`. The MVP will work for manual smoke testing without that change by injecting tags in dev tools.

**When `VITE_PEGA_CHAT_FORM_UPDATES_ENABLED=false`**: the design **still strips tags** from displayed text (parser runs unconditionally) but **does not call `applyFormUpdate`**. Rationale: showing raw `<form-update>` tags to users would be a worse UX than silently dropping them, and the agent may emit them regardless of the client flag. This is explicitly required by R11.2.

### 14. Open questions / known limitations

1. **Property-name discovery for arbitrary case types**: the agent needs to map "Incident Type" (label) → `IncidentType` (property name). The `_fields` map in the snapshot helps, but it depends on `buildFieldsMap(rootPConnect)` finding view metadata. For MVP we ship a hand-curated registry:

   ```ts
   // src/lib/genai/case-schemas.ts (NEW)
   export const caseSchemas: Record<string, Record<string, { label: string; type: string }>> = {
     'SL-FW-Work-Incident': {
       IncidentType: { label: 'Incident Type', type: 'Picklist' },
       IncidentSubType: { label: 'Incident Subtype', type: 'Picklist' },
       Description: { label: 'Description', type: 'Text' },
       Severity: { label: 'Severity', type: 'Picklist' }
     }
   };
   ```

   `buildFieldsMap` first tries view metadata, then falls back to this registry keyed by `caseInfo.content.pxObjClass`. As more case types come online, entries are added here. Long-term, server-side schema discovery is the proper fix, but it is out of scope for MVP.

2. **Nested PConnect contexts**: only root-level fields are addressable. Fields under embedded list pages, sub-cases, or nested data pages will fail the `isKnownField` check and be logged as `skipped:unknown-field`. Acceptable for MVP per the requirements' "out of scope: multi-case context" clause; revisit when the form actually contains nested structures.

3. **Streaming responses**: explicitly out of scope (Out of Scope #3). Parser runs on full response only.

4. **Localization of the protocol**: the `[Current form state: ...]` prefix and `<form-update>` tag names are English-only and protocol-fixed (Out of Scope #9). The agent prompt instruction is also English-only.

5. **Persistence**: chat conversation does not survive reloads (Out of Scope #8); `usePegaCaseStore` likewise resets on reload.

6. **Ordering of `setMessages` vs `applyFormUpdate`**: section 7 (b) appends the assistant message **first** (synchronous), then schedules `applyFormUpdate` in a microtask. This means the chat shows "Will do." before the dropdown visually updates by ~1 frame. This is intentional and aligns with R7.3.

### 15. Requirements coverage matrix

| Requirement | Acceptance | Design section / file |
|---|---|---|
| R1.1 | Snapshot prefix prepended | §7(a) `buildOutgoing`, `usePegaAgentRuntime.ts` modify |
| R1.2 | Reads from PCore store, not React state | §3 `getCaseSnapshot` uses `PCore.getStoreValue('.', 'caseInfo.content', context)` |
| R1.3 | No-op when no case open | §3 `if (!rootPConnect) return null`; §7(a) `if (!snapshot) return userText` |
| R1.4 | Try/catch + single warn on snapshot read failure | §3 catch block; §10 `logSnapshotWarn` |
| R1.5 | Whitelist/denylist filter | §9 `genaiConfig.fieldDenylist`; §3 `filterFields` |
| R1.6 | Size cap with truncation warn | §3 `enforceSizeCap`; §9 `maxSnapshotBytes` |
| R1.7 | UI shows only user text | §7(a) `setMessages(... content: userText)` |
| R2.1 | Parse self-closing tags into `FormUpdate[]` | §5 `parseFormUpdates`, `formUpdateParser.ts` |
| R2.2 | `updateFieldValue` + `triggerFieldChange` | §4 `applyFormUpdate.ts` |
| R2.3 | Document order application | §5 (regex iterates l-to-r); §7(b) `for...of` loop |
| R2.4 | Strip tags from display | §5 returns `cleanText`; §7(b) renders cleanText |
| R2.5 | No tags → render unchanged | §5 returns `updates: []`; §7(b) skips applyFormUpdate when empty |
| R2.6 | Structured debug log | §10 `logFormUpdate` |
| R3.1 | Shared store across route hierarchy | §1 `usePegaCaseStore` (Zustand) |
| R3.2 | `setRootPConnect` once on active | §2 effect when `phase === 'active'` |
| R3.3 | Clear on idle/completed | §2 second effect |
| R3.4 | `getCaseSnapshot` and `applyFormUpdate` no-op when absent | §3 §4 null guards |
| R3.5 | No reference retained on route change | §2 unmount cleanup |
| R3.6 | Replace prior PConnect on case switch | §1 `setCase` overwrites |
| R4.1 | Buffered fields reconcile to external value | §6 `usePCoreFieldSubscription` + 6 file edits |
| R4.2 | Last-write-wins on focus | §6 unconditional `setLocal(next)` |
| R4.3 | Dropdown/Checkbox re-render externally | §6 Dropdown.tsx and Checkbox.tsx edits |
| R4.4 | Unsubscribe on unmount | §6 hook returns `unsub` |
| R4.5 | Unmatched dropdown value: write+render+warn | §6 Dropdown unmatched-option block |
| R5.1 | `_fields` map in snapshot | §3 `buildFieldsMap` |
| R5.2 | Unknown field skip + warn | §4 `isKnownField`; §10 dedup warn |
| R5.3 | Omit `_fields` if unavailable | §3 returns `{}` and skips key |
| R5.4 | `_fields` size counted toward cap | §3 cap operates on full snapshot JSON including `_fields` |
| R6.1 | Malformed → skip, leave in text, no throw | §5 `continue` on missing attr; outer try/catch unnecessary because regex doesn't throw |
| R6.2 | Empty field/value → skip + warn | §5 missing-attr branch + `logParserWarn` |
| R6.3 | Single + double quotes + HTML entities | §5 `ATTR_RE` alternation; `decodeEntities` |
| R6.4 | Only on assistant response | §7(b) caller pipes `data.response` only; never user input |
| R6.5 | 50-tag cap | §5 `if (count >= 50) break` |
| R6.6 | Blank-line collapse | §5 `.replace(/\n{3,}/g, '\n\n')` |
| R7.1 | Last-write-wins on concurrent edit | §6 `setLocal(next)` even when focused |
| R7.2 | `isRunning` guard | `usePegaAgentRuntime.ts:24` (existing) |
| R7.3 | Microtask deferral | §7(b) `queueMicrotask` |
| R7.4 | 5+ tags → no errors | §12 E2E scenario 6; §5 bounded loop |
| R7.5 | Navigation drops pending updates | §2 unmount clears store; §4 null-guard makes apply a no-op |
| R8.1 | Composer disabled when not enabled | `ChatPanel.tsx:85-86` (existing) |
| R8.2 | Decorated error in banner + warning message | `pegaGenAIClient.ts:22-31` (existing) + `usePegaAgentRuntime.ts:58-61` (existing) |
| R8.3 | Non-empty fallback message | §7(b) `cleanText.trim() \|\| 'Updated the form for you.'` |
| R8.4 | applyFormUpdate no-op when no case | §4 null guard + debug log |
| R8.5 | Reset clears chat only, not form | §7(d) confirmed; `usePegaAgentRuntime.ts:76-81` |
| R9.1 | `decorateError` for GenAI calls | existing, reused |
| R9.2 | `[Pega GenAI][form-update]` tag | §10 `logFormUpdate` |
| R9.3 | Snapshot size + field count | §10 `logSnapshot` |
| R9.4 | Rate-limited warnings | §10 `seenUnknownFields` dedup; one warn per truncate/cap |
| R9.5 | PII whitelist for logs | §10 denylist applied before logging values |
| R10.1 | Focus stays in composer | §11 — no `focus()` calls in form path |
| R10.2 | aria-live announcement | §11 `<div role='status' aria-live='polite'>` in `ChatPanel` |
| R10.3 | Non-empty visible message | §7(b) fallback |
| R10.4 | Existing focus-trap preserved | §11 — Radix Popover untouched |
| R10.5 | aria-invalid / aria-describedby preserved | §11 — field components keep their existing logic |
| R11.1 | `VITE_PEGA_CHAT_SNAPSHOT_ENABLED=false` skips prefix | §7(a) `if (!genaiConfig.snapshotEnabled) return userText` |
| R11.2 | `VITE_PEGA_CHAT_FORM_UPDATES_ENABLED=false` strips but doesn't apply | §7(b) parser runs unconditionally; apply gated by flag |
| R11.3 | Single config module | §9 `src/lib/genai/config.ts` |
| R11.4 | Dev info / prod debug log levels | §10 `isDev ? console.info : console.debug` |
