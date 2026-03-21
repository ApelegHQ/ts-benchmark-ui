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
	import {
		formatPercent_ as formatPercent,
		formatTime_ as formatTime,
	} from '../../format.js';
	import {
		STRING__BASELINE_ALL_REPORTED_TIMES_HAVE_THIS_OVERHEAD_SUBTRACTED_,
		STRING__BASELINE_BASELINE_,
		STRING__BASELINE_CONSIDER_INCREASING_WORK_PER_ITERATION_FOR_MORE_ACCURATE_RESULTS_,
		STRING__BASELINE_HIGH_OVERHEAD_,
		STRING__BASELINE_MEASUREMENT_OVERHEAD_,
		STRING__BASELINE_OVERHEAD_IS_,
		STRING__BASELINE_OVERHEAD_NEGLIGIBLE_,
		STRING__BASELINE_PER_ITERATION_,
	} from '../../i18n/strings.js';

	export let baseline: IFunctionStatistics;
	export let fastest: IFunctionStatistics;

	$: blMean = baseline.rawMean;
	$: blStdDev = baseline.rawStdDev;
	$: overheadRatio = blMean / fastest.rawMean;
	$: isHigh = overheadRatio > 0.1;
</script>

<h3 class="section-title">{STRING__BASELINE_MEASUREMENT_OVERHEAD_}</h3>

<div class="card baseline-card">
	<p>
		<span class="text-dim">{STRING__BASELINE_BASELINE_}</span>
		<span class="mono text-cyan">({baseline.name})</span>:
		{#if STRING__BASELINE_PER_ITERATION_[0]}<span class="text-dim"
				>{STRING__BASELINE_PER_ITERATION_[0]}</span
			>{/if}<strong>{formatTime(blMean)}</strong
		>{#if STRING__BASELINE_PER_ITERATION_[1]}<span class="text-dim"
				>{STRING__BASELINE_PER_ITERATION_[1]}</span
			>{/if}
		&nbsp; σ = {formatTime(blStdDev)}
	</p>
	<p class="text-dim overhead">
		{STRING__BASELINE_ALL_REPORTED_TIMES_HAVE_THIS_OVERHEAD_SUBTRACTED_}
	</p>

	{#if fastest.mean > 0}
		<p class="fastest">
			{#if isHigh}
				<span class="text-yellow">⚠</span>
				<span class="text-yellow">
					{STRING__BASELINE_HIGH_OVERHEAD_[0]}{formatPercent(
						overheadRatio,
					)}{STRING__BASELINE_HIGH_OVERHEAD_[1]}
				</span>
				<br />
				<span class="text-dim high-overhead">
					{STRING__BASELINE_CONSIDER_INCREASING_WORK_PER_ITERATION_FOR_MORE_ACCURATE_RESULTS_}
				</span>
			{:else}
				<span class="text-dim">
					{STRING__BASELINE_OVERHEAD_IS_[0]}{formatPercent(
						overheadRatio,
					)}{STRING__BASELINE_OVERHEAD_IS_[1]}
				</span>
				<span class="text-green"
					>{STRING__BASELINE_OVERHEAD_NEGLIGIBLE_}</span
				>
			{/if}
		</p>
	{/if}
</div>

<style>
	.high-overhead {
		margin-left: 1.25rem;
	}

	@media not (writing-mode: tb-lr) {
		.high-overhead {
			margin-left: 0;
			margin-inline-start: 1.25rem;
		}
	}

	.fastest {
		margin-top: 0.5rem;
	}

	@media not (writing-mode: tb-lr) {
		.fastest {
			margin-top: 0;
			margin-block-start: 0.5rem;
		}
	}

	.overhead {
		margin-top: 0.35rem;
	}

	@media not (writing-mode: tb-lr) {
		.overhead {
			margin-top: 0;
			margin-block-start: 0.35rem;
		}
	}

	.baseline-card {
		font-size: 0.8125rem;
		line-height: 1.7;
	}
</style>
