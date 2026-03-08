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
import { marshalSuiteState_ } from './lib/marshal.js';
import { unmarshalSuiteState_ } from './lib/unmarshal.js';

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

/** Envelope placed around serialised payload for versioning and flags. */
interface IStateHeader {
	['v']: number; // version
	['fmt']?: 'json'; // format marker (future-proof)
}

const toUrlSafeBase64 = (bytes: Uint8Array): string => {
	const binary = String.fromCharCode(...Array.from(bytes));
	const b64 = btoa(binary);
	// URL-safe, remove padding
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromUrlSafeBase64 = (b64url: string): Uint8Array => {
	// restore padding
	let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
	const pad = b64.length % 4;
	if (pad) b64 += '='.repeat(4 - pad);
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
};

const sanitiseBenchmarkEntry = (
	item: IBenchmarkEntry | null,
	index: number,
): IBenchmarkEntry => {
	return {
		id: typeof item?.id === 'string' ? item.id : getRandomSecret(),
		name: typeof item?.name === 'string' ? item.name : `Untitled ${index}`,
		code: typeof item?.code === 'string' ? item.code : '',
	} as IBenchmarkEntry;
};

function sanitiseState(obj: ISuiteState | null): ISuiteState {
	const defaults = defaultState();
	const out: ISuiteState = {
		name: typeof obj?.name === 'string' ? obj.name : defaults.name,
		trials: Number.isFinite(obj?.trials)
			? Math.max(1, Math.floor(obj!.trials))
			: defaults.trials,
		iterationsPerTrial: Number.isFinite(obj?.iterationsPerTrial)
			? Math.max(1, Math.floor(obj!.iterationsPerTrial))
			: defaults.iterationsPerTrial,
		warmupIterations: Number.isFinite(obj?.warmupIterations)
			? Math.max(0, Math.floor(obj!.warmupIterations))
			: defaults.warmupIterations,
		setupCode:
			typeof obj?.setupCode === 'string'
				? obj.setupCode
				: defaults.setupCode,
		functions: Array.isArray(obj?.functions)
			? obj.functions.map(sanitiseBenchmarkEntry)
			: defaults.functions,
	};
	return out;
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
	// Produce minimal payload JSON
	const payloadJson = JSON.stringify(marshalSuiteState_(state));
	const header: IStateHeader = Object.fromEntries([
		['v', 1],
		['fmt', 'json'],
	]);
	const envelopeJson = JSON.stringify(header);
	return [
		toUrlSafeBase64(new TextEncoder().encode(envelopeJson)),
		toUrlSafeBase64(new TextEncoder().encode(payloadJson))
	].join('.');
}

/**
 * Decode state from a Base64 hash string.
 */
export function decodeState_(raw: string): ISuiteState | null {
	try {
		if (!raw) return null;

		const [headerRaw, payloadRaw] = raw.split('.');
		const headerBytes = fromUrlSafeBase64(headerRaw);
		const headerJson = new TextDecoder().decode(headerBytes);
		const header = JSON.parse(headerJson) as IStateHeader;

		let stateObj: ISuiteState | null = null;
		if (
			typeof header.v === 'number' &&
			header.v === 1 &&
			(!header.fmt || header.fmt === 'json')
		) {
			// Supported envelope
			const payloadBytes = fromUrlSafeBase64(payloadRaw);
			const json = new TextDecoder().decode(payloadBytes);
			stateObj = unmarshalSuiteState_(JSON.parse(json));
		}

		// Sanitise and return
		const sanitised = sanitiseState(stateObj);
		return sanitised;
	} catch {
		return null;
	}
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
