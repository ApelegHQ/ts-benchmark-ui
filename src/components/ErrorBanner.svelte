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
		STRING__APP_ERROR_,
		STRING__APP_ERROR_BANNER_CAUSE_,
		STRING__APP_ERROR_BANNER_DETAILS_,
		STRING__APP_ERROR_BANNER_NAME_,
		STRING__APP_ERROR_BANNER_STACK_TRACE_,
	} from '../i18n/strings.js';

	export let error: unknown;
	export let nested = false;

	function isErrorLike(value: unknown): value is {
		name?: unknown;
		message?: unknown;
		stack?: unknown;
		cause?: unknown;
	} {
		return typeof value === 'object' && value !== null;
	}

	function getErrorMessage(value: unknown) {
		if (value instanceof Error) return value.message;
		if (isErrorLike(value) && typeof value.message === 'string') {
			return value.message;
		}
		return String(value);
	}

	function getErrorName(value: unknown) {
		if (value instanceof Error) return value.name;
		if (isErrorLike(value) && typeof value.name === 'string') {
			return value.name;
		}
		return null;
	}

	function getErrorStack(value: unknown) {
		if (value instanceof Error) return value.stack ?? null;
		if (isErrorLike(value) && typeof value.stack === 'string') {
			return value.stack;
		}
		return null;
	}

	function getErrorCause(value: unknown) {
		if (value instanceof Error) return value.cause;
		if (isErrorLike(value) && 'cause' in value) {
			return value.cause;
		}
		return undefined;
	}

	$: message = getErrorMessage(error);
	$: name = getErrorName(error);
	$: stack = getErrorStack(error);
	$: cause = getErrorCause(error);
	$: hasDetails = !!name || !!stack || cause !== undefined;
</script>

<div
	class:error-banner={!nested}
	class:error-cause={nested}
	class="card"
	role="alert"
>
	<div class="error-header">
		<strong>{STRING__APP_ERROR_}</strong>
		<span class="error-message">{message}</span>
	</div>

	{#if hasDetails}
		<details class="error-details">
			<summary>{STRING__APP_ERROR_BANNER_DETAILS_}</summary>

			<div class="error-meta">
				{#if name}
					<div class="meta-row">
						<span class="meta-label"
							>{STRING__APP_ERROR_BANNER_NAME_}</span
						>
						<code>{name}</code>
					</div>
				{/if}

				{#if stack}
					<div class="stack-block">
						<div class="meta-label">
							{STRING__APP_ERROR_BANNER_STACK_TRACE_}
						</div>
						<pre>{stack}</pre>
					</div>
				{/if}

				{#if cause !== undefined}
					<div class="cause-block">
						<div class="meta-label">
							{STRING__APP_ERROR_BANNER_CAUSE_}
						</div>
						<svelte:self error={cause} nested={true} />
					</div>
				{/if}
			</div>
		</details>
	{/if}
</div>

<style>
	.error-banner,
	.error-cause {
		border-color: var(--c-red);
		color: var(--c-red);
	}

	.error-banner {
		background: linear-gradient(
			180deg,
			var(--c-danger-soft) 0%,
			color-mix(in srgb, var(--c-surface) 85%, var(--c-danger-soft)) 100%
		);
		margin-bottom: 1rem;
	}

	@media not (writing-mode: tb-lr) {
		.error-banner {
			margin-block-end: 1rem;
		}
	}

	.error-cause {
		background: color-mix(
			in srgb,
			var(--c-danger-soft) 65%,
			var(--c-surface)
		);
		box-shadow: none;
		padding: 1rem;
	}

	@media not (writing-mode: tb-lr) {
		.error-cause {
			padding-block: 1rem;
			padding-inline: 1rem;
		}
	}

	.error-header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.error-message {
		color: var(--c-text);
		font-weight: 500;
	}

	.error-details {
		margin-top: 0.85rem;
		border-top: 1px solid color-mix(in srgb, var(--c-red) 24%, transparent);
		padding-top: 0.85rem;
	}

	@media not (writing-mode: tb-lr) {
		.error-details {
			margin-block-start: 0.85rem;
			padding-block-start: 0.85rem;
			border-block-start: 1px solid
				color-mix(in srgb, var(--c-red) 24%, transparent);
			border-top: 0;
		}
	}

	.error-details summary {
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--c-text);
		list-style: none;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.error-details summary::-webkit-details-marker {
		display: none;
	}

	.error-details summary::before {
		content: '▸';
		color: var(--c-red);
		transition: transform 0.15s ease;
	}

	.error-details[open] summary::before {
		transform: rotate(90deg);
	}

	.error-meta {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin-top: 0.85rem;
	}

	.meta-row,
	.stack-block,
	.cause-block {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.meta-label {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--c-text-dim);
	}

	code,
	pre {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--c-text);
		background: color-mix(in srgb, var(--c-surface-2) 82%, transparent);
		border: 1px solid var(--c-border);
		border-radius: var(--radius-sm);
	}

	code {
		display: inline-block;
		width: fit-content;
		padding: 0.3rem 0.5rem;
	}

	@media not (writing-mode: tb-lr) {
		code {
			padding-block: 0.3rem;
			padding-inline: 0.5rem;
		}
	}

	pre {
		margin: 0;
		padding: 0.75rem;
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.5;
	}

	@media not (writing-mode: tb-lr) {
		pre {
			padding-block: 0.75rem;
			padding-inline: 0.75rem;
		}
	}

	.cause-block {
		padding-top: 0.25rem;
	}

	@media not (writing-mode: tb-lr) {
		.cause-block {
			padding-block-start: 0.25rem;
		}
	}
</style>
