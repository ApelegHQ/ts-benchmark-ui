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

import { parseImportsOnly_ } from './parse-imports.js';

type ModuleDesc = [
	attributes: Record<string, string> | null,
	namespace: string[] | null,
	imports: [imported: string, local: string][] | null,
];
type Modules = Record<string, ModuleDesc>;

const findWithMatchingWith = (
	mods: Modules,
	name: string,
	attributes?: ModuleDesc[0],
): ModuleDesc | undefined => {
	const mod = mods[name];

	if (!mod) return;
	if (attributes == null && mod[0] == null) return mod;
	if (attributes == null || mod[0] == null) return;

	const theirKeys = Object.keys(mod[0]);
	const ourKeys = Object.keys(attributes);

	if (theirKeys.length !== ourKeys.length) return;

	const combinedKeys = Array.from(new Set([...ourKeys, ...theirKeys]));
	if (combinedKeys.length !== ourKeys.length) return;
	for (let i = 0; i < combinedKeys.length; i++) {
		if (attributes[combinedKeys[i]] !== mod[0][combinedKeys[i]]) return;
	}
	return mod;
};

const processImports_ = (text: string) => {
	const declarations = parseImportsOnly_(text);

	const checkedLocalIdentifier = (() => {
		const identifiers = new Set<string>();
		return (identifier: string) => {
			if (identifiers.has(identifier)) {
				throw new Error('Duplicate name');
			}
			identifiers.add(identifier);
			return identifier;
		};
	})();

	const processed = Object.create(null) as Modules;

	declarations.forEach((declaration) => {
		const name = declaration.module_;
		const attributes = declaration.with_;
		const mod = findWithMatchingWith(processed, name, attributes);
		if (!mod) {
			if (declaration.kind_ === 'bindings') {
				const namespace = declaration.namespace_;
				const named = declaration.named_;
				const defaultBinding = declaration.default_;
				processed[name] = [
					attributes || null,
					namespace ? [checkedLocalIdentifier(namespace)] : null,
					defaultBinding || named
						? [
								...(defaultBinding
									? ([
											[
												'default',
												checkedLocalIdentifier(
													defaultBinding,
												),
											],
										] as [string, string][])
									: []),
								...((named?.map((named) => [
									named.imported_,
									checkedLocalIdentifier(named.local_),
								]) as [string, string][]) || []),
							]
						: null,
				];
			} else {
				processed[declaration.module_] = [
					declaration.with_ || null,
					null,
					null,
				];
			}

			return;
		} else if (declaration.kind_ === 'bindings') {
			const namespace = declaration.namespace_;
			if (namespace) {
				if (!mod[1]) {
					mod[1] = [checkedLocalIdentifier(namespace)];
				} else if (!mod[1].includes(namespace)) {
					mod[1].push(checkedLocalIdentifier(namespace));
				}
			}

			const defaultBinding = declaration.default_;
			if (defaultBinding) {
				if (!mod[2]) {
					mod[2] = [
						['default', checkedLocalIdentifier(defaultBinding)],
					];
				} else if (
					!mod[2].some(
						(v) => v[0] === 'default' && v[1] === defaultBinding,
					)
				) {
					mod[2].push([
						'default',
						checkedLocalIdentifier(defaultBinding),
					]);
				}
			}

			const named = declaration.named_;
			if (named) {
				const map = named.map((named) => [
					named.imported_,
					checkedLocalIdentifier(named.local_),
				]) as [string, string][];
				if (!mod[2]) {
					mod[2] = map;
				} else {
					map.forEach((n) => {
						if (
							!mod[2]!.some((v) => v[0] === n[0] && v[1] === n[1])
						) {
							mod[2]!.push(n);
						}
					});
				}
			}
		}
	});

	return processed;
};

export default processImports_;
