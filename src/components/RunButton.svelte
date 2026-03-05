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

	export let ready: boolean = false;
	export let running: boolean;
	export let progress: IRunProgress | null;

	$: displayFn =
		progress?.currentFunction === NULL_FUNCTION_NAME
			? 'baseline'
			: (progress?.currentFunction ?? '');
</script>

<div class="run-container">
	<button
		class="primary run-btn"
		disabled={!ready || running}
		type="submit"
		aria-label={running ? 'Benchmark is running' : 'Run benchmark'}
	>
		{#if running}
			<span class="spinner" aria-hidden="true"></span>
			Running…
		{:else}
			▶ Run Benchmark
		{/if}
	</button>

	{#if running && progress}
		<div class="progress-info" role="status" aria-live="polite">
			<progress max={progress.totalTrials} value={progress.trial - 1}
			></progress>
			<span class="progress-text">
				Trial {progress.trial}/{progress.totalTrials}
				<span class="text-dim">· {displayFn}</span>
			</span>
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

	.spinner {
		display: inline-block;
		width: 0.875em;
		height: 0.875em;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
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

	progress[value] {
		appearance: none;
		height: 4px;
		border: 0 none transparent;
		background: var(--c-surface-2);
		border-radius: 2px;
	}

	progress[value]::-webkit-progress-bar {
		background: var(--c-surface-2);
		border-radius: 2px;
	}

	progress[value]::-webkit-progress-value {
		height: 100%;
		background: var(--c-accent);
		border-radius: 2px;
	}

	progress[value]::-moz-progress-bar {
		height: 100%;
		background: var(--c-accent);
		border-radius: 2px;
	}

	.progress-text {
		font-size: 0.75rem;
		color: var(--c-text-dim);
		font-family: var(--font-mono);
	}
</style>
