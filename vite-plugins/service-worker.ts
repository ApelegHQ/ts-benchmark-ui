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
import gitCommitHash_ from './git-commit-hash';

export default function _(): Plugin {
	let done = false;

	return {
		name: 'vite:service-worker',
		apply: 'build',
		enforce: 'post',
		async ['transformIndexHtml']() {
			if (done) return;

			await build({
				minify: true,
				bundle: true,
				define: {
					'import.meta.version': JSON.stringify(gitCommitHash_),
				},
				entryPoints: [
					fileURLToPath(
						new URL('../service-worker/main.ts', import.meta.url),
					),
				],
				outfile: fileURLToPath(
					new URL(
						'../dist/' +
							(process.env.SERVICE_WORKER_PATH ??
								'/service-worker.js'),
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
