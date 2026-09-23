/**
 * Every agent in this hub — whether it's a simple API-to-sheet pipeline
 * or a future LLM-powered one — implements this same shape.
 * That's what lets runAgent.ts stay generic forever.
 */
export interface Agent {
  /** Unique key used on the CLI / in the GitHub Actions workflow, e.g. --agent=<name> */
  name: string;
  /** Do the work. Throw on failure — runAgent.ts will catch it and exit non-zero
   *  so a failed run shows up red in GitHub Actions. */
  run(): Promise<void>;
}
