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

import compileFunction from './compile-function.js';

const __import__ = (() => {
	try {
		return compileFunction(['$'], 'return import($)') as (
			specifierExpression: string,
		) => Promise<unknown>;
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
		return compileFunction(['$', '_'], 'return import($,_)') as (
			specifierExpression: string,
			optionsExpression: { ['with']: Record<string, string> },
		) => Promise<unknown>;
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
