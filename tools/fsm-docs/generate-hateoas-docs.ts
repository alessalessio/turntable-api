/**
 * Generates HATEOAS documentation from FSM definitions.
 */
import * as fs from 'fs';
import * as path from 'path';
import { FSM_STATES, FSM_TRANSITIONS, ACTION_LINKS, StateId, ActionName } from './fsm-data';

/**
 * Gets allowed actions for a given state.
 */
function getAllowedActions(stateId: StateId): ActionName[] {
  return FSM_TRANSITIONS
    .filter((t) => t.from === stateId)
    .map((t) => t.action);
}

/**
 * Creates a human-readable label for a state.
 */
function getStateLabel(stateId: StateId): string {
  const state = FSM_STATES[stateId];
  return `${state.powerState} / ${state.vinylState} / ${state.playbackState}`;
}

/**
 * Generates HATEOAS documentation content.
 */
export async function generateHateoasDocs(): Promise<void> {
  const stateIds = Object.keys(FSM_STATES) as StateId[];

  // Build allowed actions table
  const stateTable = stateIds.map((stateId) => {
    const label = getStateLabel(stateId);
    const actions = getAllowedActions(stateId);
    const actionsStr = actions.map((a) => `\`${a}\``).join(', ') || '_none_';
    return `| ${stateId} | ${label} | ${actionsStr} |`;
  });

  // Build transitions table
  const transitionsTable = FSM_TRANSITIONS.map((t) => {
    const link = ACTION_LINKS[t.action];
    return `| \`${t.action}\` | ${t.from} | ${t.to} | \`${link.method}\` | \`${link.href}\` |`;
  });

  // Build action links reference
  const actionLinksTable = (Object.entries(ACTION_LINKS) as [ActionName, typeof ACTION_LINKS[ActionName]][])
    .map(([action, link]) => `| \`${action}\` | \`${link.method}\` | \`${link.href}\` |`);

  const content = `## HATEOAS Documentation

### Allowed Actions per State

Each state exposes only the actions that are valid transitions from that state.

| State | Power / Vinyl / Playback | Allowed Actions |
|-------|--------------------------|-----------------|
${stateTable.join('\n')}

### State Transitions

| Action | From | To | Method | Endpoint |
|--------|------|----|--------|----------|
${transitionsTable.join('\n')}

### Action Links Reference

| Action | Method | Endpoint |
|--------|--------|----------|
${actionLinksTable.join('\n')}

### Example Response

When the turntable is in state **S4** (ON / LOADED / STOPPED), the response includes:

\`\`\`json
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
\`\`\`
`;

  const outputDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'hateoas.md');
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

// Allow running directly
if (require.main === module) {
  generateHateoasDocs().catch(console.error);
}
