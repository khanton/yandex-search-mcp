# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server exposing four Yandex Wordstat tools via the [Yandex Search API](https://searchapi.api.cloud.yandex.net/v2/wordstat). Runs over stdio transport and is registered locally via `.mcp.json`.

## Commands

```bash
npm run build   # compile TypeScript → dist/
npm run dev     # watch mode (tsc --watch)
npm run start   # node dist/index.js
```

> **Note:** The package manifest is named `packages.json` (not `package.json`). If `npm` commands fail, run `tsc` directly.

## Architecture

```
src/
  index.ts          # MCP server entry: registers tools, connects stdio transport
  client.ts         # HTTP client for Yandex API (auth + folderId from env)
  tools/
    get-top.ts              # topRequests endpoint
    get-dynamics.ts         # dynamics endpoint
    get-regions-distribution.ts
    get-region-tree.ts
```

**Data flow:** `src/index.ts` registers each tool with its zod schema → on invocation calls the tool function → tool calls `callWordstat<T>(path, body)` in `client.ts` → formats API response as plain text → returns `{ content: [{ type: "text", text }] }`.

**Adding a new tool:** create `src/tools/<name>.ts` exporting a zod schema object and an async function, then register both in `src/index.ts` with `server.tool(...)`.

## Auth & Environment

| Variable | Required | Notes |
|---|---|---|
| `YANDEX_FOLDER_ID` | yes | Cloud folder ID |
| `YANDEX_IAM_TOKEN` | one of two | `Bearer` header; takes priority over API key |
| `YANDEX_API_TOKEN` | one of two | `Api-Key` header |

## Module Resolution

`"moduleResolution": "Node16"` — imports within `src/` must use `.js` extensions even for `.ts` source files (e.g., `import { callWordstat } from "../client.js"`).
