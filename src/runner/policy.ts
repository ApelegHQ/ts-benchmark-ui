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

import type {
	TrustedScript,
	TrustedScriptURL,
	TrustedTypesWindow,
} from 'trusted-types/lib';

declare const TrustedTypePolicyFactory: () => {}

const p$trustedTypes = 'trustedTypes';
const m$createScript = 'createScript';
const m$createScriptURL = 'createScriptURL';

const ttSelf = self as unknown as TrustedTypesWindow;
const trustedTypes = ttSelf[p$trustedTypes];

let createScript_: (script: string) => string | TrustedScript;
let createScriptURL_: (url: string) => string | TrustedScriptURL;

if (typeof TrustedTypePolicyFactory === 'function' && trustedTypes) {
	const policy = trustedTypes.createPolicy('runner', {
		[m$createScript](script) {
			return script;
		},
		[m$createScriptURL](url) {
			return url;
		},
	});

	createScript_ = (script: string) => policy[m$createScript](script);
	createScriptURL_ = (url: string) => policy[m$createScriptURL](url);
} else {
	createScript_ = (script: string) => script;
	createScriptURL_ = (url: string) => url;
}

export { createScript_, createScriptURL_ };
