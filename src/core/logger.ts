export function log(agentName: string, message: string) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${agentName}] ${message}`);
}
