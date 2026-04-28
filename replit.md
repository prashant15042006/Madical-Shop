# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## MediGo Mobile App

Hindi/Hinglish medicine delivery Expo app. One app for both customers and dukandar (shopkeeper).

**Architecture (single shared shop)**:
- One shop row in PostgreSQL with id `"main"`. Many customers connect to this single dukandar.
- API server (`artifacts/api-server`) exposes REST endpoints under `/api` for shop, medicines, orders.
- Mobile (`artifacts/mobile`) talks to the API via generated React Query hooks from `@workspace/api-client-react` — base URL set in `lib/api-client.ts` from `EXPO_PUBLIC_DOMAIN`.
- AsyncStorage only stores UI role + the last customer mobile (used to filter "My Orders").
- DB schema in `lib/db/src/schema/{shops,medicines,orders}.ts`. Order item is embedded directly in the order row (no separate items table). Use `pnpm --filter @workspace/db run push` to sync.
- API contract in `lib/api-spec/openapi.yaml`. Run `pnpm --filter @workspace/api-spec run codegen` after changes.
- On API server boot, `ensureSeed()` creates the main shop and 7 default medicines if missing.
- Mobile screens use `useApp()` from `contexts/AppContext.tsx` which wraps the generated hooks.
