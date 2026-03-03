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

		function xPos(value: number): number {
			if (range <= 0) return plotLeft + plotWidth / 2;
			return plotLeft + ((value - globalMin) / range) * plotWidth;
		}

		// Axis labels
		ctx.fillStyle = '#5c6478';
		ctx.font = '11px JetBrains Mono, Fira Code, monospace';
		ctx.textAlign = 'left';
		ctx.fillText(formatTime(globalMin), plotLeft, 14);
		ctx.textAlign = 'right';
		ctx.fillText(formatTime(globalMax), plotRight, 14);

		// Axis line
		ctx.strokeStyle = '#2e3244';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(plotLeft, PADDING_TOP - 6);
		ctx.lineTo(plotRight, PADDING_TOP - 6);
		ctx.stroke();

		for (let i = 0; i < fns.length; i++) {
			const f = fns[i];
			const cy = PADDING_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2;

			// Function name
			ctx.fillStyle = i === 0 ? '#3dd68c' : '#e0e6f0';
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

			// Whiskers (p5 → p25, p75 → p95)
			ctx.strokeStyle = '#5c6478';
			ctx.lineWidth = 1;
			// Left whisker
			ctx.beginPath();
			ctx.moveTo(x5, cy);
			ctx.lineTo(x25, cy);
			ctx.stroke();
			// Right whisker
			ctx.beginPath();
			ctx.moveTo(x75, cy);
			ctx.lineTo(x95, cy);
			ctx.stroke();
			// Whisker caps
			ctx.beginPath();
			ctx.moveTo(x5, cy - 5);
			ctx.lineTo(x5, cy + 5);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x95, cy - 5);
			ctx.lineTo(x95, cy + 5);
			ctx.stroke();

			// IQR box
			const boxH = 14;
			// Left half of IQR (cyan)
			ctx.fillStyle = '#36d4c7';
			ctx.fillRect(x25, cy - boxH / 2, xMed - x25, boxH);
			// Right half of IQR (blue)
			ctx.fillStyle = '#5b8def';
			ctx.fillRect(xMed, cy - boxH / 2, x75 - xMed, boxH);

			// Median line
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(xMed, cy - boxH / 2 - 1);
			ctx.lineTo(xMed, cy + boxH / 2 + 1);
			ctx.stroke();

			// Sparkline (density) — small dots for each sample
			if (f.samples.length > 1) {
				ctx.fillStyle = 'rgba(54, 212, 199, 0.3)';
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

	// Redraw on resize
	function handleResize() {
		drawChart();
	}
</script>

<svelte:window on:resize={handleResize} />

<div class="section-title">Distribution</div>

<div class="card distribution-card">
	<canvas
		bind:this={canvasEl}
		style="width: 100%; height: {canvasHeight}px;"
		aria-label="Box plot distribution chart showing percentile ranges for each function"
	></canvas>

	<div class="legend">
		<span class="legend-item">
			<span class="legend-swatch" style="background: #5c6478;">╷</span>
			<span class="text-dim"
				>whiskers <abbr title="5th perentile">p5</abbr>/<abbr
					title="95th perentile">p95</abbr
				></span
			>
		</span>
		<span class="legend-item">
			<span class="legend-swatch" style="background: #36d4c7;"></span>
			<span class="legend-swatch" style="background: #5b8def;"></span>
			<span class="text-dim">
				<abbr title="Interquartile Range">IQR</abbr>
				{' '}
				(<abbr title="25th perentile">p25</abbr>–<abbr
					title="75th percentile">p75</abbr
				>)
			</span>
		</span>
		<span class="legend-item">
			<span class="legend-swatch" style="background: #fff; width: 2px;"
			></span>
			<span class="text-dim">median</span>
		</span>
		<span class="legend-item">
			<span
				class="legend-dot"
				style="background: rgba(54, 212, 199, 0.6);"
			></span>
			<span class="text-dim">samples</span>
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
	}

	.legend-dot {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
	}
</style>
