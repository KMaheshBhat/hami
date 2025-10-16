import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { startContext, ValidateErrorHandlerNode } from "./common.js";

export interface FlowOptions {
  verbose: boolean;
  global?: boolean;
}

export async function handleFlowInit(
  registry: HAMIRegistrationManager,
  opts: FlowOptions,
  name: string,
  kind: string,
  config: Record<string, any>
): Promise<void> {
  const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
  const validateErrorHandler = new ValidateErrorHandlerNode();
  const traceDataInject = registry.createNode("core-trace-fs:inject", {
    executor: 'cli',
    command: 'flow',
    operation: 'init',
    target: opts.global ? 'global' : 'local',
    key: `flow:${name}`,
    value: { kind, config },
  });
  const coreConfigFSSet = registry.createNode("core-config-fs:set", {});
  const coreTraceFSLog = registry.createNode("core-trace-fs:log", {});
  validateWorkingDirectory.on('error', validateErrorHandler);
  validateWorkingDirectory.next(traceDataInject).next(coreConfigFSSet).next(coreTraceFSLog);
  const shared: Record<string, any> = {
    coreFSStrategy: 'CWD',
    opts: opts,
    ...startContext(),
    target: opts.global ? 'global' : 'local',
    configKey: `flow:${name}`,
    configValue: { kind, config },
  };
  const initFlow = new Flow(validateWorkingDirectory);
  await initFlow.run(shared);
}

export async function handleFlowRun(
  registry: HAMIRegistrationManager,
  opts: FlowOptions,
  name: string,
  payload?: Record<string, any>
): Promise<void> {
  // TODO: Implement flow run logic
  // Run the configured flow by name with optional parsed payload
  opts.verbose && console.log(`Running flow: ${name}, payload:`, payload);
}

export async function handleFlowRemove(
  registry: HAMIRegistrationManager,
  opts: FlowOptions,
  name: string
): Promise<void> {
  const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
  const validateErrorHandler = new ValidateErrorHandlerNode();
  const traceDataInject = registry.createNode("core-trace-fs:inject", {
    executor: 'cli',
    command: 'flow',
    operation: 'remove',
    target: opts.global ? 'global' : 'local',
    key: `flow:${name}`,
  });
  const coreConfigFSRemove = registry.createNode("core-config-fs:remove", {});
  const coreTraceFSLog = registry.createNode("core-trace-fs:log", {});
  validateWorkingDirectory.on('error', validateErrorHandler);
  validateWorkingDirectory.next(traceDataInject).next(coreConfigFSRemove).next(coreTraceFSLog);
  const shared: Record<string, any> = {
    coreFSStrategy: 'CWD',
    opts: opts,
    ...startContext(),
    target: opts.global ? 'global' : 'local',
    configKey: `flow:${name}`,
  };
  const removeFlow = new Flow(validateWorkingDirectory);
  await removeFlow.run(shared);
}

export async function handleFlowList(
  registry: HAMIRegistrationManager,
  opts: FlowOptions
): Promise<void> {
  const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
  const validateErrorHandler = new ValidateErrorHandlerNode();
  const coreConfigFSGetAll = registry.createNode("core-config-fs:get-all", {});
  validateWorkingDirectory.on('error', validateErrorHandler);
  validateWorkingDirectory.next(coreConfigFSGetAll);
  const shared: Record<string, any> = {
    coreFSStrategy: 'CWD',
    opts: opts,
    ...startContext(),
    target: opts.global ? 'global' : 'local',
  };
  const listFlow = new Flow(validateWorkingDirectory);
  await listFlow.run(shared);
  if (shared.configValues) {
    // Filter for flow keys and transform the output
    const flowConfigs: Record<string, any> = {};
    Object.keys(shared.configValues).forEach(key => {
      if (key.startsWith('flow:')) {
        const flowName = key.substring(5); // Remove 'flow:' prefix
        flowConfigs[flowName] = shared.configValues[key];
      }
    });
    if (Object.keys(flowConfigs).length > 0) {
      console.table(flowConfigs);
    } else {
      console.log('No flows configured.');
    }
  }
}