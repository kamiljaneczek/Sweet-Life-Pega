# Requirements Document

## Introduction

The Hybrid Chat-Form Sync feature establishes bidirectional state synchronization between the Pega Constellation case form (rendered via custom PConnect components on the left of the `/support/new/$caseId` route) and the Pega GenAI Assistant chat panel (rendered globally by `ChatLauncher` and mounted in `__root.tsx`). Today the chat is a one-way text channel: it cannot read what the user has typed into the form, and the form cannot be driven from natural-language commands typed into the chat. This feature makes the PCore case store the single source of truth and treats both UIs as views over that store.

The business value is twofold. First, support agents and self-service customers can describe their incident conversationally ("set incident type to Product faulty, severity high") and have the agent fill the form on their behalf, dramatically reducing time-to-submit and field-discovery friction. Second, the agent always has accurate context about what the user has filled in so far, which improves the quality of suggestions, validation hints, and follow-up questions. The same assistant continues to work as a generic helper when no case is open (for example on the home route), so the feature degrades gracefully rather than becoming context-dependent.

The primary users are end customers filing incidents on the Sweet Life storefront, support staff triaging cases, and the developers extending the custom PConnect renderer who need a stable contract between the chat runtime and the case store. The problem solved is the disconnect between a deterministic structured form and a free-form conversational surface that today share no state.

## Requirements

### Requirement 1: Form-to-Chat State Snapshot [R1]

**User Story:** As a customer filling an incident form, I want the chat assistant to know what I have already entered, so that I can ask follow-up questions like "what did I select?" or "is this enough information?" without having to re-state my answers.

#### Acceptance Criteria
1. WHEN the user sends a chat message AND a case is open AND `rootPConnect` is available THEN the system SHALL prepend a `[Current form state: {json}]\n\nUser: {text}` snapshot prefix to the message body before calling `sendMessageForAgent`.
2. WHEN building the snapshot THEN the system SHALL read the current case content via `PCore.getStoreValue('.', 'caseInfo.content', context)` rather than from React component state, so that unsaved buffered changes are also visible.
3. WHEN no case is open (for example on the home route or before `useCustomPegaCase` has resolved) THEN the system SHALL send the user message verbatim without a snapshot prefix and SHALL NOT log an error.
4. IF the snapshot read throws or returns `null`/`undefined` THEN the system SHALL fall back to sending the message without a snapshot and SHALL log a single warning via the existing `decorateError`-style console pattern.
5. WHEN the snapshot is serialized THEN the system SHALL exclude null/undefined values and SHALL apply a configurable property whitelist or denylist so that PII fields and Pega internal metadata (for example `pxObjClass`, `pzInsKey`, attachments) are not transmitted by default.
6. WHEN the serialized snapshot exceeds a configured size cap (default 8 KB of JSON) THEN the system SHALL truncate or drop low-priority fields and SHALL log a warning identifying which keys were dropped.
7. WHEN the chat message is rendered in the chat transcript UI THEN the system SHALL display only the user's original text and SHALL NOT show the `[Current form state: ...]` prefix to the user.

### Requirement 2: Chat-to-Form Field Updates via `<form-update>` Tags [R2]

**User Story:** As a customer who prefers conversational input, I want to ask the assistant to fill the form for me ("set incident type to Product faulty"), so that I do not have to navigate the form structure manually.

#### Acceptance Criteria
1. WHEN the agent response contains one or more self-closing `<form-update field='X' value='Y'/>` tags THEN the system SHALL parse each tag into a `FormUpdate { field: string, value: string }` record.
2. WHEN a `FormUpdate` is parsed AND a case is open THEN the system SHALL call `rootPConnect.getActionsApi().updateFieldValue(field, value)` followed by `triggerFieldChange(field, value)` so that PCore store, validation, and dependent data pages all refresh.
3. WHEN multiple `<form-update>` tags appear in a single response THEN the system SHALL apply them in document order before rendering the assistant message.
4. WHEN the assistant message is rendered in the chat transcript THEN the system SHALL strip every `<form-update.../>` tag (and any surrounding whitespace introduced solely by the tag) from the displayed text so the user only sees the natural-language reply.
5. IF the parsed response contains no `<form-update>` tags THEN the system SHALL render the response unchanged and SHALL NOT call `applyFormUpdate`.
6. WHEN a `FormUpdate` is applied THEN the system SHALL log a structured debug entry (`field`, `value`, `caseId`) so developers can audit chat-driven mutations.

### Requirement 3: Shared Pega Case State Across Route Hierarchy [R3]

**User Story:** As a developer maintaining the custom Constellation rendering, I want a single shared mechanism that exposes the active case's `rootPConnect`, snapshot reader, and field-update applier to both the form (deep in the route tree) and the chat (mounted in `__root.tsx`), so that I do not have to thread props through every layout layer.

#### Acceptance Criteria
1. WHERE `ChatLauncher` is mounted in `__root.tsx` AND `useCustomPegaCase` is mounted in the `/support/new/$caseId` route THEN the system SHALL provide a shared store (for example `usePegaCaseStore` Zustand store or a Context provider hoisted to the root) that both can access without prop drilling.
2. WHEN `useCustomPegaCase` enters the `active` status THEN the system SHALL call `setRootPConnect(rootPConnect, caseId)` exactly once on the shared store.
3. WHEN the case route unmounts OR `useCustomPegaCase` enters `idle` or `completed` status THEN the system SHALL call `clearRootPConnect()` so stale references are not used by the chat.
4. WHEN the chat reads from the shared store THEN the system SHALL expose `getCaseSnapshot()` and `applyFormUpdate(field, value)` helpers that internally check for `rootPConnect` presence and no-op safely when absent.
5. WHEN the route changes from a case route to a non-case route THEN the system SHALL not retain a reference to a destroyed PConnect instance.
6. IF two case routes are visited in sequence THEN the system SHALL replace the previous `rootPConnect` reference and SHALL NOT leak listeners or store subscriptions from the prior case.

### Requirement 4: External Field Mutations Reflect in Locally Buffered Inputs [R4]

**User Story:** As a customer watching the form fill itself from a chat command, I want every visible input (including text fields that normally only commit on blur) to update immediately, so that I trust the assistant actually changed what it claimed.

#### Acceptance Criteria
1. WHEN a chat-driven `updateFieldValue` writes to a property that is bound to a `TextInput`, `TextArea`, `Email`, `Phone`, `Currency`, or `DateInput` field that buffers input locally until blur THEN the field component SHALL reconcile its local buffer with the new PCore store value.
2. WHEN the locally-buffered field has focus AND its PCore store value changes externally THEN the system SHALL replace the buffer with the new value and SHALL NOT preserve stale unblurred keystrokes (last-write-wins).
3. WHEN a `Dropdown` or `Checkbox` field receives an external value change THEN the system SHALL re-render with the new selection without requiring user interaction.
4. WHEN any custom field component subscribes to the PCore store for external updates THEN the system SHALL unsubscribe on unmount to prevent memory leaks.
5. WHEN an external update arrives with a value that is not a member of the field's enumerated options (for `Dropdown`) THEN the system SHALL still write the value to PCore, render the raw value as the displayed selection, and SHALL log a warning identifying the field and the unmatched value.

### Requirement 5: Property Name Discovery for the Agent [R5]

**User Story:** As an end user using human labels ("Incident Type", "Severity"), I want the assistant to translate them to the correct internal property names (`IncidentType`, `pyDeterminationType`), so that field updates land on the right Pega property.

#### Acceptance Criteria
1. WHEN building the snapshot prefix THEN the system SHALL include a `_fields` map of `{ propertyName: { label, type } }` derived from the active view's PConnect metadata so the agent can resolve human labels to property names.
2. IF the agent emits a `<form-update field='X' .../>` whose `field` is not a known property on the current case THEN the system SHALL skip the update, SHALL NOT throw, and SHALL log a warning identifying the unknown field name.
3. WHEN the `_fields` map cannot be derived (no view available, PConnect missing) THEN the system SHALL omit `_fields` from the snapshot and SHALL still send the rest of the message.
4. WHEN the `_fields` map is included THEN the system SHALL count its serialized size against the snapshot size cap defined in R1.6.

### Requirement 6: Robust Tag Parser [R6]

**User Story:** As a developer integrating with an LLM-backed agent, I want the `<form-update>` parser to be tolerant of malformed or partial tags, so that a model hallucination cannot crash the chat surface.

#### Acceptance Criteria
1. WHEN the parser encounters a malformed tag (missing closing slash, unquoted attribute, mismatched quotes, nested tag, attribute order swapped) THEN the system SHALL skip that tag, leave it in the displayed text, and SHALL NOT throw.
2. WHEN the parser encounters a tag with an empty `field` or missing `value` attribute THEN the system SHALL skip that tag and log a warning.
3. WHEN parsing THEN the system SHALL accept both single-quoted and double-quoted attribute values and SHALL handle HTML entity escaping (`&amp;`, `&quot;`, `&apos;`) in attribute values.
4. WHEN parsing THEN the system SHALL only operate on the assistant's response string and SHALL NEVER parse user input for `<form-update>` tags.
5. WHEN the response contains 100 or more tags THEN the system SHALL cap processing at the first 50 tags and SHALL log a warning, to bound work in pathological cases.
6. WHEN the parser strips tags from the displayed text THEN the system SHALL collapse runs of two or more consecutive blank lines introduced by tag removal into a single blank line.

### Requirement 7: Concurrent User-and-Agent Edits (Race Conditions) [R7]

**User Story:** As a customer who keeps editing the form while waiting for the assistant's reply, I want predictable behavior when my edits and the assistant's edits target the same field, so that I am not surprised by lost work or unexpected reverts.

#### Acceptance Criteria
1. WHEN the user mutates a field locally AND a chat-driven `applyFormUpdate` for the same field arrives before the chat reply is rendered THEN the system SHALL apply the chat update (last-write-wins) and SHALL render the assistant message normally.
2. WHEN a chat reply is in flight AND the user submits another chat message THEN the system SHALL queue or reject the second send according to the existing `isRunning` guard and SHALL NOT interleave two `applyFormUpdate` batches against the same case.
3. WHEN `applyFormUpdate` is called THEN the system SHALL invoke PCore actions on the next microtask (not synchronously inside the response handler) so that React rendering of the assistant message is not blocked.
4. WHEN rapid form mutations are driven from chat (5 or more `<form-update>` tags in a single response) THEN the system SHALL produce zero uncaught errors, zero React warnings, and zero PCore lifecycle errors in the browser console.
5. WHEN the user navigates away from the case route while a chat reply is in flight THEN the system SHALL drop pending `applyFormUpdate` calls (because `rootPConnect` is cleared per R3.3) and SHALL NOT throw.

### Requirement 8: Graceful Degradation When Pega or Agent Is Unavailable [R8]

**User Story:** As a user opening the chat before Pega has finished initializing or while the GenAI service is down, I want clear feedback rather than a frozen UI, so that I know whether to retry or wait.

#### Acceptance Criteria
1. WHEN `enabled` is `false` (Pega not ready) THEN the system SHALL disable the composer input, display a "Waiting for Pega…" placeholder, and SHALL NOT call `createConversation` or `sendMessage`.
2. WHEN `createConversationForAgent` or `sendMessageForAgent` rejects THEN the system SHALL surface the decorated error message in the existing chat error banner and SHALL append a single assistant message prefixed with a warning marker.
3. WHEN the agent response is received but contains only `<form-update>` tags and no natural-language text THEN the system SHALL render a non-empty fallback message ("Updated the form for you.") so the chat does not appear silent.
4. IF `applyFormUpdate` is invoked while no case is open THEN the system SHALL no-op silently, SHALL NOT throw, and SHALL log a single debug entry.
5. WHEN the runtime is reset via the "New" button THEN the system SHALL clear messages, conversation ID, error, and `isRunning` flag and SHALL NOT clear or mutate the form on the left.

### Requirement 9: Observability and Diagnostics [R9]

**User Story:** As a developer debugging a sync issue in production, I want consistent logs and error decoration for every cross-surface interaction, so that I can correlate a chat message with a form mutation and a Pega API call.

#### Acceptance Criteria
1. WHEN any GenAI call fails THEN the system SHALL route the error through the existing `decorateError(op, params, err)` pattern in `pegaGenAIClient.ts` so HTTP status, method, URL, and response body are captured.
2. WHEN a `FormUpdate` is parsed, applied, or rejected (unknown field, malformed tag) THEN the system SHALL emit a console entry tagged `[Pega GenAI][form-update]` with the field name, value, caseId, and outcome.
3. WHEN the snapshot prefix is built THEN the system SHALL emit a debug entry with the serialized snapshot byte size and the number of fields included so size-cap regressions are visible.
4. WHEN the parser is rate-limited per R6.5 OR the snapshot is truncated per R1.6 THEN the system SHALL emit a single warning per occurrence (not per skipped item) so logs are not flooded.
5. WHEN logging values from the form THEN the system SHALL respect the same whitelist/denylist as R1.5 so PII is not echoed to the console.

### Requirement 10: Accessibility [R10]

**User Story:** As a keyboard or screen-reader user, I want chat-driven form changes to be announced and I want focus to remain in the chat composer, so that I can continue conversing without losing my place.

#### Acceptance Criteria
1. WHEN `applyFormUpdate` mutates a field on the left THEN the system SHALL NOT move keyboard focus away from the chat composer.
2. WHEN one or more form fields are updated by the assistant THEN the system SHALL announce the change via an `aria-live="polite"` region (for example, "Incident Type set to Product faulty") that is part of the chat transcript area.
3. WHEN the assistant response renders after tag stripping THEN the system SHALL ensure the visible message text is non-empty (per R8.3) so screen readers are not silent after a successful form update.
4. WHEN the chat panel is opened or closed THEN the system SHALL preserve all existing focus-trap and `aria-label` behavior already implemented by the Radix `Popover` in `ChatLauncher`.
5. WHEN a custom field component re-renders due to an external update (R4) THEN the system SHALL preserve its existing `aria-invalid`, `aria-describedby`, and label associations.

### Requirement 11: Configurability and Feature Flags [R11]

**User Story:** As a developer rolling this out incrementally, I want both directions of the sync to be toggleable independently, so that I can ship form-to-chat snapshotting first and enable chat-to-form mutations after agent-side prompt tuning.

#### Acceptance Criteria
1. WHEN `VITE_PEGA_CHAT_SNAPSHOT_ENABLED` is set to `"false"` THEN the system SHALL send user messages without the snapshot prefix regardless of case state.
2. WHEN `VITE_PEGA_CHAT_FORM_UPDATES_ENABLED` is set to `"false"` THEN the system SHALL still strip `<form-update>` tags from displayed text but SHALL NOT call `applyFormUpdate`.
3. WHEN the snapshot size cap, field whitelist, and parser tag-count cap are configured THEN the system SHALL read them from a single module-level config (defaults documented) so they can be tuned without changing call sites.
4. WHERE `import.meta.env.DEV` is true THEN the system SHALL surface tag-parse outcomes and snapshot size in the dev console at `info` level; in production builds the same data SHALL be at `debug` level.

## Out of Scope

The following are explicitly excluded from this MVP and SHALL NOT be implemented as part of this feature. They may be considered for follow-up work but are not acceptance-criteria gated here.

1. Wizard navigation from chat (the agent CANNOT advance, regress, or jump to a different assignment step via chat commands).
2. Voice input or speech-to-text in the chat composer.
3. Streaming/token-by-token assistant responses; the chat continues to render full responses on completion.
4. Auto-save of the case from chat (the assistant CANNOT submit, save, or finalize an assignment).
5. File attachment upload or download driven from chat.
6. Multi-case context (the chat sees at most one active case at a time).
7. Server-side changes to the Pega Agent rule beyond the prompt instruction; no new Pega APIs are introduced.
8. Persistence of chat conversations across page reloads.
9. Localization of the snapshot prefix or `<form-update>` protocol; both are English-only and protocol-fixed.
10. Replacing or modifying Pega Constellation's built-in "Fill form with AI" widget where present.
