# Turntable API

A RESTful HATEOAS API simulating a vinyl turntable. Built with NestJS and TypeScript.

## Features

- **State Machine**: Manages power, vinyl loading, and playback states
- **HATEOAS**: Hypermedia-driven API with discoverable transitions
- **REST**: Clean resource-oriented endpoints

## State Machine

The turntable has three state dimensions:

| State | Values |
|-------|--------|
| `powerState` | `OFF`, `ON` |
| `vinylState` | `EMPTY`, `LOADED` |
| `playbackState` | `STOPPED`, `PLAYING` |

### Valid Transitions

```
OFF/EMPTY/STOPPED  --powerOn-->   ON/EMPTY/STOPPED
ON/EMPTY/STOPPED   --powerOff-->  OFF/EMPTY/STOPPED
ON/EMPTY/STOPPED   --putVinyl-->  ON/LOADED/STOPPED
ON/LOADED/STOPPED  --play-->      ON/LOADED/PLAYING
ON/LOADED/PLAYING  --stop-->      ON/LOADED/STOPPED
ON/LOADED/STOPPED  --removeVinyl--> ON/EMPTY/STOPPED
```

## Installation

```bash
npm install
```

## Running

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The server runs on `http://localhost:3000` by default.

## API Endpoints

### Entry Point

```
GET /
```

Returns API entry point with HATEOAS links.

### Turntable Resource

```
GET    /turntable          # Get current state
POST   /turntable/power/on # Power on
POST   /turntable/power/off# Power off
PUT    /turntable/vinyl    # Put/change vinyl (random selection)
DELETE /turntable/vinyl    # Remove vinyl
POST   /turntable/play     # Start playback
POST   /turntable/stop     # Stop playback
```

### Health Check

```
GET /health
```

## Example Usage

```bash
# Get initial state
curl http://localhost:3000/turntable

# Power on
curl -X POST http://localhost:3000/turntable/power/on

# Put a vinyl
curl -X PUT http://localhost:3000/turntable/vinyl

# Start playing
curl -X POST http://localhost:3000/turntable/play

# Stop playing
curl -X POST http://localhost:3000/turntable/stop
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## Project Structure

```
src/
├── app.module.ts           # Root module
├── app.controller.ts       # Entry point controller
├── main.ts                 # Application bootstrap
├── health/                 # Health check module
├── midi/                   # MIDI tracks catalog
│   └── midi-tracks.service.ts
└── turntable/              # Turntable domain
    ├── turntable.controller.ts
    ├── turntable.service.ts
    └── turntable.interface.ts
```

## License

MIT

