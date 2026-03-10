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

	export let id: string | undefined;
	export let name: string | undefined;
	export let value: string | undefined;
	export let placeholder: string | undefined;
	export let delayed: boolean = false;

	let textareaEl: HTMLTextAreaElement;
	let editorContainer: HTMLDivElement;
	let view: EditorView | null = null;
	let cmReady = false;
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
