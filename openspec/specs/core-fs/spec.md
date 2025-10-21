# Core File System Operations

## Purpose
The HAMI Core File System provides fundamental file and directory operations for workflow automation, including reading, writing, copying, and listing files with support for glob patterns and recursive operations.

## Requirements

### Requirement: File Reading
The system SHALL provide the ability to read file contents with configurable encoding.

#### Scenario: Read text file
- **WHEN** a read-file node is executed with a file path
- **THEN** the file contents are read and stored in shared storage
- **AND** encoding defaults to UTF-8 if not specified

#### Scenario: Read file with custom encoding
- **WHEN** a read-file node specifies a custom encoding
- **THEN** the file is read using the specified encoding
- **AND** the content is properly decoded

### Requirement: File Writing
The system SHALL provide the ability to write content to files with automatic directory creation.

#### Scenario: Write text file
- **WHEN** a write-file node is executed with content and path
- **THEN** the content is written to the specified file
- **AND** parent directories are created if they don't exist

#### Scenario: Write file with encoding
- **WHEN** a write-file node specifies encoding
- **THEN** the content is written using the specified encoding
- **AND** the operation completes successfully

### Requirement: File Copying
The system SHALL provide the ability to copy files and directories using glob patterns.

#### Scenario: Copy single file
- **WHEN** a copy node is executed with a specific file path
- **THEN** the file is copied to the target location
- **AND** parent directories are created as needed

#### Scenario: Copy with glob pattern
- **WHEN** a copy node uses a glob pattern
- **THEN** all matching files are copied to the target directory
- **AND** directory structure is preserved

### Requirement: Directory Listing
The system SHALL provide the ability to list directory contents with metadata.

#### Scenario: List directory contents
- **WHEN** a list-directory node is executed
- **THEN** all files and subdirectories are listed with metadata
- **AND** each item includes name, path, type, size, and modification time

#### Scenario: Recursive directory listing
- **WHEN** a list-directory node is configured for recursive listing
- **THEN** all nested files and directories are included
- **AND** relative paths are maintained

### Requirement: Working Directory Context
The system SHALL support working directory context for relative path operations.

#### Scenario: Relative path resolution
- **WHEN** nodes use relative paths
- **THEN** paths are resolved relative to the working directory
- **AND** absolute paths are used for file system operations

### Requirement: Verbose Logging
The system SHALL provide optional verbose logging for debugging file operations.

#### Scenario: Verbose mode enabled
- **WHEN** verbose option is enabled
- **THEN** operation details are logged to console
- **AND** progress information is displayed

### Requirement: Shared Storage Integration
The system SHALL integrate with HAMI's shared storage system for workflow state management.

#### Scenario: Content sharing between nodes
- **WHEN** a read-file node completes
- **THEN** content is stored in shared.content
- **AND** subsequent nodes can access the content

#### Scenario: Result storage
- **WHEN** write or copy operations complete
- **THEN** results are stored in appropriate shared storage properties
- **AND** workflow state is maintained