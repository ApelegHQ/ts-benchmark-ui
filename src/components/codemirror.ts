/**
 * @copyright
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
 */

import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

export interface ICreateEditorOptions {
	/** The DOM element CM will mount inside. */
	parent_: HTMLElement;
	/** Initial document text (typically read from the backing textarea). */
	doc_: string;
	/** Called on every document change with the new full text. */
	onUpdate_: (code: string) => void;
	/** Placeholder shown when the editor is empty. */
	placeholder_?: string;
	/** Additional extensions (e.g. extra keymaps). */
	extensions_?: Extension[];
}

export interface ICodeMirrorModules {
	view_: typeof import('@codemirror/view');
	state_: typeof import('@codemirror/state');
	language_: typeof import('@codemirror/language');
	langJs_: typeof import('@codemirror/lang-javascript');
	commands_: typeof import('@codemirror/commands');
	autocomplete_: typeof import('@codemirror/autocomplete');
	search_: typeof import('@codemirror/search');
	lint_: typeof import('@codemirror/lint');
	lezerHighlight_: typeof import('@lezer/highlight');
}

/** Dynamically import all CM6 modules in parallel. */
export async function loadModules_(): Promise<ICodeMirrorModules> {
	const [
		view,
		state,
		language,
		langJs,
		commands,
		autocomplete,
		search,
		lint,
		lezerHighlight,
	] = await Promise.all([
		import('@codemirror/view'),
		import('@codemirror/state'),
		import('@codemirror/language'),
		import('@codemirror/lang-javascript'),
		import('@codemirror/commands'),
		import('@codemirror/autocomplete'),
		import('@codemirror/search'),
		import('@codemirror/lint'),
		import('@lezer/highlight'),
	]);

	return {
		view_: view,
		state_: state,
		language_: language,
		langJs_: langJs,
		commands_: commands,
		autocomplete_: autocomplete,
		search_: search,
		lint_: lint,
		lezerHighlight_: lezerHighlight,
	};
}

export function buildTheme_(modules: ICodeMirrorModules) {
	const { EditorView } = modules.view_;

	return EditorView.theme(
		{
			'&': {
				fontSize: '0.875rem',
				backgroundColor: 'var(--c-bg)',
				color: 'var(--c-text)',
				border: '1px solid var(--c-border)',
				borderRadius: 'var(--radius-sm)',
			},
			'&.cm-focused': {
				outline: 'none',
				borderColor: 'var(--c-border-focus)',
				boxShadow: '0 0 0 3px rgba(91, 141, 239, 0.15)',
			},
			'.cm-scroller': {
				overflow: 'auto',
				minHeight: '4rem',
				maxHeight: '24rem',
				fontFamily: 'var(--font-mono)',
				lineHeight: '1.6',
			},
			'.cm-content': {
				caretColor: 'var(--c-accent)',
				padding: '0.5em 0',
			},
			'.cm-cursor, .cm-dropCursor': {
				borderLeftColor: 'var(--c-accent)',
				borderLeftWidth: '2px',
			},
			'.cm-selectionBackground': {
				backgroundColor: 'rgba(91, 141, 239, 0.25) !important',
			},
			'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
				{
					backgroundColor: 'rgba(91, 141, 239, 0.30) !important',
				},
			'.cm-activeLine': {
				backgroundColor: 'rgba(255, 255, 255, 0.03)',
			},
			'.cm-gutters': {
				backgroundColor: 'var(--c-surface)',
				color: 'var(--c-text-muted)',
				border: 'none',
				borderRight: '1px solid var(--c-border)',
			},
			'.cm-activeLineGutter': {
				backgroundColor: 'rgba(255, 255, 255, 0.03)',
				color: 'var(--c-text-dim)',
			},
			'.cm-lineNumbers .cm-gutterElement': {
				padding: '0 0.5em',
				minWidth: '2.5em',
				fontSize: '0.8rem',
			},
			'.cm-foldGutter .cm-gutterElement': {
				padding: '0 0.25em',
				color: 'var(--c-text-muted)',
			},
			'.cm-foldPlaceholder': {
				backgroundColor: 'var(--c-surface-2)',
				border: '1px solid var(--c-border)',
				color: 'var(--c-text-dim)',
				borderRadius: '2px',
				padding: '0 0.4em',
				margin: '0 0.2em',
			},
			'.cm-matchingBracket': {
				backgroundColor: 'rgba(91, 141, 239, 0.2)',
				color: 'var(--c-accent) !important',
				outline: '1px solid rgba(91, 141, 239, 0.4)',
			},
			'.cm-nonmatchingBracket': {
				color: 'var(--c-red) !important',
			},
			'.cm-tooltip': {
				backgroundColor: 'var(--c-surface)',
				border: '1px solid var(--c-border)',
				color: 'var(--c-text)',
				borderRadius: 'var(--radius-sm)',
				boxShadow: 'var(--shadow)',
			},
			'.cm-tooltip-autocomplete': {
				'& > ul > li': {
					padding: '0.25em 0.5em',
				},
				'& > ul > li[aria-selected]': {
					backgroundColor: 'var(--c-surface-2)',
					color: 'var(--c-text)',
				},
			},
			'.cm-panels': {
				backgroundColor: 'var(--c-surface)',
				color: 'var(--c-text)',
			},
			'.cm-panels.cm-panels-top': {
				borderBottom: '1px solid var(--c-border)',
			},
			'.cm-panels.cm-panels-bottom': {
				borderTop: '1px solid var(--c-border)',
			},
			'.cm-search label': {
				fontSize: '0.8rem',
			},
			'.cm-textfield': {
				backgroundColor: 'var(--c-bg)',
				color: 'var(--c-text)',
				border: '1px solid var(--c-border)',
				borderRadius: 'var(--radius-sm)',
				fontSize: '0.8rem',
			},
			'.cm-button': {
				backgroundColor: 'var(--c-surface-2)',
				color: 'var(--c-text)',
				border: '1px solid var(--c-border)',
				borderRadius: 'var(--radius-sm)',
				fontSize: '0.8rem',
			},
			'.cm-placeholder': {
				color: 'var(--c-text-muted)',
				fontStyle: 'italic',
			},
			'& ::-webkit-scrollbar': {
				width: '6px',
				height: '6px',
			},
			'& ::-webkit-scrollbar-track': {
				background: 'transparent',
			},
			'& ::-webkit-scrollbar-thumb': {
				background: 'var(--c-border)',
				borderRadius: '3px',
			},
			'& ::-webkit-scrollbar-thumb:hover': {
				background: 'var(--c-text-muted)',
			},
		},
		{ dark: true },
	);
}

export function buildHighlightStyle_(modules: ICodeMirrorModules) {
	const { HighlightStyle } = modules.language_;
	const { tags: t } = modules.lezerHighlight_;

	return HighlightStyle.define([
		{ tag: t.keyword, color: 'var(--c-magenta)' },
		{
			tag: [t.name, t.deleted, t.character, t.macroName],
			color: 'var(--c-text)',
		},
		{ tag: [t.function(t.variableName)], color: 'var(--c-blue)' },
		{ tag: [t.labelName], color: 'var(--c-text-dim)' },
		{
			tag: [t.color, t.constant(t.name), t.standard(t.name)],
			color: 'var(--c-orange)',
		},
		{ tag: [t.definition(t.name), t.separator], color: 'var(--c-text)' },
		{
			tag: [
				t.typeName,
				t.className,
				t.changed,
				t.annotation,
				t.modifier,
				t.self,
				t.namespace,
			],
			color: 'var(--c-yellow)',
		},
		{ tag: [t.number], color: 'var(--c-orange)' },
		{
			tag: [
				t.operator,
				t.operatorKeyword,
				t.url,
				t.escape,
				t.regexp,
				t.special(t.string),
			],
			color: 'var(--c-cyan)',
		},
		{ tag: [t.string], color: 'var(--c-green)' },
		{ tag: [t.meta], color: 'var(--c-text-dim)' },
		{ tag: [t.comment], color: 'var(--c-text-muted)', fontStyle: 'italic' },
		{ tag: t.strong, fontWeight: 'bold' },
		{ tag: t.emphasis, fontStyle: 'italic' },
		{ tag: t.strikethrough, textDecoration: 'line-through' },
		{ tag: t.link, color: 'var(--c-cyan)', textDecoration: 'underline' },
		{ tag: t.heading, fontWeight: 'bold', color: 'var(--c-blue)' },
		{ tag: [t.atom, t.bool], color: 'var(--c-orange)' },
		{ tag: [t.processingInstruction, t.inserted], color: 'var(--c-green)' },
		{ tag: t.invalid, color: 'var(--c-red)' },
		{ tag: t.propertyName, color: 'var(--c-cyan)' },
	]);
}

export function buildBaseExtensions_(modules: ICodeMirrorModules): Extension[] {
	const {
		lineNumbers,
		highlightActiveLineGutter,
		highlightSpecialChars,
		drawSelection,
		dropCursor,
		rectangularSelection,
		crosshairCursor,
		highlightActiveLine,
		keymap,
	} = modules.view_;
	const { EditorState } = modules.state_;
	const { indentOnInput, bracketMatching, foldGutter, foldKeymap } =
		modules.language_;
	const { defaultKeymap, history, historyKeymap, indentWithTab } =
		modules.commands_;
	const {
		closeBrackets,
		closeBracketsKeymap,
		autocompletion,
		completionKeymap,
	} = modules.autocomplete_;
	const { highlightSelectionMatches, searchKeymap } = modules.search_;
	const { lintKeymap } = modules.lint_;

	return [
		lineNumbers(),
		highlightActiveLineGutter(),
		highlightSpecialChars(),
		history(),
		foldGutter(),
		drawSelection(),
		dropCursor(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		bracketMatching(),
		closeBrackets(),
		autocompletion(),
		rectangularSelection(),
		crosshairCursor(),
		highlightActiveLine(),
		highlightSelectionMatches(),
		keymap.of([
			...closeBracketsKeymap,
			...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			...foldKeymap,
			...completionKeymap,
			...lintKeymap,
			indentWithTab,
		]),
	];
}

/**
 * Create a fully configured CM6 editor with the app's dark theme.
 *
 * Returns the EditorView instance, or null if the parent element
 * has been removed from the DOM (component destroyed during load).
 */
export async function createEditor_(
	opts: ICreateEditorOptions,
): Promise<EditorView | null> {
	const modules = await loadModules_();

	// Component may have been destroyed while we were loading
	if (!opts.parent_.isConnected) return null;

	const { EditorView, placeholder: cmPlaceholder } = modules.view_;
	const { EditorState } = modules.state_;
	const { syntaxHighlighting } = modules.language_;
	const { javascript } = modules.langJs_;

	const suppressDispatch = false;

	const updateListener = EditorView.updateListener.of((update) => {
		if (update.docChanged && !suppressDispatch) {
			opts.onUpdate_(update.state.doc.toString());
		}
	});

	const extensions: Extension[] = [
		buildBaseExtensions_(modules),
		javascript(),
		buildTheme_(modules),
		syntaxHighlighting(buildHighlightStyle_(modules)),
		updateListener,
		EditorView.lineWrapping,
	];

	if (opts.placeholder_) {
		extensions.push(cmPlaceholder(opts.placeholder_));
	}

	if (opts.extensions_) {
		extensions.push(...opts.extensions_);
	}

	const state = EditorState.create({
		doc: opts.doc_,
		extensions,
	});

	const view = new EditorView({ state, parent: opts.parent_ });

	return view;
}

/**
 * Push an external text change into a CM view without triggering
 * the onUpdate callback. Returns early if the text already matches.
 */
export function syncToEditor_(
	view: EditorView,
	text: string,
	suppress: { value_: boolean },
): void {
	const current = view.state.doc.toString();
	if (text === current) return;

	suppress.value_ = true;
	view.dispatch({
		changes: { from: 0, to: view.state.doc.length, insert: text },
	});
	suppress.value_ = false;
}
