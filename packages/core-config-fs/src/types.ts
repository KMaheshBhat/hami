/**
 * Options for core config file system operations.
 * Defines configuration flags that can be used across config file system operations.
 */
type CoreConfigFSOpts = {
  /** Whether to enable verbose logging for operations. */
  verbose?: boolean;
}

/**
 * Shared storage interface for core config file system operations.
 * Defines the structure of data that can be shared between config file system operation nodes.
 * Contains paths, configuration options, and results from various config operations.
 */
type CoreConfigFSStorage = {
  /** Optional configuration options for config file system operations. */
  opts?: CoreConfigFSOpts;
  /** The path to the .hami directory in the working directory. */
  hamiDirectory?: string;
  /** The path to the .hami directory in the user's home directory. */
  userHamiDirectory?: string;
  /** Target scope for config operations ('global', 'local', or null). */
  target: 'global' | 'local' | null;
  /** Whether to fall back to global config when local is not available. */
  useGlobalFallback?: boolean;
  /** Configuration key for get/set/remove operations. */
  configKey?: string;
  /** Configuration value for set operations. */
  configValue?: any;
  /** All configuration values retrieved from get-all operations. */
  configValues?: Record<string, any>;
  /** Previous configuration value from set/remove operations. */
  configValuePrevious?: any;
}

export {
    CoreConfigFSOpts,
    CoreConfigFSStorage,
}