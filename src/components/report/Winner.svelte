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
	} from '../../format.js';
	import {
		STRING__WINNER_FASTER_THAN_,
		STRING__WINNER_FASTEST_,
		STRING__WINNER_STATISTICALLY_TIED_,
	} from '../../i18n/strings.js';
	import getRatio from '../../lib/get-ratio.js';

	export let fns: IFunctionStatistics[];
	export let comps: IPairedComparison[];

	$: fastest = fns[0];
	$: second = fns.length > 1 ? fns[1] : null;
	$: slowest = fns[fns.length - 1];

	$: topComp = second
		? comps.find(
				(c) =>
					(c.a === fastest.name && c.b === second!.name) ||
					(c.b === fastest.name && c.a === second!.name),
			)
		: null;

	$: isTied = topComp && !topComp.significant;
	$: ratioVsSecond = second ? getRatio(fastest, second, fastest) : 1;
	$: ratioVsSlowest = slowest ? getRatio(fastest, slowest, fastest) : 1;
</script>

{#if fns.length >= 2}
	<div class="winner-banner" role="status">
		{#if isTied}
			<span class="winner-icon" aria-hidden="true">≈</span>
			<span>
				{STRING__WINNER_STATISTICALLY_TIED_[0]}<strong
					>{fastest.name}</strong
				>
				{STRING__WINNER_STATISTICALLY_TIED_[1]}<strong
					>{second?.name}</strong
				>
				{STRING__WINNER_STATISTICALLY_TIED_[2]}<span
					class="text-yellow text-bold"
					>{STRING__WINNER_STATISTICALLY_TIED_[3]}</span
				>{STRING__WINNER_STATISTICALLY_TIED_[4]}<span class="text-dim"
					>({formatPValue(topComp?.pValue ?? 1)})</span
				>{STRING__WINNER_STATISTICALLY_TIED_[5]}
			</span>
		{:else}
			<span class="winner-icon text-green" aria-hidden="true">⚡</span>
			<span>
				{STRING__WINNER_FASTEST_[0]}<strong class="text-green"
					>{fastest.name}</strong
				>{STRING__WINNER_FASTEST_[1]}
				<span class="text-dim">
					{STRING__WINNER_FASTER_THAN_[0]}{formatMultiplier(
						ratioVsSecond,
					)}{STRING__WINNER_FASTER_THAN_[1]}{second?.name}{#if fns.length > 2},
						{formatMultiplier(
							ratioVsSlowest,
						)}{STRING__WINNER_FASTER_THAN_[2]}{slowest.name}{/if}
				</span>
			</span>
		{/if}
	</div>
{/if}

<style>
	.winner-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		margin-top: 1rem;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--radius);
		font-size: 0.9375rem;
	}

	@media not (writing-mode: tb-lr) {
		.winner-banner {
			margin: 0;
			padding-block: 0.875rem;
			padding-inline: 1.25rem;
			margin-block-start: 1rem;
		}
	}

	.winner-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}
</style>
