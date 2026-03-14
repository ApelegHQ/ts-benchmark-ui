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

import { type Plugin } from 'vite';

export default function renameIndexPlugin_(
	opts: { ['from']?: string; ['to']?: string } = {},
) {
	const from = opts.from || 'index.html';
	const to = opts.to || 'index.html';

	return {
		name: 'vite:plugin-rename-index',
		apply: 'build',
		enforce: 'post',
		['generateBundle'](_, bundle) {
			for (const [fileName, chunkOrAsset] of Object.entries(bundle)) {
				// We only care about emitted asset named index.html
				if (fileName === from && chunkOrAsset.type === 'asset') {
					// delete the old entry and re-add under the new name
					delete bundle[fileName];
					bundle[to] = chunkOrAsset;
					// ensure the asset.name/ fileName references are consistent if present
					chunkOrAsset.fileName = to;
					if (chunkOrAsset.names) chunkOrAsset.names = [to];
					return; // done
				}
			}
		},
	} as Plugin;
}
