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
import { existsSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'postcss';
import functions from 'postcss-functions';
import postcssNesting from 'postcss-nesting';
import { defineConfig } from 'vite';
import sri from 'vite-plugin-sri-gen';
import customMetaPlugin from './vite-plugins/custom-meta.js';
import importsWorkerPlugin from './vite-plugins/imports-worker.js';
import renameIndexPlugin from './vite-plugins/rename-index.js';
import serviceWorkerPlugin from './vite-plugins/service-worker.js';
import xhtmlMinifyPlugin from './vite-plugins/xhtml-minify.js';

const locale = process.env.LOCALE || 'en';

const indexDefaultPath = fileURLToPath(
	new URL(`./index.html`, import.meta.url),
);
const indexLocalePath = fileURLToPath(
	new URL(`./index.${locale}.html`, import.meta.url),
);
const indexPath = existsSync(indexLocalePath)
	? indexLocalePath
	: indexDefaultPath;

let dir: string | null = 'ltr';
let textOrientation: string | null = null;
let writingMode: string | null = 'horizontal-tb';

try {
	const { LANG_DIR_, LANG_WRITING_MODE_, LANG_TEXT_ORIENTATION_ } =
		await import(`./src/i18n/strings.${locale}.ts`);

	dir = LANG_DIR_;
	writingMode = LANG_WRITING_MODE_;
	textOrientation = LANG_TEXT_ORIENTATION_;
} catch {
	// empty
}

const atNonTbLr = (
	dir: null | string,
	_textOrientation: null | string,
	writingMode: null | string,
): Plugin => ({
	postcssPlugin: 'at-nontblr',
	AtRule: {
		['media']: (atRule) => {
			if (atRule.params !== 'not (writing-mode: tb-lr)') return;
			if (
				(!dir || dir === 'ltr') &&
				(!writingMode || writingMode === 'horizontal-tb')
			) {
				atRule.remove();
			} else {
				if (atRule.parent && atRule.nodes) {
					for (const node of atRule.nodes.reverse()) {
						atRule.parent.insertAfter(atRule, node);
					}
				}
			}
		},
	},
});

const functionsPlugin = (
	dir: null | string,
	textOrientation: null | string,
	writingMode: null | string,
) => {
	return functions({
		functions: {
			['--x-direction']() {
				return dir || 'ltr';
			},
			['--x-text-orientation']() {
				return textOrientation || 'mixed';
			},
			['--x-writing-mode']() {
				return writingMode || 'horizontal-tb';
			},
		},
	});
};

// https://vite.dev/config/
export default defineConfig({
	resolve:
		locale === 'en'
			? undefined
			: {
					alias: [
						{
							find: /^(.*\/i18n\/strings)\.js$/,
							replacement: `$1.${locale}.ts`,
						},
					],
				},
	build: {
		manifest: `.vite/manifest.${locale}.json`,
		outDir: 'dist',
		rollupOptions: {
			input: {
				runner: fileURLToPath(
					new URL('./resources/runner.html', import.meta.url),
				),
				index: indexPath,
			},
		},
		target: 'esnext',
	},
	css: {
		postcss: {
			plugins: [
				functionsPlugin(dir, textOrientation, writingMode),
				atNonTbLr(dir, textOrientation, writingMode),
				postcssNesting(),
				cssnano({ preset: 'default' }),
			],
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
		renameIndexPlugin({
			from: basename(indexPath),
			to: `${locale}/index.html`,
		}),
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
