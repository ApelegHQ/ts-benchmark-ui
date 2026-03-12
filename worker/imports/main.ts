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

import processImports_ from './process-imports.js';

self.addEventListener(
	'message',
	(ev) => {
		const port = ev.data[0] as MessagePort;
		const text = ev.data[1] as string;
		try {
			const result = processImports_(text);
			port.postMessage([true, result]);
		} catch (e) {
			try {
				port.postMessage([false, e]);
			} catch {
				try {
					port.postMessage([false]);
				} catch (e) {
					// No further action
					void e;
				}
			}
		} finally {
			port.close();
		}
	},
	false,
);

// Ready
self.postMessage(0);
