module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:prettier/recommended',
      'prettier',
      'eslint:recommended'
    ],
    plugins: ['simple-import-sort', 'import', '@typescript-eslint', 'prettier'],
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      project: 'tsconfig.json',
    },
    env: {
      es6: true,
      node: true,
    },
    rules: {
      'no-var': 'error',
      semi: 'off',
      indent: ['error', 2, { SwitchCase: 1 }],
      'no-multi-spaces': 'error',
      'space-in-parens': 'error',
      'no-multiple-empty-lines': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports.
            ['^\\u0000'],
            ['^@?\\w'],
            // Internal packages.
            //  [`^(${importPaths})(/.*|$)`],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],  
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto',
        },
      ],    
    },
  };