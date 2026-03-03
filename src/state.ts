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

import { type Writable, writable } from 'svelte/store';
import getRandomSecret from './lib/getRandomSecret.js';

/**
 * Represents a single user-defined benchmark function.
 */
export interface IBenchmarkEntry {
	['id']: string;
	['name']: string;
	['code']: string;
}

/**
 * Represents the full suite configuration.
 */
export interface ISuiteState {
	['name']: string;
	['trials']: number;
	['iterationsPerTrial']: number;
	['warmupIterations']: number;
	/** Optional setup code (function body with `this` context). */
	['setupCode']: string;
	['functions']: IBenchmarkEntry[];
}

function defaultState(): ISuiteState {
	return {
		name: 'My Benchmark',
		trials: 30,
		iterationsPerTrial: 1000,
		warmupIterations: 10,
		setupCode: '',
		functions: [
			{
				id: getRandomSecret(),
				name: 'Example A',
				code: 'const arr = [3,1,2];\narr.sort();',
			},
			{
				id: getRandomSecret(),
				name: 'Example B',
				code: 'const arr = [3,1,2];\narr.reverse();',
			},
		],
	};
}

/**
 * Encode state into a URL-safe Base64 string stored in the hash.
 */
export function encodeState_(state: ISuiteState): string {
	const json = JSON.stringify(state);
	// TextEncoder → Uint8Array → compress-ish via base64
	const bytes = new TextEncoder().encode(json);
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

/**
 * Decode state from a Base64 hash string.
 */
export function decodeState_(hash: string): ISuiteState | null {
	try {
		const binary = atob(hash);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		const json = new TextDecoder().decode(bytes);
		const parsed = JSON.parse(json);
		// Basic validation
		if (
			typeof parsed.name === 'string' &&
			Array.isArray(parsed.functions)
		) {
			return parsed as ISuiteState;
		}
	} catch {
		// Ignore malformed hashes
	}
	return null;
}

/**
 * Load initial state: from URL hash if present, otherwise defaults.
 */
function loadInitialState(): ISuiteState {
	const hash = window.location.hash.slice(1);
	if (hash) {
		const restored = decodeState_(hash);
		if (restored) return restored;
	}
	return defaultState();
}

// ── Stores ──────────────────────────────────────────

export const suiteState_: Writable<ISuiteState> = writable(loadInitialState());

/**
 * Persist state to the URL hash whenever it changes.
 * Debounced to avoid excessive history entries.
 */
let debounceTimer: ReturnType<typeof setTimeout>;
suiteState_.subscribe((state) => {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		const encoded = encodeState_(state);
		window.history.replaceState(null, '', '#' + encoded);
	}, 400);
});

// ── Convenience mutations ───────────────────────────

export function addFunction_(): void {
	suiteState_.update((s) => ({
		...s,
		functions: [
			...s.functions,
			{
				id: getRandomSecret(),
				name: `Function ${s.functions.length + 1}`,
				code: '// Your code here',
			},
		],
	}));
}

export function removeFunction_(id: string): void {
	suiteState_.update((s) => ({
		...s,
		functions: s.functions.filter((f) => f.id !== id),
	}));
}

export function updateFunction_(
	id: string,
	patch: Partial<Pick<IBenchmarkEntry, 'name' | 'code'>>,
): void {
	suiteState_.update((s) => ({
		...s,
		functions: s.functions.map((f) =>
			f.id === id ? { ...f, ...patch } : f,
		),
	}));
}

export function updateConfig_(
	patch: Partial<
		Pick<
			ISuiteState,
			| 'name'
			| 'trials'
			| 'iterationsPerTrial'
			| 'warmupIterations'
			| 'setupCode'
		>
	>,
): void {
	suiteState_.update((s) => ({ ...s, ...patch }));
}

export function getShareUrl_(): string {
	return window.location.href;
}
