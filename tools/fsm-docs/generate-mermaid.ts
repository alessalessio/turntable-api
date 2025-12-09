/**
 * Generates a Mermaid stateDiagram-v2 from FSM definitions.
 */
import * as fs from 'fs';
import * as path from 'path';
import { FSM_STATES, FSM_TRANSITIONS, StateId } from './fsm-data';

/**
 * Creates a human-readable label for a state.
 */
function getStateLabel(stateId: StateId): string {
  const state = FSM_STATES[stateId];
  return `${state.powerState} / ${state.vinylState} / ${state.playbackState}`;
}

/**
 * Generates Mermaid diagram content.
 */
function generateMermaidContent(): string {
  const lines: string[] = [
    '```mermaid',
    'stateDiagram-v2',
    '    direction TB',
    '',
  ];

  // Define states with labels
  const stateIds = Object.keys(FSM_STATES) as StateId[];
  for (const stateId of stateIds) {
    const label = getStateLabel(stateId);
    lines.push(`    state "${label}" as ${stateId}`);
  }

  lines.push('');
  lines.push('    [*] --> S1 : Initial State');
  lines.push('');

  // Group transitions by action for better readability
  const transitionsByAction = new Map<string, typeof FSM_TRANSITIONS>();
  for (const t of FSM_TRANSITIONS) {
    if (!transitionsByAction.has(t.action)) {
      transitionsByAction.set(t.action, []);
    }
    transitionsByAction.get(t.action)!.push(t);
  }

  // Add transitions
  for (const [action, transitions] of transitionsByAction) {
    for (const t of transitions) {
      lines.push(`    ${t.from} --> ${t.to} : ${action}`);
    }
  }

  lines.push('```');

  return lines.join('\n');
}

/**
 * Generates the full Mermaid markdown file.
 */
export async function generateMermaid(): Promise<void> {
  const content = `## State Machine Diagram

The turntable API implements a finite state machine with the following states and transitions:

${generateMermaidContent()}

### States

| State | Power | Vinyl | Playback |
|-------|-------|-------|----------|
${Object.entries(FSM_STATES)
  .map(([id, s]) => `| ${id} | ${s.powerState} | ${s.vinylState} | ${s.playbackState} |`)
  .join('\n')}
`;

  const outputDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'mermaid.md');
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

// Allow running directly
if (require.main === module) {
  generateMermaid().catch(console.error);
}
