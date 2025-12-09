/**
 * Generates OpenAPI path snippets from FSM definitions.
 */
import * as fs from 'fs';
import * as path from 'path';
import { ACTION_LINKS, ACTION_DESCRIPTIONS, ActionName } from './fsm-data';

/**
 * Converts action name to operationId (camelCase).
 */
function toOperationId(action: ActionName): string {
  return action.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Generates OpenAPI paths YAML content.
 */
export async function generateOpenApiTemplate(): Promise<void> {
  const pathsMap = new Map<string, string[]>();

  // Group actions by path
  for (const [action, link] of Object.entries(ACTION_LINKS) as [ActionName, typeof ACTION_LINKS[ActionName]][]) {
    const pathKey = link.href;
    if (!pathsMap.has(pathKey)) {
      pathsMap.set(pathKey, []);
    }

    const desc = ACTION_DESCRIPTIONS[action];
    const method = link.method.toLowerCase();
    const operationId = toOperationId(action);

    const methodYaml = `    ${method}:
      operationId: ${operationId}
      summary: ${desc.summary}
      description: ${desc.description}
      tags:
        - Turntable
      responses:
        '200':
          description: Successful state transition
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TurntableResource'
        '409':
          description: Invalid state transition
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'`;

    pathsMap.get(pathKey)!.push(methodYaml);
  }

  // Build YAML content
  const lines: string[] = [
    '# Auto-generated OpenAPI paths from FSM definitions',
    '# Copy these into your main OpenAPI specification',
    '',
    'paths:',
  ];

  // Add GET /turntable first
  lines.push('  /turntable:');
  lines.push('    get:');
  lines.push('      operationId: getState');
  lines.push('      summary: Get turntable state');
  lines.push('      description: Returns the current turntable state with HATEOAS links.');
  lines.push('      tags:');
  lines.push('        - Turntable');
  lines.push('      responses:');
  lines.push("        '200':");
  lines.push('          description: Current turntable state');
  lines.push('          content:');
  lines.push('            application/json:');
  lines.push('              schema:');
  lines.push("                $ref: '#/components/schemas/TurntableResource'");

  // Add other paths
  for (const [pathKey, methods] of pathsMap) {
    lines.push(`  ${pathKey}:`);
    for (const methodYaml of methods) {
      lines.push(methodYaml);
    }
  }

  // Add schemas section
  lines.push('');
  lines.push('components:');
  lines.push('  schemas:');
  lines.push('    TurntableResource:');
  lines.push('      type: object');
  lines.push('      properties:');
  lines.push('        powerState:');
  lines.push('          type: string');
  lines.push('          enum: [OFF, ON]');
  lines.push('        vinylState:');
  lines.push('          type: string');
  lines.push('          enum: [EMPTY, LOADED]');
  lines.push('        playbackState:');
  lines.push('          type: string');
  lines.push('          enum: [STOPPED, PLAYING]');
  lines.push('        currentVinyl:');
  lines.push("          $ref: '#/components/schemas/Vinyl'");
  lines.push('          nullable: true');
  lines.push('        _links:');
  lines.push('          type: object');
  lines.push('          additionalProperties:');
  lines.push("            $ref: '#/components/schemas/HateoasLink'");
  lines.push('    Vinyl:');
  lines.push('      type: object');
  lines.push('      properties:');
  lines.push('        id:');
  lines.push('          type: string');
  lines.push('        title:');
  lines.push('          type: string');
  lines.push('        composer:');
  lines.push('          type: string');
  lines.push('        midiUrl:');
  lines.push('          type: string');
  lines.push('    HateoasLink:');
  lines.push('      type: object');
  lines.push('      properties:');
  lines.push('        href:');
  lines.push('          type: string');
  lines.push('        method:');
  lines.push('          type: string');
  lines.push('    ErrorResponse:');
  lines.push('      type: object');
  lines.push('      properties:');
  lines.push('        error:');
  lines.push('          type: object');
  lines.push('          properties:');
  lines.push('            code:');
  lines.push('              type: string');
  lines.push('            message:');
  lines.push('              type: string');

  const content = lines.join('\n') + '\n';

  const outputDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'openapi-paths.yaml');
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

// Allow running directly
if (require.main === module) {
  generateOpenApiTemplate().catch(console.error);
}
