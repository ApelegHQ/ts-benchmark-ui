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

interface INamedImport {
	imported_: string;
	local_: string;
}

type ImportDecl =
	| {
			kind_: 'side-effect';
			module_: string;
			with_?: Record<string, string>;
	  }
	| {
			kind_: 'bindings';
			module_: string;
			default_?: string;
			namespace_?: string;
			named_?: INamedImport[];
			with_?: Record<string, string>;
	  };

class ParseError extends Error {
	pos: number;

	constructor(message: string, pos: number) {
		super(`${message} at ${pos}`);
		this.pos = pos;
	}
}

export function parseImportsOnly_(source: string): ImportDecl[] {
	const p = new Parser(source);
	const out: ImportDecl[] = [];
	p.skipSpace_();
	while (!p.eof_()) {
		out.push(p.parseImportDeclaration_());
		p.skipSpace_();
	}
	return out;
}

class Parser {
	private i = 0;
	private readonly n: number;
	private readonly s: string;

	constructor(s: string) {
		this.s = s;
		this.n = s.length;
	}

	eof_(): boolean {
		return this.i >= this.n;
	}

	private error_(msg: string): never {
		throw new ParseError(msg, this.i);
	}

	private ch_(offset = 0): string {
		return this.s[this.i + offset];
	}

	skipSpace_(semi?: boolean): boolean {
		let newStatement = false;
		while (!this.eof_()) {
			const c = this.ch_();

			if (
				['\u000A', '\u000D', '\u2028', '\u2029'].includes(c) ||
				(semi && c === ';')
			) {
				this.i++;
				newStatement = true;
				continue;
			}

			if (
				[
					' ',
					'\u00A0',
					'\u0009',
					'\u000B',
					'\u000C',
					'\ufeff',
				].includes(c) ||
				(semi && c === ';') ||
				/\p{Space_Separator}/u.test(c)
			) {
				this.i++;
				continue;
			}

			if (c === '/' && this.ch_(1) === '/') {
				this.i += 2;
				while (
					!this.eof_() &&
					!['\u000a', '\u000d', '\u2028', '\u2029'].includes(
						this.ch_(),
					)
				)
					this.i++;
				newStatement = true;
				continue;
			}

			if (c === '/' && this.ch_(1) === '*') {
				this.i += 2;
				while (!this.eof_()) {
					if (this.ch_() === '*' && this.ch_(1) === '/') {
						this.i += 2;
						break;
					}
					this.i++;
				}
				if (
					this.eof_() &&
					!(this.s[this.i - 2] === '*' && this.s[this.i - 1] === '/')
				) {
					this.error_('Unterminated block comment');
				}
				continue;
			}

			break;
		}

		return newStatement;
	}

	private isIdentStart_(c: string): boolean {
		return (
			(c >= 'A' && c <= 'Z') ||
			(c >= 'a' && c <= 'z') ||
			c === '_' ||
			c === '$' ||
			/\p{ID_Start}/u.test(c)
		);
	}

	private isIdentPart_(c: string): boolean {
		return (
			(c >= 'A' && c <= 'Z') ||
			(c >= 'a' && c <= 'z') ||
			c === '_' ||
			c === '$' ||
			(c >= '0' && c <= '9') ||
			/\p{ID_Continue}/u.test(c)
		);
	}

	private readWord_(): string {
		const start = this.i;
		if (!this.isIdentStart_(this.ch_())) this.error_('Expected identifier');
		this.i++;
		while (this.isIdentPart_(this.ch_())) this.i++;
		return this.s.slice(start, this.i);
	}

	private peekWord_(word: string): boolean {
		if (this.s.slice(this.i, this.i + word.length) !== word) return false;
		const before = this.i > 0 ? this.s[this.i - 1] : '';
		const after = this.s[this.i + word.length] ?? '';
		const beforeOk = !this.isIdentPart_(before);
		const afterOk = !this.isIdentPart_(after);
		return beforeOk && afterOk;
	}

	private expectWord_(word: string): void {
		if (!this.peekWord_(word)) this.error_(`Expected '${word}'`);
		this.i += word.length;
	}

	private expectChar_(c: string): void {
		if (this.ch_() !== c)
			this.error_(
				`Expected '${c}' got ch${this.ch_()}-${this.ch_().charCodeAt(0)} i${this.i} n${this.n} eof${this.eof_()}`,
			);
		this.i++;
	}

	private readStringLiteral_(): string {
		const quote = this.ch_();
		if (quote !== `"` && quote !== `'`) {
			this.error_('Expected string literal');
		}
		this.i++;
		let out = '';
		while (!this.eof_()) {
			const c = this.ch_();
			if (c === quote) {
				this.i++;
				return out;
			}
			if (c === '\\') {
				this.i++;
				if (this.eof_()) this.error_('Unterminated string escape');
				const e = this.ch_();
				out += '\\' + e;
				this.i++;
				continue;
			}
			if (c === '\n' || c === '\r') {
				this.error_('Unterminated string literal');
			}
			out += c;
			this.i++;
		}
		this.error_('Unterminated string literal');
	}

	private readIdentifierName_(): string {
		return this.readWord_();
	}

	private readBindingIdentifier_(): string {
		const start = this.i;
		const name = this.readWord_();
		if (isReservedWord(name)) {
			this.i = start;
			this.error_(
				`Reserved word '${name}' cannot be a binding identifier`,
			);
		}
		return name;
	}

	parseImportDeclaration_(): ImportDecl {
		this.skipSpace_(true);
		this.expectWord_('import');

		this.skipSpace_();

		const next = this.ch_();
		if (next === `"` || next === `'`) {
			this.skipSpace_();
			const module = this.readStringLiteral_();
			this.skipSpace_();
			const withClause = this.tryParseWithClause_();
			if (!this.skipSpace_(true) && !this.eof_()) {
				this.error_('Expected new statement or EOF');
			}
			return withClause
				? { kind_: 'side-effect', module_: module, with_: withClause }
				: { kind_: 'side-effect', module_: module };
		}

		const clause = this.parseImportClause_();
		this.skipSpace_();
		this.expectWord_('from');
		this.skipSpace_();
		const module = this.readStringLiteral_();
		this.skipSpace_();
		const withClause = this.tryParseWithClause_();
		if (!this.skipSpace_(true) && !this.eof_()) {
			this.error_('Expected new statement or EOF');
		}

		return {
			kind_: 'bindings',
			module_: module,
			...clause,
			...(withClause ? { with_: withClause } : null),
		};
	}
	private parseImportClause_(): {
		default_?: string;
		namespace_?: string;
		named_?: INamedImport[];
	} {
		this.skipSpace_();

		if (this.ch_() === '*') {
			const namespace = this.parseNamespaceImport_();
			return { namespace_: namespace };
		}

		if (this.ch_() === '{') {
			const named = this.parseNamedImports_();
			return { named_: named };
		}

		const defaultBinding = this.readBindingIdentifier_();
		this.skipSpace_();

		if (this.ch_() === ',') {
			this.i++;
			this.skipSpace_();
			if (this.ch_() === '*') {
				const namespace = this.parseNamespaceImport_();
				return { default_: defaultBinding, namespace_: namespace };
			}
			if (this.ch_() === '{') {
				const named = this.parseNamedImports_();
				return { default_: defaultBinding, named_: named };
			}
			this.error_("Expected namespace import or named imports after ','");
		}

		return { default_: defaultBinding };
	}

	private parseNamespaceImport_(): string {
		this.expectChar_('*');
		this.skipSpace_();
		this.expectWord_('as');
		this.skipSpace_();
		return this.readBindingIdentifier_();
	}

	private parseNamedImports_(): INamedImport[] {
		const out: INamedImport[] = [];
		this.expectChar_('{');
		this.skipSpace_();

		if (this.ch_() === '}') {
			this.i++;
			return out;
		}

		while (true) {
			out.push(this.parseImportSpecifier_());
			this.skipSpace_();

			if (this.ch_() === ',') {
				this.i++;
				this.skipSpace_();
				if (this.ch_() === '}') {
					this.i++;
					return out;
				}
				continue;
			}

			if (this.ch_() === '}') {
				this.i++;
				return out;
			}

			this.error_("Expected ',' or '}' in named imports");
		}
	}

	private parseImportSpecifier_(): INamedImport {
		this.skipSpace_();

		const next = this.ch_();
		if (next === `"` || next === `'`) {
			const imported = this.readStringLiteral_();
			this.skipSpace_();
			this.expectWord_('as');
			this.skipSpace_();
			const local = this.readBindingIdentifier_();
			return { imported_: imported, local_: local };
		}

		const first = this.readWord_();
		this.skipSpace_();

		if (this.peekWord_('as')) {
			this.expectWord_('as');
			this.skipSpace_();
			const local = this.readBindingIdentifier_();
			return { imported_: first, local_: local };
		}

		if (isReservedWord(first)) {
			this.error_(
				`Reserved word '${first}' cannot be a binding identifier`,
			);
		}

		return { imported_: first, local_: first };
	}

	private tryParseWithClause_(): Record<string, string> | undefined {
		this.skipSpace_();
		if (!this.peekWord_('with')) return undefined;

		this.expectWord_('with');
		this.skipSpace_();
		this.expectChar_('{');
		this.skipSpace_();

		const attrs: Record<string, string> = {};

		if (this.ch_() === '}') {
			this.i++;
			return attrs;
		}

		while (true) {
			const key =
				this.ch_() === `"` || this.ch_() === `'`
					? this.readStringLiteral_()
					: this.readIdentifierName_();

			this.skipSpace_();
			this.expectChar_(':');
			this.skipSpace_();
			const value = this.readStringLiteral_();
			attrs[key] = value;
			this.skipSpace_();

			if (this.ch_() === ',') {
				this.i++;
				this.skipSpace_();
				if (this.ch_() === '}') {
					this.i++;
					return attrs;
				}
				continue;
			}

			if (this.ch_() === '}') {
				this.i++;
				return attrs;
			}

			this.error_("Expected ',' or '}' in with clause");
		}
	}
}

function isReservedWord(word: string): boolean {
	switch (word) {
		case 'await':
		case 'break':
		case 'case':
		case 'catch':
		case 'class':
		case 'const':
		case 'continue':
		case 'debugger':
		case 'default':
		case 'delete':
		case 'do':
		case 'else':
		case 'enum':
		case 'export':
		case 'extends':
		case 'false':
		case 'finally':
		case 'for':
		case 'function':
		case 'if':
		case 'import':
		case 'in':
		case 'instanceof':
		case 'new':
		case 'null':
		case 'return':
		case 'super':
		case 'switch':
		case 'this':
		case 'throw':
		case 'true':
		case 'try':
		case 'typeof':
		case 'var':
		case 'void':
		case 'while':
		case 'with':
		case 'yield':
			return true;
		default:
			return false;
	}
}
