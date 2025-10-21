# Core Configuration File System

## Purpose
The HAMI Core Configuration File System provides hierarchical configuration management with support for local project and global user configurations, enabling workflows to store and retrieve configuration data persistently.

## Requirements

### Requirement: Configuration Retrieval
The system SHALL provide the ability to retrieve configuration values from local and global config files.

#### Scenario: Get local config value
- **WHEN** a get node targets local configuration
- **THEN** the value is retrieved from the project's config file
- **AND** the value is stored in shared storage

#### Scenario: Get global config value
- **WHEN** a get node targets global configuration
- **THEN** the value is retrieved from the user's global config file
- **AND** the value is stored in shared storage

#### Scenario: Get with fallback
- **WHEN** a get node uses local-and-global target
- **THEN** local config is checked first, then global as fallback
- **AND** the first available value is returned

### Requirement: Configuration Setting
The system SHALL provide the ability to set configuration values in local and global config files.

#### Scenario: Set local config value
- **WHEN** a set node targets local configuration
- **THEN** the value is written to the project's config file
- **AND** the previous value is returned and stored

#### Scenario: Set global config value
- **WHEN** a set node targets global configuration
- **THEN** the value is written to the user's global config file
- **AND** the previous value is returned and stored

### Requirement: Configuration Removal
The system SHALL provide the ability to remove configuration keys from config files.

#### Scenario: Remove config key
- **WHEN** a remove node is executed with a key
- **THEN** the key is deleted from the specified config file
- **AND** the previous value is returned

### Requirement: Bulk Configuration Retrieval
The system SHALL provide the ability to retrieve all configuration values at once.

#### Scenario: Get all config values
- **WHEN** a get-all node is executed
- **THEN** all configuration values are retrieved and returned
- **AND** the complete config object is stored in shared storage

### Requirement: Configuration File Management
The system SHALL manage configuration files with proper JSON serialization.

#### Scenario: Config file creation
- **WHEN** a config file doesn't exist
- **THEN** it is created automatically when writing
- **AND** proper directory structure is ensured

#### Scenario: Config file validation
- **WHEN** reading config files
- **THEN** invalid JSON is handled gracefully
- **AND** empty objects are returned for missing files

### Requirement: Hierarchical Configuration
The system SHALL support hierarchical configuration with local overriding global settings.

#### Scenario: Local precedence
- **WHEN** both local and global configs have the same key
- **THEN** local value takes precedence in local-and-global retrieval
- **AND** global value serves as fallback

### Requirement: Verbose Logging
The system SHALL provide optional verbose logging for configuration operations.

#### Scenario: Verbose mode enabled
- **WHEN** verbose option is enabled
- **THEN** configuration operations are logged to console
- **AND** previous and new values are displayed

### Requirement: Shared Storage Integration
The system SHALL integrate with HAMI's shared storage for workflow state management.

#### Scenario: Value storage
- **WHEN** get operations complete
- **THEN** retrieved values are stored in shared.configValue
- **AND** previous values are stored in shared.configValuePrevious