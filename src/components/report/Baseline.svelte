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
	import type { IFunctionStatistics } from '@apeleghq/benchmark/types';
	import { mean, stdDev } from '@apeleghq/benchmark/stats';
	import { formatTime_ as formatTime } from '../../format.js';

	export let baseline: IFunctionStatistics;
	export let fastest: IFunctionStatistics;

	$: blMean = mean(baseline.rawSamples);
	$: blStdDev = stdDev(baseline.rawSamples);
	$: overheadRatio = fastest.mean > 0 ? blMean / fastest.mean : 0;
	$: isHigh = overheadRatio > 0.1;
</script>

<div class="section-title">Measurement Overhead</div>

<div class="card baseline-card">
	<p>
		<span class="text-dim">Baseline</span>
		<span class="mono text-cyan">({baseline.name})</span>:
		<strong>{formatTime(blMean)}</strong><span class="text-dim">/iter</span>
		&nbsp; σ = {formatTime(blStdDev)}
	</p>
	<p class="text-dim overhead">
		All reported times have this overhead subtracted.
	</p>

	{#if fastest.mean > 0}
		<p class="fastest">
			{#if isHigh}
				<span class="text-yellow">⚠</span>
				<span class="text-yellow">
					Overhead is {(overheadRatio * 100).toFixed(1)}% of the
					fastest function.
				</span>
				<br />
				<span class="text-dim high-overhead">
					Consider increasing work per iteration for more accurate
					results.
				</span>
			{:else}
				<span class="text-dim">
					Overhead is {(overheadRatio * 100).toFixed(2)}% of the
					fastest —
				</span>
				<span class="text-green">negligible</span>
			{/if}
		</p>
	{/if}
</div>

<style>
	.high-overhead {
		margin-left: 1.25rem;
	}

	.fastest {
		margin-top: 0.5rem;
	}

	.overhead {
		margin-top: 0.35rem;
	}

	.baseline-card {
		font-size: 0.8125rem;
		line-height: 1.7;
	}
</style>
