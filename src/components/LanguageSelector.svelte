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
		LANG_CODE_,
		STRING__LANGUAGE_SELECTOR_ACTIVE_LANGUAGE_NAME_,
		STRING__LANGUAGE_SELECTOR_ARIA_LABEL_,
		STRING__LANGUAGE_SELECTOR_ARIA_LABEL_MENU_,
		STRING__LANGUAGE_SELECTOR_TITLE_,
	} from '../i18n/strings.js';
	import getRandomSecret from '../lib/get-random-secret.js';
	import languages from '../lib/languages.js';

	const activeLanguage =
		languages.find((language) => language.code === LANG_CODE_) ??
		languages[0];

	let open = false;
	let menuId = `language-selector-menu-${getRandomSecret()}`;

	const closeMenu = () => {
		open = false;
	};

	const toggleMenu = () => {
		open = !open;
	};

	const handleDocumentKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			closeMenu();
		}
	};
</script>

<svelte:document on:click={closeMenu} on:keydown={handleDocumentKeydown} />

<div class="language-selector">
	<div class="language-panel">
		<button
			type="button"
			class="language-toggle"
			aria-haspopup="menu"
			aria-expanded={open}
			aria-controls={menuId}
			aria-label={STRING__LANGUAGE_SELECTOR_ARIA_LABEL_[0] +
				STRING__LANGUAGE_SELECTOR_ACTIVE_LANGUAGE_NAME_ +
				STRING__LANGUAGE_SELECTOR_ARIA_LABEL_[1]}
			title={STRING__LANGUAGE_SELECTOR_TITLE_}
			on:click|stopPropagation={toggleMenu}
		>
			<span class="language-toggle-content">
				<span aria-hidden="true" class="language-icon">🌐</span>
				<span>{STRING__LANGUAGE_SELECTOR_ACTIVE_LANGUAGE_NAME_}</span>
			</span>
		</button>

		<ul
			class="language-menu card"
			class:open
			id={menuId}
			role="menu"
			aria-label={STRING__LANGUAGE_SELECTOR_ARIA_LABEL_MENU_}
		>
			{#each languages as language}
				{#if language.code !== activeLanguage.code}
					<li class="language-menu-item" role="none">
						<a
							class="language-link"
							href={language.href + location.hash}
							hreflang={language.code}
							lang={language.code}
							rel="alternate"
							role="menuitem"
						>
							{language.label}
						</a>
					</li>
				{/if}
			{/each}
		</ul>
	</div>
</div>

<style>
	.language-selector {
		position: relative;
	}

	.language-panel {
		position: relative;
		display: inline-flex;
	}

	.language-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.7rem;
		color: var(--c-text-dim);
		background: color-mix(in srgb, var(--c-surface) 82%, transparent);
		backdrop-filter: blur(8px);
	}

	@media not (writing-mode: tb-lr) {
		.language-toggle {
			padding-block: 0.45rem;
			padding-inline: 0.7rem;
		}
	}

	.language-toggle:hover:not(:disabled),
	.language-toggle[aria-expanded='true'] {
		color: var(--c-text);
		border-color: var(--c-text-dim);
		background: var(--c-surface-2);
	}

	.language-toggle-content {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.language-icon {
		line-height: 1;
	}

	.language-menu {
		display: none;
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		min-width: 12rem;
		padding: 0.35rem;
		z-index: 10;
		list-style: none;
	}

	.language-menu.open {
		display: block;
	}

	@media not (writing-mode: tb-lr) {
		.language-menu {
			top: auto;
			right: auto;
			min-width: auto;
			inset-block-start: calc(100% + 0.5rem);
			inset-inline-end: 0;
			min-inline-size: 12rem;
		}
	}

	.language-menu-item {
		display: block;
	}

	.language-link {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.65rem 0.75rem;
		border-radius: var(--radius-sm);
		color: var(--c-text);
		text-decoration: none;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	@media not (writing-mode: tb-lr) {
		.language-link {
			width: auto;
			inline-size: 100%;
			padding-block: 0.65rem;
			padding-inline: 0.75rem;
		}
	}

	.language-link:hover,
	.language-link:focus-visible {
		background: var(--c-surface-2);
	}
</style>
