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

declare let self: ServiceWorkerGlobalScope;

const versionedKey = (
	templateArray: readonly string[] | ArrayLike<string>,
	...substitutions: readonly string[]
): string => {
	const combinedArray = new Array(
		templateArray.length + substitutions.length + 2,
	);
	for (let i = 0; i < templateArray.length; i++) {
		combinedArray[i * 2] = templateArray[i];
		if (substitutions.length > i) {
			combinedArray[i * 2 + 1] = substitutions[i];
		}
	}
	combinedArray[combinedArray.length - 2] = '@';
	combinedArray[combinedArray.length - 1] = import.meta.swCacheKey;

	return combinedArray.join('');
};

const listen = <T extends keyof ServiceWorkerGlobalScopeEventMap>(
	name: T,
	handler: (
		this: ServiceWorkerGlobalScope,
		ev: ServiceWorkerGlobalScopeEventMap[T],
	) => unknown,
) => self.addEventListener(name, handler, false);

const main = () => {
	if (
		typeof CacheStorage !== 'function' ||
		typeof caches !== 'object' ||
		!(caches instanceof CacheStorage)
	) {
		return;
	}

	listen('install', (event) => {
		event.waitUntil(
			caches.open(versionedKey`runtime`).then(() => self.skipWaiting()),
		);
	});

	listen('activate', (event) => {
		const currentCaches = [versionedKey`runtime`];
		event.waitUntil(
			caches
				.keys()
				.then((cacheNames) => {
					return cacheNames.filter(
						(cacheName) => !currentCaches.includes(cacheName),
					);
				})
				.then((cachesToDelete) => {
					return Promise.all(
						cachesToDelete.map((cacheToDelete) => {
							return caches.delete(cacheToDelete);
						}),
					);
				})
				.then(() => self.clients.claim()),
		);
	});

	listen('fetch', (event) => {
		const request = event.request;

		const url = new URL(request.url);
		if (
			['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
			url.origin === self.location.origin
		) {
			// General request handling
			event.respondWith(
				caches
					.match(request, { ignoreSearch: true })
					.then((cachedResponse) => {
						if (cachedResponse) {
							return cachedResponse;
						}

						return caches
							.open(versionedKey`runtime`)
							.then((cache) => {
								return fetch(request)
									.then((response) => {
										if (response.ok) {
											event.waitUntil(
												cache.put(
													request,
													response.clone(),
												),
											);
										}
										return response;
									})
									.catch((e) => {
										console.error('Fetch error', e);
										return new Response('Network error', {
											status: 408,
											headers: [
												['content-type', 'text/plain'],
											],
										});
									});
							});
					}),
			);
		}
	});
};

main();
