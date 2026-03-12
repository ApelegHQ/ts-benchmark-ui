<script lang="ts">
	import type { IRunProgress, ISuiteReport } from '@apeleghq/benchmark/types';
	import {
		STRING__APP_CONTROLS_,
		STRING__APP_COPY_SHAREABLE_URL_TO_CLIPBOARD_,
		STRING__APP_FAILED_TO_COPY_,
		STRING__APP_INITIALISATION_FAILED_,
		STRING__APP_INITIALISING_BENCHMARK_STUDIO_,
		STRING__APP_INTERACTIVE_JAVASCRIPT_BENCHMARKING_IN_YOUR_BROWSER_,
		STRING__APP_LINK_COPIED_,
		STRING__APP_PLEASE_RELOAD_THE_PAGE_TO_TRY_AGAIN_,
		STRING__APP_RELOAD_PAGE_,
		STRING__APP_SETTING_UP_THE_SANDBOXED_RUNNER_ENVIRONMENT_,
		STRING__APP_SHARE_,
		STRING__APP_SHARE_BENCHMARK_CONFIGURATION_,
		STRING__APP_TITLE_,
	} from './i18n/strings.js';
	import {
		type ISuiteState,
		getShareUrl_ as getShareUrl,
		suiteState_ as suiteState,
	} from './state.js';

	import ErrorBanner from './components/ErrorBanner.svelte';
	import Footer from './components/Footer.svelte';
	import FunctionList from './components/FunctionList.svelte';
	import Header from './components/Header.svelte';
	import ReportView from './components/report/ReportView.svelte';
	import RunButton from './components/RunButton.svelte';
	import Runner from './components/Runner.svelte';

	const empty = Symbol();

	let report: ISuiteReport | null = null;
	let running = false;
	let progress: IRunProgress | null = null;
	let error: unknown | typeof empty = empty;
	let shareMessage = '';

	let runSuite:
		| ((
				suiteState: ISuiteState,
				onProgress: (p: IRunProgress) => void,
		  ) => Promise<ISuiteReport>)
		| null = null;
	let runnerError: string | typeof empty = empty;

	let loadingDialogEl: HTMLDialogElement | null = null;
	let errorDialogEl: HTMLDialogElement | null = null;

	$: ready = runSuite !== null && runnerError === empty;

	$: if (loadingDialogEl) {
		if (!ready && runnerError === empty) {
			if (!loadingDialogEl.open) loadingDialogEl.showModal();
		} else {
			if (loadingDialogEl.open) loadingDialogEl.close();
		}
	}

	$: if (errorDialogEl) {
		if (runnerError !== empty) {
			if (!errorDialogEl.open) errorDialogEl.showModal();
		} else {
			if (errorDialogEl.open) errorDialogEl.close();
		}
	}

	function handleDialogCancel(event: Event) {
		event.preventDefault();
	}

	async function handleRun(event: SubmitEvent) {
		event.preventDefault();

		if (!runSuite) return;

		running = true;
		error = empty;
		report = null;
		progress = null;

		try {
			report = await runSuite($suiteState, (p) => {
				progress = p;
			});
		} catch (e) {
			console.error('Error running suite', e);
			error = e;
		} finally {
			running = false;
			progress = null;
		}
	}

	function handleShare() {
		const url = getShareUrl();
		navigator.clipboard
			.writeText(url)
			.then(() => {
				shareMessage = STRING__APP_LINK_COPIED_;
				setTimeout(() => {
					shareMessage = '';
				}, 2000);
			})
			.catch(() => {
				shareMessage = STRING__APP_FAILED_TO_COPY_;
				setTimeout(() => {
					shareMessage = '';
				}, 2000);
			});
	}
</script>

<dialog
	bind:this={loadingDialogEl}
	class="status-dialog"
	on:cancel={handleDialogCancel}
	aria-labelledby="loading-title"
>
	<div class="dialog-content">
		<div class="spinner" aria-hidden="true"></div>
		<h2 id="loading-title">{STRING__APP_INITIALISING_BENCHMARK_STUDIO_}</h2>
		<p>{STRING__APP_SETTING_UP_THE_SANDBOXED_RUNNER_ENVIRONMENT_}</p>
	</div>
</dialog>

<dialog
	bind:this={errorDialogEl}
	class="status-dialog error"
	on:cancel={handleDialogCancel}
	aria-labelledby="error-title"
>
	<div class="dialog-content">
		<div class="error-icon" aria-hidden="true">⚠</div>
		<h2 id="error-title">{STRING__APP_INITIALISATION_FAILED_}</h2>
		<p>{runnerError !== empty ? runnerError : ''}</p>
		<p class="error-hint">
			{STRING__APP_PLEASE_RELOAD_THE_PAGE_TO_TRY_AGAIN_}
		</p>
		<button
			class="primary"
			on:click={() => location.reload()}
			type="button"
		>
			{STRING__APP_RELOAD_PAGE_}
		</button>
	</div>
</dialog>

{#if ready}
	<header>
		<h1>
			<span class="logo" aria-hidden="true">⚡</span>
			{STRING__APP_TITLE_}
		</h1>
		<p class="subtitle">
			{STRING__APP_INTERACTIVE_JAVASCRIPT_BENCHMARKING_IN_YOUR_BROWSER_}
		</p>
	</header>
	<main>
		<form on:submit={handleRun}>
			<Header />

			<FunctionList />

			<fieldset class="controls-bar">
				<legend class="sr-only">{STRING__APP_CONTROLS_}</legend>

				<RunButton ready={!!runSuite} {running} {progress} />

				<button
					class="share-btn"
					on:click={handleShare}
					title={STRING__APP_COPY_SHAREABLE_URL_TO_CLIPBOARD_}
					type="button"
					aria-label={STRING__APP_SHARE_BENCHMARK_CONFIGURATION_}
				>
					{#if shareMessage}
						{shareMessage}
					{:else}
						{STRING__APP_SHARE_}
					{/if}
				</button>
			</fieldset>

			{#if error !== empty}
				<ErrorBanner {error} />
			{/if}
		</form>

		{#if report}
			<ReportView {report} />
		{/if}
	</main>

	<Footer />
{/if}

<Runner
	on:ready={(e: CustomEvent) => {
		runSuite = e.detail.run_;
	}}
	on:error={(e: CustomEvent) => {
		runnerError = e.detail.message;
	}}
/>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
	}

	@media not (writing-mode: tb-lr) {
		header {
			margin-block-end: 2rem;
		}
	}

	header h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--c-text);
		margin-bottom: 0.25rem;
	}

	@media not (writing-mode: tb-lr) {
		header h1 {
			margin-block-end: 0.25rem;
		}
	}

	.logo {
		margin-right: 0.35em;
	}

	@media not (writing-mode: tb-lr) {
		.logo {
			margin-inline-end: 0.35em;
		}
	}

	form fieldset {
		border: 0 none transparent;
	}

	.subtitle {
		font-size: 0.9rem;
		color: var(--c-text-dim);
	}

	.controls-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 1.5rem 0;
	}

	@media not (writing-mode: tb-lr) {
		.controls-bar {
			margin-block: 1.5rem;
			margin-inline: 0;
		}
	}

	.share-btn {
		font-size: 0.8125rem;
		min-width: 6rem;
	}

	@media not (writing-mode: tb-lr) {
		.share-btn {
			min-inline-size: 6rem;
		}
	}

	.status-dialog {
		border: none;
		border-radius: 12px;
		padding: 0;
		max-width: 28rem;
		width: 90vw;
		background: var(--c-surface);
		color: var(--c-text);
		box-shadow: 0 8px 32px var(--c-overlay-strong);
	}

	@media not (writing-mode: tb-lr) {
		.status-dialog {
			max-inline-size: 28rem;
			inline-size: 90vw;
		}
	}

	.status-dialog::backdrop {
		background: var(--c-overlay-strong);
		backdrop-filter: blur(4px);
	}

	.dialog-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2.5rem 2rem;
		gap: 0.75rem;
	}

	@media not (writing-mode: tb-lr) {
		.dialog-content {
			padding-block: 2.5rem;
			padding-inline: 2rem;
		}
	}

	.dialog-content h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.dialog-content p {
		font-size: 0.875rem;
		color: var(--c-text-dim);
		margin: 0;
		line-height: 1.5;
	}

	.spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 3px solid var(--c-border);
		border-top-color: var(--c-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 0.5rem;
	}

	@media not (writing-mode: tb-lr) {
		.spinner {
			inline-size: 2.5rem;
			block-size: 2.5rem;
			border-block-start-color: var(--c-accent);
			margin-block-end: 0.5rem;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.status-dialog.error {
		border: 1px solid var(--c-red);
	}

	.error-icon {
		font-size: 2.5rem;
		margin-bottom: 0.25rem;
	}

	@media not (writing-mode: tb-lr) {
		.error-icon {
			margin-block-end: 0.25rem;
		}
	}

	.error-hint {
		font-size: 0.8125rem;
		font-style: italic;
	}
</style>
