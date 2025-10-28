import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends(
      'next/core-web-vitals',
      'eslint:recommended',
      'plugin:react/recommended'
    ),
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        NodeJS: true,
      },

      ecmaVersion: 9,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          modules: true,
        },
      },
    },
    rules: {
      '@next/next/no-img-element': 'off',
      'array-bracket-newline': ['error', 'consistent'],
      'arrow-body-style': 'off',
      'brace-style': ['error', '1tbs'],
      'class-methods-use-this': 'off',
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'only-multiline',
        },
      ],

      curly: ['error', 'all'],
      'import/imports-first': 'off',
      'import/newline-after-import': 'off',
      'import/no-dynamic-require': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-named-as-default': 'off',
      'import/no-unresolved': 'error',
      'import/no-webpack-loader-syntax': 'off',
      'import/prefer-default-export': 'off',

      indent: [
        'error',
        2,
        {
          ignoredNodes: [
            'JSXElement',
            'JSXElement > *',
            'JSXAttribute',
            'JSXIdentifier',
            'JSXNamespacedName',
            'JSXMemberExpression',
            'JSXSpreadAttribute',
            'JSXExpressionContainer',
            'JSXOpeningElement',
            'JSXClosingElement',
            'JSXText',
            'JSXEmptyExpression',
            'JSXSpreadChild',
          ],

          SwitchCase: 1,
        },
      ],

      'max-len': 'off',
      'newline-per-chained-call': 'off',
      'no-confusing-arrow': 'off',
      'no-console': 'warn',
      'no-multi-spaces': 'error',

      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 0,
          maxBOF: 0,
        },
      ],

      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': ['error', 'nofunc'],
      'object-curly-spacing': ['error', 'always'],
      'prefer-template': 'error',

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],

      'react/button-has-type': 'off',
      'react/destructuring-assignment': ['error', 'always'],
      'react/forbid-prop-types': 'off',
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-curly-brace-presence': ['error', 'never'],

      'react/jsx-curly-spacing': [
        'error',
        {
          when: 'never',

          children: {
            when: 'never',
          },
        },
      ],

      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-filename-extension': 'off',

      'react/jsx-indent': [
        'error',
        2,
        {
          checkAttributes: true,
          indentLogicalExpressions: true,
        },
      ],

      'react/jsx-indent-props': ['error', 2],

      'react/jsx-max-props-per-line': [
        'error',
        {
          maximum: {
            multi: 1,
            single: 2,
          },
        },
      ],

      'react/jsx-no-target-blank': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-props-no-multi-spaces': 'error',
      'react/jsx-props-no-spreading': 'off',

      'react/jsx-tag-spacing': [
        'error',
        {
          closingSlash: 'never',
          beforeSelfClosing: 'always',
          afterOpening: 'never',
          beforeClosing: 'never',
        },
      ],

      'react/jsx-uses-vars': 'error',

      'react/jsx-wrap-multilines': [
        'error',
        {
          arrow: 'parens-new-line',
          assignment: 'parens-new-line',
          condition: 'parens-new-line',
          declaration: 'parens-new-line',
          prop: 'parens-new-line',
          logical: 'parens-new-line',
          return: 'parens-new-line',
        },
      ],

      'react/no-array-index-key': 'off',
      'react/no-unescaped-entities': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/require-extension': 'off',
      'react/self-closing-comp': 'off',
      'react/sort-comp': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'error',
      semi: ['error', 'always'],
      'space-infix-ops': 'error',
      'template-curly-spacing': ['error', 'never'],
    },
  },
]);
