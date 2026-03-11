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
	import type { ISuiteReport } from '@apeleghq/benchmark/types';
	import {
		STRING__DOWNLOAD_REPORT_ARIA_LABEL_,
		STRING__DOWNLOAD_REPORT_ARIA_LABEL_MENU_,
		STRING__DOWNLOAD_REPORT_CI_FRIENDLY_XML_EXPORT_,
		STRING__DOWNLOAD_REPORT_DOWNLOAD_REPORT_,
		STRING__DOWNLOAD_REPORT_EXPORT_,
		STRING__DOWNLOAD_REPORT_JSON_,
		STRING__DOWNLOAD_REPORT_LOADING_REPORTER_AND_GENERATING_XML_,
		STRING__DOWNLOAD_REPORT_PREPARING_XUNIT_,
		STRING__DOWNLOAD_REPORT_PREPARING_XUNIT_EXPORT_,
		STRING__DOWNLOAD_REPORT_RAW_SUITE_REPORT_,
		STRING__DOWNLOAD_REPORT_UNABLE_TO_PREPARE_XUNIT_EXPORT_,
		STRING__DOWNLOAD_REPORT_XUNIT_,
	} from '../../i18n/strings.js';
	import getRandomSecret from '../../lib/get-random-secret.js';

	export let report: ISuiteReport;

	type XUnitReporter = (report: ISuiteReport) => string;

	let open = false;
	let exportingXUnit = false;
	let xunitExportError = '';
	let menuId = `download-report-menu-${getRandomSecret()}`;

	let xunitReporterPromise: Promise<XUnitReporter> | undefined;

	const loadXunitReporter = (): Promise<XUnitReporter> => {
		if (!xunitReporterPromise) {
			xunitReporterPromise =
				import('@apeleghq/benchmark/reporters/xunit').then(
					({ default: xunitReporter }) => xunitReporter,
				);
		}

		return xunitReporterPromise;
	};

	const sanitizeFilePart = (value: string) =>
		value
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'benchmark-report';

	const getBaseFileName = (suiteReport: ISuiteReport) =>
		sanitizeFilePart(suiteReport.name);

	const triggerDownload = (
		content: string,
		fileName: string,
		contentType: string,
	) => {
		const blob = new Blob([content], { type: contentType });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');

		anchor.href = url;
		anchor.download = fileName;
		anchor.click();

		URL.revokeObjectURL(url);
	};

	const triggerJsonDownload = (suiteReport: ISuiteReport) => {
		triggerDownload(
			`${JSON.stringify(suiteReport, undefined, '\t')}\n`,
			`${getBaseFileName(suiteReport)}.json`,
			'application/json;charset=utf-8',
		);
	};

	const triggerXUnitDownload = async (suiteReport: ISuiteReport) => {
		const xunitReporter = await loadXunitReporter();

		triggerDownload(
			xunitReporter(suiteReport),
			`${getBaseFileName(suiteReport)}.xml`,
			'application/xml;charset=utf-8',
		);
	};

	const closeMenu = () => {
		open = false;
	};

	const clearXUnitExportError = () => {
		xunitExportError = '';
	};

	const closeMenuAndClearError = () => {
		closeMenu();
		clearXUnitExportError();
	};

	const toggleMenu = () => {
		if (!open) {
			clearXUnitExportError();
		}

		open = !open;
	};

	const handleDocumentKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			closeMenuAndClearError();
		}
	};

	const handleDownloadJson = () => {
		triggerJsonDownload(report);
		closeMenuAndClearError();
	};

	const handleDownloadXUnit = async () => {
		if (exportingXUnit) {
			return;
		}

		exportingXUnit = true;
		xunitExportError = '';

		try {
			await triggerXUnitDownload(report);
			closeMenu();
		} catch (error) {
			xunitExportError =
				error instanceof Error
					? error.message
					: STRING__DOWNLOAD_REPORT_UNABLE_TO_PREPARE_XUNIT_EXPORT_;
		} finally {
			exportingXUnit = false;
		}
	};
</script>

<svelte:document
	on:click={closeMenuAndClearError}
	on:keydown={handleDocumentKeydown}
/>

<div class="download-report">
	<div class="download-panel">
		<button
			type="button"
			class="download-toggle"
			aria-haspopup="menu"
			aria-expanded={open}
			aria-controls={open ? menuId : undefined}
			aria-label={STRING__DOWNLOAD_REPORT_ARIA_LABEL_}
			title={STRING__DOWNLOAD_REPORT_DOWNLOAD_REPORT_}
			on:click|stopPropagation={toggleMenu}
		>
			<svg viewBox="0 0 20 20" aria-hidden="true">
				<path
					d="M10 2.75a.75.75 0 0 1 .75.75v7.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V3.5a.75.75 0 0 1 .75-.75Zm-5 11a.75.75 0 0 1 .75.75v.75h8.5v-.75a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75H5a.75.75 0 0 1-.75-.75v-1.5A.75.75 0 0 1 5 13.75Z"
				/>
			</svg>
			<span>{STRING__DOWNLOAD_REPORT_EXPORT_}</span>
		</button>

		{#if open}
			<div
				class="download-menu card"
				id={menuId}
				role="menu"
				tabindex="-1"
				aria-label={STRING__DOWNLOAD_REPORT_ARIA_LABEL_MENU_}
			>
				<button
					type="button"
					class="download-option"
					role="menuitem"
					on:click|stopPropagation={handleDownloadJson}
				>
					<span class="download-option-title"
						>{STRING__DOWNLOAD_REPORT_JSON_}</span
					>
					<span class="download-option-meta"
						>{STRING__DOWNLOAD_REPORT_RAW_SUITE_REPORT_}</span
					>
				</button>
				<button
					type="button"
					class="download-option"
					role="menuitem"
					disabled={exportingXUnit}
					aria-busy={exportingXUnit}
					on:click|stopPropagation={handleDownloadXUnit}
				>
					<span class="download-option-title">
						{#if exportingXUnit}
							<span class="spinner" aria-hidden="true"></span>
							{STRING__DOWNLOAD_REPORT_PREPARING_XUNIT_}
						{:else}
							{STRING__DOWNLOAD_REPORT_XUNIT_}
						{/if}
					</span>
					<span class="download-option-meta">
						{#if exportingXUnit}
							{STRING__DOWNLOAD_REPORT_LOADING_REPORTER_AND_GENERATING_XML_}
						{:else}
							{STRING__DOWNLOAD_REPORT_CI_FRIENDLY_XML_EXPORT_}
						{/if}
					</span>
				</button>
			</div>
		{/if}

		{#if exportingXUnit}
			<div class="download-status" role="status" aria-live="polite">
				<span class="spinner" aria-hidden="true"></span>
				<span class="download-status-text"
					>{STRING__DOWNLOAD_REPORT_PREPARING_XUNIT_EXPORT_}</span
				>
			</div>
		{:else if xunitExportError}
			<div
				class="download-status download-status-error"
				role="status"
				aria-live="polite"
			>
				<span class="download-status-text">{xunitExportError}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.download-report {
		position: relative;
	}

	.download-panel {
		position: relative;
	}

	.download-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.7rem;
		color: var(--c-text-dim);
		background: color-mix(in srgb, var(--c-surface) 82%, transparent);
		backdrop-filter: blur(8px);
	}

	@media not (writing-mode: tb-lr) {
		.download-toggle {
			padding-block: 0.45rem;
			padding-inline: 0.7rem;
		}
	}

	.download-toggle:hover:not(:disabled),
	.download-toggle[aria-expanded='true'] {
		color: var(--c-text);
		border-color: var(--c-text-dim);
		background: var(--c-surface-2);
	}

	.download-toggle :global(svg) {
		width: 0.95rem;
		height: 0.95rem;
		fill: currentColor;
	}

	@media not (writing-mode: tb-lr) {
		.download-toggle :global(svg) {
			inline-size: 0.95rem;
			block-size: 0.95rem;
		}
	}

	.download-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		min-width: 12rem;
		padding: 0.35rem;
		z-index: 10;
	}

	@media not (writing-mode: tb-lr) {
		.download-menu {
			top: auto;
			right: auto;
			min-width: auto;
			inset-block-start: calc(100% + 0.5rem);
			inset-inline-end: 0;
			min-inline-size: 12rem;
			padding-block: 0.35rem;
			padding-inline: 0.35rem;
		}
	}

	.download-option {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1rem;
		width: 100%;
		padding: 0.65rem 0.75rem;
		border: 0;
		background: transparent;
		box-shadow: none;
	}

	@media not (writing-mode: tb-lr) {
		.download-option {
			width: auto;
			inline-size: 100%;
			padding-block: 0.65rem;
			padding-inline: 0.75rem;
		}
	}

	.download-option:hover:not(:disabled) {
		background: var(--c-surface-2);
		border-color: transparent;
	}

	.download-option:disabled {
		opacity: 0.9;
		cursor: progress;
	}

	.download-option-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--c-text);
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.download-option-meta {
		font-size: 0.75rem;
		color: var(--c-text-dim);
	}

	.download-status {
		margin-top: 0.5rem;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.75rem;
		color: var(--c-text-dim);
		font-family: var(--font-mono);
	}

	@media not (writing-mode: tb-lr) {
		.download-status {
			margin-top: 0;
			margin-block-start: 0.5rem;
		}
	}

	.download-status-text {
		white-space: nowrap;
	}

	.download-status-error {
		color: var(--c-red);
	}

	.spinner {
		display: inline-block;
		width: 0.875em;
		height: 0.875em;
		border: 2px solid color-mix(in srgb, currentColor 30%, transparent);
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@media not (writing-mode: tb-lr) {
		.spinner {
			inline-size: 0.875em;
			block-size: 0.875em;
			border-block-start-color: currentColor;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
