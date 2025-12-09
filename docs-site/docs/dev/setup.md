---
id: setup
title: Development Setup
---

# Development Setup

## Requirements

- Node.js (LTS recommended, v18+)
- npm or yarn

## Install

```bash
git clone https://github.com/alessalessio/turntable-api.git
cd turntable-api
npm install
```

## Run API

```bash
# Development mode (hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API runs at `http://localhost:3000`.

## Run Documentation Site

```bash
# Install docs dependencies (first time)
cd docs-site && npm install && cd ..

# Start docs dev server
npm run docs:start
```

The docs site runs at `http://localhost:3000` (or next available port).

## Project Structure

```
turntable-api/
├── src/
│   ├── turntable/          # Turntable domain
│   │   ├── turntable.service.ts    # FSM + state logic
│   │   ├── turntable.controller.ts # REST endpoints
│   │   └── turntable.interface.ts  # Types
│   ├── midi/               # MIDI catalog service
│   ├── health/             # Health check
│   └── main.ts             # Bootstrap
├── tools/
│   └── fsm-docs/           # Auto-doc generation
├── docs-site/              # Docusaurus docs
├── config/
│   └── midi-tracks.json    # Track catalog
└── package.json
```

## Regenerate FSM Documentation

After changing the FSM (states, transitions):

```bash
npm run build:fsm-docs
```

This updates `README.md` and `tools/fsm-docs/generated/`.

