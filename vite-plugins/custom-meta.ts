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

import childProcess from 'node:child_process';
import { type Plugin } from 'vite';
import packageJson from '../package.json' with { type: 'json' };

const gitCommitHash = (() => {
	try {
		const result = childProcess.spawnSync('git', ['rev-parse', 'HEAD']);
		if (result.status === 0 && result.stdout.byteLength) {
			return Buffer.from(result.stdout).toString().trim();
		}
	} catch {
		/* empty */
	}
})();

export default function customMetaPlugin_(): Plugin {
	return {
		['name']: 'custom-meta',
		['transform'](code, _id) {
			void _id;

			const map = {
				'import.meta.pkg.repository':
					JSON.stringify(Reflect.get(packageJson, 'repository')) ||
					'undefined',
				'import.meta.pkg.name':
					JSON.stringify(Reflect.get(packageJson, 'name')) ||
					'undefined',
				'import.meta.pkg.version':
					JSON.stringify(Reflect.get(packageJson, 'version')) ||
					'undefined',
				'import.meta.pkg.gitCommitHash':
					JSON.stringify(gitCommitHash) || 'undefined',
				'import.meta.pkg.homepage':
					JSON.stringify(Reflect.get(packageJson, 'homepage')) ||
					'undefined',
			};
			const modifiedCode = Object.entries(map).reduce(
				(acc, [identifier, value]) => {
					return acc.replaceAll(identifier, value);
				},
				code,
			);
			return {
				code: modifiedCode,
				map: null, // Provide source map if needed
			};
		},
	};
}
