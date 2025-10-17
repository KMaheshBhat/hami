import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { DynamicRunnerNode, startContext, LogErrorNode, LogResult, DynamicRunnerFlow } from "./common.js";

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
  const validateErrorHandler = new LogErrorNode("directoryValidationErrors");
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
  const validate = registry.createNode("core-fs:validate-hami", {});
  validate.on('error', new LogErrorNode("directoryValidationErrors"))
  const getConfig = registry.createNode("core-config-fs:get", {});
  const runner = new DynamicRunnerFlow({ runnerConfigValueKey: 'configValue' });
  runner.on('error', new LogErrorNode("dynamicRunnerError"));
  const traceInject = registry.createNode("core-trace-fs:inject", {
    executor: 'cli',
    command: 'flow',
    operation: 'run',
    target: opts.global ? 'global' : 'local',
    name: `flow:${name}`,
  });
  const traceLog = registry.createNode("core-trace-fs:log", {});
  const logResults = new LogResult("results");
  validate.next(getConfig).next(runner).next(traceInject).next(traceLog).next(logResults);
  const flow = new Flow(validate);
  await flow.run({
    registry: registry,
    coreFSStrategy: 'CWD',
    opts: opts,
    ...startContext(),
    target: opts.global ? 'global' : 'local',
    configKey: `flow:${name}`,
    ...payload,
  });
}

export async function handleFlowRemove(
  registry: HAMIRegistrationManager,
  opts: FlowOptions,
  name: string
): Promise<void> {
  const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
  const validateErrorHandler = new LogErrorNode("directoryValidationErrors");
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
  const validateErrorHandler = new LogErrorNode("directoryValidationErrors");
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