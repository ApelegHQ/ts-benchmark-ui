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
		cvClass_ as cvClass,
		cvPercent_ as cvPercent,
		formatTime_ as formatTime,
	} from '../../format.js';

	export let fns: IFunctionStatistics[];
</script>

<div class="section-title">Detailed Statistics</div>

<div class="card stats-card">
	<div class="table-scroll">
		<table class="data-table" aria-label="Detailed function statistics">
			<thead>
				<tr>
					<th scope="col">Function</th>
					<th scope="col" class="num">Mean</th>
					<th scope="col" class="num">Median</th>
					<th scope="col" class="num">
						<abbr title="Standard Deviation">Std Dev</abbr>
					</th>
					<th scope="col" class="num">
						<abbr title="Coefficient of Variation">CV</abbr>
					</th>
					<th scope="col" class="num">
						<abbr title="Minimum">Min</abbr>
					</th>
					<th scope="col" class="num">
						<abbr title="Maximum">Max</abbr>
					</th>
					<th scope="col" class="num">
						<abbr title="Standard Error of the Mean">SEM</abbr>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each fns as f}
					{@const cv = cvPercent(f)}
					<tr>
						<td>{f.name}</td>
						<td class="num">{formatTime(f.mean)}</td>
						<td class="num">{formatTime(f.median)}</td>
						<td class="num">{formatTime(f.stdDev)}</td>
						<td class="num {cvClass(cv)}">{cv.toFixed(1)}%</td>
						<td class="num">{formatTime(f.min)}</td>
						<td class="num">{formatTime(f.max)}</td>
						<td class="num">{formatTime(f.sem)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.stats-card {
		padding: 0;
		overflow: hidden;
	}

	.table-scroll {
		overflow-x: auto;
	}
</style>
