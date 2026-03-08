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

import type {
	IFunctionStatistics,
	IPairedComparison,
	IRunProgress,
	ISuiteReport,
	ITrialMeasurement,
	ITrialResult,
} from '@apeleghq/benchmark/types';
import type { IBenchmarkEntry, ISuiteState } from '../state.js';

// Unmarshal helpers
const assertArray: (v: unknown, name?: string) => asserts v is unknown[] = (
	v: unknown,
	name = 'value',
): asserts v is unknown[] => {
	if (!Array.isArray(v)) throw new Error(`${name} must be an array`);
};
const assertNumber: (v: unknown, name?: string) => asserts v is number = (
	v: unknown,
	name = 'value',
): asserts v is number => {
	if (typeof v !== 'number') throw new Error(`${name} must be a number`);
};
const assertString: (v: unknown, name?: string) => asserts v is string = (
	v: unknown,
	name = 'value',
): asserts v is string => {
	if (typeof v !== 'string') throw new Error(`${name} must be a string`);
};
const assertBoolean: (v: unknown, name?: string) => asserts v is boolean = (
	v: unknown,
	name = 'value',
): asserts v is boolean => {
	if (typeof v !== 'boolean') throw new Error(`${name} must be a boolean`);
};
/*
const assertObject: (v: unknown, name?: string) => asserts v is object = (
	v: unknown,
	name = 'value',
): asserts v is Record<string, unknown> => {
	if (v === null || typeof v !== 'object' || Array.isArray(v))
		throw new Error(`${name} must be an object`);
};
*/

const unmarshalBenchmarkEntry = (data: unknown): IBenchmarkEntry => {
	assertArray(data, 'BenchmarkEntry');

	if (data.length !== 3) {
		throw new Error('BenchmarkEntry length mismatch');
	}
	const [id, name, codeArr] = data;

	assertString(id, 'BenchmarkEntry.id');
	assertString(name, 'BenchmarkEntry.name');
	assertArray(codeArr, 'BenchmarkEntry.code');
	if (codeArr.length !== 1) {
		throw new Error('BenchmarkEntry.code expected single-item array');
	}
	assertString(codeArr[0], 'BenchmarkEntry.code[0]');

	return {
		id,
		name,
		code: codeArr[0],
	};
};

export const unmarshalSuiteState_ = (data: unknown): ISuiteState => {
	assertArray(data, 'SuiteState');

	if (data.length !== 4) throw new Error('SuiteState length mismatch');
	const [name, numericTriple, setupCodeArr, functionsArr] = data;
	assertString(name, 'SuiteState.name');

	assertArray(numericTriple, 'SuiteState.numerics');
	if (numericTriple.length !== 3)
		throw new Error('SuiteState numerics length must be 3');
	const [trials, iterationsPerTrial, warmupIterations] = numericTriple;
	assertNumber(trials, 'SuiteState.trials');
	assertNumber(iterationsPerTrial, 'SuiteState.iterationsPerTrial');
	assertNumber(warmupIterations, 'SuiteState.warmupIterations');

	assertArray(setupCodeArr, 'SuiteState.setupCode');
	if (setupCodeArr.length !== 2) {
		throw new Error('SuiteState.setupCode expected two-item array');
	}
	assertString(setupCodeArr[0], 'SuiteState.setupCode[0]');
	assertString(setupCodeArr[1], 'SuiteState.setupCode[1]');

	assertArray(functionsArr, 'SuiteState.functions');
	const functions: IBenchmarkEntry[] = functionsArr.map((f: unknown) =>
		unmarshalBenchmarkEntry(f),
	);

	return {
		name,
		trials,
		iterationsPerTrial,
		warmupIterations,
		setupCode: setupCodeArr[0],
		teardownCode: setupCodeArr[1],
		functions,
	};
};

export const unmarshalRunProgress_ = (data: unknown): IRunProgress => {
	assertArray(data, 'RunProgress');

	if (data.length !== 3) throw new Error('RunProgress length mismatch');
	const [currentFunction, trial, totalTrials] = data;
	assertString(currentFunction, 'RunProgress.currentFunction');
	assertNumber(trial, 'RunProgress.trial');
	assertNumber(totalTrials, 'RunProgress.totalTrials');

	return {
		currentFunction,
		trial,
		totalTrials,
	};
};

const unmarshalTrialMeasurement = (data: unknown): ITrialMeasurement => {
	assertArray(data, 'TrialMeasurement');

	if (data.length !== 4) {
		throw new Error('TrialMeasurement length mismatch');
	}
	const [name, iterations, totalMs, perIterationMs] = data;
	assertString(name, 'TrialMeasurement.name');
	assertNumber(iterations, 'TrialResult.iterations');
	assertNumber(totalMs, 'TrialResult.totalMs');
	assertNumber(perIterationMs, 'TrialResult.perIterationMs');

	return {
		name,
		iterations,
		totalMs,
		perIterationMs,
	};
};

// ITrialResult unmarshal
const unmarshalTrialResult = (data: unknown): ITrialResult => {
	assertArray(data, 'TrialResult');

	if (data.length !== 3) {
		throw new Error('TrialResult length mismatch');
	}
	const [trialIndex, executionOrder, measurementsEntries] = data;
	assertNumber(trialIndex, 'TrialResult.trialIndex');
	assertArray(executionOrder, 'TrialResult.executionOrder');
	executionOrder.every((v) => assertString(v));
	assertArray(measurementsEntries, 'TrialResult.measurementsEntries');

	// measurementsEntries is an array of [key, value] pairs
	const measurements: Record<string, ITrialMeasurement> = {};
	for (const pair of measurementsEntries) {
		assertArray(pair, 'TrialResult.measurements entry');
		if (pair.length !== 2)
			throw new Error('Each measurement entry must be [key, value]');
		const [k, v] = pair;
		assertString(k, 'TrialResult.measurements key');
		assertArray(v, `TrialResult.measurements value for ${k}`);
		measurements[k] = unmarshalTrialMeasurement(v);
	}

	return {
		trialIndex,
		executionOrder: executionOrder as string[],
		measurements,
	};
};

// IFunctionStatistics unmarshal
const unmarshalFunctionStatistics = (data: unknown): IFunctionStatistics => {
	assertArray(data, 'FunctionStatistics');
	// marshal structure:
	// [
	//  name,
	//  [ sampleSize, samples, rawSamples ],
	//  mean,
	//  median,
	//  stdDev,
	//  [ sem, min, max ],
	//  [ p5, p25, p75, p95 ],
	//  marginOfError95,
	// ]
	if (data.length !== 8)
		throw new Error('FunctionStatistics length mismatch');
	const [
		name,
		sampleTriple,
		mean,
		median,
		stdDev,
		semMinMax,
		percentiles,
		marginOfError95,
	] = data;

	assertString(name, 'FunctionStatistics.name');

	assertArray(sampleTriple, 'FunctionStatistics.sampleTriple');
	if (sampleTriple.length !== 3)
		throw new Error('FunctionStatistics sampleTriple length must be 3');
	const [sampleSize, samples, rawSamples] = sampleTriple;
	assertNumber(sampleSize, 'FunctionStatistics.sampleSize');
	assertArray(samples, 'FunctionStatistics.samples');
	samples.every((v) => assertNumber(v));
	assertArray(rawSamples, 'FunctionStatistics.rawSamples');
	rawSamples.every((v) => assertNumber(v));

	assertNumber(mean, 'FunctionStatistics.mean');
	assertNumber(median, 'FunctionStatistics.median');
	assertNumber(stdDev, 'FunctionStatistics.stdDev');

	assertArray(semMinMax, 'FunctionStatistics.semMinMax');
	if (semMinMax.length !== 3)
		throw new Error('FunctionStatistics semMinMax length must be 3');
	const [sem, min, max] = semMinMax;
	assertNumber(sem, 'FunctionStatistics.sem');
	assertNumber(min, 'FunctionStatistics.min');
	assertNumber(max, 'FunctionStatistics.max');

	assertArray(percentiles, 'FunctionStatistics.percentiles');
	if (percentiles.length !== 4)
		throw new Error('FunctionStatistics.percentiles length must be 4');
	const [p5, p25, p75, p95] = percentiles;
	assertNumber(p5, 'FunctionStatistics.p5');
	assertNumber(p25, 'FunctionStatistics.p25');
	assertNumber(p75, 'FunctionStatistics.p75');
	assertNumber(p95, 'FunctionStatistics.p95');

	assertNumber(marginOfError95, 'FunctionStatistics.marginOfError95');

	return {
		name,
		sampleSize,
		mean,
		median,
		stdDev,
		sem,
		min,
		max,
		p5,
		p25,
		p75,
		p95,
		samples: samples as number[],
		rawSamples: rawSamples as number[],
		marginOfError95,
	};
};

const unmarshalPairedComparison = (data: unknown): IPairedComparison => {
	assertArray(data, 'PairedComparison');

	if (data.length !== 9) throw new Error('PairedComparison length mismatch');
	const [
		pairArr,
		meanDifference,
		stdDevDifference,
		relativeDifference,
		tStatistic,
		degreesOfFreedom,
		pValue,
		significant,
		confidenceInterval,
	] = data;

	assertArray(pairArr, 'PairedComparison.pair');
	if (pairArr.length !== 2)
		throw new Error('PairedComparison pair must have 2 items');
	const [a, b] = pairArr;
	assertString(a, 'PairedComparison.a');
	assertString(b, 'PairedComparison.b');

	assertNumber(meanDifference, 'PairedComparison.meanDifference');
	assertNumber(stdDevDifference, 'PairedComparison.stdDevDifference');
	assertNumber(relativeDifference, 'PairedComparison.relativeDifference');
	assertNumber(tStatistic, 'PairedComparison.tStatistic');
	assertNumber(degreesOfFreedom, 'PairedComparison.degreesOfFreedom');
	assertNumber(pValue, 'PairedComparison.pValue');
	assertBoolean(significant, 'PairedComparison.significant');

	assertArray(confidenceInterval, 'PairedComparison.confidenceInterval');
	if (confidenceInterval.length !== 2)
		throw new Error('PairedComparison.confidenceInterval length must be 2');
	assertNumber(
		confidenceInterval[0],
		'PairedComparison.confidenceInterval[0]',
	);
	assertNumber(
		confidenceInterval[1],
		'PairedComparison.confidenceInterval[1]',
	);

	return {
		a,
		b,
		meanDifference,
		stdDevDifference,
		relativeDifference,
		tStatistic,
		degreesOfFreedom,
		pValue,
		significant,
		confidenceInterval: [confidenceInterval[0], confidenceInterval[1]],
	};
};

export const unmarshalSuiteReport_ = (data: unknown): ISuiteReport => {
	assertArray(data, 'SuiteReport');
	// marshal:
	// [
	//  name,
	//  [trials, iterationsPerTrial, warmupIterations],
	//  baselineName,
	//  functions.map(marshalFunctionStatistics),
	//  trials.map(marshalTrialResult),
	//  comparisons.map(marshalPairedComparison),
	// ]
	if (data.length !== 6) throw new Error('SuiteReport length mismatch');
	const [
		name,
		numericTriple,
		baselineName,
		functionsArr,
		trialsArr,
		comparisonsArr,
	] = data;
	assertString(name, 'SuiteReport.name');
	assertArray(numericTriple, 'SuiteReport.numerics');
	if (numericTriple.length !== 3)
		throw new Error('SuiteReport numerics length must be 3');
	const [trials, iterationsPerTrial, warmupIterations] = numericTriple;
	assertNumber(trials, 'SuiteReport.trials');
	assertNumber(iterationsPerTrial, 'SuiteReport.iterationsPerTrial');
	assertNumber(warmupIterations, 'SuiteReport.warmupIterations');

	assertString(baselineName, 'SuiteReport.baselineName');

	assertArray(functionsArr, 'SuiteReport.functions');
	const functions: IFunctionStatistics[] = functionsArr.map((f: unknown) =>
		unmarshalFunctionStatistics(f),
	);

	assertArray(trialsArr, 'SuiteReport.trials');
	const trialsResults: ITrialResult[] = trialsArr.map((t: unknown) =>
		unmarshalTrialResult(t),
	);

	assertArray(comparisonsArr, 'SuiteReport.comparisons');
	const comparisons: IPairedComparison[] = comparisonsArr.map((c: unknown) =>
		unmarshalPairedComparison(c),
	);

	return {
		name,
		config: {
			trials,
			iterationsPerTrial,
			warmupIterations,
		},
		baselineName,
		functions,
		trials: trialsResults,
		comparisons,
	};
};
