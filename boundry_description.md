● Great document you've put together. Let me break down the boundaries between these layers in a way that should make it click.

  The 4 Layers (and who does what)

  Think of it as a stack where each layer has one job:

  ┌─────────────────────────────────────────────────┐
  │  YOUR CODE (React components + Tailwind/Shadcn) │  ← What the user sees
  │  "The Skin"                                     │
  ├─────────────────────────────────────────────────┤
  │  COMPONENT MAP (sdk-local-component-map.js)     │  ← The wiring
  │  "The Switchboard"                              │
  │  Maps type strings → React components           │
  ├─────────────────────────────────────────────────┤
  │  PConnect API (pConn object)                    │  ← The interface contract
  │  "The Translator"                               │
  │  Exposes engine data as props your UI can read  │
  ├─────────────────────────────────────────────────┤
  │  ConstellationJS Engine + PCore                 │  ← The brain
  │  "The Backend-on-the-Client"                    │
  │  Auth, state, validation, API calls, events     │
  └─────────────────────────────────────────────────┘

  Layer by layer:

  ConstellationJS Engine (bottom) — You never touch this. It:
  - Authenticates with Pega server (OAuth)
  - Calls DX API v2 to fetch case metadata and data
  - Manages all form state (field values, dirty tracking, WIP save)
  - Runs server-side validation rules
  - Handles cascading fields (field B changes when field A changes)
  - Controls dynamic visibility (show/hide based on rules)
  - Builds a tree of PConnect nodes — one per UI element the server says to render

  PConnect API (the contract) — This is the boundary you code against. Each pConn object is a thin wrapper that lets you read what the engine knows and write back user actions:
  - pConn.getComponentName() → "What type am I?" (e.g., "TextInput")
  - pConn.getConfigProps() → "What are my props?" (label, required, readOnly)
  - pConn.getChildren() → "What's nested inside me?" (array of child pConns)
  - pConn.getValue() → "What's the current value?"
  - pConn.getActionsApi() → "How do I tell the engine the user changed something?"

  Component Map (the switchboard) — This is the only thing the React SDK really does at its core. It's a lookup table:
  "TextInput"    → <CosmosTextField />     (default)
  "TextInput"    → <YourShadcnInput />     (if you override it)
  The SDK's getSdkComponentMap() merges your overrides with defaults. That's it.

  Your Components (top) — Pure React. They receive a pConn, read what they need, render whatever JSX you want, and call actionsApi when the user interacts. They know nothing about Pega internals.

  ---
  The key confusion point

  The React SDK (@pega/react-sdk-components) is really doing two things that feel like one:

  1. Bridge utilities — handleEvent(), loginIfNecessary(), myLoadMashup() — these are glue between ConstellationJS and React. You'll keep using these regardless of approach.
  2. Cosmos UI components — the actual <TextInput>, <Dropdown>, <CaseView> React components with Pega styling. This is what you're replacing.

  When your doc talks about "the SDK," it usually means #2. The bridge utilities (#1) are still useful even in Approach B.

  ---
  Who owns what — at a glance

  ┌───────────────────────────────────────┬────────────────────────────────────────┬─────────────────────────────────┐
  │                Concern                │                 Owner                  │          You touch it?          │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ OAuth login                           │ ConstellationJS + @pega/auth           │ No (just call loginIfNecessary) │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ REST calls to Pega                    │ ConstellationJS engine                 │ No                              │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ Field validation                      │ ConstellationJS engine                 │ No (just call handleEvent)      │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ Cascading fields                      │ ConstellationJS engine                 │ No                              │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ "What components to render"           │ ConstellationJS (builds PConnect tree) │ No                              │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ "Which React component for this type" │ Component Map                          │ Yes — this is your seam         │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ "How it looks"                        │ Your React components                  │ Yes — full control              │
  ├───────────────────────────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
  │ "User changed a value"                │ Your component → actionsApi → Engine   │ Yes — you fire the event        │
  └───────────────────────────────────────┴────────────────────────────────────────┴─────────────────────────────────┘

  The mental model: ConstellationJS is a headless form engine. It tells you what to render and what state each field has. You decide how it looks. PConnect is the API contract between the two.

● User answered Claude's questions:
