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
		cv_ as cv_,
		formatPercent_ as formatPercent,
		formatTime_ as formatTime,
	} from '../../format.js';
	import {
		STRING__DETAILED_STATISTICS_,
		STRING__DETAILED_STATISTICS_ARIA_LABEL_,
		STRING__DETAILED_STATISTICS_COEFFICIENT_OF_VARIATION_,
		STRING__DETAILED_STATISTICS_CV_,
		STRING__DETAILED_STATISTICS_FUNCTION_,
		STRING__DETAILED_STATISTICS_MAX_,
		STRING__DETAILED_STATISTICS_MAXIMUM_,
		STRING__DETAILED_STATISTICS_MEAN_,
		STRING__DETAILED_STATISTICS_MEDIAN_,
		STRING__DETAILED_STATISTICS_MIN_,
		STRING__DETAILED_STATISTICS_MINIMUM_,
		STRING__DETAILED_STATISTICS_SEM_,
		STRING__DETAILED_STATISTICS_STANDARD_DEVIATION_,
		STRING__DETAILED_STATISTICS_STANDARD_ERROR_OF_THE_MEAN_,
		STRING__DETAILED_STATISTICS_STD_DEV_,
	} from '../../i18n/strings.js';

	export let fns: IFunctionStatistics[];
</script>

<h3 class="section-title">{STRING__DETAILED_STATISTICS_}</h3>

<div class="card stats-card">
	<div class="table-scroll">
		<table
			class="data-table"
			aria-label={STRING__DETAILED_STATISTICS_ARIA_LABEL_}
		>
			<thead>
				<tr>
					<th scope="col">{STRING__DETAILED_STATISTICS_FUNCTION_}</th>
					<th scope="col" class="num">
						{STRING__DETAILED_STATISTICS_MEAN_}
					</th>
					<th scope="col" class="num">
						{STRING__DETAILED_STATISTICS_MEDIAN_}
					</th>
					<th scope="col" class="num">
						<abbr
							title={STRING__DETAILED_STATISTICS_STANDARD_DEVIATION_}
							>{STRING__DETAILED_STATISTICS_STD_DEV_}</abbr
						>
					</th>
					<th scope="col" class="num">
						<abbr
							title={STRING__DETAILED_STATISTICS_COEFFICIENT_OF_VARIATION_}
							>{STRING__DETAILED_STATISTICS_CV_}</abbr
						>
					</th>
					<th scope="col" class="num">
						<abbr title={STRING__DETAILED_STATISTICS_MINIMUM_}
							>{STRING__DETAILED_STATISTICS_MIN_}</abbr
						>
					</th>
					<th scope="col" class="num">
						<abbr title={STRING__DETAILED_STATISTICS_MAXIMUM_}
							>{STRING__DETAILED_STATISTICS_MAX_}</abbr
						>
					</th>
					<th scope="col" class="num">
						<abbr
							title={STRING__DETAILED_STATISTICS_STANDARD_ERROR_OF_THE_MEAN_}
							>{STRING__DETAILED_STATISTICS_SEM_}</abbr
						>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each fns as f}
					{@const cv = cv_(f)}
					<tr>
						<td>{f.name}</td>
						<td class="num">{formatTime(f.mean)}</td>
						<td class="num">{formatTime(f.median)}</td>
						<td class="num">{formatTime(f.stdDev)}</td>
						<td class="num {cvClass(cv)}">{formatPercent(cv)}</td>
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
