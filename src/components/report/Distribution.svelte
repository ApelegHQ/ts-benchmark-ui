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

	const ROW_BLOCK_SIZE = 36;
	const PADDING_INLINE_START = 160;
	const PADDING_INLINE_END = 40;
	const PADDING_BLOCK_START = 28;

	let vertical: boolean;

	$: canvasBlockSize = PADDING_BLOCK_START + fns.length * ROW_BLOCK_SIZE + 10;

	function drawChart() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const dpr = self.devicePixelRatio || 1;
		const inlineSize = vertical
			? canvasEl.clientHeight
			: canvasEl.clientWidth;
		const blockSize = canvasBlockSize;

		if (vertical) {
			canvasEl.width = blockSize * dpr;
			canvasEl.height = inlineSize * dpr;
		} else {
			canvasEl.width = inlineSize * dpr;
			canvasEl.height = blockSize * dpr;
		}
		ctx.scale(dpr, dpr);
		ctx.clearRect(
			0,
			0,
			vertical ? blockSize : inlineSize,
			vertical ? inlineSize : blockSize,
		);

		const stroke = () => ctx.stroke();
		const beginPath = () => ctx.beginPath();
		const lineWidth = (w: number) => (ctx.lineWidth = w);
		const fillStyle = (s: string) => (ctx.fillStyle =  s);
		const strokeStyle = (s: string) => (ctx.strokeStyle =  s);
		const textAlign = (a: CanvasTextAlign) => (ctx.textAlign = a);
		const font = (f: string) => (ctx.font = f);
		const fillText = (
			text: string,
			x: number,
			y: number,
			maxWidth?: number,
		) =>
			vertical
				? ctx.fillText(text, y, x, maxWidth)
				: ctx.fillText(text, x, y, maxWidth);
		const moveTo = (x: number, y: number) =>
			vertical ? ctx.moveTo(y, x) : ctx.moveTo(x, y);
		const lineTo = (x: number, y: number) =>
			vertical ? ctx.lineTo(y, x) : ctx.lineTo(x, y);
		const fillRect = (x: number, y: number, w: number, h: number) =>
			vertical ? ctx.fillRect(y, x, h, w) : ctx.fillRect(x, y, w, h);
		const arc = (
			x: number,
			y: number,
			radius: number,
			startAngle: number,
			endAngle: number,
			counterclockwise?: boolean,
		) =>
			vertical
				? ctx.arc(y, x, radius, startAngle, endAngle, counterclockwise)
				: ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
		const fill = () => ctx.fill();

		const plotInlineStart = PADDING_INLINE_START;
		const plotInlineEnd = inlineSize - PADDING_INLINE_END;
		const plotInlineSize = plotInlineEnd - plotInlineStart;
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

		const xPos = (value: number): number => {
			if (range <= 0) return plotInlineStart + plotInlineSize / 2;
			return (
				plotInlineStart + ((value - globalMin) / range) * plotInlineSize
			);
		}

		fillStyle(chartAxis);
		font('11px JetBrains Mono, Fira Code, monospace');
		textAlign('left');
		fillText(formatTime(globalMin), plotInlineStart, 14);
		textAlign('right');
		fillText(formatTime(globalMax), plotInlineEnd, 14);

		strokeStyle(chartLine);
		lineWidth(1);
		beginPath();
		moveTo(plotInlineStart, PADDING_BLOCK_START - 6);
		lineTo(plotInlineEnd, PADDING_BLOCK_START - 6);
		stroke();

		for (let i = 0; i < fns.length; i++) {
			const f = fns[i];
			const cy =
				PADDING_BLOCK_START + i * ROW_BLOCK_SIZE + ROW_BLOCK_SIZE / 2;

			fillStyle(i === 0 ? chartLabelStrong : chartLabel);
			font(`${i === 0 ? 'bold ' : ''}12px Inter, -apple-system, sans-serif`);
			textAlign('right');
			fillText(
				f.name.length > 18 ? f.name.slice(0, 17) + '…' : f.name,
				plotInlineStart - 12,
				cy + 4,
			);

			const x5 = xPos(f.p5);
			const x25 = xPos(f.p25);
			const xMed = xPos(f.median);
			const x75 = xPos(f.p75);
			const x95 = xPos(f.p95);

			strokeStyle(chartAxis);
			lineWidth(1);
			beginPath();
			moveTo(x5, cy);
			lineTo(x25, cy);
			stroke();
			beginPath();
			moveTo(x75, cy);
			lineTo(x95, cy);
			stroke();
			beginPath();
			moveTo(x5, cy - 5);
			lineTo(x5, cy + 5);
			stroke();
			beginPath();
			moveTo(x95, cy - 5);
			lineTo(x95, cy + 5);
			stroke();

			const boxH = 14;
			fillStyle(accentCyan);
			fillRect(x25, cy - boxH / 2, xMed - x25, boxH);
			fillStyle(accentBlue);
			fillRect(xMed, cy - boxH / 2, x75 - xMed, boxH);

			strokeStyle(textPrimary);
			lineWidth(2);
			beginPath();
			moveTo(xMed, cy - boxH / 2 - 1);
			lineTo(xMed, cy + boxH / 2 + 1);
			stroke();

			if (f.samples.length > 1) {
				fillStyle(chartSample);
				for (const sample of f.samples) {
					const sx = xPos(
						Math.max(globalMin, Math.min(globalMax, sample)),
					);
					beginPath();
					arc(sx, cy + boxH / 2 + 6, 1.5, 0, Math.PI * 2);
					fill();
				}
			}
		}
	}

	$: if (canvasEl && canvasBlockSize != null) {
		const styles = getComputedStyle(canvasEl);
		if (styles['writingMode']?.startsWith('vertical-')) {
			canvasEl.style.inlineSize = '100%';
			canvasEl.style.blockSize = `${canvasBlockSize}px`;
			vertical = true;
		} else {
			canvasEl.style.width = '100%';
			canvasEl.style.height = `${canvasBlockSize}px`;
			vertical = false;
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
	<canvas bind:this={canvasEl} aria-label={STRING__DISTRIBUTION_ARIA_LABEL_}
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
