/**
 * Options for core trace file system operations.
 * Defines configuration flags that can be used across trace file system operations.
 */
type CoreTraceFSOpts = {
  /** Whether to enable verbose logging for operations. */
  verbose?: boolean;
}

/**
 * Shared storage interface for core trace file system operations.
 * Defines the structure of data that can be shared between trace file system operation nodes.
 * Contains paths, trace data, search parameters, and results from various trace operations.
 */
type CoreTraceFSStorage = {
  /** Optional configuration options for trace file system operations. */
  opts?: CoreTraceFSOpts;
  /** The path to the .hami directory where trace data is stored. */
  hamiDirectory?: string;
  /** The complete trace index loaded from the file system. */
  traceIndex?: Record<string, any>[];
  /** The unique identifier of a specific trace. */
  traceId?: string;
  /** The data payload of a trace entry. */
  traceData?: Record<string, any>;
  /** Results from trace queries (list, grep operations). */
  traceResults?: Record<string, any>[];
  /** Search query string for filtering traces. */
  searchQuery?: string;
}

export {
    CoreTraceFSOpts,
    CoreTraceFSStorage,
}