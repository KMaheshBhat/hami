# Core Trace File System

## Purpose
The HAMI Core Trace File System provides persistent logging and retrieval of workflow execution traces, enabling debugging, auditing, and analysis of workflow runs with unique identifiers and timestamps.

## Requirements

### Requirement: Trace Logging
The system SHALL provide the ability to log trace data with unique identifiers and timestamps.

#### Scenario: Log trace data
- **WHEN** a log node is executed with trace data
- **THEN** a unique trace ID is generated using UUIDv7
- **AND** the trace is stored with timestamp and data in the index

#### Scenario: Trace storage
- **WHEN** trace data is logged
- **THEN** it is persisted to the project's trace index file
- **AND** the trace ID is returned and stored in shared storage

### Requirement: Trace Listing
The system SHALL provide the ability to list all traces with their metadata.

#### Scenario: List traces
- **WHEN** a list node is executed
- **THEN** all traces are retrieved from the index
- **AND** each trace includes id and timestamp (without full data for performance)

#### Scenario: Trace metadata
- **WHEN** traces are listed
- **THEN** results are stored in shared.traceResults
- **AND** verbose logging shows the count of traces

### Requirement: Trace Retrieval
The system SHALL provide the ability to retrieve full trace data by ID.

#### Scenario: Show trace by ID
- **WHEN** a show node is executed with a trace ID
- **THEN** the full trace data is retrieved from the index
- **AND** the trace details are stored in shared storage

### Requirement: Trace Searching
The system SHALL provide the ability to search traces using pattern matching.

#### Scenario: Grep traces
- **WHEN** a grep node is executed with a search pattern
- **THEN** traces containing matching data are returned
- **AND** the search results are stored in shared storage

### Requirement: Trace Injection
The system SHALL provide the ability to inject trace data into workflows.

#### Scenario: Inject trace data
- **WHEN** an inject node is executed with a trace ID
- **THEN** the trace data is loaded and made available in shared storage
- **AND** the workflow can continue with the injected data

### Requirement: Trace Index Management
The system SHALL manage trace indices with proper JSON serialization and error handling.

#### Scenario: Index file creation
- **WHEN** a trace index doesn't exist
- **THEN** it is created automatically when logging
- **AND** proper directory structure is ensured

#### Scenario: Index file validation
- **WHEN** reading trace indices
- **THEN** invalid JSON is handled gracefully
- **AND** empty arrays are returned for missing files

### Requirement: Unique Trace Identification
The system SHALL generate unique, time-ordered trace identifiers.

#### Scenario: UUIDv7 generation
- **WHEN** traces are logged
- **THEN** UUIDv7 identifiers are used for uniqueness and temporal ordering
- **AND** identifiers are suitable for database indexing

### Requirement: Verbose Logging
The system SHALL provide optional verbose logging for trace operations.

#### Scenario: Verbose mode enabled
- **WHEN** verbose option is enabled
- **THEN** trace operations are logged to console
- **AND** operation details and counts are displayed

### Requirement: Shared Storage Integration
The system SHALL integrate with HAMI's shared storage for workflow state management.

#### Scenario: Trace ID storage
- **WHEN** log operations complete
- **THEN** generated trace IDs are stored in shared.traceId
- **AND** trace results are stored in shared.traceResults