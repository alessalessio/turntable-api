---
id: endpoints
title: Endpoints
---

# Endpoints

## Entry Point

```http
GET /
```

Returns top-level HATEOAS links to discover the API.

## Turntable Resource

### Get State

```http
GET /turntable
```

Returns current turntable state with available actions in `_links`.

### Power On

```http
POST /turntable/power/on
```

Powers on the turntable. Only valid when `powerState` is `OFF`.

### Power Off

```http
POST /turntable/power/off
```

Powers off the turntable. Only valid when `powerState` is `ON` and `playbackState` is `STOPPED`.

### Put / Change Vinyl

```http
PUT /turntable/vinyl
```

Loads a random vinyl from the catalog. If vinyl is already loaded, it swaps for a new one.

### Remove Vinyl

```http
DELETE /turntable/vinyl
```

Removes the current vinyl. Only valid when vinyl is loaded and playback is stopped.

### Play

```http
POST /turntable/play
```

Starts playback. Only valid when powered on, vinyl loaded, and currently stopped.

### Stop

```http
POST /turntable/stop
```

Stops playback. Only valid when currently playing.

## Health Check

```http
GET /health
```

Returns API health status:

```json
{
  "status": "ok"
}
```

