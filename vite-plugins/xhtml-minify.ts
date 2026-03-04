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

import { promises as fs } from 'fs';
import { minify } from 'html-minifier-terser';
import path from 'node:path';
import type { Plugin } from 'vite';
import { createFilter } from 'vite';

/**
 * Options:
 * - include / exclude: globs for files to process (default: '** /*.html' in outDir)
 * - outDir: build output directory (default: 'dist')
 */
export default function xhtmlMinifyPlugin_(
	options: {
		['outDir']?: string;
		['include']?: string[];
		['exclude']?: string[];
		['verbose']?: boolean;
	} = {},
): Plugin {
	const {
		outDir = 'dist',
		include = ['**/*.html'],
		exclude,
		// If true, run only on files that changed? unused for now
		verbose = false,
	} = options;

	const filter = createFilter(include, exclude);

	// Utility to read all files under a directory recursively
	async function walk(dir: string): Promise<string[]> {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		const files = await Promise.all(
			entries.map(async (entry) => {
				const res = path.resolve(dir, entry.name);
				return entry.isDirectory() ? await walk(res) : res;
			}),
		);
		return Array.prototype.concat(...files);
	}

	async function minifyHTML(filePath: string): Promise<void> {
		const src = await fs.readFile(filePath, 'utf-8');

		let out = await minify(src, {
			// Whitespace & comments
			collapseWhitespace: true,
			conservativeCollapse: false,
			removeComments: true,
			// But keep copyright / licence banners and IE conditionals
			ignoreCustomComments: [/^!/],

			// Attributes
			removeRedundantAttributes: true,
			removeEmptyAttributes: true,
			sortAttributes: true,
			sortClassName: true,
			// Keep quotes — XHTML requires them
			removeAttributeQuotes: false,

			// Inline CSS / JS
			minifyCSS: true,
			minifyJS: true,

			// Don't strip type="..." on scripts / styles (XHTML compat)
			removeScriptTypeAttributes: false,
			removeStyleLinkTypeAttributes: false,

			// Preserve XHTML self-closing syntax
			keepClosingSlash: true,

			// Misc
			removeOptionalTags: false,
			decodeEntities: false,
			processScripts: ['application/ld+json'],
		});

		// ── XHTML polyglot fixups ──────────────────────────────────
		// 1. Void elements must self-close: <meta ...> → <meta ... />
		const voidElements = [
			'area',
			'base',
			'br',
			'col',
			'embed',
			'hr',
			'img',
			'input',
			'link',
			'meta',
			'param',
			'source',
			'track',
			'wbr',
		];
		const voidRe = new RegExp(
			`<(${voidElements.join('|')})\\b([^>]*?)\\s*/?>`,
			'gi',
		);
		out = out.replace(voidRe, '<$1$2 />');

		// 2. Boolean attributes need explicit values: checked → checked="checked"
		const boolAttrs = [
			'allowfullscreen',
			'async',
			'autofocus',
			'autoplay',
			'checked',
			'controls',
			'default',
			'defer',
			'disabled',
			'formnovalidate',
			'hidden',
			'inert',
			'ismap',
			'itemscope',
			'loop',
			'multiple',
			'muted',
			'nomodule',
			'novalidate',
			'open',
			'playsinline',
			'readonly',
			'required',
			'reversed',
			'selected',
			'spellcheck',
		];
		for (const attr of boolAttrs) {
			const attrRe = new RegExp(
				`(<[a-z][^>]*\\s)${attr}(?=\\s|/?>)`,
				'gi',
			);
			out = out.replace(attrRe, `$1${attr}="${attr}"`);
		}

		// 3. Strip any XML declaration
		out = out.replace(/^\s*<\?xml[^?]*\?>\s*/i, '');

		// 4. Normalise DOCTYPE to uppercase
		out = out.replace(/<!doctype\s+html\s*>/i, '<!DOCTYPE html>');

		// 5. Ensure POSIX-compliant trailing newline
		if (!out.endsWith('\n')) out += '\n';

		await fs.writeFile(filePath, out, 'utf-8');
	}

	return {
		name: 'vite:xhtml-minify',
		apply: 'build',
		async ['closeBundle']() {
			// The Vite build output dir; attempt to read from process.cwd()/outDir
			const fullOut = path.resolve(process.cwd(), outDir);
			let allFiles: string[];
			try {
				allFiles = await walk(fullOut);
			} catch (e) {
				if (verbose)
					console.warn(
						`[vite:xhtml-minify] outDir not found: ${fullOut}`,
						e,
					);
				return;
			}

			const htmlFiles = allFiles.filter(
				(f) => filter(path.relative(fullOut, f)) && f.endsWith('.html'),
			);
			if (htmlFiles.length === 0) {
				if (verbose)
					console.log('[vite:xhtml-minify] no HTML files found');
				return;
			}

			await Promise.all(
				htmlFiles.map(async (file) => {
					try {
						await minifyHTML(file);
						if (verbose)
							console.log(
								`[vite:xhtml-minify] minified ${path.relative(fullOut, file)}`,
							);
					} catch (e) {
						this.error(
							`Failed to minify ${file}: ${(e as Error).message}`,
						);
					}
				}),
			);
		},
	};
}
