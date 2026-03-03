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
		suiteState_ as suiteState,
		updateConfig_ as updateConfig,
	} from '../state.js';

	function handleInput(field: string, e: Event) {
		const target = e.target as HTMLInputElement;
		if (field === 'name' || field === 'setupCode') {
			updateConfig({ [field]: target.value });
		} else {
			const val = parseInt(target.value, 10);
			if (!isNaN(val) && val > 0) {
				updateConfig({ [field]: val });
			}
		}
	}
</script>

<section class="card config-section" aria-label="Suite configuration">
	<div class="config-grid">
		<div class="field field-name">
			<label for="suite-name">Suite Name</label>
			<input
				id="suite-name"
				type="text"
				value={$suiteState.name}
				on:input={(e) => handleInput('name', e)}
			/>
		</div>

		<div class="field">
			<label for="cfg-trials">Trials</label>
			<input
				id="cfg-trials"
				type="number"
				min="1"
				max="500"
				value={$suiteState.trials}
				on:input={(e) => handleInput('trials', e)}
			/>
		</div>

		<div class="field">
			<label for="cfg-iters">Iterations / Trial</label>
			<input
				id="cfg-iters"
				type="number"
				min="1"
				max="1000000"
				value={$suiteState.iterationsPerTrial}
				on:input={(e) => handleInput('iterationsPerTrial', e)}
			/>
		</div>

		<div class="field">
			<label for="cfg-warmup">Warmup Iterations</label>
			<input
				id="cfg-warmup"
				type="number"
				min="0"
				max="10000"
				value={$suiteState.warmupIterations}
				on:input={(e) => handleInput('warmupIterations', e)}
			/>
		</div>
	</div>

	<details class="setup-details">
		<summary>
			<span class="summary-text">Suite Setup Code</span>
			<span class="text-dim">(optional — runs before each function)</span>
		</summary>
		<div class="setup-editor">
			<label for="setup-code" class="sr-only">Setup function body</label>
			<textarea
				id="setup-code"
				rows="4"
				placeholder="// e.g. this.data = Array.from({{
					length: 1000,
				}}, () => Math.random());"
				value={$suiteState.setupCode}
				on:input={(e) => handleInput('setupCode', e)}
				spellcheck="false"
			></textarea>
		</div>
	</details>
</section>

<style>
	.config-section {
		margin-bottom: 1rem;
	}

	.config-grid {
		display: grid;
		grid-template-columns: 1fr repeat(3, 8rem);
		gap: 1rem;
		align-items: end;
	}

	@media (max-width: 640px) {
		.config-grid {
			grid-template-columns: 1fr 1fr;
		}

		.field-name {
			grid-column: 1 / -1;
		}
	}

	.field input {
		width: 100%;
	}

	.setup-details {
		margin-top: 1rem;
	}

	.setup-details summary {
		cursor: pointer;
		font-size: 0.8125rem;
		color: var(--c-text-dim);
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.setup-details summary::-webkit-details-marker {
		display: none;
	}

	.setup-details summary::before {
		content: '▶';
		font-size: 0.65rem;
		transition: transform 0.15s;
	}

	.setup-details[open] summary::before {
		transform: rotate(90deg);
	}

	.summary-text {
		font-weight: 600;
		color: var(--c-text);
	}

	.setup-editor {
		margin-top: 0.75rem;
	}

	.setup-editor textarea {
		width: 100%;
		resize: vertical;
		min-height: 4rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
