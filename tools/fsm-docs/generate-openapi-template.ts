/**
 * Generates OpenAPI specification from FSM definitions.
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
 * Generates a complete OpenAPI 3.0 specification.
 */
export async function generateOpenApiTemplate(): Promise<void> {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Turntable API',
      description: 'RESTful HATEOAS API for a vinyl turntable with FSM-driven state transitions.',
      version: '1.0.0',
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    tags: [
      {
        name: 'Turntable',
        description: 'Turntable state and actions',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
    paths: {} as Record<string, Record<string, unknown>>,
    components: {
      schemas: {
        TurntableResource: {
          type: 'object',
          properties: {
            powerState: {
              type: 'string',
              enum: ['OFF', 'ON'],
              description: 'Current power state of the turntable',
            },
            vinylState: {
              type: 'string',
              enum: ['EMPTY', 'LOADED'],
              description: 'Whether a vinyl is loaded',
            },
            playbackState: {
              type: 'string',
              enum: ['STOPPED', 'PLAYING'],
              description: 'Current playback state',
            },
            currentVinyl: {
              nullable: true,
              allOf: [
                { $ref: '#/components/schemas/Vinyl' },
              ],
              description: 'Currently loaded vinyl, or null if none',
            },
            _links: {
              type: 'object',
              additionalProperties: {
                $ref: '#/components/schemas/HateoasLink',
              },
              description: 'HATEOAS links for available actions',
            },
          },
          required: ['powerState', 'vinylState', 'playbackState', '_links'],
        },
        Vinyl: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique vinyl identifier' },
            title: { type: 'string', description: 'Track title' },
            composer: { type: 'string', description: 'Composer name' },
            midiUrl: { type: 'string', description: 'URL to MIDI file' },
          },
          required: ['id', 'title', 'composer', 'midiUrl'],
        },
        HateoasLink: {
          type: 'object',
          properties: {
            href: { type: 'string', description: 'URL for the action' },
            method: { type: 'string', description: 'HTTP method to use' },
          },
          required: ['href', 'method'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Error code' },
                message: { type: 'string', description: 'Human-readable error message' },
              },
              required: ['code', 'message'],
            },
          },
          required: ['error'],
        },
      },
    },
  };

  // Add GET /turntable
  spec.paths['/turntable'] = {
    get: {
      operationId: 'getState',
      summary: 'Get turntable state',
      description: 'Returns the current turntable state with HATEOAS links for available actions.',
      tags: ['Turntable'],
      responses: {
        '200': {
          description: 'Current turntable state',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TurntableResource' },
            },
          },
        },
      },
    },
  };

  // Add health endpoint
  spec.paths['/health'] = {
    get: {
      operationId: 'healthCheck',
      summary: 'Health check',
      description: 'Returns the health status of the API.',
      tags: ['Health'],
      responses: {
        '200': {
          description: 'API is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                },
              },
            },
          },
        },
      },
    },
  };

  // Group actions by path and method to handle duplicates
  // put-vinyl and change-vinyl both use PUT /turntable/vinyl
  // We'll combine them into one operation with a combined description
  const pathMethodMap = new Map<string, { actions: ActionName[]; method: string }>();

  for (const [action, link] of Object.entries(ACTION_LINKS) as [ActionName, typeof ACTION_LINKS[ActionName]][]) {
    const key = `${link.href}:${link.method}`;
    if (!pathMethodMap.has(key)) {
      pathMethodMap.set(key, { actions: [], method: link.method });
    }
    pathMethodMap.get(key)!.actions.push(action);
  }

  // Build paths
  for (const [key, { actions, method }] of pathMethodMap) {
    const href = key.split(':')[0];
    const methodLower = method.toLowerCase();

    if (!spec.paths[href]) {
      spec.paths[href] = {};
    }

    // Combine descriptions if multiple actions share the same endpoint
    const descriptions = actions.map((a) => ACTION_DESCRIPTIONS[a]);
    const summary = descriptions.length === 1
      ? descriptions[0].summary
      : descriptions.map((d) => d.summary).join(' / ');
    const description = descriptions.length === 1
      ? descriptions[0].description
      : descriptions.map((d, i) => `**${actions[i]}**: ${d.description}`).join('\n\n');

    // Use first action for operationId, note others in description
    const operationId = toOperationId(actions[0]);

    spec.paths[href][methodLower] = {
      operationId,
      summary,
      description,
      tags: ['Turntable'],
      responses: {
        '200': {
          description: 'Successful state transition',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TurntableResource' },
            },
          },
        },
        '409': {
          description: 'Invalid state transition - action not allowed in current state',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    };
  }

  // Convert to YAML manually (simple approach without external deps)
  const yaml = jsonToYaml(spec, 0);

  const outputDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'openapi-paths.yaml');
  fs.writeFileSync(outputPath, yaml, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

/**
 * Simple JSON to YAML converter (handles nested objects, arrays, strings).
 */
function jsonToYaml(obj: unknown, indent: number): string {
  const spaces = '  '.repeat(indent);

  if (obj === null) {
    return 'null';
  }

  if (typeof obj === 'string') {
    // Quote strings with special characters or that look like other types
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#') ||
        obj.includes("'") || obj.includes('"') || obj.match(/^[\[\]{}&*!|>@`]/) ||
        obj === '' || obj === 'true' || obj === 'false' || !isNaN(Number(obj))) {
      // Use literal block for multiline
      if (obj.includes('\n')) {
        const lines = obj.split('\n').map((line) => spaces + '  ' + line).join('\n');
        return `|-\n${lines}`;
      }
      return `'${obj.replace(/'/g, "''")}'`;
    }
    return obj;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    return obj.map((item) => {
      const value = jsonToYaml(item, indent + 1);
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const lines = value.split('\n');
        return `${spaces}- ${lines[0].trim()}\n${lines.slice(1).join('\n')}`;
      }
      return `${spaces}- ${value}`;
    }).join('\n');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return '{}';
    }
    return entries.map(([key, value]) => {
      const yamlValue = jsonToYaml(value, indent + 1);
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
        return `${spaces}${key}:\n${yamlValue}`;
      }
      if (Array.isArray(value) && value.length > 0) {
        return `${spaces}${key}:\n${yamlValue}`;
      }
      return `${spaces}${key}: ${yamlValue}`;
    }).join('\n');
  }

  return String(obj);
}

// Allow running directly
if (require.main === module) {
  generateOpenApiTemplate().catch(console.error);
}
