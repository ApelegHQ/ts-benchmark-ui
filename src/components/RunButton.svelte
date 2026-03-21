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
	import {
		type IRunProgress,
		NULL_FUNCTION_NAME,
	} from '@apeleghq/benchmark/types';
	import {
		STRING__RUN_BUTTON_BASELINE_,
		STRING__RUN_BUTTON_BENCHMARK_IS_RUNNING_,
		STRING__RUN_BUTTON_RUN_BENCHMARK_,
		STRING__RUN_BUTTON_RUN_BENCHMARK_LABEL_,
		STRING__RUN_BUTTON_RUNNING_,
		STRING__RUN_BUTTON_TRIAL_,
	} from '../i18n/strings.js';

	export let ready: boolean = false;
	export let running: boolean;
	export let progress: IRunProgress | null;
</script>

<div class="run-container">
	<button
		class="primary run-btn"
		disabled={!ready || running}
		type="submit"
		aria-label={running
			? STRING__RUN_BUTTON_BENCHMARK_IS_RUNNING_
			: STRING__RUN_BUTTON_RUN_BENCHMARK_}
	>
		{#if running}
			<span class="spinner" aria-hidden="true"></span>
			{STRING__RUN_BUTTON_RUNNING_}
		{:else}
			{STRING__RUN_BUTTON_RUN_BENCHMARK_LABEL_}
		{/if}
	</button>

	{#if running && progress}
		<div class="progress-info" role="status" aria-live="polite">
			<progress
				max={progress.totalTrials}
				value={String(progress.trial - 1)}
			></progress>
			<div class="progress-text">
				{STRING__RUN_BUTTON_TRIAL_[0]}{progress.trial}{STRING__RUN_BUTTON_TRIAL_[1]}{progress.totalTrials}{STRING__RUN_BUTTON_TRIAL_[2]}
				<div class="text-dim">
					{#if progress.currentFunction === NULL_FUNCTION_NAME}
						{STRING__RUN_BUTTON_BASELINE_}
						<span class="mono text-cyan"
							>({NULL_FUNCTION_NAME})</span
						>
					{:else}
						{progress.currentFunction}
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.run-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.run-btn {
		font-size: 0.9375rem;
		padding: 0.625em 1.5em;
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		white-space: nowrap;
	}

	@media not (writing-mode: tb-lr) {
		.run-btn {
			padding-block: 0.625em;
			padding-inline: 1.5em;
		}
	}

	.spinner {
		display: inline-block;
		width: 0.875em;
		height: 0.875em;
		border: 2px solid color-mix(in srgb, #fff 35%, transparent);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@media not (writing-mode: tb-lr) {
		.spinner {
			border-top-color: color-mix(in srgb, #fff 35%, transparent);
			inline-size: 0.875em;
			block-size: 0.875em;
			border-block-start-color: #fff;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.progress-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	@media not (writing-mode: tb-lr) {
		.progress-info {
			min-width: auto;
			min-inline-size: 0;
		}
	}

	progress[value] {
		appearance: none;
		width: 100%;
		height: 4px;
		border: 0 none transparent;
		background: var(--c-surface-2);
		border-radius: 2px;
		forced-color-adjust: none;
	}

	@media not (writing-mode: tb-lr) {
		progress[value] {
			block-size: 4px;
			inline-size: 100%;
		}
	}

	progress[value]::-webkit-progress-bar {
		background: var(--c-surface-2);
		border-radius: 2px;
	}

	progress[value]::-webkit-progress-value {
		height: 100%;
		background: var(--c-accent);
		border-radius: 2px;
		transition: width 0.2s ease;
	}

	@media not (writing-mode: tb-lr) {
		progress[value]::-webkit-progress-value {
			height: auto;
			block-size: 100%;
		}
	}

	progress[value]::-moz-progress-bar {
		height: 100%;
		background: var(--c-accent);
		border-radius: 2px;
	}

	@media not (writing-mode: tb-lr) {
		progress[value]::-moz-progress-bar {
			height: auto;
			block-size: 100%;
		}
	}

	.progress-text {
		font-size: 0.75rem;
		color: var(--c-text-dim);
		font-family: var(--font-mono);
	}
</style>
