/* eslint-env node */

module.exports = {
  env: {browser: true, es2022: true},
  ignorePatterns: ['dist', 'node_modules'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {ecmaVersion: 'latest', sourceType: 'module', project: ['tsconfig.json', 'tsconfig.node.json']},
  settings: {react: {version: 'detect'}},
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    quotes: ['error', 'single'],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['public/*.js'],
      parser: 'espree',
      env: {serviceworker: true, browser: true, es2022: true},
      parserOptions: {ecmaVersion: 'latest', sourceType: 'script'}
    },
    {
      files: ['*test*'],
      rules: {'@typescript-eslint/unbound-method': 'off'}
    },
  ],
}
