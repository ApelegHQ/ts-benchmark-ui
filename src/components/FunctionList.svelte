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
		STRING__FUNCTION_LIST_ADD_FUNCTION_,
		STRING__FUNCTION_LIST_BENCHMARK_FUNCTIONS_,
		STRING__FUNCTION_LIST_FUNCTIONS_,
		STRING__FUNCTION_LIST_PLUS_ADD_FUNCTION_,
	} from '../i18n/strings.js';
	import {
		addFunction_ as addFunction,
		suiteState_ as suiteState,
	} from '../state.js';
	import FunctionEditor from './FunctionEditor.svelte';
</script>

<fieldset aria-label={STRING__FUNCTION_LIST_BENCHMARK_FUNCTIONS_}>
	<legend class="section-title">{STRING__FUNCTION_LIST_FUNCTIONS_}</legend>

	{#each $suiteState.functions as entry (entry.id)}
		<FunctionEditor {entry} />
	{/each}

	<button
		class="add-btn"
		on:click={addFunction}
		type="button"
		aria-label={STRING__FUNCTION_LIST_ADD_FUNCTION_}
	>
		{STRING__FUNCTION_LIST_PLUS_ADD_FUNCTION_}
	</button>
</fieldset>

<style>
	fieldset {
		border: 0 none transparent;
	}

	.add-btn {
		width: 100%;
		padding: 0.75em;
		border-style: dashed;
		color: var(--c-text-dim);
		font-size: 0.875rem;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	@media not (writing-mode: tb-lr) {
		.add-btn {
			width: auto;
			inline-size: 100%;
		}
	}

	.add-btn:hover {
		color: var(--c-accent);
		border-color: var(--c-accent);
	}
</style>
