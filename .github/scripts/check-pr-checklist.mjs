import { readFileSync } from 'node:fs';

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.error('GITHUB_EVENT_PATH is not available.');
  process.exit(1);
}

const event = JSON.parse(readFileSync(eventPath, 'utf8'));
const body = event.pull_request?.body ?? '';

const requiredSections = [
  '## Refatoração oportuna — checklist obrigatório',
  '**Findings adiados / exceções',
  '**Comandos e resultados:',
  '**Validações não executadas / limitações:',
];

const missing = requiredSections.filter((section) => !body.includes(section));
if (missing.length > 0) {
  console.error('PR description is missing required checklist sections:');
  for (const section of missing) console.error(`- ${section}`);
  process.exit(1);
}

const checkboxes = [...body.matchAll(/^\s*-\s*\[([ xX])\]\s+(.+)$/gm)];
if (checkboxes.length === 0) {
  console.error('No review checklist was found in the PR description.');
  process.exit(1);
}

const unchecked = checkboxes.filter((match) => match[1].toLowerCase() !== 'x');
if (unchecked.length > 0) {
  console.error('All PR checklist items must be checked. For non-applicable items, check the box and explain N/A in the validation/findings section.');
  for (const match of unchecked) console.error(`- ${match[2]}`);
  process.exit(1);
}

console.log(`PR checklist passed (${checkboxes.length} checked items).`);
