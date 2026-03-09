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

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseImportsOnly_ } from './parse-imports.js';

describe('parseImportsOnly - valid side-effect import', () => {
	it('parses bare module import (side-effect)', () => {
		const src = `import "module-name";`;
		const expected = [{ kind_: 'side-effect', module_: 'module-name' }];
		const got = parseImportsOnly_(src);
		assert.deepEqual(got, expected);
	});

	it('parses side-effect import with with {} clause (empty)', () => {
		const src = `import "mod" with { }`;
		const expected = [{ kind_: 'side-effect', module_: 'mod', with_: {} }];
		const got = parseImportsOnly_(src);
		assert.deepEqual(got, expected);
	});

	it('parses side-effect import with with entries', () => {
		const src = `import "X" with { meta: "v1", "str-key": "v2" }`;
		const expected = [
			{
				kind_: 'side-effect',
				module_: 'X',
				with_: { meta: 'v1', 'str-key': 'v2' },
			},
		];
		const got = parseImportsOnly_(src);
		assert.deepEqual(got, expected);
	});
});

describe('parseImportsOnly - default import', () => {
	it('parses default import', () => {
		const src = `import def from "m";`;
		const expected = [{ kind_: 'bindings', module_: 'm', default_: 'def' }];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses default import with with clause', () => {
		const src = `import def from "m" with { a: "1" }`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				default_: 'def',
				with_: { a: '1' },
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});
});

describe('parseImportsOnly - namespace import', () => {
	it('parses namespace import', () => {
		const src = `import * as ns from "mod";`;
		const expected = [
			{ kind_: 'bindings', module_: 'mod', namespace_: 'ns' },
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses default + namespace import', () => {
		const src = `import D, * as ns from "mod";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'mod',
				default_: 'D',
				namespace_: 'ns',
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});
});

describe('parseImportsOnly - named imports', () => {
	it('parses single named import', () => {
		const src = `import { a } from "m";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				named_: [{ imported_: 'a', local_: 'a' }],
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses named import with alias', () => {
		const src = `import { foo as bar } from "m";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				named_: [{ imported_: 'foo', local_: 'bar' }],
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses default renamed in named imports (default as alias)', () => {
		const src = `import { default as alias } from "m";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				named_: [
					{
						imported_: 'default',
						local_: 'alias',
					},
				],
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses multiple named imports with trailing comma', () => {
		const src = `import { a, b as c, "str name" as s, } from "m";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				named_: [
					{ imported_: 'a', local_: 'a' },
					{ imported_: 'b', local_: 'c' },
					{
						imported_: 'str name',
						local_: 's',
					},
				],
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses empty named imports {} (no specifiers)', () => {
		const src = `import { } from "m";`;
		const expected = [{ kind_: 'bindings', module_: 'm', named_: [] }];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses default + named imports', () => {
		const src = `import def, { a, b as c } from "m";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				default_: 'def',
				named_: [
					{ imported_: 'a', local_: 'a' },
					{ imported_: 'b', local_: 'c' },
				],
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});
});

describe('parseImportsOnly - combinations & multiple statements', () => {
	it('parses multiple import declarations sequentially', () => {
		const src = `
      import "side";
      import def from "m1";
      import { x as y } from "m2";
      import * as ns from "m3";
    `;
		const expected = [
			{ kind_: 'side-effect', module_: 'side' },
			{ kind_: 'bindings', module_: 'm1', default_: 'def' },
			{
				kind_: 'bindings',
				module_: 'm2',
				named_: [{ imported_: 'x', local_: 'y' }],
			},
			{ kind_: 'bindings', module_: 'm3', namespace_: 'ns' },
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it('parses with clause on bindings import', () => {
		const src = `import { a } from "m" with { key: "val" }`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				named_: [{ imported_: 'a', local_: 'a' }],
				with_: { key: 'val' },
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});
});

describe('parseImportsOnly - identifier edge-cases', () => {
	it('parses identifier names with Unicode and $ _', () => {
		const src = `import { $foo as _bar, café as caféLocal } from "m";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				named_: [
					{
						imported_: '$foo',
						local_: '_bar',
					},
					{
						imported_: 'café',
						local_: 'caféLocal',
					},
				],
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});

	it("parses 'yield' and 'await' as module export names", () => {
		const src = `import { yield as y, await as a } from "m";`;
		const expected = [
			{
				kind_: 'bindings',
				module_: 'm',
				named_: [
					{ imported_: 'yield', local_: 'y' },
					{ imported_: 'await', local_: 'a' },
				],
			},
		];
		assert.deepEqual(parseImportsOnly_(src), expected);
	});
});

describe('parseImportsOnly - invalid inputs (must be rejected)', () => {
	const shouldThrow = (src: string) => {
		assert.throws(() => parseImportsOnly_(src));
	};

	it('rejects non-import code', () => {
		shouldThrow(`const x = 1;`);
	});

	it('rejects partial import statements', () => {
		// missing closing brace
		shouldThrow(`import { a from "m";`);
		// missing clause
		shouldThrow(`import from "m";`);
		// invalid namespace form
		shouldThrow(`import * as from "m";`);
	});

	it('rejects import with invalid reserved identifier usage', () => {
		// 'import' is reserved and cannot be used as an IdentifierName
		// for bindings
		shouldThrow(`import { x as import } from "m";`);
	});

	it('rejects mixed non-import tokens and imports', () => {
		// anything that is not an import statement should cause rejection
		shouldThrow(`import "a"; let x = 1;`);
	});

	it('rejects malformed with clauses', () => {
		// values must be StringLiteral
		shouldThrow(`import "m" with { key }`);
		// missing key
		shouldThrow(`import "m" with { : "v" }`);
	});
});
