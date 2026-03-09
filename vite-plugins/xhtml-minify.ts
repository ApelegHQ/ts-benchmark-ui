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

import { minify } from 'html-minifier-terser';
import type { Plugin } from 'vite';

const minifyOpts = {
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

	maxLineLength: 500,
};

async function minifyHTML(src: string): Promise<string> {
	let out = await minify(src, {
		...minifyOpts,
		maxLineLength: undefined,
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
		const attrRe = new RegExp(`(<[a-z][^>]*\\s)${attr}(?=\\s|/?>)`, 'gi');
		out = out.replace(attrRe, `$1${attr}="${attr}"`);
	}
	out = out.replace(
		/(<[a-z][^>]*\s)crossorigin(?=\s|\/?>)/gi,
		`$1crossorigin="anonymous"`,
	);

	// 2b. Second pass
	out = await minify(out, minifyOpts);

	// 3. Strip any XML declaration
	out = out.replace(/^\s*<\?xml[^?]*\?>\s*/i, '');

	// 4. Normalise DOCTYPE to uppercase
	out = out.replace(/<!doctype\s+html\s*>/i, '<!DOCTYPE html>');

	// 5. Ensure POSIX-compliant trailing newline
	if (!out.endsWith('\n')) out += '\n';

	return out;
}

export default function xhtmlMinifyPlugin_(): Plugin {
	return {
		name: 'vite:xhtml-minify',
		apply: 'build',
		enforce: 'post',
		async ['transformIndexHtml'](src, ctx) {
			try {
				return await minifyHTML(src);
			} catch (e) {
				this.error(
					`Failed to minify ${ctx.filename}: ${(e as Error).message}`,
				);
			}
		},
	};
}
