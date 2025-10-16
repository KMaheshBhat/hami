/**
 * Validation utilities for schema-based validation
 * @packageDocumentation
 */

export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Optional error message if validation failed */
  error?: string;
  /** Optional list of validation errors */
  errors?: string[];
}

/**
 * Configuration schema for OpNode validation
 */
export interface ValidationSchema {
  /** Type of the value (string, number, boolean, object, array) */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Whether the field is required (for non-objects) or list of required properties (for objects) */
  required?: boolean | string[];
  /** Default value if not provided */
  default?: any;
  /** Enumeration of allowed values */
  enum?: any[];
  /** Minimum value (for numbers) */
  minimum?: number;
  /** Maximum value (for numbers) */
  maximum?: number;
  /** Minimum length (for strings and arrays) */
  minLength?: number;
  /** Maximum length (for strings and arrays) */
  maxLength?: number;
  /** Pattern for string validation (regex) */
  pattern?: string;
  /** Nested schema for objects */
  properties?: Record<string, ValidationSchema>;
  /** Item schema for arrays */
  items?: ValidationSchema;
  /** Description of the field */
  description?: string;
}

/**
 * Validate a value against a schema
 * @param value - The value to validate
 * @param schema - The validation schema
 * @param path - Current path in the object (for error reporting)
 * @returns ValidationResult object
 */
export function validateAgainstSchema(
  value: any,
  schema: ValidationSchema,
  path: string = ''
): ValidationResult {
  const errors: string[] = [];

  // Check required field (for non-objects)
  if (schema.type !== 'object' && schema.required === true && (value === undefined || value === null || value === '')) {
    errors.push(`${path || 'value'} is required`);
    return { isValid: false, errors };
  }

  // If value is not required and not provided, use default
  if (!schema.required && (value === undefined || value === null)) {
    if (schema.default !== undefined) {
      return { isValid: true };
    }
    return { isValid: true };
  }

  // Check type
  if (value !== undefined && value !== null) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== schema.type) {
      errors.push(`${path || 'value'} must be of type ${schema.type}, got ${actualType}`);
    }
  }

  // Type-specific validation
  if (value !== undefined && value !== null && errors.length === 0) {
    switch (schema.type) {
      case 'string':
        validateString(value, schema, path, errors);
        break;
      case 'number':
        validateNumber(value, schema, path, errors);
        break;
      case 'boolean':
        validateBoolean(value, schema, path, errors);
        break;
      case 'object':
        validateObject(value, schema, path, errors);
        break;
      case 'array':
        validateArray(value, schema, path, errors);
        break;
    }
  }

  // Check enum
  if (schema.enum && value !== undefined && value !== null && !schema.enum.includes(value)) {
    errors.push(`${path || 'value'} must be one of: ${schema.enum.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validate a string value
 */
function validateString(
  value: any,
  schema: ValidationSchema,
  path: string,
  errors: string[]
): void {
  if (typeof value !== 'string') {
    errors.push(`${path || 'value'} must be a string`);
    return;
  }

  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push(`${path || 'value'} must be at least ${schema.minLength} characters long`);
  }

  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push(`${path || 'value'} must be at most ${schema.maxLength} characters long`);
  }

  if (schema.pattern) {
    try {
      const regex = new RegExp(schema.pattern);
      const isValid = regex.test(value);
      if (!isValid) {
        errors.push(`${path || 'value'} must match pattern: ${schema.pattern}`);
      }
    } catch (error) {
      // If regex compilation fails, skip pattern validation
    }
  }
}

/**
 * Validate a number value
 */
function validateNumber(
  value: any,
  schema: ValidationSchema,
  path: string,
  errors: string[]
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${path || 'value'} must be a valid number`);
    return;
  }

  if (schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${path || 'value'} must be at least ${schema.minimum}`);
  }

  if (schema.maximum !== undefined && value > schema.maximum) {
    errors.push(`${path || 'value'} must be at most ${schema.maximum}`);
  }
}

/**
 * Validate a boolean value
 */
function validateBoolean(
  value: any,
  schema: ValidationSchema,
  path: string,
  errors: string[]
): void {
  if (typeof value !== 'boolean') {
    errors.push(`${path || 'value'} must be a boolean`);
  }
}

/**
 * Validate an object value
 */
function validateObject(
  value: any,
  schema: ValidationSchema,
  path: string,
  errors: string[]
): void {
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    errors.push(`${path || 'value'} must be an object`);
    return;
  }

  // Check required properties for objects
  if (schema.required && Array.isArray(schema.required)) {
    for (const prop of schema.required) {
      if (!(prop in value)) {
        errors.push(`${path || 'value'}.${prop} is required`);
      }
    }
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const propPath = path ? `${path}.${key}` : key;
      const result = validateAgainstSchema(value[key], propSchema, propPath);
      if (!result.isValid && result.errors) {
        errors.push(...result.errors);
      }
    }
  }
}

/**
 * Validate an array value
 */
function validateArray(
  value: any,
  schema: ValidationSchema,
  path: string,
  errors: string[]
): void {
  if (!Array.isArray(value)) {
    errors.push(`${path || 'value'} must be an array`);
    return;
  }

  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push(`${path || 'value'} must have at least ${schema.minLength} items`);
  }

  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push(`${path || 'value'} must have at most ${schema.maxLength} items`);
  }

  if (schema.items) {
    for (let i = 0; i < value.length; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      const result = validateAgainstSchema(value[i], schema.items, itemPath);
      if (!result.isValid && result.errors) {
        errors.push(...result.errors);
      }
    }
  }
}
