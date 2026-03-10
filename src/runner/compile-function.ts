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

/**
 * Build a function from user-supplied code string.
 * The code is wrapped in `new Function(...)` and bound via `this`.
 *
 * Security note: this runs arbitrary user code in the user's own browser —
 * no different from the browser console. There is no server.
 */
const compileFunction_ = (() => {
	const FunctionCtor = (() => {}).constructor;
	const AsyncFunctionCtor = (async () => {}).constructor;

	return <TR = void>(
		params: string[],
		code: string,
	): (() => TR | Promise<TR>) => {
		try {
			return FunctionCtor(...params, code);
		} catch (e) {
			if (e instanceof SyntaxError && code.includes('await')) {
				return AsyncFunctionCtor(...params, code);
			}

			throw e;
		}
	};
})();

export default compileFunction_;
