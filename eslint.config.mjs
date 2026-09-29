import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Local-only Claude Design / reference dumps (not shipped):
    '.claude-design-tmp*/**',
    'references/**',
    // Generated local agent session state (gitignored, not application code):
    '.remember/**',
  ]),
]);

export default eslintConfig;
