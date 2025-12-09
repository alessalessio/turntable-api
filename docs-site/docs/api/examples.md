---
id: examples
title: Example Flows
---

# Example Flows

## Power On and Play

```bash
# Get initial state (OFF / EMPTY / STOPPED)
curl http://localhost:3000/turntable

# Power on
curl -X POST http://localhost:3000/turntable/power/on

# Put a random vinyl
curl -X PUT http://localhost:3000/turntable/vinyl

# Start playing
curl -X POST http://localhost:3000/turntable/play
```

## Stop and Power Off

```bash
# Stop playback
curl -X POST http://localhost:3000/turntable/stop

# Remove vinyl (optional)
curl -X DELETE http://localhost:3000/turntable/vinyl

# Power off
curl -X POST http://localhost:3000/turntable/power/off
```

## Change Vinyl While Stopped

```bash
# Assuming ON / LOADED / STOPPED state
curl -X PUT http://localhost:3000/turntable/vinyl
```

## Invalid Transition Example

Trying to play when powered off:

```bash
curl -X POST http://localhost:3000/turntable/play
```

Response (409 Conflict):

```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot play: turntable is OFF, no vinyl loaded, or already playing"
  }
}
```

## Following HATEOAS Links

The hypermedia approach — just follow `_links`:

```bash
# 1. Start at entry point
curl http://localhost:3000/
# Response includes: _links.turntable

# 2. Get turntable state
curl http://localhost:3000/turntable
# Response includes: _links["power-on"]

# 3. Follow power-on link
curl -X POST http://localhost:3000/turntable/power/on
# Response includes: _links["put-vinyl"]

# 4. Follow put-vinyl link
curl -X PUT http://localhost:3000/turntable/vinyl
# Response includes: _links.play

# 5. Follow play link
curl -X POST http://localhost:3000/turntable/play
# Now playing!
```

