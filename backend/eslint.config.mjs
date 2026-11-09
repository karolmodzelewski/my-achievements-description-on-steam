import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import path from 'node:path';
import globals from 'globals';
import _import from 'eslint-plugin-import';
import stylistic from '@stylistic/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.nyc_output/**'],
    },
    ...fixupConfigRules(compat.extends('plugin:import/typescript', 'plugin:import/errors', 'plugin:import/warnings', 'plugin:import/recommended', 'plugin:@typescript-eslint/recommended')).map(
        (config) => ({
            ...config,
            files: ['**/*.ts'],
        })
    ),
    {
        files: ['**/*.ts'],

        plugins: {
            '@typescript-eslint': fixupPluginRules(typescriptEslint),
            '@stylistic': stylistic,
            'unused-imports': unusedImports,
            import: fixupPluginRules(_import),
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: 'commonjs',
            parserOptions: {
                projectService: true,
            },
        },

        settings: {
            'import/internal-regex': '@nestjs/',
            'import/external-module-folders': ['node_modules'],
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts'],
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: 'tsconfig.json',
                },
                node: {
                    extensions: ['.ts'],
                },
            },
        },

        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/adjacent-overload-signatures': 'off',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-deprecated': 'error',
            '@typescript-eslint/no-unnecessary-type-arguments': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/prefer-includes': 'error',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/no-redundant-type-constituents': 'error',
            '@typescript-eslint/no-useless-constructor': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/prefer-enum-initializers': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/return-await': 'error',
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
            '@typescript-eslint/strict-boolean-expressions': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/only-throw-error': 'error',
            '@typescript-eslint/prefer-promise-reject-errors': 'error',
            '@typescript-eslint/no-unnecessary-template-expression': 'error',
            '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
            '@typescript-eslint/no-unnecessary-type-conversion': 'error',
            '@typescript-eslint/no-misused-spread': 'error',
            '@typescript-eslint/no-unsafe-enum-comparison': 'error',
            '@typescript-eslint/strict-void-return': 'error',
            '@typescript-eslint/prefer-string-starts-ends-with': 'error',
            '@typescript-eslint/prefer-find': 'error',
            '@typescript-eslint/dot-notation': 'error',
            '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/consistent-type-definitions': 'error',
            '@typescript-eslint/array-type': ['error', { default: 'array' }],
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/method-signature-style': 'error',
            '@typescript-eslint/no-unused-private-class-members': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/no-confusing-void-expression': [
                'error',
                {
                    ignoreArrowShorthand: true,
                },
            ],
            '@typescript-eslint/switch-exhaustiveness-check': [
                'error',
                {
                    allowDefaultCaseForExhaustiveSwitch: true,
                    considerDefaultExhaustiveForUnions: true,
                },
            ],
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                {
                    allowBoolean: true,
                    allowNumber: true,
                },
            ],
            '@typescript-eslint/no-extraneous-class': [
                'error',
                {
                    allowWithDecorator: true,
                    allowStaticOnly: true,
                },
            ],
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowTernary: true,
                    allowShortCircuit: true,
                },
            ],
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'explicit',
                    overrides: {
                        constructors: 'off',
                    },
                },
            ],
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'property',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                },
            ],
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/member-ordering': [
                'error',
                {
                    default: [
                        // Index signature
                        'signature',

                        // Fields
                        'public-static-field',
                        'protected-static-field',
                        'private-static-field',

                        /* Decorated setters (start) */
                        'public-decorated-set',
                        'protected-decorated-set',
                        'private-decorated-set',
                        /* Decorated setters (end) */

                        /* Decorated getters (start) */
                        'public-decorated-get',
                        'protected-decorated-get',
                        'private-decorated-get',
                        /* Decorated getters (end) */

                        'public-decorated-field',
                        'protected-decorated-field',
                        'private-decorated-field',

                        'public-instance-field',
                        'protected-instance-field',
                        'private-instance-field',

                        'public-abstract-field',
                        'protected-abstract-field',

                        'public-field',
                        'protected-field',
                        'private-field',

                        // Setters
                        'public-static-set',
                        'protected-static-set',
                        'private-static-set',

                        'public-instance-set',
                        'protected-instance-set',
                        'private-instance-set',

                        'public-abstract-set',
                        'protected-abstract-set',

                        'public-set',
                        'protected-set',
                        'private-set',

                        // Getters
                        'public-static-get',
                        'protected-static-get',
                        'private-static-get',

                        'public-instance-get',
                        'protected-instance-get',
                        'private-instance-get',

                        'public-abstract-get',
                        'protected-abstract-get',

                        'public-get',
                        'protected-get',
                        'private-get',

                        // Constructors
                        'constructor',

                        // Methods
                        'public-static-method',
                        'protected-static-method',
                        'private-static-method',

                        'public-decorated-method',
                        'protected-decorated-method',
                        'private-decorated-method',

                        'public-instance-method',
                        'protected-instance-method',
                        'private-instance-method',

                        'public-abstract-method',
                        'protected-abstract-method',

                        'public-method',
                        'protected-method',
                        'private-method',
                    ],
                },
            ],
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
            '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
            '@stylistic/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                {
                    blankLine: 'any',
                    prev: ['const', 'let', 'var'],
                    next: ['const', 'let', 'var'],
                },
                { blankLine: 'always', prev: 'directive', next: '*' },
                { blankLine: 'always', prev: 'block-like', next: '*' },
                { blankLine: 'never', prev: 'case', next: 'case' },
                { blankLine: 'never', prev: 'case', next: 'block-like' },
                { blankLine: 'never', prev: 'block-like', next: 'case' },
            ],
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_',
                },
            ],
            'prefer-const': 'error',
            'arrow-body-style': 'error',
            'id-denylist': ['error', 'err', 'e', 'cb', 'ev'],
            'no-underscore-dangle': 'error',
            'max-classes-per-file': ['error', 1],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'warn',
            'no-alert': 'error',
            'no-var': 'error',
            'no-irregular-whitespace': 'off',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-param-reassign': 'error',
            'prefer-template': 'error',
            'object-shorthand': 'error',
            'no-nested-ternary': 'error',
            'no-else-return': 'error',
            'no-useless-rename': 'error',
            'no-useless-concat': 'error',
            'prefer-arrow-callback': 'error',
            'no-return-assign': 'error',
            'default-case-last': 'error',
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'error',
            'no-constructor-return': 'error',
            'no-promise-executor-return': 'error',
            'no-unassigned-vars': 'error',
            'no-useless-assignment': 'error',
            'preserve-caught-error': 'error',
            'import/named': 'error',
            'import/no-cycle': 'error',
            'import/no-unresolved': 'error',
            'import/no-duplicates': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-self-import': 'error',
            'import/no-useless-path-segments': 'error',
            'import/no-mutable-exports': 'error',
            'import/no-extraneous-dependencies': 'error',
            'import/namespace': [
                'error',
                {
                    allowComputed: true,
                },
            ],
            'import/order': [
                'error',
                {
                    'newlines-between': 'always',
                    groups: ['internal', 'unknown', 'external', ['parent', 'sibling', 'index']],
                    pathGroups: [
                        {
                            pattern: 'rxjs',
                            group: 'unknown',
                        },
                        {
                            pattern: 'rxjs/**',
                            group: 'unknown',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin', 'type', 'object'],
                },
            ],
        },
    },
];
