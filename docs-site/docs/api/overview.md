---
id: overview
title: API Overview
---

# API Overview

## Base URL

**Local development:**

```
http://localhost:3000
```

## Key Resources

| Resource | Description |
|----------|-------------|
| `/` | API entry point with HATEOAS links |
| `/turntable` | Turntable resource (state + actions) |
| `/health` | Health check endpoint |

## Content Type

All requests and responses use:

```
Content-Type: application/json
```

## Authentication

This demo API has no authentication. In production, you'd add appropriate auth headers.

## Error Responses

Invalid state transitions return `409 Conflict`:

```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot play: turntable is OFF, no vinyl loaded, or already playing"
  }
}
```

