import 'dotenv/config';
import type { Agent } from './core/types.js';
import { tradingviewPeScannerAgent } from './agents/tradingview-pe-scanner/index.js';

// --- Agent registry -------------------------------------------------
// When you add a new agent folder under src/agents/, import it and add
// one line here. Nothing else in this file needs to change, ever.
const registry: Record<string, Agent> = {
  [tradingviewPeScannerAgent.name]: tradingviewPeScannerAgent,
};
// ---------------------------------------------------------------------

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--agent='));
  const name = arg?.split('=')[1];

  if (!name || !registry[name]) {
    console.error(
      `Usage: npm start -- --agent=<name>\nAvailable agents: ${Object.keys(registry).join(', ')}`
    );
    process.exit(1);
  }

  await registry[name].run();
}

main().catch((err) => {
  console.error('Agent run failed:', err);
  process.exit(1);
});
