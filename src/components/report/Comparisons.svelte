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
	import type {
		IFunctionStatistics,
		IPairedComparison,
	} from '@apeleghq/benchmark/types';
	import {
		formatMultiplier_ as formatMultiplier,
		formatPValue_ as formatPValue,
		formatTime_ as formatTime,
		significance_ as significance,
	} from '../../format.js';

	export let fns: IFunctionStatistics[];
	export let comps: IPairedComparison[];

	const byName: Record<string, IFunctionStatistics> = {};
	$: {
		for (const f of fns) byName[f.name] = f;
	}
</script>

<h3 class="section-title">Pairwise Comparisons (paired t-test)</h3>

<div class="comparisons-list">
	{#each comps as c}
		{@const fA = byName[c.a]}
		{@const fB = byName[c.b]}
		{#if fA && fB}
			{@const aFaster = fA.mean <= fB.mean}
			{@const fasterName = aFaster ? c.a : c.b}
			{@const ratio = aFaster ? fB.mean / fA.mean : fA.mean / fB.mean}
			{@const seD =
				c.stdDevDifference / Math.sqrt(c.degreesOfFreedom + 1)}

			<div class="card comparison-card">
				<div class="comp-header">
					<strong>{c.a}</strong>
					<span class="text-dim">vs</span>
					<strong>{c.b}</strong>
					<span
						class="sig-badge {c.significant ? 'sig-yes' : 'sig-no'}"
					>
						{significance(c.pValue)}
					</span>
				</div>

				<div class="comp-body">
					{#if c.significant}
						<p>
							<span class="text-green">✓</span>
							<strong class="text-green">{fasterName}</strong> is
							<strong class="text-green"
								>{formatMultiplier(ratio)}</strong
							>
							faster
							<span class="text-dim"
								>({formatPValue(c.pValue)})</span
							>
						</p>
					{:else}
						<p>
							<span class="text-yellow">≈</span>
							No significant difference
							<span class="text-dim"
								>({formatPValue(c.pValue)})</span
							>
						</p>
					{/if}

					<p class="comp-detail text-dim">
						Δ = {formatTime(c.meanDifference)} &nbsp; 95% CI [{formatTime(
							c.confidenceInterval[0],
						)}, {formatTime(c.confidenceInterval[1])}]
					</p>
					<p class="comp-detail text-dim">
						t = {c.tStatistic.toFixed(3)} &nbsp; df = {c.degreesOfFreedom}
						&nbsp; SE(Δ) = {formatTime(seD)}
					</p>
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.comparisons-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.comparison-card {
		padding: 0.875rem 1rem;
	}

	.comp-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.sig-badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.15em 0.5em;
		border-radius: 3px;
		margin-left: auto;
	}

	.sig-yes {
		color: var(--c-yellow);
		background: rgba(240, 192, 80, 0.12);
	}

	.sig-no {
		color: var(--c-text-muted);
		background: var(--c-surface-2);
	}

	.comp-body {
		font-size: 0.8125rem;
	}

	.comp-body p {
		margin-bottom: 0.25rem;
	}

	.comp-detail {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}
</style>
