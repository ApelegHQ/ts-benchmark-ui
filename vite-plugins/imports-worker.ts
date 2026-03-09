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

import plugin from '@apeleghq/esbuild-plugin-closure-compiler';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { type Plugin } from 'vite';

export default function _(): Plugin {
	let done = false;

	return {
		name: 'vite:imports-worker',
		apply: 'build',
		enforce: 'post',
		async ['transformIndexHtml']() {
			if (done) return;

			await build({
				minify: true,
				bundle: true,
				entryPoints: [
					fileURLToPath(
						new URL('../worker/imports/main.ts', import.meta.url),
					),
				],
				outfile: fileURLToPath(
					new URL(
						'../dist/' +
							(process.env.IMPORTS_WORKER_PATH ??
								'/assets/imports.js'),
						import.meta.url,
					),
				),
				format: 'iife',
				plugins: [
					plugin({
						compilation_level: 'ADVANCED_OPTIMIZATIONS',
						language_in: 'ECMASCRIPT_NEXT',
						language_out: 'ECMASCRIPT_2020',
					}),
				],
			});
			done = true;
		},
	};
}
