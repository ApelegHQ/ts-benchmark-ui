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
		type IBenchmarkEntry,
		removeFunction_ as removeFunction,
		updateFunction_ as updateFunction,
	} from '../state.js';
	import './codemirror.css';

	export let entry: IBenchmarkEntry;

	let textareaEl: HTMLTextAreaElement;
	let editorContainer: HTMLDivElement;
	let view: EditorView | null = null;
	let cmReady = false;
	const suppressFlag = { value_: false };

	function handleNameChange(e: Event) {
		updateFunction(entry.id, {
			name: (e.target as HTMLInputElement).value,
		});
	}

	function handleCodeInput(e: Event) {
		if (!cmReady) {
			updateFunction(entry.id, {
				code: (e.target as HTMLTextAreaElement).value,
			});
		}
	}

	function handleRemove() {
		removeFunction(entry.id);
	}

	onMount(async () => {
		await tick();
		const editorView = await createEditor({
			parent_: editorContainer,
			doc_: textareaEl.value,
			placeholder_: textareaEl.placeholder,
			labels_: textareaEl.labels,
			onUpdate_(code) {
				updateFunction(entry.id, { code });
				textareaEl.value = code;
			},
		});
		if (editorView) {
			view = editorView;
			cmReady = true;
		}
	});

	onDestroy(() => {
		view?.destroy();
		view = null;
	});

	$: if (view && cmReady) {
		syncToEditor(view, entry.code, suppressFlag);
	}

	$: if (!cmReady && textareaEl) {
		textareaEl.value = entry.code;
	}
</script>

<article class="card fn-editor" aria-label="Benchmark function: {entry.name}">
	<div class="fn-header">
		<div class="fn-name-field">
			<label for="fn-name-{entry.id}">Name</label>
			<input
				id="fn-name-{entry.id}"
				name="fn-name-{entry.id}"
				on:input={handleNameChange}
				placeholder="Function name"
				required
				type="text"
				value={entry.name}
			/>
		</div>
		<button
			class="danger remove-btn"
			on:click={handleRemove}
			title="Remove this function"
			type="button"
			aria-label="Remove {entry.name}"
		>
			✕
		</button>
	</div>

	<div class="fn-code-field">
		<label id="fn-label-code-{entry.id}" for="fn-code-{entry.id}"
			>Code</label
		>
		<textarea
			autocapitalize="off"
			autocomplete="off"
			bind:this={textareaEl}
			class:cm-visually-hidden={cmReady}
			id="fn-code-{entry.id}"
			name="fn-code-{entry.id}"
			on:input={handleCodeInput}
			placeholder="// JavaScript code to benchmark"
			rows="4"
			spellcheck="false"
			tabindex={cmReady ? -1 : undefined}
			value={entry.code}
			aria-hidden={cmReady ? 'true' : undefined}
		></textarea>
		<div
			class="cm-wrapper"
			class:cm-active={cmReady}
			bind:this={editorContainer}
		></div>
	</div>
</article>

<style>
	.fn-editor {
		margin-bottom: 0.75rem;
	}

	.fn-header {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.fn-name-field {
		flex: 1;
	}

	.fn-name-field input {
		width: 100%;
	}

	.remove-btn {
		padding: 0.4em 0.6em;
		font-size: 1rem;
		line-height: 1;
		flex-shrink: 0;
		margin-bottom: 1px;
	}

	.fn-code-field {
		display: flex;
		flex-direction: column;
		gap: 0.35em;
	}

	.fn-code-field textarea {
		width: 100%;
		resize: vertical;
		min-height: 4rem;
	}
</style>
