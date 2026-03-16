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

import process from 'node:process';
import { type Plugin } from 'vite';
import packageJson from '../package.json' with { type: 'json' };
import gitCommitHash_ from './git-commit-hash.js';

export default function customMetaPlugin_(): Plugin {
	return {
		['name']: 'custom-meta',
		['transform'](code, _id) {
			void _id;

			const map = {
				'import.meta.importsWorkerPath': JSON.stringify(
					process.env.IMPORTS_WORKER_PATH ?? '/assets/imports.js',
				),
				'import.meta.serviceWorkerPath': JSON.stringify(
					process.env.SERVICE_WORKER_PATH ?? '/service-worker.js',
				),
				'import.meta.runnerUrl': JSON.stringify(
					process.env.RUNNER_URL ?? '/resources/runner',
				),
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
					JSON.stringify(gitCommitHash_) || 'undefined',
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
