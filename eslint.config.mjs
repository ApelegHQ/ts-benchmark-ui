/**
 * @copyright
 * Copyright © 2026 Apeleg Limited. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import plugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import svelteParser from 'svelte-eslint-parser';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default [
	{
		ignores: [
			'**/node_modules/*',
			'**/.nyc_output/*',
			'**/dist/*',
			'**/build/*',
			'**/coverage/*',
			'**/package-lock.json',
		],
	},
	js.configs.recommended,
	...compat.extends('plugin:@typescript-eslint/recommended'),
	prettierRecommended,
	// svelte.configs['flat/recommended'],
	// svelte.configs['flat/prettier'],
	{
		languageOptions: {
			parser,
			globals: {
				...globals.node,
			},
		},
		plugins: { plugin, svelte },
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'typeParameter',
					format: ['PascalCase'],
					prefix: ['T'],
				},
				{
					selector: 'interface',
					format: ['PascalCase'],
					prefix: ['I'],
				},
				{
					selector: 'enumMember',
					format: ['UPPER_CASE'],
					trailingUnderscore: 'require',
				},
				{
					selector: 'variable',
					modifiers: ['exported'],
					format: ['camelCase', 'PascalCase'],
					trailingUnderscore: 'require',
				},
				{
					selector: 'function',
					modifiers: ['exported'],
					format: ['camelCase', 'PascalCase'],
					trailingUnderscore: 'require',
				},
				{
					selector: 'typeProperty',
					format: ['camelCase'],
					trailingUnderscore: 'require',
				},
				{
					selector: 'method',
					format: ['camelCase'],
					trailingUnderscore: 'require',
				},
			],
		},
		settings: {
			svelte: {
				typescript: true,
			},
		},
	},
	{
		files: ['**/*.js', '**/*.schema.json', '**/package.json', '**/*.d.ts'],
		rules: {
			'@typescript-eslint/naming-convention': 'off',
		},
	},
	{
		files: ['**/*.json', '**/closure-externs.js'],
		rules: {
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
	{
		files: ['**/*.cjs', '**/*.cts'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			globals: {
				...globals.browser,
			},
			parserOptions: {
				parser,
				tsconfigRootDir: __dirname,
				project: ['./tsconfig.app.json'],
				extraFileExtensions: ['.svelte'],
			},
		},
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'typeParameter',
					format: ['PascalCase'],
					prefix: ['T'],
				},
				{
					selector: 'interface',
					format: ['PascalCase'],
					prefix: ['I'],
				},
				{
					selector: 'enumMember',
					format: ['UPPER_CASE'],
					trailingUnderscore: 'require',
				},
				{
					selector: 'variable',
					modifiers: ['exported'],
					format: ['camelCase', 'PascalCase'],
					trailingUnderscore: 'allow',
				},
				{
					selector: 'typeProperty',
					format: ['camelCase'],
					trailingUnderscore: 'allow',
				},
				{
					selector: 'method',
					format: ['camelCase'],
					trailingUnderscore: 'require',
				},
			],
		},
	},
];
