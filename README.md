# Sweet Life Pega

A sample e-commerce storefront ("Sweet Life" candy/confectionery brand) built with the **Pega Constellation React SDK** (v25.1.10). Connects to a Pega Infinity 25+ backend for case management, mashup UI rendering, and business logic. The frontend replaces Pega's default Constellation UI with custom components using **Tailwind CSS v4** and **ShadCN/Radix UI**.

> This is a community project — no SRs will be accepted by Pega GCS. If you find issues, please help fix them.

Check out the demo: [https://youtu.be/LrdKmpy3QCU](https://youtu.be/LrdKmpy3QCU)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for dev server and builds
- **TanStack Router** (file-based routing)
- **TanStack React Query** for server state management
- **Tailwind CSS v4** with ShadCN/Radix UI primitives
- **Biome** for linting and formatting
- **Pega Constellation React SDK** v25.1.10
- **Orval** for API client generation from OpenAPI specs

## Prerequisites

- **Pega Infinity 25+** server running a Constellation-enabled application
- **Node.js** 24.x+ and **npm** 11.x+
- OAuth 2.0 client registration configured on the Pega server

For Pega server setup, refer to [Downloading the Constellation SDK files](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/installing-constellation-sdks.html).

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your Pega server URL and OAuth credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run start-dev
   ```
   The app runs at [http://localhost:3502](http://localhost:3502).

## Scripts

| Command | Description |
|---|---|
| `npm run start-dev` | Dev server on localhost:3502 (Vite) |
| `npm run start-dev-https` | Dev server with HTTPS |
| `npm run build:dev` | Development build to ./dist |
| `npm run build:prod` | Production build with compression |
| `npm run start-prod` | Serve production build |
| `npm run lint` | Biome lint + format check |
| `npm run fix` | Biome auto-fix |
| `npm run api:generate` | Generate API client (Orval) |
| `npm run codegen:pega` | Generate Zod schemas from Pega DX API |
| `npm test` | Playwright e2e tests |
| `npm run test:headed` | Playwright with visible browser |
| `npm run test:functional` | Jest functional tests |
| `npm run storybookSDK` | SDK component stories (port 6040) |
| `npm run storybookConstellation` | Constellation component stories (port 6050) |

## Project Structure

```
src/
├── api/                    # Orval-generated API client + React Query hooks
├── app/                    # Page-level components
├── components/
│   ├── override-sdk/       # Custom replacements for Pega Constellation components
│   │   ├── field/          # Form fields (TextInput, Dropdown, Date, etc.)
│   │   ├── template/       # Layout templates (OneColumn, TwoColumn, CaseView, etc.)
│   │   ├── widget/         # Widgets (ToDo, FileUtility, CaseHistory, etc.)
│   │   ├── infra/          # Infrastructure (Assignment, FlowContainer, etc.)
│   │   └── designSystemExtension/
│   ├── custom-sdk/         # DXCB-created components
│   └── custom-constellation/ # DX components (published to Pega server)
├── design-system/ui/       # ShadCN/Radix UI primitives
├── hooks/                  # useConstellation, useCustomPegaCase
├── lib/
│   ├── custom-pega/        # Custom PConnect renderer (bypasses SDK rendering)
│   ├── constellation.tsx   # Mashup bootstrap
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
├── routes/                 # TanStack Router file-based routes
├── router.tsx              # Router configuration
└── index.tsx               # App entry point
```

## DX Component Builder (DXCB)

Build and publish custom Constellation DX components to the Pega server:

```bash
npm run authenticate         # Auth to Pega server
npm run create               # Create a new component
npm run buildComponent       # Build a single component
npm run publish              # Publish to Pega server
```

## Deployment

Deployed on **Vercel** with SPA rewrite configuration (`vercel.json`).

## Documentation

- [Constellation SDKs](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/constellation-sdks.html)
- [React SDK Updates](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/react-sdk-updates.html)
- [Installing Constellation SDKs](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/installing-configuring-constellation-sdks.html)
- [Troubleshooting](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/troubleshooting-constellation-sdks.html)
- [MediaCo Sample Application](https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/mediaco-sample-application.html)

## License

This project is licensed under the terms of the **Apache 2.0** license. See [LICENSE](LICENSE) for details.

## Contributing

We welcome contributions. See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.
