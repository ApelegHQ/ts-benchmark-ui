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
	import {
		STRING__COMPARISONS_95_PERCENT_CI_PREFIX_,
		STRING__COMPARISONS_95_PERCENT_CI_SEPARATOR_,
		STRING__COMPARISONS_95_PERCENT_CI_SUFFIX_,
		STRING__COMPARISONS_DELTA_PREFIX_,
		STRING__COMPARISONS_DF_PREFIX_,
		STRING__COMPARISONS_FASTER_,
		STRING__COMPARISONS_NO_SIGNIFICANT_DIFFERENCE_,
		STRING__COMPARISONS_PAIRED_T_TEST_,
		STRING__COMPARISONS_SE_DELTA_PREFIX_,
		STRING__COMPARISONS_T_PREFIX_,
		STRING__COMPARISONS_VS_,
	} from '../../i18n/strings.js';

	export let fns: IFunctionStatistics[];
	export let comps: IPairedComparison[];

	const byName: Record<string, IFunctionStatistics> = {};
	$: {
		for (const f of fns) byName[f.name] = f;
	}
</script>

<h3 class="section-title">{STRING__COMPARISONS_PAIRED_T_TEST_}</h3>

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
					<span class="text-dim">{STRING__COMPARISONS_VS_}</span>
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
							{STRING__COMPARISONS_FASTER_}
							<span class="text-dim"
								>({formatPValue(c.pValue)})</span
							>
						</p>
					{:else}
						<p>
							<span class="text-yellow">≈</span>
							{STRING__COMPARISONS_NO_SIGNIFICANT_DIFFERENCE_}
							<span class="text-dim"
								>({formatPValue(c.pValue)})</span
							>
						</p>
					{/if}

					<p class="comp-detail text-dim">
						{STRING__COMPARISONS_DELTA_PREFIX_}{formatTime(
							c.meanDifference,
						)}
						&nbsp; {STRING__COMPARISONS_95_PERCENT_CI_PREFIX_}{formatTime(
							c.confidenceInterval[0],
						)}{STRING__COMPARISONS_95_PERCENT_CI_SEPARATOR_}{formatTime(
							c.confidenceInterval[1],
						)}{STRING__COMPARISONS_95_PERCENT_CI_SUFFIX_}
					</p>
					<p class="comp-detail text-dim">
						{STRING__COMPARISONS_T_PREFIX_}{c.tStatistic.toFixed(3)} &nbsp;
						{STRING__COMPARISONS_DF_PREFIX_}{c.degreesOfFreedom}
						&nbsp; {STRING__COMPARISONS_SE_DELTA_PREFIX_}{formatTime(
							seD,
						)}
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

	@media not (writing-mode: tb-lr) {
		.comparison-card {
			padding-block: 0.875rem;
			padding-inline: 1rem;
		}
	}

	.comp-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	@media not (writing-mode: tb-lr) {
		.comp-header {
			margin-bottom: 0;
			margin-block-end: 0.5rem;
		}
	}

	.sig-badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.15em 0.5em;
		border-radius: 3px;
		margin-left: auto;
	}

	@media not (writing-mode: tb-lr) {
		.sig-badge {
			padding-block: 0.15em;
			padding-inline: 0.5em;
			margin-left: 0;
			margin-inline-start: auto;
		}
	}

	.sig-yes {
		color: var(--c-yellow);
		background: color-mix(in srgb, var(--c-yellow) 14%, transparent);
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

	@media not (writing-mode: tb-lr) {
		.comp-body p {
			margin-bottom: 0;
			margin-block-end: 0.25rem;
		}
	}

	.comp-detail {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}
</style>
