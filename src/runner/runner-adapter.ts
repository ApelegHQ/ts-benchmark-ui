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

import { type ISuiteReport, runSuite } from '@apeleghq/benchmark';
import type { ISuiteState } from '../state.js';

/**
 * Build a function from user-supplied code string.
 * The code is wrapped in `new Function(...)` and bound via `this`.
 *
 * Security note: this runs arbitrary user code in the user's own browser —
 * no different from the browser console. There is no server.
 */
function compileFunction(code: string): () => void {
	return new Function(code) as () => void;
}

/**
 * Run benchmarks from the application state.
 * Yields progress updates for the UI.
 */
export async function runBenchmarks_(
	state: ISuiteState,
	eventTarget?: EventTarget,
	signal?: AbortSignal,
): Promise<ISuiteReport> {
	if (state.functions.length === 0) {
		throw new Error('Add at least one function to benchmark.');
	}

	// Compile user functions
	const benchFns: Array<{ ['name']: string; ['fn']: () => void }> = [];

	for (const entry of state.functions) {
		try {
			const compiled = compileFunction(entry.code);
			benchFns.push({ name: entry.name, fn: compiled });
		} catch (err) {
			throw new Error(
				`Syntax error in "${entry.name}": ${(err as Error).message}`,
				{ cause: err },
			);
		}
	}

	// Compile optional setup
	let setupFn: (() => void) | undefined;
	if (state.setupCode.trim()) {
		try {
			setupFn = compileFunction(state.setupCode);
		} catch (err) {
			throw new Error(
				`Syntax error in setup code: ${(err as Error).message}`,
				{ cause: err },
			);
		}
	}

	let teardownFn: (() => void) | undefined;
	if (state.teardownCode.trim()) {
		try {
			teardownFn = compileFunction(state.teardownCode);
		} catch (err) {
			throw new Error(
				`Syntax error in teardown code: ${(err as Error).message}`,
				{ cause: err },
			);
		}
	}

	const { trials: nTrials, iterationsPerTrial, warmupIterations } = state;

	const report = runSuite({
		name: state.name,
		setup: setupFn,
		teardown: teardownFn,
		warmupIterations,
		iterationsPerTrial,
		trials: nTrials,
		functions: benchFns,
		eventTarget,
		signal,
	});

	return report;
}
