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
import moduleResolver from './basic-resolver.js';
import compileFunction from './compile-function.js';

type ModuleDesc = [
	attributes: Record<string, string> | null,
	namespace: string[] | null,
	imports: [imported: string, local: string][] | null,
];
export type Modules = Record<string, ModuleDesc>;

/**
 * Run benchmarks from the application state.
 * Yields progress updates for the UI.
 */
export async function runBenchmarks_(
	state: ISuiteState,
	imports: Modules | undefined,
	eventTarget?: EventTarget,
	signal?: AbortSignal,
): Promise<ISuiteReport> {
	if (state.functions.length === 0) {
		throw new Error('Add at least one function to benchmark.');
	}

	const params = Object.create(null);
	if (imports) {
		await Promise.all(
			Object.entries(imports).map((entry) => {
				return moduleResolver(entry[0], entry[1][0]).then(
					(module: unknown) => {
						entry[1][1]?.forEach((v) => {
							params[v] = module;
						});
						entry[1][2]?.forEach((v) => {
							if (
								Object.prototype.hasOwnProperty.call(
									module,
									v[0],
								)
							) {
								params[v[1]] = (
									module as Record<string, unknown>
								)[v[0]];
							} else {
								throw new SyntaxError(
									`The requested module ${JSON.stringify(entry[0])} does not provide an export named ${JSON.stringify(v[0])}`,
								);
							}
						});
					},
				);
			}),
		);
	}
	const paramNames = Object.keys(params);
	const paramValues = Object.values(params);

	// Compile user functions
	const benchFns: Array<{ ['name']: string; ['fn']: () => void }> = [];

	for (const entry of state.functions) {
		try {
			const compiled = compileFunction(paramNames, entry.code);
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
			setupFn = compileFunction(paramNames, state.setupCode);
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
			teardownFn = compileFunction(paramNames, state.teardownCode);
		} catch (err) {
			throw new Error(
				`Syntax error in teardown code: ${(err as Error).message}`,
				{ cause: err },
			);
		}
	}

	const { trials: nTrials, iterationsPerTrial, warmupIterations } = state;

	const report = runSuite<Record<string, unknown>, unknown, unknown[]>({
		name: state.name,
		args: paramValues,
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
