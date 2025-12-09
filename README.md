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

### State Diagram

```mermaid
stateDiagram-v2
    direction TB

    state "OFF / EMPTY / STOPPED" as S1
    state "OFF / LOADED / STOPPED" as S2
    state "ON / EMPTY / STOPPED" as S3
    state "ON / LOADED / STOPPED" as S4
    state "ON / LOADED / PLAYING" as S5

    [*] --> S1 : Initial State

    S1 --> S3 : powerOn
    S2 --> S4 : powerOn

    S3 --> S1 : powerOff
    S4 --> S2 : powerOff

    S3 --> S4 : putVinyl
    S4 --> S4 : changeVinyl
    S4 --> S3 : removeVinyl

    S4 --> S5 : play
    S5 --> S4 : stop
```

### Combined States

| State | Power | Vinyl | Playback |
|-------|-------|-------|----------|
| S1 | OFF | EMPTY | STOPPED |
| S2 | OFF | LOADED | STOPPED |
| S3 | ON | EMPTY | STOPPED |
| S4 | ON | LOADED | STOPPED |
| S5 | ON | LOADED | PLAYING |

### Transitions

| Action | From | To | Preconditions |
|--------|------|----|---------------|
| `powerOn` | S1, S2 | S3, S4 | powerState = OFF |
| `powerOff` | S3, S4 | S1, S2 | powerState = ON, playbackState = STOPPED |
| `putVinyl` | S3, S4 | S4 | powerState = ON, playbackState = STOPPED |
| `removeVinyl` | S4 | S3 | powerState = ON, vinylState = LOADED, playbackState = STOPPED |
| `play` | S4 | S5 | powerState = ON, vinylState = LOADED, playbackState = STOPPED |
| `stop` | S5 | S4 | playbackState = PLAYING |

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

