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
	import type { IRunProgress, ISuiteReport } from '@apeleghq/benchmark/types';
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		STRING__RUNNER_FAILED_TO_DESERIALISE_INITIAL_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_,
		STRING__RUNNER_FAILED_TO_DESERIALISE_INSTANCE_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_,
		STRING__RUNNER_INVALID_DATA_,
		STRING__RUNNER_MESSAGE_ERROR_,
		STRING__RUNNER_TIMED_OUT_WAITING_FOR_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_,
	} from '../i18n/strings.js';
	import getRandomSecret from '../lib/get-random-secret.js';
	import { marshalSuiteState_ as marshalSuiteState } from '../lib/marshal.js';
	import processImportsWorker from '../lib/process-imports-worker.js';
	import {
		unmarshalRunProgress_ as unmarshalRunProgress,
		unmarshalSuiteReport_ as unmarshalSuiteReport,
	} from '../lib/unmarshal.js';
	import type { ISuiteState } from '../state.js';

	type RunnerErrorData =
		| [false, unknown]
		| [false, Record<string, unknown>, string];
	type RunnerResultData = [true, ISuiteReport] | RunnerErrorData;

	const dispatch = createEventDispatcher<{
		ready: {
			run_: (
				suiteState: ISuiteState,
				onProgress: (progress: IRunProgress) => void,
			) => Promise<ISuiteReport>;
		};
		error: { message: string; cause?: unknown };
	}>();

	const initMessageKeyA = getRandomSecret();
	const initMessageKeyB = getRandomSecret();
	const iframeSrc = `${import.meta.runnerUrl}#${initMessageKeyA}/${initMessageKeyB}`;

	let globalSetup = false;
	let instanceSetup = false;
	let hasError = false;
	let errorMessage: string | null = null;
	let iframeEl: HTMLIFrameElement | null = null;

	const instanceOnmessage = (event: Event) => {
		const typedEvent = event as MessageEvent<MessagePort>;

		if (
			!globalSetup ||
			hasError ||
			instanceSetup ||
			!typedEvent.target ||
			!typedEvent.isTrusted ||
			!(typedEvent.data instanceof MessagePort)
		) {
			return;
		}

		instanceSetup = true;
		typedEvent.target.removeEventListener(
			'message',
			instanceOnmessage,
			false,
		);
		typedEvent.target.removeEventListener(
			'messageerror',
			instanceOnmessageerror,
			false,
		);
		(typedEvent.target as MessagePort).close();

		const instancePort = typedEvent.data;

		const run = async (
			suiteState: ISuiteState,
			onProgress: (progress: IRunProgress) => void,
		): Promise<ISuiteReport> => {
			let imports: unknown;
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
					(event: Event) => {
						const typedEvent =
							event as MessageEvent<RunnerResultData>;

						if (
							!typedEvent.isTrusted ||
							!Array.isArray(typedEvent.data) ||
							typeof typedEvent.data[0] !== 'boolean' ||
							(typedEvent.data[0] &&
								typedEvent.data.length !== 2) ||
							(!typedEvent.data[0] &&
								typedEvent.data.length !== 2 &&
								typedEvent.data.length !== 3)
						) {
							reject(new TypeError(STRING__RUNNER_INVALID_DATA_));
						} else if (typedEvent.data[0]) {
							resolve(unmarshalSuiteReport(typedEvent.data[1]));
						} else {
							const errorData = [
								...typedEvent.data,
							] as RunnerErrorData;
							if (errorData.length === 3) {
								errorData[1].name = errorData[2];
							}
							reject(errorData[1]);
						}

						messageChannelResult.port1.close();
						messageChannelProgress.port1.close();
					},
					false,
				);

				messageChannelResult.port1.addEventListener(
					'messageerror',
					() => {
						reject(new Error(STRING__RUNNER_MESSAGE_ERROR_));
						messageChannelResult.port1.close();
						messageChannelProgress.port1.close();
					},
					false,
				);

				messageChannelProgress.port1.addEventListener(
					'message',
					(event: Event) => {
						const typedEvent = event as MessageEvent<
							[string, unknown]
						>;
						if (
							!typedEvent.isTrusted ||
							!Array.isArray(typedEvent.data) ||
							typedEvent.data.length !== 2 ||
							typedEvent.data[0] !== 'progress'
						) {
							return;
						}

						onProgress(unmarshalRunProgress(typedEvent.data[1]));
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

	const instanceOnmessageerror = (event: Event) => {
		const typedEvent = event as MessageEvent;

		if (
			!globalSetup ||
			hasError ||
			instanceSetup ||
			!typedEvent.target ||
			!typedEvent.isTrusted
		) {
			return;
		}

		instanceSetup = true;
		typedEvent.target.removeEventListener(
			'message',
			instanceOnmessage,
			false,
		);
		typedEvent.target.removeEventListener(
			'messageerror',
			instanceOnmessageerror,
			false,
		);
		(typedEvent.target as MessagePort).close();

		hasError = true;
		errorMessage =
			STRING__RUNNER_FAILED_TO_DESERIALISE_INSTANCE_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_;
		dispatch('error', { message: errorMessage });
	};

	const onmessage = (event: Event) => {
		const typedEvent = event as MessageEvent<
			[initMessage: typeof initMessageKeyA, responsePort: MessagePort]
		>;

		if (
			globalSetup ||
			hasError ||
			!iframeEl ||
			!typedEvent.isTrusted ||
			typedEvent.source !== iframeEl.contentWindow ||
			!Array.isArray(typedEvent.data) ||
			typedEvent.data.length !== 2 ||
			typedEvent.data[0] !== initMessageKeyA ||
			!(typedEvent.data[1] instanceof MessagePort)
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

		typedEvent.data[1].postMessage(
			[initMessageKeyB, messageChannel.port2],
			[messageChannel.port2],
		);
	};

	const onmessageerror = (event: Event) => {
		const typedEvent = event as MessageEvent;

		if (
			globalSetup ||
			hasError ||
			!iframeEl ||
			!typedEvent.isTrusted ||
			typedEvent.source !== iframeEl.contentWindow
		) {
			return;
		}

		clear();

		hasError = true;
		errorMessage =
			STRING__RUNNER_FAILED_TO_DESERIALISE_INITIAL_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_;
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

			hasError = true;
			errorMessage =
				STRING__RUNNER_TIMED_OUT_WAITING_FOR_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_;
			dispatch('error', { message: errorMessage });
		}, 5_000);

		return clear;
	});
</script>

<iframe
	allow="cross-origin-isolated"
	bind:this={iframeEl}
	sandbox="allow-scripts"
	src={iframeSrc}
	title=""
></iframe>

<style>
	iframe {
		display: none;
	}
</style>
