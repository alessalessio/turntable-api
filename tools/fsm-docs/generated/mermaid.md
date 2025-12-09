## State Machine Diagram

The turntable API implements a finite state machine with the following states and transitions:

```mermaid
stateDiagram-v2
    direction TB

    state "OFF / EMPTY / STOPPED" as S1
    state "OFF / LOADED / STOPPED" as S2
    state "ON / EMPTY / STOPPED" as S3
    state "ON / LOADED / STOPPED" as S4
    state "ON / LOADED / PLAYING" as S5

    [*] --> S1 : Initial State

    S1 --> S3 : power-on
    S2 --> S4 : power-on
    S3 --> S1 : power-off
    S4 --> S2 : power-off
    S3 --> S4 : put-vinyl
    S4 --> S4 : change-vinyl
    S4 --> S3 : remove-vinyl
    S4 --> S5 : play
    S5 --> S4 : stop
```

### States

| State | Power | Vinyl | Playback |
|-------|-------|-------|----------|
| S1 | OFF | EMPTY | STOPPED |
| S2 | OFF | LOADED | STOPPED |
| S3 | ON | EMPTY | STOPPED |
| S4 | ON | LOADED | STOPPED |
| S5 | ON | LOADED | PLAYING |
