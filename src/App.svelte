<script lang="ts">
	import type { IRunProgress, ISuiteReport } from '@apeleghq/benchmark/types';
	import {
		type ISuiteState,
		getShareUrl_ as getShareUrl,
		suiteState_ as suiteState,
	} from './state.js';

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
	let error: string | typeof empty = empty;
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

	// Show/hide the loading dialog reactively
	$: if (loadingDialogEl) {
		if (!ready && runnerError === empty) {
			if (!loadingDialogEl.open) loadingDialogEl.showModal();
		} else {
			if (loadingDialogEl.open) loadingDialogEl.close();
		}
	}

	// Show/hide the error dialog reactively
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
			error =
				typeof e === 'object' && e instanceof Error
					? e.message
					: String(e);
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
				shareMessage = 'Link copied!';
				setTimeout(() => {
					shareMessage = '';
				}, 2000);
			})
			.catch(() => {
				shareMessage = 'Failed to copy';
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
		<h2 id="loading-title">Initialising Benchmark Studio</h2>
		<p>Setting up the sandboxed runner environment&hellip;</p>
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
		<h2 id="error-title">Initialisation failed</h2>
		<p>{runnerError !== empty ? runnerError : ''}</p>
		<p class="error-hint">Please reload the page to try again.</p>
		<button
			class="primary"
			on:click={() => location.reload()}
			type="button"
		>
			Reload Page
		</button>
	</div>
</dialog>

{#if ready}
	<header>
		<h1>
			<span class="logo" aria-hidden="true">⚡</span>
			Benchmark Studio
		</h1>
		<p class="subtitle">
			Interactive JavaScript benchmarking in your browser.
		</p>
	</header>
	<main>
		<form on:submit={handleRun}>
			<Header />

			<FunctionList />

			<fieldset class="controls-bar">
				<legend class="sr-only">Controls</legend>

				<RunButton ready={!!runSuite} {running} {progress} />

				<button
					class="share-btn"
					on:click={handleShare}
					title="Copy shareable URL to clipboard"
					type="button"
					aria-label="Share benchmark configuration"
				>
					{#if shareMessage}
						{shareMessage}
					{:else}
						Share
					{/if}
				</button>
			</fieldset>

			{#if error !== empty}
				<div class="error-banner card" role="alert">
					<strong>Error:</strong>
					{error}
				</div>
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

	header h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--c-text);
		margin-bottom: 0.25rem;
	}

	.logo {
		margin-right: 0.35em;
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

	.share-btn {
		font-size: 0.8125rem;
		min-width: 6rem;
	}

	.error-banner {
		background: var(--c-danger-soft);
		border-color: var(--c-red);
		color: var(--c-red);
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	/* Dialog styles */

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

	/* Loading spinner */

	.spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 3px solid var(--c-border);
		border-top-color: var(--c-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 0.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Error dialog */

	.status-dialog.error {
		border: 1px solid var(--c-red);
	}

	.error-icon {
		font-size: 2.5rem;
		margin-bottom: 0.25rem;
	}

	.error-hint {
		font-size: 0.8125rem;
		font-style: italic;
	}
</style>
