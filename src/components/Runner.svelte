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
	import type { ISuiteState } from '../state.js';
	import getRandomSecret from '../lib/get-random-secret.js';
	import processImportsWorker from '../lib/process-imports-worker.js';
	import { marshalSuiteState_ as marshalSuiteState } from '../lib/marshal.js';
	import {
		unmarshalRunProgress_ as unmarshalRunProgress,
		unmarshalSuiteReport_ as unmarshalSuiteReport,
	} from '../lib/unmarshal.js';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher<{
		['ready']: {
			run_: (
				suiteState: ISuiteState,
				onProgress: (progress: unknown) => void,
			) => Promise<ISuiteReport>;
		};
		['error']: { message: string; cause?: unknown };
	}>();

	const initMessageKeyA = getRandomSecret();
	const initMessageKeyB = getRandomSecret();
	const iframeSrc = `${import.meta.runnerUrl}#${initMessageKeyA}/${initMessageKeyB}`;

	let globalSetup = false;
	let instanceSetup = false;
	let hasError = false;
	let errorMessage: string | null = null;

	const instanceOnmessage = (event: MessageEvent<MessagePort>) => {
		if (
			!globalSetup ||
			hasError ||
			instanceSetup ||
			!event.target ||
			!event.isTrusted ||
			!(event.data instanceof MessagePort)
		) {
			return;
		}

		instanceSetup = true;
		event.target.removeEventListener('message', instanceOnmessage, false);
		event.target.removeEventListener(
			'messageerror',
			instanceOnmessageerror,
			false,
		);
		(event.target as MessagePort).close();

		const instancePort = event.data;

		// Dispatch a 'ready' event with a `run` function that the parent
		// Runner.svelte can use
		const run = async (
			suiteState: ISuiteState,
			onProgress: (progress: unknown) => void,
		): Promise<ISuiteReport> => {
			let imports;
			if (suiteState.importsCode) {
				imports = await processImportsWorker(suiteState.importsCode);
			}

			return new Promise((resolve, reject) => {
				const messageChannelResult = new MessageChannel();
				const messageChannelProgress = new MessageChannel();

				messageChannelResult.port1.start();
				messageChannelProgress.port1.start();

				messageChannelResult.port1.addEventListener(
					'message',
					(
						event: MessageEvent<
							[true, ISuiteReport] | [false, unknown]
						>,
					) => {
						if (
							!event.isTrusted ||
							!Array.isArray(event.data) ||
							typeof event.data[0] !== 'boolean' ||
							(event.data[0] && event.data.length !== 2) ||
							(!event.data[0] &&
								event.data.length !== 2 &&
								event.data.length !== 3)
						) {
							reject(new TypeError('Invalid data'));
						} else if (event.data[0]) {
							resolve(unmarshalSuiteReport(event.data[1]));
						} else {
							if (event.data.length === 3) {
								event.data[1].name = event.data[2];
							}
							reject(event.data[1]);
						}

						messageChannelResult.port1.close();
						messageChannelProgress.port1.close();
					},
					false,
				);

				messageChannelResult.port1.addEventListener(
					'messageerror',
					() => {
						reject(new Error('Message error'));
						messageChannelResult.port1.close();
						messageChannelProgress.port1.close();
					},
					false,
				);

				messageChannelProgress.port1.addEventListener(
					'message',
					(event: MessageEvent) => {
						if (
							!event.isTrusted ||
							!Array.isArray(event.data) ||
							event.data.length !== 2 ||
							event.data[0] !== 'progress'
						) {
							return;
						}

						onProgress(unmarshalRunProgress(event.data[1]));
					},
					false,
				);

				instancePort.postMessage(
					[
						messageChannelResult.port2,
						messageChannelProgress.port2,
						marshalSuiteState({ ...suiteState, importsCode: '' }),
						imports,
					],
					[messageChannelResult.port2, messageChannelProgress.port2],
				);
			});
		};

		dispatch('ready', { run_: run });
	};

	const instanceOnmessageerror = (event: MessageEvent) => {
		if (
			!globalSetup ||
			hasError ||
			instanceSetup ||
			!event.target ||
			!event.isTrusted
		) {
			return;
		}

		instanceSetup = true;
		event.target.removeEventListener('message', instanceOnmessage, false);
		event.target.removeEventListener(
			'messageerror',
			instanceOnmessageerror,
			false,
		);
		(event.target as MessagePort).close();

		// Set app error state
		hasError = true;
		errorMessage =
			'Failed to deserialise instance handshake message from runner iframe.';
		dispatch('error', { message: errorMessage });
	};

	const onmessage = (
		event: MessageEvent<
			[initMessage: typeof initMessageKeyA, responsePort: MessagePort]
		>,
	) => {
		if (
			globalSetup ||
			hasError ||
			!iframeEl ||
			!event.isTrusted ||
			event.source !== iframeEl.contentWindow ||
			!Array.isArray(event.data) ||
			event.data.length !== 2 ||
			event.data[0] !== initMessageKeyA ||
			!(event.data[1] instanceof MessagePort)
		) {
			return;
		}

		clear();

		const messageChannel = new MessageChannel();
		messageChannel.port1.start();

		messageChannel.port1.addEventListener(
			'message',
			instanceOnmessage,
			false,
		);
		messageChannel.port1.addEventListener(
			'messageerror',
			instanceOnmessageerror,
			false,
		);

		event.data[1].postMessage(
			[initMessageKeyB, messageChannel.port2],
			[messageChannel.port2],
		);
	};

	const onmessageerror = (event: MessageEvent) => {
		if (
			globalSetup ||
			hasError ||
			!iframeEl ||
			!event.isTrusted ||
			event.source !== iframeEl.contentWindow
		) {
			return;
		}

		clear();

		// Set app error state
		hasError = true;
		errorMessage =
			'Failed to deserialise initial handshake message from runner iframe.';
		dispatch('error', { message: errorMessage });
	};

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	const clear = () => {
		if (globalSetup) return;

		globalSetup = true;
		self.removeEventListener('message', onmessage, false);
		self.removeEventListener('messageerror', onmessageerror, false);
		clearTimeout(timeoutId);
	};

	onMount(() => {
		self.addEventListener('message', onmessage, false);
		self.addEventListener('messageerror', onmessageerror, false);
		timeoutId = setTimeout(() => {
			if (globalSetup) return;
			clear();

			// Set app error state
			hasError = true;
			errorMessage =
				'Timed out waiting for handshake message from runner iframe.';
			dispatch('error', { message: errorMessage });
		}, 5_000);

		return clear;
	});

	let iframeEl: HTMLIFrameElement | null = null;
</script>

<iframe
	allow="cross-origin-isolated"
	bind:this={iframeEl}
	credentialless=""
	sandbox="allow-scripts"
	src={iframeSrc}
	title=""
></iframe>

<style>
	iframe {
		display: none;
	}
</style>
