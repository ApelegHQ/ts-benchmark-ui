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
		STRING__FUNCTION_EDITOR_BENCHMARK_FUNCTION_PREFIX_,
		STRING__FUNCTION_EDITOR_CODE_,
		STRING__FUNCTION_EDITOR_FUNCTION_NAME_,
		STRING__FUNCTION_EDITOR_JAVASCRIPT_CODE_TO_BENCHMARK_,
		STRING__FUNCTION_EDITOR_NAME_,
		STRING__FUNCTION_EDITOR_REMOVE_PREFIX_,
		STRING__FUNCTION_EDITOR_REMOVE_THIS_FUNCTION_,
	} from '../i18n/strings.js';
	import {
		type IBenchmarkEntry,
		removeFunction_ as removeFunction,
		updateFunction_ as updateFunction,
	} from '../state.js';
	import CodeMirrorWrapper from './CodeMirrorWrapper.svelte';

	export let entry: IBenchmarkEntry;

	function handleNameChange(e: Event) {
		updateFunction(entry.id, {
			name: (e.target as HTMLInputElement).value,
		});
	}

	function handleCodeInput(e: Event) {
		updateFunction(entry.id, {
			code: (e.target as HTMLTextAreaElement).value,
		});
	}

	function handleRemove() {
		removeFunction(entry.id);
	}
</script>

<article
	class="card fn-editor"
	aria-label={`${STRING__FUNCTION_EDITOR_BENCHMARK_FUNCTION_PREFIX_}${entry.name}`}
>
	<div class="fn-header">
		<div class="fn-name-field">
			<label for="fn-name-{entry.id}"
				>{STRING__FUNCTION_EDITOR_NAME_}</label
			>
			<input
				id="fn-name-{entry.id}"
				name="fn-name-{entry.id}"
				on:input={handleNameChange}
				placeholder={STRING__FUNCTION_EDITOR_FUNCTION_NAME_}
				required
				type="text"
				value={entry.name}
			/>
		</div>
		<button
			class="danger remove-btn"
			on:click={handleRemove}
			title={STRING__FUNCTION_EDITOR_REMOVE_THIS_FUNCTION_}
			type="button"
			aria-label={`${STRING__FUNCTION_EDITOR_REMOVE_PREFIX_}${entry.name}`}
		>
			✕
		</button>
	</div>

	<div class="fn-code-field">
		<label id="fn-label-code-{entry.id}" for="fn-code-{entry.id}"
			>{STRING__FUNCTION_EDITOR_CODE_}</label
		>
		<CodeMirrorWrapper
			id="fn-code-{entry.id}"
			name="fn-code-{entry.id}"
			value={entry.code}
			placeholder={STRING__FUNCTION_EDITOR_JAVASCRIPT_CODE_TO_BENCHMARK_}
			on:input={handleCodeInput}
		/>
	</div>
</article>

<style>
	.fn-editor {
		margin-bottom: 0.75rem;
	}

	@media not (writing-mode: tb-lr) {
		.fn-editor {
			margin-bottom: 0;
			margin-block-end: 0.75rem;
		}
	}

	.fn-header {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	@media not (writing-mode: tb-lr) {
		.fn-header {
			margin-bottom: 0;
			margin-block-end: 0.75rem;
		}
	}

	.fn-name-field {
		flex: 1;
	}

	.fn-name-field input {
		width: 100%;
	}

	@media not (writing-mode: tb-lr) {
		.fn-name-field input {
			width: auto;
			inline-size: 100%;
		}
	}

	.remove-btn {
		padding: 0.4em 0.6em;
		font-size: 1rem;
		line-height: 1;
		flex-shrink: 0;
		margin-bottom: 1px;
	}

	@media not (writing-mode: tb-lr) {
		.remove-btn {
			margin-bottom: 0;
			margin-block-end: 1px;
			padding-block: 0.4em;
			padding-inline: 0.6em;
		}
	}

	.fn-code-field {
		display: flex;
		flex-direction: column;
		gap: 0.35em;
	}

	.fn-code-field :global(textarea) {
		width: 100%;
		resize: vertical;
		min-height: 4rem;
	}

	@media not (writing-mode: tb-lr) {
		.fn-code-field :global(textarea) {
			width: auto;
			inline-size: 100%;
			min-block-size: 4rem;
		}
	}
</style>
