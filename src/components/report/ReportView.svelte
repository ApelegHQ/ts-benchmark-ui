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

	import Baseline from './Baseline.svelte';
	import Comparisons from './Comparisons.svelte';
	import DetailedStats from './DetailedStats.svelte';
	import Distribution from './Distribution.svelte';
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

<section class="report" aria-label="Benchmark Results">
	<!-- Header box -->
	<div class="report-header card">
		<h2 class="report-title">{report.name}</h2>
		<p class="report-meta">
			{formatNumber(report.config.trials)} trials ·
			{formatNumber(report.config.iterationsPerTrial)} iter/trial ·
			{formatNumber(report.config.warmupIterations)} warmup
		</p>
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
		<p class="text-dim" style="margin-top: 1rem;">
			No benchmark functions found in the report.
		</p>
	{/if}

	<footer class="report-footer">
		<p>
			Significance:
			<span class="text-yellow text-bold">***</span> p&lt;0.001 &nbsp;
			<span class="text-yellow text-bold">**</span> p&lt;0.01 &nbsp;
			<span class="text-yellow text-bold">*</span> p&lt;0.05 &nbsp;
			<span class="text-muted">n.s.</span> not significant
		</p>
		<p class="text-dim">
			Paired t-test on baseline-corrected per-iteration times.
		</p>
	</footer>
</section>

<style>
	.report {
		margin-top: 1rem;
	}

	.report-header {
		text-align: center;
		border-left: 3px solid var(--c-accent);
		padding: 1.25rem 1.5rem;
	}

	.report-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
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
</style>
