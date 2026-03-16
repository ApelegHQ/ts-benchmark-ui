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
	import type { EditorView } from '@codemirror/view';
	import { onDestroy, onMount, tick } from 'svelte';
	import './codemirror.css';
	import {
		createEditor_ as createEditor,
		syncToEditor_ as syncToEditor,
	} from './codemirror.js';
	import {
		STRING_CM_EDITOR_ESCAPE_HATCH_,
		STRING_KBD_KEY_ESCAPE_,
		STRING_KBD_KEY_SHIFT_TAB_,
		STRING_KBD_KEY_TAB_,
	} from '../i18n/strings.js';

	export let id: string | undefined;
	export let name: string | undefined;
	export let value: string = '';
	export let placeholder: string | undefined;
	export let delayed: boolean = false;

	let textareaEl: HTMLTextAreaElement;
	let editorContainer: HTMLDivElement;
	let view: EditorView | null = null;
	let cmReady = false;
	let cmFocused = false;
	let mountAttempted = false;
	const suppressFlag = { value_: false };

	// Public method: request mount (callable by parent via bind:this)
	export async function requestMount() {
		if (mountAttempted) return;
		mountAttempted = true;
		await tick();

		const editorView = await createEditor({
			parent_: editorContainer,
			doc_: textareaEl?.value ?? value,
			placeholder_: placeholder,
			labels_: textareaEl?.labels,
			onUpdate_(code: string) {
				if (!textareaEl) return;
				textareaEl.value = code;
				textareaEl.dispatchEvent(new InputEvent('input'));
				textareaEl.dispatchEvent(new Event('change'));
			},
			onBlur_() {
				cmFocused = false;
			},
			onFocus_() {
				cmFocused = true;
			},
		});

		if (editorView) {
			view = editorView;
			cmReady = true;
			// sync immediately from external value
			syncToEditor(view, value, suppressFlag);
		}
	}

	onMount(() => {
		if (!delayed) {
			requestMount();
		}
	});

	onDestroy(() => {
		view?.destroy();
		view = null;
	});

	// keep editor in sync when parent updates `value`
	$: if (view && cmReady) {
		syncToEditor(view, value, suppressFlag);
	}

	// when not mounted keep textarea value up-to-date
	$: if (!cmReady && textareaEl) {
		textareaEl.value = value;
	}
</script>

<textarea
	autocapitalize="off"
	autocomplete="off"
	bind:this={textareaEl}
	class:cm-visually-hidden={cmReady}
	{id}
	on:change
	on:input
	{name}
	{placeholder}
	rows="4"
	spellcheck="false"
	tabindex={cmReady ? -1 : undefined}
	{value}
	aria-hidden={cmReady ? 'true' : undefined}
></textarea>
<div
	class="cm-wrapper"
	class:cm-active={cmReady}
	bind:this={editorContainer}
></div>
{#if cmFocused}
	<div class="escape-hatch text-dim" role="alert">
		{STRING_CM_EDITOR_ESCAPE_HATCH_[0]}<kbd
			><kbd>{STRING_KBD_KEY_ESCAPE_}</kbd></kbd
		>{STRING_CM_EDITOR_ESCAPE_HATCH_[1]}<kbd
			><kbd>{STRING_KBD_KEY_TAB_}</kbd></kbd
		>{STRING_CM_EDITOR_ESCAPE_HATCH_[2]}<kbd
			><kbd>{STRING_KBD_KEY_SHIFT_TAB_[0]}</kbd
			>{STRING_KBD_KEY_SHIFT_TAB_[1]}<kbd
				>{STRING_KBD_KEY_SHIFT_TAB_[2]}</kbd
			></kbd
		>{STRING_CM_EDITOR_ESCAPE_HATCH_[3]}
	</div>
{/if}

<style>
	textarea,
	.cm-wrapper {
		direction: ltr;
		writing-mode: horizontal-tb;
	}

	.escape-hatch {
		font-size: 0.8em;
		padding: 0.5em 0;
	}

	@media not (writing-mode: tb-lr) {
		.escape-hatch {
			padding-block: 0.5em;
			padding-inline: 0;
		}
	}
</style>
