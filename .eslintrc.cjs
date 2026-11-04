module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react'],
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'playwright-report', 'server/uploads'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['server/**/*.js', 'scripts/**/*.js', 'shared/**/*.js', 'e2e/**/*.js'],
      env: { node: true, browser: false },
    },
  ],
};
