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

import {
	marshalRunProgress_ as marshalRunProgress,
	marshalSuiteReport_ as marshalSuiteReport,
} from '../lib/marshal.js';
import { unmarshalSuiteState_ as unmarshalSuiteState } from '../lib/unmarshal.js';
import type { ISuiteState } from '../state.js';
import { runBenchmarks_ as runBenchmarks } from './runner-adapter.js';

const instantiate_ = (): MessagePort => {
	const messageChannel = new MessageChannel();

	messageChannel.port1.addEventListener(
		'message',
		(
			event: MessageEvent<
				[
					resultPort: MessagePort,
					progressPort: MessagePort,
					suiteState: ISuiteState,
				]
			>,
		) => {
			if (
				!event.isTrusted ||
				!Array.isArray(event.data) ||
				event.data.length !== 3 ||
				!(event.data[0] instanceof MessagePort) ||
				!(event.data[1] instanceof MessagePort) ||
				!(typeof event.data[2] === 'object')
			) {
				return;
			}

			const resultPort = event.data[0];
			const progressPort = event.data[1];
			const suiteState = unmarshalSuiteState(event.data[2]);

			const abortController = new AbortController();
			const eventTarget = new EventTarget();

			eventTarget.addEventListener('progress', (event: Event) => {
				if (!(event instanceof CustomEvent)) {
					return;
				}

				progressPort.postMessage([
					event.type,
					marshalRunProgress(event.detail),
				]);
			});

			runBenchmarks(suiteState, eventTarget, abortController.signal).then(
				(result) => {
					console.log('Suite result', result);
					resultPort.postMessage([true, marshalSuiteReport(result)]);
					resultPort.close();
					progressPort.close();
				},
				(e) => {
					const name =
						typeof e === 'object' && e instanceof Error
							? e.name
							: undefined;
					resultPort.postMessage([false, e, name]);
					resultPort.close();
					progressPort.close();
				},
			);
		},
		false,
	);

	messageChannel.port1.start();

	return messageChannel.port2;
};

export default instantiate_;
