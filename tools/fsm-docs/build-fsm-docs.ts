/**
 * Orchestrator script that generates all FSM documentation
 * and updates README.md with the generated content.
 */
import * as fs from 'fs';
import * as path from 'path';
import { generateMermaid } from './generate-mermaid';
import { generateHateoasDocs } from './generate-hateoas-docs';
import { generateOpenApiTemplate } from './generate-openapi-template';

const README_START_MARKER = '<!-- FSM_DOCS_START -->';
const README_END_MARKER = '<!-- FSM_DOCS_END -->';

/**
 * Reads a generated file and returns its content.
 */
function readGeneratedFile(filename: string): string {
  const filePath = path.join(__dirname, 'generated', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Generated file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Updates README.md with generated FSM documentation.
 */
async function updateReadme(): Promise<void> {
  const readmePath = path.join(__dirname, '..', '..', 'README.md');

  if (!fs.existsSync(readmePath)) {
    console.warn('README.md not found, skipping update');
    return;
  }

  let readme = fs.readFileSync(readmePath, 'utf-8');

  const startIndex = readme.indexOf(README_START_MARKER);
  const endIndex = readme.indexOf(README_END_MARKER);

  if (startIndex === -1 || endIndex === -1) {
    console.warn(
      `README.md does not contain FSM_DOCS markers (${README_START_MARKER} / ${README_END_MARKER}), skipping update`,
    );
    return;
  }

  // Read generated content
  const mermaidContent = readGeneratedFile('mermaid.md');
  const hateoasContent = readGeneratedFile('hateoas.md');

  // Build the replacement content
  const generatedContent = `${README_START_MARKER}

<!-- ⚠️ AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY ⚠️ -->
<!-- Run \`npm run build:fsm-docs\` to regenerate -->

${mermaidContent}

${hateoasContent}

### OpenAPI Specification

The OpenAPI paths are auto-generated in \`tools/fsm-docs/generated/openapi-paths.yaml\`.

${README_END_MARKER}`;

  // Replace content between markers
  const before = readme.substring(0, startIndex);
  const after = readme.substring(endIndex + README_END_MARKER.length);
  readme = before + generatedContent + after;

  fs.writeFileSync(readmePath, readme, 'utf-8');
  console.log(`Updated: ${readmePath}`);
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
  console.log('Building FSM documentation...\n');

  try {
    // Generate all documentation
    await generateMermaid();
    await generateHateoasDocs();
    await generateOpenApiTemplate();

    // Update README
    await updateReadme();

    console.log('\n✅ FSM documentation build complete!');
  } catch (error) {
    console.error('\n❌ FSM documentation build failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
