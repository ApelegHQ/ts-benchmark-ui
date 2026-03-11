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
	import { afterUpdate, onMount } from 'svelte';
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

	let canvasEl: HTMLCanvasElement;

	$: globalMin = Math.min(...fns.map((f) => f.p5));
	$: globalMax = Math.max(...fns.map((f) => f.p95));

	const ROW_HEIGHT = 36;
	const PADDING_LEFT = 160;
	const PADDING_RIGHT = 40;
	const PADDING_TOP = 28;

	$: canvasHeight = PADDING_TOP + fns.length * ROW_HEIGHT + 10;

	function drawChart() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const width = canvasEl.clientWidth;
		const height = canvasHeight;

		canvasEl.width = width * dpr;
		canvasEl.height = height * dpr;
		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, width, height);

		const plotLeft = PADDING_LEFT;
		const plotRight = width - PADDING_RIGHT;
		const plotWidth = plotRight - plotLeft;
		const range = globalMax - globalMin;
		const styles = getComputedStyle(document.documentElement);
		const chartAxis = styles.getPropertyValue('--c-chart-axis').trim();
		const chartLine = styles.getPropertyValue('--c-chart-line').trim();
		const chartLabelStrong = styles
			.getPropertyValue('--c-chart-label-strong')
			.trim();
		const chartLabel = styles.getPropertyValue('--c-chart-label').trim();
		const chartSample = styles.getPropertyValue('--c-chart-sample').trim();
		const accentCyan = styles.getPropertyValue('--c-cyan').trim();
		const accentBlue = styles.getPropertyValue('--c-blue').trim();
		const textPrimary = styles.getPropertyValue('--c-text').trim();

		function xPos(value: number): number {
			if (range <= 0) return plotLeft + plotWidth / 2;
			return plotLeft + ((value - globalMin) / range) * plotWidth;
		}

		ctx.fillStyle = chartAxis;
		ctx.font = '11px JetBrains Mono, Fira Code, monospace';
		ctx.textAlign = 'left';
		ctx.fillText(formatTime(globalMin), plotLeft, 14);
		ctx.textAlign = 'right';
		ctx.fillText(formatTime(globalMax), plotRight, 14);

		ctx.strokeStyle = chartLine;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(plotLeft, PADDING_TOP - 6);
		ctx.lineTo(plotRight, PADDING_TOP - 6);
		ctx.stroke();

		for (let i = 0; i < fns.length; i++) {
			const f = fns[i];
			const cy = PADDING_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2;

			ctx.fillStyle = i === 0 ? chartLabelStrong : chartLabel;
			ctx.font = `${i === 0 ? 'bold ' : ''}12px Inter, -apple-system, sans-serif`;
			ctx.textAlign = 'right';
			ctx.fillText(
				f.name.length > 18 ? f.name.slice(0, 17) + '…' : f.name,
				plotLeft - 12,
				cy + 4,
			);

			const x5 = xPos(f.p5);
			const x25 = xPos(f.p25);
			const xMed = xPos(f.median);
			const x75 = xPos(f.p75);
			const x95 = xPos(f.p95);

			ctx.strokeStyle = chartAxis;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x5, cy);
			ctx.lineTo(x25, cy);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x75, cy);
			ctx.lineTo(x95, cy);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x5, cy - 5);
			ctx.lineTo(x5, cy + 5);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x95, cy - 5);
			ctx.lineTo(x95, cy + 5);
			ctx.stroke();

			const boxH = 14;
			ctx.fillStyle = accentCyan;
			ctx.fillRect(x25, cy - boxH / 2, xMed - x25, boxH);
			ctx.fillStyle = accentBlue;
			ctx.fillRect(xMed, cy - boxH / 2, x75 - xMed, boxH);

			ctx.strokeStyle = textPrimary;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(xMed, cy - boxH / 2 - 1);
			ctx.lineTo(xMed, cy + boxH / 2 + 1);
			ctx.stroke();

			if (f.samples.length > 1) {
				ctx.fillStyle = chartSample;
				for (const sample of f.samples) {
					const sx = xPos(
						Math.max(globalMin, Math.min(globalMax, sample)),
					);
					ctx.beginPath();
					ctx.arc(sx, cy + boxH / 2 + 6, 1.5, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}
	}

	onMount(drawChart);
	afterUpdate(drawChart);

	function handleResize() {
		drawChart();
	}
</script>

<svelte:window on:resize={handleResize} />

<h3 class="section-title">{STRING__DISTRIBUTION_}</h3>

<div class="card distribution-card">
	<canvas
		bind:this={canvasEl}
		style={`width: 100%; height: ${canvasHeight}px;`}
		aria-label={STRING__DISTRIBUTION_ARIA_LABEL_}
	></canvas>

	<div class="legend">
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
	</div>
</div>

<style>
	.distribution-card {
		padding: 1rem;
	}

	canvas {
		display: block;
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
</style>
