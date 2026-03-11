<!-- @copyright
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
-->

<script lang="ts">
	import type { ISuiteReport } from '@apeleghq/benchmark/types';
	import { formatNumber_ as formatNumber } from '../../format.js';
	import {
		STRING__REPORT_VIEW_BENCHMARK_RESULTS_,
		STRING__REPORT_VIEW_ITERATIONS_PER_TRIAL_SHORT_,
		STRING__REPORT_VIEW_NO_BENCHMARK_FUNCTIONS_FOUND_IN_THE_REPORT_,
		STRING__REPORT_VIEW_NOT_SIGNIFICANT_,
		STRING__REPORT_VIEW_PAIRED_T_TEST_ON_BASELINE_CORRECTED_PER_ITERATION_TIMES_,
		STRING__REPORT_VIEW_SIGNIFICANCE_,
		STRING__REPORT_VIEW_TRIALS_SHORT_,
		STRING__REPORT_VIEW_WARMUP_SHORT_,
	} from '../../i18n/strings.js';

	import Baseline from './Baseline.svelte';
	import Comparisons from './Comparisons.svelte';
	import DetailedStats from './DetailedStats.svelte';
	import Distribution from './Distribution.svelte';
	import DownloadReport from './DownloadReport.svelte';
	import Leaderboard from './Leaderboard.svelte';
	import SpeedMatrix from './SpeedMatrix.svelte';
	import Winner from './Winner.svelte';

	export let report: ISuiteReport;

	$: baseline = report.functions.find((f) => f.name === report.baselineName);
	$: fns = report.functions
		.filter((f) => f.name !== report.baselineName)
		.sort((a, b) => a.mean - b.mean);
	$: comps = report.comparisons.filter(
		(c) => c.a !== report.baselineName && c.b !== report.baselineName,
	);
</script>

<section class="report" aria-label={STRING__REPORT_VIEW_BENCHMARK_RESULTS_}>
	<div class="report-header card">
		<div class="report-header-main">
			<h2 class="report-title">{report.name}</h2>
			<p class="report-meta">
				{formatNumber(
					report.config.trials,
				)}{STRING__REPORT_VIEW_TRIALS_SHORT_}
				{formatNumber(
					report.config.iterationsPerTrial,
				)}{STRING__REPORT_VIEW_ITERATIONS_PER_TRIAL_SHORT_}
				{formatNumber(
					report.config.warmupIterations,
				)}{STRING__REPORT_VIEW_WARMUP_SHORT_}
			</p>
		</div>
		<div class="report-actions">
			<DownloadReport {report} />
		</div>
	</div>

	{#if fns.length > 0}
		<Winner {fns} {comps} />
		<Leaderboard {fns} />
		<Distribution {fns} />
		<DetailedStats {fns} />

		{#if comps.length > 0}
			<Comparisons {fns} {comps} />
		{/if}

		{#if fns.length >= 3 && fns.length <= 8}
			<SpeedMatrix {fns} {comps} />
		{/if}

		{#if baseline}
			<Baseline {baseline} fastest={fns[0]} />
		{/if}
	{:else}
		<p class="text-dim no-fns">
			{STRING__REPORT_VIEW_NO_BENCHMARK_FUNCTIONS_FOUND_IN_THE_REPORT_}
		</p>
	{/if}

	<footer class="report-footer">
		<p>
			{STRING__REPORT_VIEW_SIGNIFICANCE_}
			<span class="text-yellow text-bold">***</span> p{'<'}0.001 &nbsp;
			<span class="text-yellow text-bold">**</span> p{'<'}0.01 &nbsp;
			<span class="text-yellow text-bold">*</span> p{'<'}0.05 &nbsp;
			<span class="text-muted">n.s.</span>
			{STRING__REPORT_VIEW_NOT_SIGNIFICANT_}
		</p>
		<p class="text-dim">
			{STRING__REPORT_VIEW_PAIRED_T_TEST_ON_BASELINE_CORRECTED_PER_ITERATION_TIMES_}
		</p>
	</footer>
</section>

<style>
	.no-fns {
		margin-top: 1rem;
	}

	@media not (writing-mode: tb-lr) {
		.no-fns {
			margin-top: 0;
			margin-block-start: 1rem;
		}
	}

	.report {
		margin-top: 1rem;
	}

	@media not (writing-mode: tb-lr) {
		.report {
			margin-top: 0;
			margin-block-start: 1rem;
		}
	}

	.report-header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.75rem 1rem;
		border-left: 3px solid var(--c-accent);
		padding: 1.25rem 1.5rem;
	}

	@media not (writing-mode: tb-lr) {
		.report-header {
			border-left: 0;
			border-inline-start: 3px solid var(--c-accent);
			padding-block: 1.25rem;
			padding-inline: 1.5rem;
		}
	}

	.report-header-main {
		flex: 1 1 16rem;
		min-width: 0;
		text-align: center;
	}

	@media not (writing-mode: tb-lr) {
		.report-header-main {
			min-inline-size: 0;
		}
	}

	.report-actions {
		flex: 0 0 auto;
		margin-left: auto;
	}

	@media not (writing-mode: tb-lr) {
		.report-actions {
			margin-inline-start: auto;
		}
	}

	.report-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	@media not (writing-mode: tb-lr) {
		.report-title {
			margin-block-end: 0.25rem;
		}
	}

	.report-meta {
		font-size: 0.8125rem;
		color: var(--c-text-dim);
		font-family: var(--font-mono);
	}

	.report-footer {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--c-border);
		font-size: 0.75rem;
		color: var(--c-text-dim);
		text-align: center;
		line-height: 1.8;
	}

	@media not (writing-mode: tb-lr) {
		.report-footer {
			margin-block-start: 2rem;
			padding-block-start: 1rem;
			border-block-start: 1px solid var(--c-border);
		}
	}
</style>
