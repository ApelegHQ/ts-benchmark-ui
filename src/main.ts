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

import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import registerServiceWorker_ from './lib/register-service-worker.js';

const onLoad = (handler: { (): void }) => {
	if (
		typeof document === 'undefined' ||
		typeof Document !== 'function' ||
		!(document instanceof Document) ||
		typeof self !== 'object' ||
		typeof top !== 'object' ||
		typeof window !== 'object' ||
		typeof Window !== 'function' ||
		!(window instanceof Window)
	) {
		throw new Error('Not executing in a browser context');
	}

	if (self !== top) {
		throw new Error('Not executing in a top-level window');
	}

	if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
		setTimeout(handler, 0);
	} else if (document.addEventListener) {
		const eventListener = () => {
			document.removeEventListener(
				'DOMContentLoaded',
				eventListener,
				false,
			);
			handler();
		};
		document.addEventListener('DOMContentLoaded', eventListener, false);
	} else {
		throw new Error('Unsupported browser');
	}
};

onLoad(() => {
	const rootId = 'app';
	const fallbackId = 'fallback';

	const target$ = document.getElementById(rootId);
	if (!target$) {
		throw new Error('Root element not found');
	}

	const children$$ = target$.children;
	for (let i = children$$.length - 1; i >= 0; i--) {
		target$.removeChild(children$$[i]);
	}

	const fallback$ = document.getElementById(fallbackId);
	try {
		mount(App, {
			['target']: target$,
		});

		if (fallback$) {
			fallback$.style.setProperty('display', 'none', 'important');
			const main$ = fallback$.querySelector('main');
			if (main$ && main$.parentNode) {
				const section$ = document.createElementNS(
					'http://www.w3.org/1999/xhtml',
					'div',
				);
				while (main$.childNodes.length !== 0) {
					const node = main$.childNodes[0];
					main$.removeChild(node);
					section$.appendChild(node);
				}

				main$.parentNode.replaceChild(section$, main$);
			}
		}

		self.onerror = null;
	} catch (e) {
		target$.style.setProperty('display', 'none', 'important');
		alert(e instanceof Error ? `${e.name}: ${e.message}` : e);

		throw e;
	}
});

registerServiceWorker_(import.meta.serviceWorkerPath).catch(function (error) {
	console.error('Service worker registration failed', error);
});
