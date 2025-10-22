/**
 * Options for core file system operations.
 * Defines configuration flags that can be used across file system operations.
 */
type CoreFSOpts = {
  /** Whether to enable verbose logging for operations. */
  verbose?: boolean;
}

/**
 * Shared storage interface for core file system operations.
 * Defines the structure of data that can be shared between file system operation nodes.
 * Contains paths, configuration options, and results from various file system operations.
 */
type CoreFSSharedStorage = {
  /** Optional configuration options for file system operations. */
  opts?: CoreFSOpts;
  /** Strategy for initializing the file system environment (e.g., 'CWD'). */
  coreFSStrategy?: string;
  /** Flag to control validation of working directory. */
  checkWorkingDirectory?: boolean;
  /** Flag to control validation of .hami directory in working directory. */
  checkHamiDirectory?: boolean;
  /** Flag to control validation of user home directory. */
  checkUserHomeDirectory?: boolean;
  /** Flag to control validation of .hami directory in user home. */
  checkUserHamiDirectory?: boolean;
  /** The resolved working directory path. */
  workingDirectory?: string;
  /** The path to the .hami directory in the working directory. */
  hamiDirectory?: string;
  /** The user's home directory path. */
  userHomeDirectory?: string;
  /** The path to the .hami directory in the user's home directory. */
  userHamiDirectory?: string;
  /** Array of validation errors from directory checks. */
  directoryValidationErrors?: string[];
  /** Source pattern for copy operations. */
  copySourcePattern?: string;
  /** Target directory for copy operations. */
  copyTargetDirectory?: string;
  /** Results from copy operations (array of copied file paths). */
  copyResults?: string[];
  /** Path for read file operations. */
  readFilePath?: string;
  /** Encoding for read file operations. */
  readFileEncoding?: string;
  /** Content read from file operations. */
  readFileContent?: string;
  /** Result message from write file operations. */
  writeFileResult?: string;
  /** Content to write for file operations. */
  content?: string;
  /** Generic results array for various operations. */
  results?: any[];
  /** Items listed from directory operations with metadata. */
  listDirectoryItems?: Array<{ name: string, path: string, type: 'file' | 'directory', size?: number, modified?: Date }>;
};

export {
  CoreFSOpts,
  CoreFSSharedStorage,
};