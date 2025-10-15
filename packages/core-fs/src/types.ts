type CoreFSOpts = {
  verbose?: boolean;
}

type CoreFSSharedStorage = {
  opts?: CoreFSOpts;
  coreFSStrategy?: string;
  checkWorkingDirectory?: boolean;
  checkHamiDirectory?: boolean;
  checkUserHomeDirectory?: boolean;
  checkUserHamiDirectory?: boolean;
  workingDirectory?: string;
  hamiDirectory?: string;
  userHomeDirectory?: string;
  userHamiDirectory?: string;
  directoryValidationErrors?: string[];
};

export {
  CoreFSOpts,
  CoreFSSharedStorage,
};