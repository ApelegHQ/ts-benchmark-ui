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
		formatTime_ as formatTime,
		formatOps_ as formatOps,
		formatMultiplier_ as formatMultiplier,
	} from '../../format.js';

	export let fns: IFunctionStatistics[];

	const MEDALS = ['🥇', '🥈', '🥉'];

	$: fastest = fns[0];
	$: maxOps = fastest?.mean > 0 ? 1 / fastest.mean : 0;

	function barWidth(f: IFunctionStatistics): number {
		if (maxOps <= 0) return 0;
		const ops = f.mean > 0 ? 1 / f.mean : 0;
		return (ops / maxOps) * 100;
	}

	function barColor(rank: number): string {
		if (rank === 0) return 'var(--c-green)';
		if (rank === 1) return 'var(--c-cyan)';
		if (rank === 2) return 'var(--c-yellow)';
		return 'var(--c-magenta)';
	}
</script>

<div class="section-title">Leaderboard</div>

<div class="card leaderboard-card">
	<table class="data-table" aria-label="Benchmark leaderboard">
		<thead>
			<tr>
				<th scope="col" class="marker-col">#</th>
				<th scope="col">Function</th>
				<th scope="col" class="num">Mean</th>
				<th scope="col" class="num"
					>± <abbr title="Margin of Error">MOE</abbr></th
				>
				<th scope="col" class="num">ops/s</th>
				<th scope="col" class="relative-col">Relative</th>
			</tr>
		</thead>
		<tbody>
			{#each fns as f, i}
				<tr>
					<td>
						{#if i < 3}
							<span aria-label="Rank {i + 1}">{MEDALS[i]}</span>
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
							<div
								class="bar-fill"
								style="width: {barWidth(
									f,
								)}%; background: {barColor(i)};"
								role="img"
								aria-label="{barWidth(f).toFixed(
									0,
								)}% relative throughput"
							></div>
							<span class="bar-label">
								{#if i === 0}
									<span class="text-green">fastest</span>
								{:else if fastest.mean > 0}
									<span class="text-dim"
										>{formatMultiplier(
											f.mean / fastest.mean,
										)} slower</span
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

	.relative-col {
		min-width: 10rem;
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

	.bar-fill {
		height: 10px;
		border-radius: 2px;
		min-width: 2px;
		transition: width 0.3s ease;
	}

	.bar-label {
		font-size: 0.75rem;
		white-space: nowrap;
	}
</style>
