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
	import { onMount, onDestroy, tick } from 'svelte';
	import {
		createEditor_ as createEditor,
		syncToEditor_ as syncToEditor,
	} from './codemirror.js';
	import type { EditorView } from '@codemirror/view';
	import {
		suiteState_ as suiteState,
		updateConfig_ as updateConfig,
	} from '../state.js';
	import './codemirror.css';

	let textareaEl: HTMLTextAreaElement;
	let editorContainer: HTMLDivElement;
	let view: EditorView | null = null;
	let cmReady = false;
	const suppressFlag = { value_: false };

	// Tracks whether <details> is open so we only mount CM once visible
	let detailsOpen = false;
	let cmMountAttempted = false;

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

	function handleSetupCodeInput(e: Event) {
		if (!cmReady) {
			updateConfig({
				setupCode: (e.target as HTMLTextAreaElement).value,
			});
		}
	}

	async function mountEditor() {
		if (cmMountAttempted) return;
		cmMountAttempted = true;

		await tick();

		const editorView = await createEditor({
			parent_: editorContainer,
			doc_: textareaEl.value,
			placeholder_: textareaEl.placeholder,
			onUpdate_(code) {
				updateConfig({ setupCode: code });
				textareaEl.value = code;
			},
		});

		if (editorView) {
			view = editorView;
			cmReady = true;
		}
	}

	function handleToggle(e: Event) {
		detailsOpen = (e.target as HTMLDetailsElement).open;
		if (detailsOpen) {
			mountEditor();
		}
	}

	// If the details starts open (e.g. there's existing setup code),
	// mount CM immediately
	onMount(() => {
		if (detailsOpen) {
			mountEditor();
		}
	});

	onDestroy(() => {
		view?.destroy();
		view = null;
	});

	// Sync external state → CM
	$: if (view && cmReady) {
		syncToEditor(view, $suiteState.setupCode, suppressFlag);
	}

	$: if (!cmReady && textareaEl) {
		textareaEl.value = $suiteState.setupCode;
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
				pattern="[0-9]*"
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
				pattern="[0-9]*"
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
				pattern="[0-9]*"
				value={$suiteState.warmupIterations}
				on:input={(e) => handleInput('warmupIterations', e)}
			/>
		</div>
	</div>

	<details
		class="setup-details"
		bind:open={detailsOpen}
		on:toggle={handleToggle}
	>
		<summary>
			<span class="summary-text">Suite Setup Code</span>
			<span class="text-dim">(optional — runs before each function)</span>
		</summary>

		<div class="setup-editor">
			<label for="setup-code" class="sr-only">Setup function body</label>
			<textarea
				id="setup-code"
				bind:this={textareaEl}
				rows="4"
				placeholder="// e.g. this.data = Array.from({{
					length: 1000,
				}}, () => Math.random());"
				value={$suiteState.setupCode}
				on:input={handleSetupCodeInput}
				spellcheck="false"
				autocapitalize="off"
				autocomplete="off"
				class:cm-visually-hidden={cmReady}
				aria-hidden={cmReady ? 'true' : undefined}
				tabindex={cmReady ? -1 : undefined}
			></textarea>
			<div
				class="cm-wrapper"
				class:cm-active={cmReady}
				bind:this={editorContainer}
				aria-hidden="true"
			></div>
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
