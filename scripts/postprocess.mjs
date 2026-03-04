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

import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';

const distURL = (path) => new URL(`../dist/${path}`, import.meta.url);
const distPath = (path) => fileURLToPath(distURL(path));

const computeDigests = async (urls) =>
	await Promise.all(
		urls.map(async (url) => {
			const data = await readFile(fileURLToPath(url));
			const digest = await crypto.subtle.digest('SHA-384', data);
			return `'sha384-${Buffer.from(digest).toString('base64')}'`;
		}),
	);

const resolveEntry = (manifest, entryKey) => {
	const entry = manifest[entryKey];
	const importKeys = entry.imports || [];
	const cssRelPaths = entry.css || [];

	const allJsPaths = [
		entry.file,
		...importKeys.map((key) => manifest[key].file),
	];

	return {
		jsURLs: allJsPaths.map(distURL),
		cssURLs: cssRelPaths.map(distURL),
		jsPaths: allJsPaths.map((p) => `/${p}`),
		cssPaths: cssRelPaths.map((p) => `/${p}`),
	};
};

const preloadHeaders = (jsPaths, cssPaths) => [
	...jsPaths.map((p) => `link: <${p}>; rel=preload; as=script`),
	...cssPaths.map((p) => `link: <${p}>; rel=preload; as=style`),
];

const buildCSP = (jsDigests) =>
	[
		`default-src 'self'`,
		`script-src ${jsDigests.join(' ')} 'self' 'strict-dynamic'`,
		`script-src-attr 'none'`,
		`script-src-elem ${jsDigests.join(' ')} 'self' 'strict-dynamic'`,
		`style-src 'self' 'unsafe-inline'`,
		`style-src-attr 'self'`,
		`style-src-elem 'self' 'unsafe-inline'`,
		`frame-ancestors 'none'`,
		`upgrade-insecure-requests`,
	].join('; ');

const collectRunnerAssetPaths = (manifest) => {
	const entry = manifest['resources/runner.html'];
	if (!entry) return [];

	const importKeys = entry.imports || [];
	const files = new Set([
		entry.file,
		...importKeys.map((key) => manifest[key].file),
		...(entry.css || []),
	]);

	return [...files].map((f) => `/${f}`);
};

/**
 * Minify an HTML file in place, producing XHTML-polyglot output.
 *
 * html-minifier-terser collapses whitespace, removes comments, and
 * minifies inline CSS/JS. We then patch the output to ensure it
 * remains valid XHTML (self-closing void elements, explicit attribute
 * values, XML declaration).
 */
const minifyHTML = async (filePath) => {
	const src = await readFile(filePath, 'utf-8');

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
		// Match the attribute when it appears without ="..."
		const attrRe = new RegExp(`(<[a-z][^>]*\\s)${attr}(?=\\s|/?>)`, 'gi');
		out = out.replace(attrRe, `$1${attr}="${attr}"`);
	}

	// 3. Strip any XML declaration (not valid in polyglot markup —
	//    encoding is conveyed via <meta charset> and Content-Type header)
	out = out.replace(/^\s*<\?xml[^?]*\?>\s*/i, '');

	// 4. Normalise DOCTYPE to uppercase (polyglot requirement:
	//    XML parsers treat <!doctype> as case-sensitive)
	out = out.replace(/<!doctype\s+html\s*>/i, '<!DOCTYPE html>');

	// 5. Ensure POSIX-compliant trailing newline
	if (!out.endsWith('\n')) {
		out += '\n';
	}

	await writeFile(filePath, out);
};

const section = (pattern, headers) => [
	pattern,
	...headers.map((h) => `  ${h}`),
];

const globalHeaders = [
	`! access-control-allow-origin`,
	`cache-control: public, max-age=7200`,
	`cross-origin-embedder-policy: require-corp`,
	`cross-origin-opener-policy: same-origin`,
	`cross-origin-resource-policy: same-origin`,
	`permissions-policy: accelerometer=(), document-domain=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()`,
	`referrer-policy: strict-origin-when-cross-origin`,
	`x-content-type-options: nosniff`,
	`x-frame-options: DENY`,
	`x-xss-protection: 1; mode=block`,
];

const assetCSP = `content-security-policy: default-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests`;

const runnerPageHeaders = [
	`! content-security-policy`,
	`! cross-origin-resource-policy`,
	`! x-frame-options`,
	`content-security-policy: default-src * data: blob: https:; script-src * data: blob: https: 'self' 'unsafe-eval'; script-src-attr 'none'; style-src-attr 'none'; sandbox allow-scripts; frame-ancestors 'self'; upgrade-insecure-requests`,
	`cross-origin-resource-policy: cross-origin`,
	`x-frame-options: SAMEORIGIN`,
];

const manifestString = await readFile(distPath('.vite/manifest.json'), 'utf-8');
const manifest = JSON.parse(manifestString);

const index = resolveEntry(manifest, 'index.html');
const runner = resolveEntry(manifest, 'resources/runner.html');

const [jsDigests, cssDigests] = await Promise.all(
	[index.jsURLs, index.cssURLs].map(computeDigests),
);

const runnerAssetPaths = collectRunnerAssetPaths(manifest);

const sections = [
	section('/*', globalHeaders),
	section('/', [
		`! content-security-policy`,
		`content-security-policy: ${buildCSP(jsDigests, cssDigests)}`,
		...preloadHeaders(index.jsPaths, index.cssPaths),
	]),
	section('/resources/runner', [
		...runnerPageHeaders,
		...preloadHeaders(runner.jsPaths, runner.cssPaths),
	]),
	section('/assets/*', [assetCSP]),
	...runnerAssetPaths.map((path) =>
		section(path, [`access-control-allow-origin: *`]),
	),
];

await writeFile(
	distPath('_headers'),
	sections.map((s) => s.join('\n')).join('\n\n') + '\n',
);

await writeFile(
	distPath('_headers'),
	sections.map((s) => s.join('\n')).join('\n\n') + '\n',
);

// ── Minify all HTML files (XHTML polyglot) ────────────────────
const htmlFiles = (await readdir(distPath('.'), { recursive: true })).filter(
	(f) => f.endsWith('.html'),
);

await Promise.all(htmlFiles.map((f) => minifyHTML(distPath(f))));

await rm(distPath('.vite'), { recursive: true });

await rm(distPath('.vite'), { recursive: true });
