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
		STRING__ARIA_LABEL_ATTRIBUTION_,
		STRING__BUILD_INFORMATION_VERSION_,
		STRING__COPYRIGHT_YEAR_ALL_RIGHTS_RESERVED_,
		STRING__FOOTER_HOME_LINK_,
		STRING__FOOTER_SOURCE_CODE_LINK_,
		STRING__MADE_WITH_LOVE_BY_,
	} from '../i18n/strings.js';
	import Logo from './Logo.svelte';

	const repository = (() => {
		if (!import.meta.pkg.repository) {
			return;
		}
		const url =
			typeof import.meta.pkg.repository === 'string'
				? import.meta.pkg.repository
				: import.meta.pkg.repository.url;

		return url.replace(/^git\+/, '');
	})();
</script>

<footer>
	<div>
		<aside aria-label={STRING__ARIA_LABEL_ATTRIBUTION_}>
			{STRING__MADE_WITH_LOVE_BY_[0]}<a href="https://apeleg.com/"><Logo
			/></a>{STRING__MADE_WITH_LOVE_BY_[1]}
		</aside>
		<p>
			{STRING__COPYRIGHT_YEAR_ALL_RIGHTS_RESERVED_[0]}<time
				datetime="2026">ⅯⅯⅩⅩⅥ</time
			>{STRING__COPYRIGHT_YEAR_ALL_RIGHTS_RESERVED_[1]}
		</p>
		{#if import.meta.pkg.name}
			<ul>
				<li>
					{STRING__BUILD_INFORMATION_VERSION_[0]}
					{import.meta.pkg.name}
					{#if import.meta.pkg.version}{STRING__BUILD_INFORMATION_VERSION_[1]}v{import.meta
							.pkg.version}{/if}
					{#if import.meta.pkg.gitCommitHash}
						{STRING__BUILD_INFORMATION_VERSION_[2]}(<data
							lang="zxx"
							value={import.meta.pkg.gitCommitHash}
							>{import.meta.pkg.gitCommitHash.slice(0, 7)}</data
						>)
					{/if}
					{STRING__BUILD_INFORMATION_VERSION_[3]}
				</li>

				{#if import.meta.pkg.homepage}
					<li>
						<a
							href={import.meta.pkg.homepage}
							rel="me external noopener noreferrer"
							target="_blank">{STRING__FOOTER_HOME_LINK_}</a
						>
					</li>
				{/if}
				{#if repository}
					<li>
						<a
							href={repository}
							rel="me external noopener noreferrer"
							target="_blank"
							>{STRING__FOOTER_SOURCE_CODE_LINK_}</a
						>
					</li>
				{/if}
			</ul>
		{/if}
	</div>
</footer>

<style lang="postcss">
	a, a:visited, a:hover, a:active {
		color: currentColor;
	}

	footer {
		width: 100%;
		height: auto;
		font-size: 0.7em;
		padding: 1em;
	}

	@media not (writing-mode: tb-lr) {
		footer {
			inline-size: 100%;
			block-size: auto;
		}
	}

	div {
		display: block;
		width: 100%;
		height: auto;
		max-width: 800px;
		max-height: none;
		margin: 0 auto;
	}

	@media not (writing-mode: tb-lr) {
		div {
			inline-size: 100%;
			block-size: auto;
			max-inline-size: 800px;
			max-block-size: none;
			margin-inline: auto;
			margin-block: 0;
		}
	}

	aside {
		display: block;
		text-align: right;
	}

	aside :global(svg) {
		display: inline;
		height: 4em;
		width: auto;
		user-select: none;
		/* Writing mode independent for this element */
		transform: translateY(-0.25em);
		vertical-align: middle;
	}

	p {
		display: block;
		text-align: center;
	}

	ul {
		display: block;
		text-align: center;
		font-size: 0.85em;
		font-style: italic;
	}

	ul li {
		display: inline;
	}

	ul li + li::before {
		content: ' | ';
		font-style: normal;
	}

	ul a {
		text-decoration: underline;
	}
</style>
