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

import { svelte } from '@sveltejs/vite-plugin-svelte';
import cssnano from 'cssnano';
import postcssNesting from 'postcss-nesting';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import sri from 'vite-plugin-sri-gen';
import customMetaPlugin from './vite-plugins/custom-meta.js';
import importsWorkerPlugin from './vite-plugins/imports-worker.js';
import serviceWorkerPlugin from './vite-plugins/service-worker.js';
import xhtmlMinifyPlugin from './vite-plugins/xhtml-minify.js';

// https://vite.dev/config/
export default defineConfig({
	build: {
		manifest: true,
		rollupOptions: {
			input: {
				runner: fileURLToPath(
					new URL('./resources/runner.html', import.meta.url),
				),
				index: fileURLToPath(new URL('./index.html', import.meta.url)),
			},
		},
		target: 'esnext',
	},
	css: {
		postcss: {
			plugins: [postcssNesting(), cssnano({ preset: 'default' })],
		},
	},
	plugins: [
		svelte(),
		customMetaPlugin(),
		serviceWorkerPlugin(),
		importsWorkerPlugin(),
		sri({
			algorithm: 'sha384',
			crossorigin: 'anonymous',
			fetchCache: true,
			fetchTimeoutMs: 5000,
			skipResources: [],
			verboseLogging: true,
			preloadDynamicChunks: false,
			runtimePatchDynamicLinks: false,
		}),
		xhtmlMinifyPlugin(),
	],
	preview: {
		headers: {
			'access-control-allow-origin': '*',
			'cross-origin-opener-policy': 'same-origin',
			// 'cross-origin-embedder-policy': 'require-corp',
		},
	},
	server: {
		headers: {
			'access-control-allow-origin': '*',
			'cross-origin-opener-policy': 'same-origin',
			// 'cross-origin-embedder-policy': 'require-corp',
		},
	},
});
