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
		formatMultiplier_ as formatMultiplier,
		formatNumber_ as formatNumber,
		formatOps_ as formatOps,
		formatTime_ as formatTime,
	} from '../../format.js';
	import {
		STRING__LEADERBOARD_ARIA_LABEL_,
		STRING__LEADERBOARD_FASTEST_,
		STRING__LEADERBOARD_FUNCTION_,
		STRING__LEADERBOARD_LEADERBOARD_,
		STRING__LEADERBOARD_MARGIN_OF_ERROR_,
		STRING__LEADERBOARD_MEAN_,
		STRING__LEADERBOARD_MOE_,
		STRING__LEADERBOARD_OPS_PER_SECOND_,
		STRING__LEADERBOARD_RANK_,
		STRING__LEADERBOARD_RELATIVE_,
		STRING__LEADERBOARD_RELATIVE_THROUGHPUT_,
		STRING__LEADERBOARD_SLOWER_,
	} from '../../i18n/strings.js';
	import getRatio from '../../lib/get-ratio.js';

	export let fns: IFunctionStatistics[];

	const MEDALS = ['🥇', '🥈', '🥉'];

	$: fastest = fns[0];
	$: maxOps = fastest
		? fastest.mean > 0
			? 1 / fastest.mean
			: 1 / fastest.rawMean
		: 0;

	function barWidth(
		fastest: IFunctionStatistics,
		f: IFunctionStatistics,
	): number {
		const ops = fastest.mean > 0 ? 1 / f.mean : 1 / f.rawMean;
		const ratio = maxOps > 0 ? ops / maxOps : 0;

		return (Math.min(ratio, 1) || 0) * 100;
	}
</script>

<h3 class="section-title">{STRING__LEADERBOARD_LEADERBOARD_}</h3>

<div class="card leaderboard-card">
	<table class="data-table" aria-label={STRING__LEADERBOARD_ARIA_LABEL_}>
		<thead>
			<tr>
				<th scope="col" class="marker-col">#</th>
				<th scope="col">{STRING__LEADERBOARD_FUNCTION_}</th>
				<th scope="col" class="num">{STRING__LEADERBOARD_MEAN_}</th>
				<th scope="col" class="num"
					>± <abbr title={STRING__LEADERBOARD_MARGIN_OF_ERROR_}
						>{STRING__LEADERBOARD_MOE_}</abbr
					></th
				>
				<th scope="col" class="num">
					{STRING__LEADERBOARD_OPS_PER_SECOND_}
				</th>
				<th scope="col" class="relative-col">
					{STRING__LEADERBOARD_RELATIVE_}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each fns as f, i}
				{@const ratio = getRatio(fastest, f, fastest)}
				{@const bw = barWidth(fns[0], f)}
				<tr>
					<td>
						{#if i < 3}
							<span
								title={`${STRING__LEADERBOARD_RANK_[0]}${i + 1}${STRING__LEADERBOARD_RANK_[1]}`}
								>{MEDALS[i]}</span
							>
						{:else}
							<span class="text-muted">#{i + 1}</span>
						{/if}
					</td>
					<td>
						<span
							class:text-green={i === 0}
							class:text-bold={i <= 1}
						>
							{f.name}
						</span>
					</td>
					<td class="num">{formatTime(f.mean)}</td>
					<td class="num text-dim"
						>±{formatTime(f.marginOfError95)}</td
					>
					<td class="num">{formatOps(f.mean)}</td>
					<td>
						<div class="bar-cell">
							<meter
								min="0"
								max="10000"
								value={bw * 100}
								class={`r${i}`}
								aria-label={`${STRING__LEADERBOARD_RELATIVE_THROUGHPUT_[0]}${formatNumber(Math.round(bw))}${STRING__LEADERBOARD_RELATIVE_THROUGHPUT_[1]}`}
							></meter>
							<span class="bar-label">
								{#if i === 0}
									<span class="text-green"
										>{STRING__LEADERBOARD_FASTEST_}</span
									>
								{:else if ratio}
									<span class="text-dim"
										>{STRING__LEADERBOARD_SLOWER_[0]}{formatMultiplier(
											ratio,
										)}{STRING__LEADERBOARD_SLOWER_[1]}</span
									>
								{/if}
							</span>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.marker-col {
		width: 3rem;
	}

	@media not (writing-mode: tb-lr) {
		.marker-col {
			width: auto;
			inline-size: 3rem;
		}
	}

	.relative-col {
		min-width: 10rem;
	}

	@media not (writing-mode: tb-lr) {
		.relative-col {
			min-width: auto;
			min-inline-size: 10rem;
		}
	}

	.leaderboard-card {
		overflow-x: auto;
		padding: 0;
	}

	.bar-cell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	meter {
		appearance: none;
		height: 10px;
		border-radius: 2px;
		min-width: 2px;
		background: none;
	}

	@media not (writing-mode: tb-lr) {
		meter {
			min-width: auto;
			block-size: 10px;
			min-inline-size: 2px;
		}
	}

	meter::-webkit-meter-bar {
		background: none;
	}

	meter::-webkit-meter-optimum-value {
		background: var(--c-magenta);
		transition: width 0.3s ease;
		forced-color-adjust: none;
		background-size: 100% 100%;
	}

	meter::-moz-meter-bar {
		background: var(--c-magenta);
		forced-color-adjust: none;
		background-size: 100% 100%;
	}
	meter.r2::-webkit-meter-optimum-value {
		background: var(--c-yellow);
	}

	meter.r2::-moz-meter-bar {
		background: var(--c-yellow);
	}
	meter.r1::-webkit-meter-optimum-value {
		background: var(--c-cyan);
	}

	meter.r1::-moz-meter-bar {
		background: var(--c-cyan);
	}

	meter.r0::-webkit-meter-optimum-value {
		background: var(--c-green);
	}

	meter.r0::-moz-meter-bar {
		background: var(--c-green);
	}

	.bar-label {
		font-size: 0.75rem;
		white-space: nowrap;
	}
</style>
