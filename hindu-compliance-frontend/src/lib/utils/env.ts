/**
 * Environment variable validation
 * Ensures all required environment variables are present
 */

interface EnvConfig {
  // Nandi SSO
  NEXT_PUBLIC_NANDI_SSO_URL: string;
  NEXT_PUBLIC_NANDI_CLIENT_ID: string;
  NANDI_CLIENT_SECRET: string;
  NEXT_PUBLIC_NANDI_REDIRECT_URI: string;

  // Payload CMS
  NEXT_PUBLIC_PAYLOAD_CMS_URL: string;
  PAYLOAD_CMS_API_KEY: string;

  // App
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';

  // Session
  SESSION_SECRET: string;
  SESSION_MAX_AGE: string;
}

type RequiredEnvKeys = keyof EnvConfig;

const REQUIRED_ENV_VARS: RequiredEnvKeys[] = [
  'NEXT_PUBLIC_NANDI_SSO_URL',
  'NEXT_PUBLIC_NANDI_CLIENT_ID',
  'NANDI_CLIENT_SECRET',
  'NEXT_PUBLIC_NANDI_REDIRECT_URI',
  'NEXT_PUBLIC_PAYLOAD_CMS_URL',
  'PAYLOAD_CMS_API_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
  'SESSION_SECRET',
  'SESSION_MAX_AGE',
];

/**
 * Validate environment variables on server startup
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];

    if (!value) {
      missing.push(key);
      continue;
    }

    // Validate specific formats
    if (key.includes('URL') && !isValidUrl(value)) {
      invalid.push(`${key} (invalid URL format)`);
    }

    if (key === 'SESSION_SECRET' && value.length < 32) {
      invalid.push(`${key} (must be at least 32 characters)`);
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    const errors: string[] = [];

    if (missing.length > 0) {
      errors.push(`Missing required environment variables:\n  - ${missing.join('\n  - ')}`);
    }

    if (invalid.length > 0) {
      errors.push(`Invalid environment variables:\n  - ${invalid.join('\n  - ')}`);
    }

    throw new Error(`\n\nEnvironment Validation Failed:\n\n${errors.join('\n\n')}\n\nPlease check your .env.local file.\n`);
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Get environment variable with type safety
 */
export function getEnv<K extends RequiredEnvKeys>(key: K): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
}

/**
 * Check if string is valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
