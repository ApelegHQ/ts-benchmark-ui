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
	import { formatMultiplier_ as formatMultiplier } from '../../format.js';

	export let fns: IFunctionStatistics[];
	export let comps: IPairedComparison[];

	function findComp(a: string, b: string): IPairedComparison | undefined {
		return comps.find(
			(c) => (c.a === a && c.b === b) || (c.b === a && c.a === b),
		);
	}

	function cellClass(ratio: number): string {
		if (ratio >= 1.005) return 'text-green';
		if (ratio <= 0.995) return 'text-red';
		return 'text-dim';
	}
</script>

<div class="section-title">Speed Matrix</div>

<div class="card matrix-card">
	<p class="matrix-caption text-dim">
		Cell = column time ÷ row time ·
		<span class="text-green">green</span> &gt; 1 (row is faster) ·
		<span class="text-red">red</span> &lt; 1 (row is slower) ·
		<span class="text-yellow">*</span> significant
	</p>

	<div class="table-scroll">
		<table class="data-table" aria-label="Speed comparison matrix">
			<thead>
				<tr>
					<th scope="col"></th>
					{#each fns as colF}
						<th scope="col" class="num">
							{colF.name.length > 12
								? colF.name.slice(0, 11) + '…'
								: colF.name}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each fns as rowF}
					<tr>
						<th scope="row">{rowF.name}</th>
						{#each fns as colF}
							<td class="num">
								{#if rowF.name === colF.name}
									<span class="text-muted">—</span>
								{:else}
									{@const ratio = colF.mean / rowF.mean}
									{@const comp = findComp(
										rowF.name,
										colF.name,
									)}
									<span class={cellClass(ratio)}>
										{formatMultiplier(
											ratio,
										)}{#if comp?.significant}<span
												class="text-yellow">*</span
											>{/if}
									</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.matrix-card {
		padding: 1rem;
	}

	.matrix-caption {
		font-size: 0.7rem;
		margin-bottom: 0.75rem;
	}

	.table-scroll {
		overflow-x: auto;
	}

	th[scope='row'] {
		text-align: left;
		font-weight: 600;
		font-size: 0.8125rem;
	}
</style>
