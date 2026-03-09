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

const registerServiceWorker_ = async (scriptURL: string) => {
	if (
		!import.meta.serviceWorkerPath ||
		typeof ServiceWorker !== 'function' ||
		typeof ServiceWorkerContainer !== 'function' ||
		!navigator.serviceWorker ||
		!(navigator.serviceWorker instanceof ServiceWorkerContainer) ||
		typeof navigator.serviceWorker.register !== 'function'
	) {
		return;
	}

	return navigator.serviceWorker.register(scriptURL);
};

export default registerServiceWorker_;
