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

import { STRING__RUNNER_ERROR_STARTING_WEB_WORKER_ } from '../i18n/strings';

const processImportsWorker_ = (() => {
	let worker: Worker;

	return async (text: string) => {
		if (!worker) {
			const success = Symbol();

			worker = await new Promise<Worker>((resolve, reject) => {
				const instance = new Worker(import.meta.importsWorkerPath);

				const cleanup = (error: typeof success | unknown) => {
					instance.removeEventListener('error', errorHandler, false);
					instance.removeEventListener(
						'message',
						messageHandler,
						false,
					);
					instance.removeEventListener(
						'messageerror',
						messageErrorHandler,
						false,
					);
					clearTimeout(timeoutId);
					if (error === success) {
						resolve(instance);
					} else {
						reject(error);
						try {
							instance.terminate();
						} catch (e) {
							// empty
							void e;
						}
					}
				};

				const errorHandler = (event: ErrorEvent) => {
					if (event.isTrusted) {
						const error =
							event.error !== undefined
								? event.error
								: new Error(
										STRING__RUNNER_ERROR_STARTING_WEB_WORKER_,
									);
						cleanup(error);
					}
				};

				const messageHandler = (event: MessageEvent) => {
					if (event.isTrusted && event.data === 0) {
						cleanup(success);
					}
				};

				const messageErrorHandler = (event: MessageEvent) => {
					if (event.isTrusted) {
						cleanup(Error('Message error'));
					}
				};

				instance.addEventListener('error', errorHandler, false);
				instance.addEventListener('message', messageHandler, false);
				instance.addEventListener(
					'messageerror',
					messageErrorHandler,
					false,
				);
				const timeoutId = setTimeout(() => {
					cleanup(Error('Timed out'));
				}, 5000);
			});
		}

		return new Promise((resolve, reject) => {
			try {
				const messageChannel = new MessageChannel();
				messageChannel.port1.addEventListener(
					'message',
					(event) => {
						messageChannel.port1.close();
						if (event.data[0]) {
							resolve(event.data[1]);
						} else if (event.data.length === 2) {
							reject(event.data[1]);
						} else {
							reject(Error('Error'));
						}
					},
					false,
				);
				messageChannel.port1.addEventListener(
					'messageerror',
					() => {
						messageChannel.port1.close();
						reject(Error('Message error'));
					},
					false,
				);
				messageChannel.port1.start();

				worker.postMessage(
					[messageChannel.port2, text],
					[messageChannel.port2],
				);
			} catch (e) {
				reject(e);
			}
		});
	};
})();

export default processImportsWorker_;
