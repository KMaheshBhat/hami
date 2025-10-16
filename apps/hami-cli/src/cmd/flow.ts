import { HAMIRegistrationManager } from "@hami/core";

export interface FlowOptions {
  verbose: boolean;
  global?: boolean;
}

export async function handleFlowInit(
  registry: HAMIRegistrationManager,
  opts: FlowOptions,
  name: string,
  kind: string,
  config: string
): Promise<void> {
  // TODO: Implement flow initialization logic
  // Parse config as JSON and configure the flow with name, kind, and config
  opts.verbose && console.log(`Initializing flow: ${name}, kind: ${kind}, config: ${config}`);
}

export async function handleFlowRun(
  registry: HAMIRegistrationManager,
  opts: FlowOptions,
  name: string
): Promise<void> {
  // TODO: Implement flow run logic
  // Run the configured flow by name
  opts.verbose && console.log(`Running flow: ${name}`);
}

export async function handleFlowRemove(
  registry: HAMIRegistrationManager,
  opts: FlowOptions,
  name: string
): Promise<void> {
  // TODO: Implement flow remove logic
  // Remove the configured flow by name
  opts.verbose && console.log(`Removing flow: ${name}`);
}

export async function handleFlowList(
  registry: HAMIRegistrationManager,
  opts: FlowOptions
): Promise<void> {
  // TODO: Implement flow list logic
  // List all configured flows
  opts.verbose && console.log('Listing all flows');
}