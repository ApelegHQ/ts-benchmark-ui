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

const marshalBenkmarkEntry = (entry: IBenchmarkEntry) => {
	return [entry.id, entry.name, [entry.code]];
};

export const marshalSuiteState_ = (state: ISuiteState) => {
	return [
		state.name,
		[state.trials, state.iterationsPerTrial, state.warmupIterations],
		[state.setupCode, state.teardownCode],
		state.functions.map((fn) => marshalBenkmarkEntry(fn)),
		[state.importsCode],
	];
};

export const marshalRunProgress_ = (runProgress: IRunProgress) => {
	return [
		runProgress.currentFunction,
		runProgress.trial,
		runProgress.totalTrials,
	];
};

const marshalTrialMeasurement = (trialMeasurement: ITrialMeasurement) => {
	return [
		trialMeasurement.name,
		trialMeasurement.iterations,
		trialMeasurement.totalMs,
		trialMeasurement.perIterationMs,
	];
};

const marshalTrialResult = (trialResult: ITrialResult) => {
	return [
		trialResult.trialIndex,
		trialResult.executionOrder,
		Object.entries(trialResult.measurements).map((e) => {
			return [e[0], marshalTrialMeasurement(e[1])];
		}),
	];
};

const marshalFunctionStatistics = (functionStatistics: IFunctionStatistics) => {
	return [
		functionStatistics.name,
		[
			functionStatistics.sampleSize,
			functionStatistics.samples,
			functionStatistics.rawSamples,
		],
		functionStatistics.mean,
		functionStatistics.median,
		functionStatistics.stdDev,
		/** Standard error of the mean (ms). */
		[
			functionStatistics.sem,
			functionStatistics.min,
			functionStatistics.max,
		],
		[
			functionStatistics.p5,
			functionStatistics.p25,
			functionStatistics.p75,
			functionStatistics.p95,
		],
		functionStatistics.marginOfError95,
	];
};

const marshalPairedComparison = (pairedComparison: IPairedComparison) => {
	return [
		[pairedComparison.a, pairedComparison.b],
		pairedComparison.meanDifference,
		pairedComparison.stdDevDifference,
		pairedComparison.relativeDifference,
		pairedComparison.tStatistic,
		pairedComparison.degreesOfFreedom,
		pairedComparison.pValue,
		pairedComparison.significant,
		pairedComparison.confidenceInterval,
	];
};

export const marshalSuiteReport_ = (suiteReport: ISuiteReport) => {
	return [
		suiteReport.name,
		[
			suiteReport.config.trials,
			suiteReport.config.iterationsPerTrial,
			suiteReport.config.warmupIterations,
		],
		suiteReport.baselineName,
		suiteReport.functions.map((fn) => marshalFunctionStatistics(fn)),
		suiteReport.trials.map((trial) => marshalTrialResult(trial)),
		suiteReport.comparisons.map((pairedComparison) =>
			marshalPairedComparison(pairedComparison),
		),
	];
};
