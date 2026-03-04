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

import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

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

await rm(distPath('.vite'), { recursive: true });
