/**
 * Orchestrator script that generates all FSM documentation
 * and updates README.md and Docusaurus docs with the generated content.
 */
import * as fs from 'fs';
import * as path from 'path';
import { generateMermaid } from './generate-mermaid';
import { generateHateoasDocs } from './generate-hateoas-docs';
import { generateOpenApiTemplate } from './generate-openapi-template';

// Marker constants
const README_START_MARKER = '<!-- FSM_DOCS_START -->';
const README_END_MARKER = '<!-- FSM_DOCS_END -->';
const FSM_DIAGRAM_START = '<!-- FSM_DIAGRAM_START -->';
const FSM_DIAGRAM_END = '<!-- FSM_DIAGRAM_END -->';
const HATEOAS_START = '<!-- HATEOAS_DOCS_START -->';
const HATEOAS_END = '<!-- HATEOAS_DOCS_END -->';

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
 * Updates content between markers in a file.
 */
function updateFileBetweenMarkers(
  filePath: string,
  startMarker: string,
  endMarker: string,
  newContent: string,
): boolean {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found, skipping: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.warn(`Markers not found in ${filePath}, skipping`);
    return false;
  }

  const replacement = `${startMarker}\n\n${newContent}\n\n${endMarker}`;
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex + endMarker.length);
  content = before + replacement + after;

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated: ${filePath}`);
  return true;
}

/**
 * Updates README.md with generated FSM documentation.
 */
async function updateReadme(): Promise<void> {
  const readmePath = path.join(__dirname, '..', '..', 'README.md');
  const mermaidContent = readGeneratedFile('mermaid.md');
  const hateoasContent = readGeneratedFile('hateoas.md');

  const fullContent = `<!-- ⚠️ AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY ⚠️ -->
<!-- Run \`npm run build:fsm-docs\` to regenerate -->

${mermaidContent}

${hateoasContent}

### OpenAPI Specification

The OpenAPI paths are auto-generated in \`tools/fsm-docs/generated/openapi-paths.yaml\`.`;

  updateFileBetweenMarkers(readmePath, README_START_MARKER, README_END_MARKER, fullContent);
}

/**
 * Updates Docusaurus docs with generated content.
 */
async function updateDocusaurusDocs(): Promise<void> {
  const docsDir = path.join(__dirname, '..', '..', 'docs-site', 'docs');

  // Update fsm.md with the Mermaid diagram
  const fsmDocPath = path.join(docsDir, 'fsm.md');
  const mermaidContent = readGeneratedFile('mermaid.md');
  updateFileBetweenMarkers(fsmDocPath, FSM_DIAGRAM_START, FSM_DIAGRAM_END, mermaidContent);

  // Update hateoas.md with the HATEOAS docs
  const hateoasDocPath = path.join(docsDir, 'hateoas.md');
  const hateoasContent = readGeneratedFile('hateoas.md');
  // Extract just the tables part (skip the header since the doc has its own)
  const hateoasTablesOnly = hateoasContent
    .replace(/^## HATEOAS Documentation\n+/m, '')
    .trim();
  updateFileBetweenMarkers(hateoasDocPath, HATEOAS_START, HATEOAS_END, hateoasTablesOnly);
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

    // Update Docusaurus docs
    await updateDocusaurusDocs();

    console.log('\n✅ FSM documentation build complete!');
  } catch (error) {
    console.error('\n❌ FSM documentation build failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
