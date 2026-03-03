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
		type IBenchmarkEntry,
		removeFunction_ as removeFunction,
		updateFunction_ as updateFunction,
	} from '../state.js';

	export let entry: IBenchmarkEntry;

	function handleNameChange(e: Event) {
		updateFunction(entry.id, {
			name: (e.target as HTMLInputElement).value,
		});
	}

	function handleCodeChange(e: Event) {
		updateFunction(entry.id, {
			code: (e.target as HTMLTextAreaElement).value,
		});
	}

	function handleRemove() {
		removeFunction(entry.id);
	}

	function handleKeyDown(e: KeyboardEvent) {
		// Tab inserts two spaces instead of moving focus
		if (e.key === 'Tab') {
			e.preventDefault();
			const textarea = e.target as HTMLTextAreaElement;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const value = textarea.value;
			textarea.value =
				value.substring(0, start) + '  ' + value.substring(end);
			textarea.selectionStart = textarea.selectionEnd = start + 2;
			// Trigger Svelte reactivity
			textarea.dispatchEvent(new Event('input', { bubbles: true }));
		}
	}
</script>

<article class="card fn-editor" aria-label="Benchmark function: {entry.name}">
	<div class="fn-header">
		<div class="fn-name-field">
			<label for="fn-name-{entry.id}">Name</label>
			<input
				id="fn-name-{entry.id}"
				type="text"
				value={entry.name}
				on:input={handleNameChange}
				placeholder="Function name"
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
		<label for="fn-code-{entry.id}">Code</label>
		<textarea
			id="fn-code-{entry.id}"
			rows="5"
			value={entry.code}
			on:input={handleCodeChange}
			on:keydown={handleKeyDown}
			placeholder="// JavaScript code to benchmark"
			spellcheck="false"
			autocapitalize="off"
			autocomplete="off"
		></textarea>
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

	.fn-code-field textarea {
		width: 100%;
		resize: vertical;
		min-height: 4rem;
		tab-size: 2;
		line-height: 1.5;
	}
</style>
