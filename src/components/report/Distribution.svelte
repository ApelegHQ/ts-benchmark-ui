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
	import { onMount } from 'svelte';
	import { formatTime_ as formatTime } from '../../format.js';
	import {
		STRING__DISTRIBUTION_,
		STRING__DISTRIBUTION_ARIA_LABEL_,
		STRING__DISTRIBUTION_INTERQUARTILE_RANGE_,
		STRING__DISTRIBUTION_IQR_,
		STRING__DISTRIBUTION_MEDIAN_,
		STRING__DISTRIBUTION_P25_,
		STRING__DISTRIBUTION_P5_,
		STRING__DISTRIBUTION_P75_,
		STRING__DISTRIBUTION_P95_,
		STRING__DISTRIBUTION_PERCENTILE_05_,
		STRING__DISTRIBUTION_PERCENTILE_25_,
		STRING__DISTRIBUTION_PERCENTILE_75_,
		STRING__DISTRIBUTION_PERCENTILE_95_,
		STRING__DISTRIBUTION_SAMPLES_,
		STRING__DISTRIBUTION_WHISKERS_,
	} from '../../i18n/strings.js';

	export let fns: IFunctionStatistics[];

	let svgEl: SVGSVGElement;
	let svgInlineSize = 0;
	let svgBlockSize = 0;

	$: globalMin = Math.min(...fns.map((f) => f.p5));
	$: globalMax = Math.max(...fns.map((f) => f.p95));

	const ROW_BLOCK_SIZE = 36;
	const PADDING_INLINE_START = 160;
	const PADDING_INLINE_END = 40;
	const PADDING_BLOCK_START = 28;

	let vertical = false;

	$: chartBlockSize = PADDING_BLOCK_START + fns.length * ROW_BLOCK_SIZE + 10;
	$: measuredInlineSize = vertical ? svgBlockSize : svgInlineSize;
	$: plotInlineStart = PADDING_INLINE_START;
	$: plotInlineEnd = measuredInlineSize - PADDING_INLINE_END;
	$: plotInlineSize = Math.max(0, plotInlineEnd - plotInlineStart);
	$: range = globalMax - globalMin;
	$: svgWidth = vertical ? chartBlockSize : Math.max(measuredInlineSize, 0);
	$: svgHeight = vertical ? Math.max(measuredInlineSize, 0) : chartBlockSize;
	$: viewBox = `0 0 ${Math.max(svgWidth, 1)} ${Math.max(svgHeight, 1)}`;

	onMount(() => {
		if (!svgEl) return;
		const styles = getComputedStyle(svgEl);
		vertical = styles['writingMode']?.startsWith('vertical-') ?? false;

		if (vertical) {
			svgEl.style.inlineSize = '100%';
			svgEl.style.blockSize = `${chartBlockSize}px`;
			svgEl.style.width = '';
			svgEl.style.height = '';
		} else {
			svgEl.style.width = '100%';
			svgEl.style.height = `${chartBlockSize}px`;
			svgEl.style.inlineSize = '';
			svgEl.style.blockSize = '';
		}
	});

	$: xPos = (value: number): number => {
		if (range <= 0) return plotInlineStart + plotInlineSize / 2;
		return plotInlineStart + ((value - globalMin) / range) * plotInlineSize;
	};

	function px(inline: number, block: number): number {
		return vertical ? block : inline;
	}

	function py(inline: number, block: number): number {
		return vertical ? inline : block;
	}

	function textX(inline: number, block: number): number {
		return vertical ? chartBlockSize - block : inline;
	}

	function textY(inline: number, block: number): number {
		return vertical ? inline : block;
	}

	function rectWidth(inlineSize: number, blockSize: number): number {
		return vertical ? blockSize : inlineSize;
	}

	function rectHeight(inlineSize: number, blockSize: number): number {
		return vertical ? inlineSize : blockSize;
	}

	function labelText(name: string): string {
		return name.length > 18 ? name.slice(0, 17) + '…' : name;
	}

	function statsDescription(f: IFunctionStatistics): string {
		return `${f.name}: ${STRING__DISTRIBUTION_P5_} ${formatTime(f.p5)}, ${STRING__DISTRIBUTION_P25_} ${formatTime(f.p25)}, ${STRING__DISTRIBUTION_MEDIAN_} ${formatTime(f.median)}, ${STRING__DISTRIBUTION_P75_} ${formatTime(f.p75)}, ${STRING__DISTRIBUTION_P95_} ${formatTime(f.p95)}, ${STRING__DISTRIBUTION_SAMPLES_} ${f.samples.length}`;
	}
</script>

<h3 class="section-title">{STRING__DISTRIBUTION_}</h3>

<figure class="card distribution-card">
	<div
		bind:clientWidth={svgInlineSize}
		bind:clientHeight={svgBlockSize}
		class="container"
	>
		<svg
			bind:this={svgEl}
			{viewBox}
			aria-label={STRING__DISTRIBUTION_ARIA_LABEL_}
			preserveAspectRatio="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>{STRING__DISTRIBUTION_ARIA_LABEL_}</title>

			{#if measuredInlineSize > 0}
				<text
					x={textX(plotInlineStart, 14)}
					y={textY(plotInlineStart, 14)}
					class="axis"
					text-anchor={vertical ? 'middle' : 'start'}
					dominant-baseline={vertical ? 'hanging' : 'alphabetic'}
				>
					{formatTime(globalMin)}
				</text>

				<text
					x={textX(plotInlineEnd, 14)}
					y={textY(plotInlineEnd, 14)}
					class="axis"
					text-anchor={vertical ? 'middle' : 'end'}
					dominant-baseline={vertical
						? 'text-after-edge'
						: 'alphabetic'}
				>
					{formatTime(globalMax)}
				</text>

				<line
					x1={px(plotInlineStart, PADDING_BLOCK_START - 6)}
					y1={py(plotInlineStart, PADDING_BLOCK_START - 6)}
					x2={px(plotInlineEnd, PADDING_BLOCK_START - 6)}
					y2={py(plotInlineEnd, PADDING_BLOCK_START - 6)}
					class="axis"
				/>

				{#each fns as f, i}
					{@const cy =
						PADDING_BLOCK_START +
						i * ROW_BLOCK_SIZE +
						ROW_BLOCK_SIZE / 2}
					{@const x5 = xPos(f.p5)}
					{@const x25 = xPos(f.p25)}
					{@const xMed = xPos(f.median)}
					{@const x75 = xPos(f.p75)}
					{@const x95 = xPos(f.p95)}
					{@const boxH = 14}

					<g role="group" aria-label={f.name}>
						<desc>{statsDescription(f)}</desc>

						<text
							x={textX(plotInlineStart - 12, cy + 4)}
							y={textY(plotInlineStart - 12, cy + 4)}
							class="fn"
							class:first={i === 0}
							text-anchor={vertical ? 'middle' : 'end'}
							dominant-baseline={vertical
								? 'text-after-edge'
								: 'alphabetic'}
						>
							{labelText(f.name)}
						</text>

						<line
							x1={px(x5, cy)}
							y1={py(x5, cy)}
							x2={px(x25, cy)}
							y2={py(x25, cy)}
							class="whisker"
						/>
						<line
							x1={px(x75, cy)}
							y1={py(x75, cy)}
							x2={px(x95, cy)}
							y2={py(x95, cy)}
							class="whisker"
						/>
						<line
							x1={px(x5, cy - 5)}
							y1={py(x5, cy - 5)}
							x2={px(x5, cy + 5)}
							y2={py(x5, cy + 5)}
							class="whisker"
						/>
						<line
							x1={px(x95, cy - 5)}
							y1={py(x95, cy - 5)}
							x2={px(x95, cy + 5)}
							y2={py(x95, cy + 5)}
							class="whisker"
						/>

						<rect
							x={px(x25, cy - boxH / 2)}
							y={py(x25, cy - boxH / 2)}
							width={rectWidth(xMed - x25, boxH)}
							height={rectHeight(xMed - x25, boxH)}
							class="p25"
						/>
						<rect
							x={px(xMed, cy - boxH / 2)}
							y={py(xMed, cy - boxH / 2)}
							width={rectWidth(x75 - xMed, boxH)}
							height={rectHeight(x75 - xMed, boxH)}
							class="p75"
						/>

						<line
							x1={px(xMed, cy - boxH / 2 - 1)}
							y1={py(xMed, cy - boxH / 2 - 1)}
							x2={px(xMed, cy + boxH / 2 + 1)}
							y2={py(xMed, cy + boxH / 2 + 1)}
							class="median-c"
						/>

						{#if f.samples.length > 1}
							{#each f.samples as sample}
								{@const sx = xPos(
									Math.max(
										globalMin,
										Math.min(globalMax, sample),
									),
								)}
								<circle
									class="sample"
									cx={px(sx, cy + boxH / 2 + 6)}
									cy={py(sx, cy + boxH / 2 + 6)}
									r="1.5"
								/>
							{/each}
						{/if}
					</g>
				{/each}
			{/if}
		</svg>
	</div>

	<figcaption class="legend">
		<span class="legend-item">
			<span class="legend-swatch whiskers">╷</span>
			<span class="text-dim"
				>{STRING__DISTRIBUTION_WHISKERS_}
				<abbr title={STRING__DISTRIBUTION_PERCENTILE_05_}
					>{STRING__DISTRIBUTION_P5_}</abbr
				>/<abbr title={STRING__DISTRIBUTION_PERCENTILE_95_}
					>{STRING__DISTRIBUTION_P95_}</abbr
				></span
			>
		</span>
		<span class="legend-item">
			<span class="legend-swatch iqr25"></span>
			<span class="legend-swatch iqr75"></span>
			<span class="text-dim">
				<abbr title={STRING__DISTRIBUTION_INTERQUARTILE_RANGE_}
					>{STRING__DISTRIBUTION_IQR_}</abbr
				>
				{' '}
				(<abbr title={STRING__DISTRIBUTION_PERCENTILE_25_}
					>{STRING__DISTRIBUTION_P25_}</abbr
				>–<abbr title={STRING__DISTRIBUTION_PERCENTILE_75_}
					>{STRING__DISTRIBUTION_P75_}</abbr
				>)
			</span>
		</span>
		<span class="legend-item">
			<span class="legend-swatch median"></span>
			<span class="text-dim">{STRING__DISTRIBUTION_MEDIAN_}</span>
		</span>
		<span class="legend-item">
			<span class="legend-dot samples"></span>
			<span class="text-dim">{STRING__DISTRIBUTION_SAMPLES_}</span>
		</span>
	</figcaption>
</figure>

<style>
	.container {
		display: block;
		margin: 0;
		padding: 0;
		border: 0;
		outline: 0;
	}

	.distribution-card {
		padding: 1rem;
	}

	svg {
		display: block;
		forced-color-adjust: none;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		margin-top: 0.75rem;
		font-size: 0.7rem;
		justify-content: center;
	}

	@media not (writing-mode: tb-lr) {
		.legend {
			margin-top: 0;
			margin-block-start: 0.75rem;
		}
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.legend-swatch {
		display: inline-block;
		width: 12px;
		height: 10px;
		border-radius: 2px;
		forced-color-adjust: none;
	}

	@media not (writing-mode: tb-lr) {
		.legend-swatch {
			inline-size: 12px;
			block-size: 10px;
		}
	}

	.legend-dot {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		forced-color-adjust: none;
	}

	@media not (writing-mode: tb-lr) {
		.legend-dot {
			inline-size: 7px;
			block-size: 7px;
		}
	}

	.whiskers {
		background: var(--c-chart-axis);
	}

	.iqr25 {
		background: var(--c-cyan);
	}

	.iqr75 {
		background: var(--c-blue);
	}

	.median {
		background: var(--c-text);
		width: 2px;
	}

	@media not (writing-mode: tb-lr) {
		.median {
			width: auto;
			inline-size: 2px;
		}
	}

	.samples {
		background: var(--c-chart-sample);
	}

	text.axis {
		fill: var(--c-chart-axis);
		font-family:
			JetBrains Mono,
			Fira Code,
			monospace;
		font-size: 11px;
	}

	line.axis {
		stroke: var(--c-chart-line);
		stroke-width: 1px;
	}

	.whisker {
		stroke: var(--c-chart-axis);
		stroke-width: 1px;
	}

	.median-c {
		stroke: var(--c-text);
		stroke-width: 2px;
	}

	.p25 {
		fill: var(--c-cyan);
	}

	.p75 {
		fill: var(--c-blue);
	}

	.sample {
		fill: var(--c-chart-sample);
	}

	.fn {
		fill: var(--c-chart-label);
		font-family:
			Inter,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 400;
	}

	.fn.first {
		fill: var(--c-chart-label-strong);
		font-weight: 700;
	}
</style>
