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

import instantiate_ from './instantiate.js';

const init_ = () => {
	if (self === parent) return;

	const location = self.location;
	const parentOrigin =
		'ancestorOrigins' in location &&
		location['ancestorOrigins'] &&
		location['ancestorOrigins'][0] &&
		location['ancestorOrigins'][0] !== 'null' &&
		// `file://` URLs seem to be problematic as window.origin can be `null`
		/^https?:/i.test(location['ancestorOrigins'][0])
			? location['ancestorOrigins'][0]
			: '*';

	const [initMessageKeyA, initMessageKeyB] = location.hash
		.slice(1)
		.split('/');

	const onmessage = (
		event: MessageEvent<
			[initMessage: typeof initMessageKeyB, runBenchmarks: MessagePort]
		>,
	) => {
		messageChannel.port1.removeEventListener('message', onmessage, false);
		messageChannel.port1.close();

		if (
			!event.isTrusted ||
			!Array.isArray(event.data) ||
			event.data.length !== 2 ||
			event.data[0] !== initMessageKeyB ||
			!(event.data[1] instanceof MessagePort)
		) {
			return;
		}

		const instancePort = instantiate_();
		event.data[1].postMessage(instancePort, [instancePort]);
		event.data[1].close();
	};
	const onmessageerror = () => {
		messageChannel.port1.removeEventListener('message', onmessage, false);
		messageChannel.port1.removeEventListener(
			'messageerror',
			onmessageerror,
			false,
		);
		messageChannel.port1.close();
	};

	const messageChannel = new MessageChannel();
	try {
		messageChannel.port1.addEventListener('message', onmessage, false);
		messageChannel.port1.addEventListener(
			'messageerror',
			onmessageerror,
			false,
		);
		messageChannel.port1.start();

		parent.postMessage(
			[initMessageKeyA, messageChannel.port2],
			parentOrigin,
			[messageChannel.port2],
		);
	} catch (e) {
		messageChannel.port1.close();

		throw e;
	}
};

export default init_;
