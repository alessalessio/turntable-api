---
id: hateoas
title: HATEOAS & Hypermedia
---

# HATEOAS

Turntable API is deliberately hypermedia-driven:

- Every response includes a `_links` object.
- Links are generated from the FSM: only valid actions appear.
- Clients don't need to encode state machine rules; they just **follow links**.

This is a concrete example of **REST Level 3** (Richardson Maturity Model).

:::info Auto-Generated
The tables below are auto-generated from the FSM definition.
Run `npm run build:fsm-docs` to regenerate after changes.
:::

<!-- HATEOAS_DOCS_START -->

### Allowed Actions per State

Each state exposes only the actions that are valid transitions from that state.

| State | Power / Vinyl / Playback | Allowed Actions |
|-------|--------------------------|-----------------|
| S1 | OFF / EMPTY / STOPPED | `power-on` |
| S2 | OFF / LOADED / STOPPED | `power-on` |
| S3 | ON / EMPTY / STOPPED | `power-off`, `put-vinyl` |
| S4 | ON / LOADED / STOPPED | `power-off`, `change-vinyl`, `remove-vinyl`, `play` |
| S5 | ON / LOADED / PLAYING | `stop` |

### State Transitions

| Action | From | To | Method | Endpoint |
|--------|------|----|--------|----------|
| `power-on` | S1 | S3 | `POST` | `/turntable/power/on` |
| `power-on` | S2 | S4 | `POST` | `/turntable/power/on` |
| `power-off` | S3 | S1 | `POST` | `/turntable/power/off` |
| `power-off` | S4 | S2 | `POST` | `/turntable/power/off` |
| `put-vinyl` | S3 | S4 | `PUT` | `/turntable/vinyl` |
| `change-vinyl` | S4 | S4 | `PUT` | `/turntable/vinyl` |
| `remove-vinyl` | S4 | S3 | `DELETE` | `/turntable/vinyl` |
| `play` | S4 | S5 | `POST` | `/turntable/play` |
| `stop` | S5 | S4 | `POST` | `/turntable/stop` |

### Action Links Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| `power-on` | `POST` | `/turntable/power/on` |
| `power-off` | `POST` | `/turntable/power/off` |
| `put-vinyl` | `PUT` | `/turntable/vinyl` |
| `change-vinyl` | `PUT` | `/turntable/vinyl` |
| `remove-vinyl` | `DELETE` | `/turntable/vinyl` |
| `play` | `POST` | `/turntable/play` |
| `stop` | `POST` | `/turntable/stop` |

### Example Response

When the turntable is in state **S4** (ON / LOADED / STOPPED), the response includes:

```json
{
  "powerState": "ON",
  "vinylState": "LOADED",
  "playbackState": "STOPPED",
  "currentVinyl": { "id": "...", "title": "...", "composer": "...", "midiUrl": "..." },
  "_links": {
    "self": { "href": "/turntable", "method": "GET" },
    "power-off": { "href": "/turntable/power/off", "method": "POST" },
    "change-vinyl": { "href": "/turntable/vinyl", "method": "PUT" },
    "remove-vinyl": { "href": "/turntable/vinyl", "method": "DELETE" },
    "play": { "href": "/turntable/play", "method": "POST" }
  }
}
```

<!-- HATEOAS_DOCS_END -->
