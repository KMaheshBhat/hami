# HAMI CLI Command-Line Interface

## Purpose
The HAMI CLI provides a command-line interface for managing HAMI workflows, configurations, and traces, enabling direct interaction with the HAMI system through terminal commands.

## Requirements

### Requirement: CLI Initialization
The system SHALL provide initialization of HAMI working directories.

#### Scenario: Initialize project
- **WHEN** `hami init` is executed
- **THEN** a .hami directory is created in the current working directory
- **AND** necessary configuration files are set up

### Requirement: Configuration Management
The system SHALL provide commands for managing configuration values.

#### Scenario: List configuration
- **WHEN** `hami config list` is executed
- **THEN** all configuration values are displayed
- **AND** global or local scope can be specified

#### Scenario: Get configuration value
- **WHEN** `hami config get <key>` is executed
- **THEN** the value for the specified key is retrieved and displayed
- **AND** global/local scope is respected

#### Scenario: Set configuration value
- **WHEN** `hami config set <key> <value>` is executed
- **THEN** the configuration key is set to the specified value
- **AND** the change is persisted to the appropriate config file

#### Scenario: Remove configuration key
- **WHEN** `hami config remove <key>` is executed
- **THEN** the configuration key is deleted
- **AND** the change is persisted

### Requirement: Trace Inspection
The system SHALL provide commands for inspecting workflow execution traces.

#### Scenario: List traces
- **WHEN** `hami trace list` is executed
- **THEN** all traces are listed with IDs and timestamps
- **AND** trace metadata is displayed

#### Scenario: Show trace details
- **WHEN** `hami trace show <traceId>` is executed
- **THEN** full details of the specified trace are displayed
- **AND** trace data and metadata are shown

#### Scenario: Search traces
- **WHEN** `hami trace grep <query>` is executed
- **THEN** traces containing the query string are found and displayed
- **AND** matching traces are listed with their data

### Requirement: Flow Management
The system SHALL provide commands for managing workflow flows.

#### Scenario: Initialize flow
- **WHEN** `hami flow init <name> <kind> <config>` is executed
- **THEN** a new flow configuration is created
- **AND** the flow is stored in the appropriate config scope

#### Scenario: Run flow
- **WHEN** `hami flow run <name> [payload]` is executed
- **THEN** the specified flow is executed with optional payload
- **AND** results are displayed or stored

#### Scenario: Remove flow
- **WHEN** `hami flow remove <name>` is executed
- **THEN** the flow configuration is deleted
- **AND** the flow is no longer available

#### Scenario: List flows
- **WHEN** `hami flow list` is executed
- **THEN** all configured flows are displayed
- **AND** flow names, kinds, and configurations are shown

### Requirement: Global vs Local Scope
The system SHALL support both global and local configuration scopes.

#### Scenario: Global operations
- **WHEN** `--global` flag is used with config/flow commands
- **THEN** operations affect global configuration in user home
- **AND** local project configuration is not modified

#### Scenario: Local operations
- **WHEN** commands are executed without --global flag
- **THEN** operations affect local project configuration
- **AND** .hami directory in current working directory is used

### Requirement: Verbose Logging
The system SHALL provide optional verbose logging for all operations.

#### Scenario: Verbose mode
- **WHEN** `--verbose` flag is used
- **THEN** detailed operation logs are displayed
- **AND** progress and debug information is shown

### Requirement: Error Handling
The system SHALL provide proper error handling and user feedback.

#### Scenario: Command errors
- **WHEN** a command fails
- **THEN** error messages are displayed to the user
- **AND** the process exits with appropriate error code

### Requirement: Context Management
The system SHALL manage working directory and user context automatically.

#### Scenario: Context initialization
- **WHEN** CLI starts
- **THEN** working directory, hami directory, and user home are determined
- **AND** context is passed to all operations

### Requirement: JSON Payload Handling
The system SHALL support JSON payloads for flow operations.

#### Scenario: JSON parsing
- **WHEN** JSON strings are provided as arguments
- **THEN** they are parsed into objects
- **AND** passed to flows as structured data