# Implementation Plan

## Progress Summary
- **Total Tasks**: 14
- **Completed**: 0
- **Remaining**: 14
- **Progress**: 0%

---

## Completed Tasks

_No tasks completed yet. Tasks will be moved here as they are implemented._

---

## Pending Tasks

### Phase 1: Foundation (types, config, store)

- [ ] 1. Add `zustand` dependency and create `usePegaCaseStore`
  - **Goal**: Introduce the singleton Zustand store that holds the active case `rootPConnect` + `caseId`. No consumers wired yet.
  - **Files to create or modify**:
    - `package.json` (add `zustand` to `dependencies`; run `npm install` so `package-lock.json` is updated; respect `.npmrc` `legacy-peer-deps=true`)
    - `src/lib/genai/usePegaCaseStore.ts` (NEW)
    - `src/lib/genai/types.ts` (MODIFY — add `FormUpdate`, `CaseSnapshot`, `ParseResult`, `GenAIRuntimeConfig`, augment `PegaMessage` with optional `announcement`)
  - **Steps**:
    - Add the `zustand` package (latest 4.x compatible with React 18). Do not modify any other dependency versions.
    - Create `usePegaCaseStore.ts` with the `PegaCaseStoreState` interface (`caseId`, `rootPConnect`, `setCase`, `clearCase`) per design §1.
    - Implement `setCase(caseId, rootPConnect)` and `clearCase()` as plain `set({...})` calls; `setCase` overwrites without explicit clear (per R3.6).
    - Export the hook (`usePegaCaseStore`) plus a re-export of `usePegaCaseStore.getState` shape (Zustand provides this natively; just document usage in a leading JSDoc block).
    - Append the new type interfaces to `src/lib/genai/types.ts` exactly as listed in design §8. Keep existing `PegaMessage` shape; add `announcement?: string`.
    - Use single quotes, 150 line width, 2-space indent (Biome).
  - **Tests / verification**:
    - `tests/unit/genai/usePegaCaseStore.test.ts` (NEW): assert initial state `{ caseId: null, rootPConnect: null }`; `setCase('C-1', stub)` populates both; second `setCase('C-2', stub2)` replaces (no array growth); `clearCase()` resets to nulls; subscribers called once per change.
    - Run `npm run lint` and the unit suite (see task 2 for Jest wiring if not yet present — if Jest is not yet wired, defer this test execution to task 2 and only commit the test file).
  - **Done when**: `usePegaCaseStore.ts` compiles, `npm run lint` passes, the test file exists and (once Jest runs) passes.
  - **Requirements satisfied**: [R3.1], [R3.6], [R8.4] (foundation only)
  - **Depends on**: none

- [ ] 2. Add `src/lib/genai/config.ts` and `.env.example` entries
  - **Goal**: Single module-level config object that reads `import.meta.env`, with documented defaults. No call sites changed yet.
  - **Files to create or modify**:
    - `src/lib/genai/config.ts` (NEW)
    - `.env.example` (NEW at repo root)
    - `src/lib/genai/types.ts` (verify `GenAIRuntimeConfig` interface added in task 1)
  - **Steps**:
    - Implement `genaiConfig` exactly as in design §9, including the `truthy` helper that treats unset / empty / `'false'` / `'0'` correctly.
    - Default `snapshotEnabled = true`, `formUpdatesEnabled = true`, `maxSnapshotBytes = 8192`, `maxTagsPerResponse = 50`, `fieldWhitelist = null`, `fieldDenylist` per design §9 (10 entries).
    - Create `.env.example` with the three `VITE_PEGA_CHAT_*` keys and a brief comment header noting they are read at build time by Vite.
    - Do NOT modify any existing `.env` / `.env.local` files.
  - **Tests / verification**:
    - `tests/unit/genai/config.test.ts` (NEW): import `genaiConfig`, assert defaults; use `vi.stubEnv` is NOT available (Vitest only) — instead test the `truthy` helper as an exported pure function with a small table (`undefined`, `''`, `'true'`, `'false'`, `'0'`, `'1'`, `'FALSE'`).
    - Export `truthy` (or a renamed `parseBoolEnv`) from `config.ts` for testability; keep it a single tiny export.
    - Run `npm run lint` and Jest (see task 3 for setup if needed).
  - **Done when**: `genaiConfig` is importable, defaults match design, `.env.example` documents all three flags + max-bytes.
  - **Requirements satisfied**: [R11.1], [R11.2], [R11.3], [R11.4]
  - **Depends on**: 1

- [ ] 3. Wire Jest into the repo for `tests/unit/genai/*` (if not already runnable)
  - **Goal**: Ensure unit suites added in tasks 1, 2, 4-7 actually execute via `npm run test:functional` or a sibling script. The repo currently has Jest configured for `tests/functional/dxcb` only; we need a path for `tests/unit/`.
  - **Files to create or modify**:
    - `jest.config.*` (locate existing config — do not break the `dxcb` project; add a second project or extend `roots`/`testMatch`)
    - `package.json` (add a new script, e.g. `"test:unit": "jest --selectProjects unit"`, only if the existing `npm test` does not already discover `tests/unit/`)
    - `tsconfig.json` or a Jest-specific `tsconfig` (only if `ts-jest` requires one; do not alter the build tsconfig)
  - **Steps**:
    - Inspect the existing Jest configuration; if it scopes to `tests/functional/dxcb`, extend it with a `projects` array containing the existing functional project plus a new `unit` project rooted at `tests/unit/` with `testEnvironment: 'jsdom'` (RTL needs jsdom).
    - Install dev dependencies only if missing (`ts-jest`, `@types/jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`). Use `legacy-peer-deps`.
    - Add a setup file `tests/unit/setup.ts` that imports `@testing-library/jest-dom`.
    - Confirm Vitest is NOT introduced anywhere — keep Jest.
  - **Tests / verification**:
    - Run `npm run test:unit` (or whichever script is added) and confirm the placeholder tests from tasks 1-2 execute and pass.
    - Run `npm run lint` (must remain green).
  - **Done when**: `npm run test:unit` discovers and runs files under `tests/unit/`; existing `npm test` (Playwright) and `npm run test:functional` are unchanged.
  - **Requirements satisfied**: [R9] (developer observability via tests); supports R1-R11 verification
  - **Depends on**: 1, 2

### Phase 2: Pure helpers (parser, snapshot, applyFormUpdate, logger)

- [ ] 4. Build `formUpdateParser` (pure)
  - **Goal**: Tolerant, framework-agnostic regex parser that returns `{ updates, cleanText }` and never throws.
  - **Files to create or modify**:
    - `src/lib/genai/formUpdateParser.ts` (NEW)
    - `tests/unit/genai/formUpdateParser.test.ts` (NEW)
  - **Steps**:
    - Implement `parseFormUpdates(text: string): ParseResult` per design §5.
    - Include `TAG_RE` (`/<form-update\s+([^>]*?)\/?>/gi`), `ATTR_RE` (alternation for single + double quotes), and `HTML_ENTITIES` map for `&amp; &quot; &apos; &lt; &gt;`.
    - Helpers: `parseAttrs(raw: string)`, `decodeEntities(s: string | undefined)`, `stripSpans(text, spans)`.
    - Cap at `genaiConfig.maxTagsPerResponse` (50) — import from `config.ts`. On cap, log via `logParserWarn('tag-cap', { capped: true })` (logger added in task 6 — for now stub via `console.warn` and update the import in task 6).
    - On missing `field` or `value`, `continue` (leave tag in text) and log `skipped:missing-attr`.
    - Collapse `\n{3,}` to `\n\n` after stripping spans (R6.6).
    - Defensively handle non-string / empty input: return `{ updates: [], cleanText: text ?? '' }`.
    - Reset `TAG_RE.lastIndex = 0` at function entry to keep the global regex re-entrant.
  - **Tests / verification** (`tests/unit/genai/formUpdateParser.test.ts`):
    - 1 single tag, 2 multiple in document order, 3 double quotes, 4 single quotes, 5 HTML entities decode, 6 malformed cases each (missing slash with text after, missing field attr, missing value attr, mismatched quotes, nested tag) — assert no throw, tag remains in `cleanText`, `updates` excludes them.
    - 7 cap at 50 (input with 60 tags returns 50 updates and one warn).
    - 8 blank-line collapse (`A\n\n\n\nB` after tag removal becomes `A\n\nB`).
    - 9 empty / null / non-string input.
    - 10 whitespace around `=` and around the tag.
    - 11 verify the parser does not mutate or look at fields outside `<form-update>` (random `<other-tag>` left intact).
  - **Done when**: All parser tests pass via `npm run test:unit`; `npm run lint` passes.
  - **Requirements satisfied**: [R2.1], [R2.3], [R2.4], [R2.5], [R6.1], [R6.2], [R6.3], [R6.5], [R6.6]
  - **Depends on**: 2, 3

- [ ] 5. Build `case-schemas.ts` registry + `getCaseSnapshot` helper
  - **Goal**: Pure snapshot read against `PCore.getStoreValue('.', 'caseInfo.content', context)` with whitelist/denylist filtering, `_fields` map, and size-cap enforcement.
  - **Files to create or modify**:
    - `src/lib/genai/case-schemas.ts` (NEW) — Incident only for MVP
    - `src/lib/genai/snapshot.ts` (NEW) — exports `getCaseSnapshot`
    - `tests/unit/genai/snapshot.test.ts` (NEW)
  - **Steps**:
    - In `case-schemas.ts`, export `caseSchemas` exactly as in design §14 keyed by `'SL-FW-Work-Incident'` with `IncidentType`, `IncidentSubType`, `Description`, `Severity`. No other case types.
    - In `snapshot.ts`:
      - `declare const PCore: any;`
      - `getCaseSnapshot(rootPConnect)` returns `null` when `rootPConnect` is null (R1.3).
      - Wrap PCore read in try/catch; on failure call `logSnapshotWarn` (stub via `console.warn` until task 6) and return `null` (R1.4).
      - Implement `filterFields(content, whitelist, denylist)` — drops null/undefined values (R1.5), drops denylisted keys, applies whitelist if non-null.
      - Implement `buildFieldsMap(rootPConnect)` — try `rootPConnect.getReferencedView()` (gracefully fall back to `caseSchemas[content.pxObjClass] ?? {}`); never throw.
      - Implement `enforceSizeCap(snapshot, maxBytes)` — `JSON.stringify` and measure `Buffer.byteLength` if Node, else `new TextEncoder().encode(json).length`; if over cap, drop denylisted entries first, then sort remaining string values by length DESC and drop until under cap; log a single warn naming the dropped keys via `logSnapshot({ truncated: true, dropped })` (stub for now).
      - Always count `_fields` toward the cap (R5.4).
      - Omit `_fields` from the output object when the map is empty (R5.3).
  - **Tests / verification** (`tests/unit/genai/snapshot.test.ts`):
    - Mock `PCore` as a global with `getStoreValue` returning a fixture content payload.
    - Mock `rootPConnect` with `getContextName: () => 'app/primary_1'` and either a `getReferencedView` returning view metadata or omitted (to exercise the registry fallback).
    - Cases: (1) returns `null` when `rootPConnect` is null, (2) returns `null` when content is empty/non-object, (3) drops denylisted keys, (4) drops null/undefined, (5) `_fields` populated from registry when view metadata absent, (6) `_fields` omitted entirely when both sources empty, (7) cap enforcement drops largest strings first and logs once, (8) `caseID` falls back from `pyID` to `caseID` to `null`.
  - **Done when**: All snapshot tests pass; `npm run lint` passes.
  - **Requirements satisfied**: [R1.2], [R1.3], [R1.4], [R1.5], [R1.6], [R5.1], [R5.3], [R5.4]
  - **Depends on**: 2, 3

- [ ] 6. Build `logger.ts` and `applyFormUpdate.ts`
  - **Goal**: Centralized observability helpers + the field-mutation entry point used by the chat runtime.
  - **Files to create or modify**:
    - `src/lib/genai/logger.ts` (NEW)
    - `src/lib/genai/applyFormUpdate.ts` (NEW)
    - `src/lib/genai/formUpdateParser.ts` (MODIFY — replace temporary `console.warn` stubs with imports from `logger.ts`)
    - `src/lib/genai/snapshot.ts` (MODIFY — replace temporary `console.warn` stubs with imports from `logger.ts`)
    - `tests/unit/genai/applyFormUpdate.test.ts` (NEW)
    - `tests/unit/genai/logger.test.ts` (NEW, lightweight)
  - **Steps**:
    - In `logger.ts` implement `logFormUpdate`, `logFormUpdateWarn`, `logSnapshot`, `logSnapshotWarn`, `logParserWarn` per design §10. Use `import.meta.env.DEV` to pick `console.info` vs `console.debug` (R11.4).
    - In `applyFormUpdate.ts`:
      - Maintain a module-scoped `seenUnknownFields = new Set<string>()` for session-level dedup (R9.4).
      - `applyFormUpdate({ field, value })`:
        - read `usePegaCaseStore.getState()`;
        - if no `rootPConnect`, log `skipped:no-case` debug entry and return (R8.4);
        - call `isKnownField(rootPConnect, field)` (consult `buildFieldsMap` from `snapshot.ts` plus `caseSchemas`); if unknown, dedup-warn and return (R5.2);
        - try/catch around `getActionsApi().updateFieldValue(field, value)` then `triggerFieldChange(field, value)` (R2.2); log `applied` on success, `error` on catch.
      - Export `isKnownField` for testability and to allow reuse from other tasks (e.g. dropdown unmatched-option check could share the same registry).
    - Update `formUpdateParser.ts` and `snapshot.ts` to import from `logger.ts` instead of using `console.*` directly.
  - **Tests / verification** (`tests/unit/genai/applyFormUpdate.test.ts`):
    - Mock `usePegaCaseStore.getState` (manual mock or by importing the real store and calling `setCase`/`clearCase`).
    - Cases: (1) no-op when no case (logs `skipped:no-case`), (2) unknown field warns once for repeated calls (dedup), (3) known field calls `updateFieldValue` then `triggerFieldChange` in that order, (4) thrown error in `updateFieldValue` is caught and logged as `error`, (5) `applyFormUpdate` itself never throws to the caller.
    - `tests/unit/genai/logger.test.ts`: assert `logFormUpdate` calls `console.info` in dev (mock `import.meta.env.DEV` via Jest module mock or by spying on console).
  - **Done when**: All tests pass; `npm run lint` passes; parser + snapshot use real logger.
  - **Requirements satisfied**: [R2.2], [R2.6], [R5.2], [R8.4], [R9.1], [R9.2], [R9.3], [R9.4], [R9.5], [R11.4]
  - **Depends on**: 1, 4, 5

### Phase 3: Integration — store population and chat runtime wiring

- [ ] 7. Wire `useCustomPegaCase` into `usePegaCaseStore`
  - **Goal**: Publish `rootPConnect` + `caseId` to the shared store on `phase === 'active'`, clear on idle/completed/error and on unmount.
  - **Files to create or modify**:
    - `src/hooks/useCustomPegaCase.ts` (MODIFY)
  - **Steps**:
    - Import `usePegaCaseStore` (do not subscribe — call `getState()` inside effects).
    - Add the three effects from design §2 after the existing effect block (around line 302):
      - `useEffect` on `[phase, rootPConnect, caseId]` calling `setCase(caseId, rootPConnect)` when `phase === 'active' && rootPConnect && caseId`.
      - `useEffect` on `[phase]` calling `clearCase()` when phase is `idle` / `completed` / `error`.
      - Unmount-only `useEffect(() => () => clearCase(), [])`.
    - Do NOT change any other behavior of `useCustomPegaCase`.
    - Verify with `npm run lint` and a quick app boot (`npm run start-dev`) that the existing `/support/new/$caseId` route still mounts and creates a case.
  - **Tests / verification**:
    - Manual smoke: open `/support/new/<id>` in dev, then in DevTools console run `usePegaCaseStore.getState()` and confirm `caseId` + `rootPConnect` are populated; navigate away and confirm both reset to `null`.
    - Optional unit test (`tests/unit/hooks/useCustomPegaCase.store.test.tsx`) using RTL `renderHook` with a mocked `useCustomPegaCase` internals — defer if it requires too much PCore mocking.
  - **Done when**: Store reflects active-case lifecycle in dev, `npm run lint` passes, no regressions in `useCustomPegaCase`.
  - **Requirements satisfied**: [R3.2], [R3.3], [R3.5], [R3.6], [R7.5]
  - **Depends on**: 1

- [ ] 8. Modify `usePegaAgentRuntime` to use snapshot prefix and apply parsed updates
  - **Goal**: Pre-send: prepend `[Current form state: …]` per R1; post-receive: parse + apply in microtask, render `cleanText` with non-empty fallback, attach an `announcement` to the assistant message.
  - **Files to create or modify**:
    - `src/lib/genai/usePegaAgentRuntime.ts` (MODIFY)
  - **Steps**:
    - Import `genaiConfig`, `getCaseSnapshot`, `parseFormUpdates`, `applyFormUpdate`, `usePegaCaseStore`.
    - Add `buildOutgoing(userText)` per design §7(a): if `!genaiConfig.snapshotEnabled` (R11.1) or `!snapshot`, return `userText`; else return `[Current form state: ${JSON.stringify(snapshot)}]\n\nUser: ${userText}`.
    - In the existing send flow:
      - `setMessages` for the user message stores `userText` only — never the enriched payload (R1.7).
      - Pass `enriched` to `sendMessage({ ... message: enriched ... })`.
    - On response:
      - `const { updates, cleanText } = parseFormUpdates(data.response);`
      - If `genaiConfig.formUpdatesEnabled && updates.length > 0`, `queueMicrotask(() => { for (const u of updates) applyFormUpdate(u); })` (R7.3, R11.2).
      - `const visible = cleanText.trim() || 'Updated the form for you.';` (R8.3)
      - `const announcement = updates.length > 0 ? \`Updated ${updates.map((u) => \`${u.field} to ${u.value}\`).join(', ')}.\` : undefined;` (R10.2)
      - Append `{ id, role: 'assistant', content: visible, announcement }`.
    - Preserve existing `isRunning` guard (R7.2) and `resetConversation` behavior (R8.5) — do not touch the form on reset.
    - Emit `logSnapshot({ bytes, fieldCount })` from inside `buildOutgoing` after stringifying the snapshot, so size telemetry is observable per send (R9.3).
  - **Tests / verification**:
    - Component tests in task 11 cover this end-to-end. For now, smoke test in dev: send a message, inspect the network call payload for the `[Current form state:` prefix (or stub the GenAI client to log the outgoing message).
    - `npm run lint` must pass.
  - **Done when**: Sending a message with an active case includes the snapshot prefix, transcript shows only the user's text, response with `<form-update>` tags strips them and shows the natural-language reply (or the fallback), and disabling either flag has the documented effect.
  - **Requirements satisfied**: [R1.1], [R1.7], [R2.1], [R2.3], [R2.4], [R2.5], [R7.2], [R7.3], [R8.3], [R8.5], [R10.2], [R11.1], [R11.2], [R9.3]
  - **Depends on**: 1, 2, 4, 5, 6, 7

### Phase 4: Field-level reconciliation (one subtask per field family)

- [ ] 9. Add `usePCoreFieldSubscription` hook and wire into `TextInput`
  - **Goal**: Reusable PCore-store subscription that reconciles a locally-buffered input with external mutations; first consumer is `TextInput` (smallest blast radius).
  - **Files to create or modify**:
    - `src/lib/custom-pega/hooks/usePCoreFieldSubscription.ts` (NEW)
    - `src/lib/custom-pega/fields/TextInput.tsx` (MODIFY — lines around 22-26 per design §6)
    - `tests/unit/custom-pega/hooks/usePCoreFieldSubscription.test.ts` (NEW)
    - `tests/unit/custom-pega/fields/TextInput.test.tsx` (NEW)
  - **Steps**:
    - Implement the hook per design §6: subscribes via `PCore.getStore().subscribe(...)`; reads via `PCore.getStoreValue(\`.${propName}\`, 'caseInfo.content', context)`; calls `setLocal(next)` on divergence regardless of focus (last-write-wins, R4.2); returns unsubscribe in cleanup (R4.4).
    - In `TextInput.tsx`: add `const inputRef = useRef<HTMLInputElement>(null);`, attach to the rendered `<Input ref={inputRef} ... />`, replace the existing buffer-sync effect with a call to `usePCoreFieldSubscription(propName, contextName, externalValue, setLocal, () => document.activeElement === inputRef.current)`.
    - Do not change validation, label, or accessibility wiring (R10.5).
  - **Tests / verification**:
    - Hook unit test mocks `PCore.getStore` (with `subscribe`/`unsubscribe`) and `PCore.getStoreValue`; asserts: subscribe on mount, setLocal called when value changes, NOT called on identical value, unsubscribe on unmount.
    - `TextInput.test.tsx` (RTL): render with a stubbed `getPConnect`; simulate an external change by triggering the mocked store subscriber and assert the input reflects the new value (both when focused and unfocused).
  - **Done when**: Tests pass; manual check — type in a `TextInput` while a chat-driven update arrives: the chat update wins.
  - **Requirements satisfied**: [R4.1], [R4.2], [R4.4], [R7.1]
  - **Depends on**: 7

- [ ] 10. Apply `usePCoreFieldSubscription` to remaining buffered fields and to `Dropdown` / `Checkbox`
  - **Goal**: Replicate the task-9 pattern across the remaining custom field components, plus add `Dropdown` unmatched-option handling.
  - **Files to create or modify**:
    - `src/lib/custom-pega/fields/TextArea.tsx` (MODIFY)
    - `src/lib/custom-pega/fields/Currency.tsx` (MODIFY)
    - `src/lib/custom-pega/fields/Email.tsx` (MODIFY)
    - `src/lib/custom-pega/fields/Phone.tsx` (MODIFY)
    - `src/lib/custom-pega/fields/DateInput.tsx` (MODIFY)
    - `src/lib/custom-pega/fields/Dropdown.tsx` (MODIFY)
    - `src/lib/custom-pega/fields/Checkbox.tsx` (MODIFY)
    - `tests/unit/custom-pega/fields/Dropdown.test.tsx` (NEW)
  - **Steps**:
    - For each buffered field (`TextArea`, `Currency`, `Email`, `Phone`, `DateInput`): mirror task-9 pattern (ref + hook call). Currency and DateInput keep their existing parse/format logic; the hook only writes the canonical value.
    - For `Dropdown` (around lines 80-86): add the subscription so external value changes during/after open menu reflect (R4.3); when `localValue && !options.find((o) => o.key === localValue)`, log a single warn `[Pega GenAI][form-update] dropdown value not in options` and still pass through `localValue` to `<SelectValue>` (R4.5).
    - For `Checkbox`: add the subscription with bool-cast preserved (R4.3).
    - Keep all `aria-invalid`, `aria-describedby`, label associations untouched (R10.5).
  - **Tests / verification**:
    - `Dropdown.test.tsx` (RTL): (a) render with options and an external change to a known option → re-renders with new selection; (b) external change to an unknown option → warn fires once and `<SelectValue>` shows the raw string.
    - Smoke test the other field types in dev by manually calling `applyFormUpdate({ field: '<propName>', value: '...' })` from the DevTools console.
  - **Done when**: All seven field components subscribe and reconcile; `npm run lint` passes; tests pass.
  - **Requirements satisfied**: [R4.1], [R4.2], [R4.3], [R4.4], [R4.5], [R10.5]
  - **Depends on**: 9

### Phase 5: UI polish, component tests, e2e, docs

- [ ] 11. Add aria-live announcement region in `ChatPanel` and component tests
  - **Goal**: Surface `announcement` from assistant messages in a `role='status' aria-live='polite'` region; verify focus stays in composer; component tests cover render-without-tags and fallback message.
  - **Files to create or modify**:
    - `src/components/genai/ChatPanel.tsx` (MODIFY)
    - `tests/unit/components/genai/ChatPanel.test.tsx` (NEW)
  - **Steps**:
    - Track `lastAnnouncement` via local `useState`; update it when a new assistant message with `announcement` is appended (effect on `messages`).
    - Inside `ThreadPrimitive.Viewport` (or sibling within the panel), render `<div role='status' aria-live='polite' aria-atomic='true' className='sr-only'>{lastAnnouncement}</div>` (R10.2).
    - Confirm there are NO `focus()` calls in the form-update path (R10.1) and that the existing Radix `Popover` aria-label / focus trap is not modified (R10.4).
    - Component test: mock `usePegaAgentRuntime` to return canned `messages` (one assistant message with `content: 'Will do.'` and `announcement: 'Updated IncidentType to Product faulty.'`); assert (a) transcript shows `'Will do.'`, (b) no `<form-update` substring anywhere in the rendered DOM, (c) the live region contains the announcement text, (d) when `enabled={false}`, composer input is disabled and shows the "Waiting for Pega…" placeholder (R8.1).
  - **Tests / verification**:
    - `npm run test:unit` passes the new ChatPanel suite.
    - Manual screen-reader check is OUT OF SCOPE for this coding task; covered by the structural assertions above.
  - **Done when**: Component test green; live region visible to AT (verified by DOM presence + `aria-live` attr).
  - **Requirements satisfied**: [R8.1], [R10.1], [R10.2], [R10.4]
  - **Depends on**: 8

- [ ] 12. Playwright e2e: form-to-chat snapshot + chat-to-form update happy path
  - **Goal**: Single e2e spec exercising both directions against a mocked PCore + mocked GenAI client. If complexity exceeds one session, document deferral and ship only the chat-to-form direction.
  - **Files to create or modify**:
    - `tests/e2e/sweet-life/hybrid-chat-form-sync.spec.ts` (NEW)
    - `playwright.config.ts` (MODIFY only if a new project entry is required for `tests/e2e/sweet-life/`; otherwise reuse the default chromium project and an explicit `testMatch` glob)
  - **Steps**:
    - Use Playwright's `page.addInitScript` to install a global `PCore` shim BEFORE the SDK boots, with stubbed `getStoreValue`, `getStore`, `getGenAIAssistantUtils`, `getMashupApi`, container utils. Reuse the chat-mock shape from `src/lib/genai/pegaGenAIClient.ts` so `createConversationForAgent` and `sendMessageForAgent` return canned responses.
    - Scenario A (chat-to-form): empty form, agent returns `<form-update field='IncidentType' value='Product faulty'/>Will do.`; assert the dropdown displays "Product faulty" and the chat shows `Will do.` with no raw tag.
    - Scenario B (form-to-chat): pre-fill the dropdown via the mocked store, send "what did I select?", intercept the outgoing `sendMessage` call (via the same mock) and assert the message body starts with `[Current form state:` and includes the chosen value.
    - Scenario C (no case open): navigate to `/`, send a message, assert no snapshot prefix and no console errors.
    - If wiring the global PCore shim proves prohibitively expensive, ship only Scenario A and add a `test.skip(true, 'deferred to integration phase')` for B/C with a comment linking to this task and to design §12.
  - **Tests / verification**:
    - `npm test` (Playwright) runs the new spec and exits zero. The default config targets chromium with 120s timeout; ensure the new spec stays well under that.
  - **Done when**: At least scenario A passes in CI; deferrals (if any) are explicitly marked.
  - **Requirements satisfied**: [R1.1], [R2.1], [R2.4], [R7.4]
  - **Depends on**: 8, 10, 11

- [ ] 13. Component test: external mutations against `TextInput` and `Dropdown` (race + focus)
  - **Goal**: Lock down R4 / R7.1 behavior with focused RTL tests that don't require Playwright.
  - **Files to create or modify**:
    - `tests/unit/custom-pega/fields/TextInput.race.test.tsx` (NEW)
    - `tests/unit/custom-pega/fields/Dropdown.race.test.tsx` (NEW)
  - **Steps**:
    - For `TextInput`: render with focus on the input, then trigger a mocked store subscriber callback with a new value; assert the input's `value` becomes the new external value (last-write-wins, R7.1) and `document.activeElement` is still the input (R10.1).
    - For `Dropdown`: render, programmatically push an external change to a value not in options, assert the warn is emitted exactly once and the displayed value is the raw external string (R4.5).
    - Use the same PCore mocking pattern as in task 9; centralize it in `tests/unit/custom-pega/_mocks/pcore.ts` if duplicated.
  - **Tests / verification**:
    - `npm run test:unit` passes new race specs.
  - **Done when**: Both specs pass; lint clean.
  - **Requirements satisfied**: [R4.5], [R7.1], [R10.1]
  - **Depends on**: 9, 10

- [ ] 14. Documentation update — replace or extend `docs/HYBRID-CHAT-FORM-PLAN.md`
  - **Goal**: Reflect the shipped implementation. Either append a "Final Implementation" section pointing at `specs/hybrid-chat-form-sync/` or replace the file with a short stub linking to the spec.
  - **Files to create or modify**:
    - `docs/HYBRID-CHAT-FORM-PLAN.md` (MODIFY)
  - **Steps**:
    - Read the current contents of `docs/HYBRID-CHAT-FORM-PLAN.md` to decide between replace and append.
    - If appending: add a section titled `## Hybrid chat-form sync — shipped implementation` with: (1) one-paragraph summary, (2) link to `specs/hybrid-chat-form-sync/requirements.md` and `design.md`, (3) the two env flags + their defaults, (4) the registry location (`src/lib/genai/case-schemas.ts`) for adding new case types, (5) brief note that the Pega Agent prompt instruction is configured server-side and is out-of-repo.
    - If replacing: keep a short note (5-10 lines) with the same five bullets and the spec links.
    - Do NOT document any server-side Pega rule edits beyond the existing "agent prompt is updated separately" sentence.
  - **Tests / verification**:
    - Manual read-through; ensure no stale instructions remain that contradict the shipped code.
    - `npm run lint` (Biome doesn't lint markdown but should still pass on the rest of the tree).
  - **Done when**: The doc accurately points readers from the planning artifact to the spec + code.
  - **Requirements satisfied**: developer-facing, supports [R11.3] discoverability
  - **Depends on**: 8, 10
