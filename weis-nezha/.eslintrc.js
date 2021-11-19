module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  globals: {
    'QueryComponents': 'readonly',
    'BasePageTable': 'readonly',
    'BaseSelect': 'readonly',
    'NumberInput': 'readonly',
    'DatePicker': 'readonly',
    'ReturnButton': 'readonly',
    JSX: true
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/base',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'import/prefer-default-export': 0,
    'default-case': 0,
    'comma-dangle': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'linebreak-style': 0,
    'no-await-in-loop': 0,
    'semi': ['error', 'never'],
    'prefer-destructuring': 0,
    'vue/component-definition-name-casing': 0,
    'no-unused-expressions': 0,
    'max-len': ['error', 200],
    'vue/max-attributes-per-line': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/html-self-closing': 0,
    'quotes': [1, 'single'],
    '@typescript-eslint/indent': ['error', 2, { 'SwitchCase': 1 }],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'key-spacing': ['error', { 'afterColon': true }],
    'no-undef': 'error',
    'comma-dangle': 'error',
    'no-unused-vars': 'error',
    'vue/multiline-html-element-content-newline': 0,
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1
      }
    ]
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      'jsx': true
    }
  }
}
