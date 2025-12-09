---
id: testing
title: Testing
---

# Testing

## Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Test Coverage

The test suite covers:

### Valid Transitions

- Power on from OFF state
- Power off from ON + STOPPED state
- Put vinyl when ON + STOPPED + EMPTY
- Change vinyl when ON + STOPPED + LOADED
- Remove vinyl when ON + STOPPED + LOADED
- Play when ON + LOADED + STOPPED
- Stop when PLAYING

### Invalid Transitions (409 Conflict)

- Power on when already ON
- Power off when OFF or PLAYING
- Put vinyl when OFF or PLAYING
- Remove vinyl when EMPTY or PLAYING
- Play when OFF, EMPTY, or already PLAYING
- Stop when not PLAYING

### HATEOAS Links

- Correct links appear for each state
- Only valid actions are exposed
- Self link always present

## Example Test

```typescript
describe('play', () => {
  it('should start playing when ON, LOADED, and STOPPED', () => {
    service.powerOn();
    service.putVinyl();
    const state = service.play();
    expect(state.playbackState).toBe(PlaybackState.PLAYING);
    expect(state._links.stop).toBeDefined();
    expect(state._links.play).toBeUndefined();
  });

  it('should throw when OFF', () => {
    expect(() => service.play()).toThrow(HttpException);
  });
});
```

## CI Integration

Tests run automatically on push via GitHub Actions. The FSM documentation check also runs to ensure docs are up to date:

```bash
npm run check:fsm-docs
```

