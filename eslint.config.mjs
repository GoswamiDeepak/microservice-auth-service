import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    {
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            'no-unused-vars': 'error',
            'no-console': 'error',
        },      
    },
    {
        ignores: ['dist', 'node_modules'],
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
];
