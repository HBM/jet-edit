module.exports = {
  env: {
    browser: true,
    es2020: true,
    jest: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:import/warnings',
    'plugin:prettier/recommended', // Runs Prettier as an ESLint rule and reports differences as individual ESLint issues.
    'plugin:react/recommended', // React specific linting rules for ESLint
    'prettier/@typescript-eslint' // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    },
    sourceType: 'module'
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect'
    }
  }
}
