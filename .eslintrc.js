module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended' // Enables Prettier integration
    ],
    env: {
      node: true,
      jest: true, // If using Jest
      es6: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: './tsconfig.json', // Ensure this points to your tsconfig.json
    },
    rules: {
      'prettier/prettier': 'error', // Enforce Prettier formatting
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
    ignorePatterns: ['node_modules', 'dist'],
  };
  