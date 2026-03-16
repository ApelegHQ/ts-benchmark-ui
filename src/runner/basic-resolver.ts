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

import type { TrustedScriptURL } from 'trusted-types/lib';
import compileFunction from './compile-function.js';
import { createScriptURL_ as createScriptURL } from './policy.js';

type TSpecifierExpression = string | TrustedScriptURL;
type TOptionsExpression = { ['with']: Record<string, string> };

const __import__ = (() => {
	try {
		const fn = compileFunction(['$'], 'return import($)') as (
			specifierExpression: TSpecifierExpression,
		) => Promise<unknown>;

		return (url: string) => fn(createScriptURL(url));
	} catch (e) {
		return async () => {
			throw new SyntaxError('Dynamic imports not supported', {
				cause: e,
			});
		};
	}
})();

const __import_with_options__ = (() => {
	try {
		const fn = compileFunction(['$', '_'], 'return import($,_)') as (
			specifierExpression: TSpecifierExpression,
			optionsExpression: TOptionsExpression,
		) => Promise<unknown>;

		return (url: string, options: TOptionsExpression) =>
			fn(createScriptURL(url), options);
	} catch (e) {
		return async () => {
			throw new SyntaxError('Dynamic imports not supported', {
				cause: e,
			});
		};
	}
})();

export default (
	m: string,
	_with_?: Record<string, string> | null,
): Promise<unknown> =>
	_with_ ? __import_with_options__(m, { with: _with_ }) : __import__(m);
