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
	import { onMount } from 'svelte';
	import {
		STRING__HEADER_IMPORTS_BODY_,
		STRING__HEADER_ITERATIONS_PER_TRIAL_,
		STRING__HEADER_PLACEHOLDER_IMPORTS_,
		STRING__HEADER_PLACEHOLDER_SETUP_,
		STRING__HEADER_PLACEHOLDER_TEARDOWN_,
		STRING__HEADER_SETUP_FUNCTION_BODY_,
		STRING__HEADER_SUITE_CONFIGURATION_,
		STRING__HEADER_SUITE_IMPORTS_,
		STRING__HEADER_SUITE_IMPORTS_OPTIONAL_,
		STRING__HEADER_SUITE_NAME_,
		STRING__HEADER_SUITE_SETUP_CODE_,
		STRING__HEADER_SUITE_SETUP_OPTIONAL_,
		STRING__HEADER_SUITE_TEARDOWN_CODE_,
		STRING__HEADER_SUITE_TEARDOWN_OPTIONAL_,
		STRING__HEADER_TEARDOWN_FUNCTION_BODY_,
		STRING__HEADER_TRIALS_,
		STRING__HEADER_WARMUP_ITERATIONS_,
	} from '../i18n/strings.js';
	import {
		suiteState_ as suiteState,
		updateConfig_ as updateConfig,
	} from '../state.js';
	import CodeMirrorWrapper from './CodeMirrorWrapper.svelte';

	let importsDetailsOpen = false;
	let setupDetailsOpen = false;
	let teardownDetailsOpen = false;
	let importsCodeEl: InstanceType<typeof CodeMirrorWrapper> | null = null;
	let setupCodeEl: InstanceType<typeof CodeMirrorWrapper> | null = null;
	let teardownCodeEl: InstanceType<typeof CodeMirrorWrapper> | null = null;

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

	function handleImportsCodeInput(e: Event) {
		updateConfig({
			importsCode: (e.target as HTMLTextAreaElement).value,
		});
	}

	function handleSetupCodeInput(e: Event) {
		updateConfig({
			setupCode: (e.target as HTMLTextAreaElement).value,
		});
	}

	function handleTeardownCodeInput(e: Event) {
		updateConfig({
			teardownCode: (e.target as HTMLTextAreaElement).value,
		});
	}

	function handleImportsCodeToggle(e: Event) {
		importsDetailsOpen = (e.target as HTMLDetailsElement).open;
		if (importsDetailsOpen && importsCodeEl?.requestMount) {
			importsCodeEl.requestMount();
		}
	}

	function handleSetupToggle(e: Event) {
		setupDetailsOpen = (e.target as HTMLDetailsElement).open;
		if (setupDetailsOpen && setupCodeEl?.requestMount) {
			setupCodeEl.requestMount();
		}
	}

	function handleTeardownToggle(e: Event) {
		teardownDetailsOpen = (e.target as HTMLDetailsElement).open;
		if (teardownDetailsOpen && teardownCodeEl?.requestMount) {
			teardownCodeEl.requestMount();
		}
	}

	onMount(() => {
		if (importsDetailsOpen && importsCodeEl?.requestMount) {
			importsCodeEl.requestMount();
		}
		if (setupDetailsOpen && setupCodeEl?.requestMount) {
			setupCodeEl.requestMount();
		}
		if (teardownDetailsOpen && teardownCodeEl?.requestMount) {
			teardownCodeEl.requestMount();
		}
	});
</script>

<fieldset
	class="card config-section"
	aria-label={STRING__HEADER_SUITE_CONFIGURATION_}
>
	<legend class="sr-only">{STRING__HEADER_SUITE_CONFIGURATION_}</legend>

	<div class="config-grid">
		<div class="field field-name">
			<label for="suite-name">{STRING__HEADER_SUITE_NAME_}</label>
			<input
				id="suite-name"
				type="text"
				value={$suiteState.name}
				on:input={(e) => handleInput('name', e)}
			/>
		</div>

		<div class="field">
			<label for="cfg-trials">{STRING__HEADER_TRIALS_}</label>
			<input
				id="cfg-trials"
				type="number"
				min="1"
				max="500"
				pattern="[0-9]*"
				required={true}
				value={$suiteState.trials}
				on:input={(e) => handleInput('trials', e)}
			/>
		</div>

		<div class="field">
			<label for="cfg-iters">{STRING__HEADER_ITERATIONS_PER_TRIAL_}</label
			>
			<input
				id="cfg-iters"
				type="number"
				min="1"
				max="1000000"
				pattern="[0-9]*"
				required={true}
				value={$suiteState.iterationsPerTrial}
				on:input={(e) => handleInput('iterationsPerTrial', e)}
			/>
		</div>

		<div class="field">
			<label for="cfg-warmup">{STRING__HEADER_WARMUP_ITERATIONS_}</label>
			<input
				id="cfg-warmup"
				type="number"
				min="0"
				max="10000"
				pattern="[0-9]*"
				required={true}
				value={$suiteState.warmupIterations}
				on:input={(e) => handleInput('warmupIterations', e)}
			/>
		</div>
	</div>

	<details
		class="setup-details"
		bind:open={importsDetailsOpen}
		on:toggle={handleImportsCodeToggle}
	>
		<summary>
			<span class="summary-text">{STRING__HEADER_SUITE_IMPORTS_}</span>
			<span class="text-dim"
				>{STRING__HEADER_SUITE_IMPORTS_OPTIONAL_}</span
			>
		</summary>

		<div class="setup-editor">
			<label for="import-code" class="sr-only" id="label-import-code"
				>{STRING__HEADER_IMPORTS_BODY_}</label
			>
			<CodeMirrorWrapper
				bind:this={importsCodeEl}
				delayed={true}
				id="import-code"
				name="import-code"
				value={$suiteState.importsCode}
				placeholder={STRING__HEADER_PLACEHOLDER_IMPORTS_}
				on:input={handleImportsCodeInput}
			/>
		</div>
	</details>

	<details
		class="setup-details"
		bind:open={setupDetailsOpen}
		on:toggle={handleSetupToggle}
	>
		<summary>
			<span class="summary-text">{STRING__HEADER_SUITE_SETUP_CODE_}</span>
			<span class="text-dim">{STRING__HEADER_SUITE_SETUP_OPTIONAL_}</span>
		</summary>

		<div class="setup-editor">
			<label for="setup-code" class="sr-only" id="label-setup-code"
				>{STRING__HEADER_SETUP_FUNCTION_BODY_}</label
			>
			<CodeMirrorWrapper
				bind:this={setupCodeEl}
				delayed={true}
				id="setup-code"
				name="setup-code"
				value={$suiteState.setupCode}
				placeholder={STRING__HEADER_PLACEHOLDER_SETUP_}
				on:input={handleSetupCodeInput}
			/>
		</div>
	</details>

	<details
		class="setup-details"
		bind:open={teardownDetailsOpen}
		on:toggle={handleTeardownToggle}
	>
		<summary>
			<span class="summary-text"
				>{STRING__HEADER_SUITE_TEARDOWN_CODE_}</span
			>
			<span class="text-dim"
				>{STRING__HEADER_SUITE_TEARDOWN_OPTIONAL_}</span
			>
		</summary>

		<div class="setup-editor">
			<label for="teardown-code" class="sr-only" id="label-teardown-code"
				>{STRING__HEADER_TEARDOWN_FUNCTION_BODY_}</label
			>
			<CodeMirrorWrapper
				bind:this={teardownCodeEl}
				delayed={true}
				id="teardown-code"
				name="teardown-code"
				value={$suiteState.teardownCode}
				placeholder={STRING__HEADER_PLACEHOLDER_TEARDOWN_}
				on:input={handleTeardownCodeInput}
			/>
		</div>
	</details>
</fieldset>

<style>
	.config-section {
		margin-bottom: 1rem;
	}

	@media not (writing-mode: tb-lr) {
		.config-section {
			margin-block-end: 1rem;
		}
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

	@media not (writing-mode: tb-lr) {
		.field input {
			inline-size: 100%;
		}
	}

	.setup-details {
		margin-top: 1rem;
	}

	@media not (writing-mode: tb-lr) {
		.setup-details {
			margin-block-start: 1rem;
		}
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

	.setup-details summary::marker {
		content: '';
	}

	.setup-details summary::before {
		content: '▶';
		font-size: 0.65rem;
		transition: transform 0.15s;
	}

	.setup-details[open] > summary::before {
		transform: rotate(90deg);
	}

	.summary-text {
		font-weight: 600;
		color: var(--c-text);
	}

	.setup-editor {
		margin-top: 0.75rem;
	}

	@media not (writing-mode: tb-lr) {
		.setup-editor {
			margin-block-start: 0.75rem;
		}
	}

	.setup-editor :global(textarea) {
		width: 100%;
		resize: vertical;
		min-height: 4rem;
	}

	@media not (writing-mode: tb-lr) {
		.setup-editor :global(textarea) {
			inline-size: 100%;
			min-block-size: 4rem;
		}
	}
</style>
