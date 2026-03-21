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

import type { IFunctionStatistics } from '@apeleghq/benchmark/types';

const getLocale = () => {
	return document.documentElement.lang || 'en';
};

const unitMap = Object.fromEntries([
	/*
	['attosecond', 'as'],
	['femtosecond', 'fs'],
	['femtosecond', 'fs'],
	['picosecond', 'ps'],
	*/
	['nanosecond', 'ns'],
	['microsecond', 'µs'],
	['millisecond', 'ms'],
	['second', 's'],
]);

const timeFormatFactory = (locale: string, unit: string) => {
	try {
		const formatter = new Intl.NumberFormat(locale, {
			style: 'unit',
			unit: unit,
			unitDisplay: 'short',
			minimumFractionDigits: 3,
			maximumFractionDigits: 3,
		});

		return (n: number) => formatter.format(n);
	} catch (e) {
		void e;

		try {
			const formatter = new Intl.NumberFormat(locale, {
				style: 'decimal',
				minimumFractionDigits: 3,
				maximumFractionDigits: 3,
			});

			return (n: number) =>
				`${formatter.format(n)} ${unitMap[unit] || unit}`;
		} catch (e) {
			void e;

			return (n: number) => `${n.toFixed(3)} ${unitMap[unit] || unit}`;
		}
	}
};

const memoisedTimeFormatFactory = (() => {
	const map = Object.create(null) as Record<
		string,
		Record<string, (n: number) => string>
	>;

	return (locale: string, unit: string) => {
		if (!map[locale]) {
			map[locale] = Object.create(null);
		}
		if (!map[locale][unit]) {
			map[locale][unit] = timeFormatFactory(locale, unit);
		}

		return map[locale][unit];
	};
})();

const formatTimeHelper = (unit: string, n: number) => {
	const locale = getLocale();

	return memoisedTimeFormatFactory(locale, unit)(n);
};

/**
 * Format milliseconds with automatic unit selection.
 */
export const formatTime_ = (ms: number): string => {
	const a = Math.abs(ms);
	if (a === 0) return formatTimeHelper('nanosecond', 0);
	/*
	if (a < 0.000_000_000_001) return formatTimeHelper('attosecond', a * 1e15);
	if (a < 0.000_000_001) return formatTimeHelper('picosecond', a * 1e12);
	if (a < 0.000_001) return formatTimeHelper('picosecond', a * 1e9);
	*/
	if (a < 0.001) return formatTimeHelper('nanosecond', ms * 1e6);
	if (a < 1) return formatTimeHelper('microsecond', ms * 1e3);
	if (a < 1000) return formatTimeHelper('millisecond', ms * 1);
	return formatTimeHelper('second', ms * 1e-3);
}

////

const opsPerSFactory = (locale: string) => {
	try {
		const formatter = new Intl.NumberFormat(locale, {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			notation: 'compact',
		});

		return (n: number) => `${formatter.format(n)}`;
	} catch (e) {
		void e;

		return (n: number) => {
			if (n >= 1e18) return `${(n / 1e18).toFixed(2)}\u202fE`;
			if (n >= 1e15) return `${(n / 1e15).toFixed(2)}\u202fP`;
			if (n >= 1e12) return `${(n / 1e12).toFixed(2)}\u202fT`;
			if (n >= 1e9) return `${(n / 1e9).toFixed(2)}\u202fG`;
			if (n >= 1e6) return `${(n / 1e6).toFixed(2)}\u202fM`;
			if (n >= 1e3) return `${(n / 1e3).toFixed(2)}\u202fk`;

			return `${n.toFixed(2)}`;
		};
	}
};

/**
 * Format throughput as operations per second with SI suffix.
 */
export const formatOps_ = (() => {
	const locale = getLocale();
	const opPerS = opsPerSFactory(locale);

	return (ms: number) => {
		if (ms <= 0) return '\u221e';
		const ops = 1000 / ms;

		return opPerS(ops);
	};
})();

/**
 * Format a speed multiplier: e.g. `1.23×`.
 */
export const formatMultiplier_ = (() => {
	try {
		const locale = getLocale();
		const formatter = new Intl.NumberFormat(locale, {
			style: 'decimal',
			notation: 'compact',
			minimumSignificantDigits: 3,
			maximumSignificantDigits: 3,
		});

		return (r: number) => `${formatter.format(r)}×`;
	} catch (e) {
		void e;

		return (r: number): string => {
			if (r >= 100) return `${r.toFixed(0)}×`;
			if (r >= 10) return `${r.toFixed(1)}×`;
			return `${r.toFixed(2)}×`;
		};
	}
})();

/**
 * Display a p-value in human-readable form.
 */
export const formatPValue_ = (() => {
	try {
		const locale = getLocale();
		const formatter = new Intl.NumberFormat(locale, {
			style: 'decimal',
			notation: 'compact',
			minimumSignificantDigits: 1,
			maximumSignificantDigits: 2,
		});

		return (p: number) => {
			if (p < 1e-3) return `p < ${formatter.format(1e-3)}`;

			return `p = ${formatter.format(p)}`;
		};
	} catch (e) {
		void e;

		return (p: number): string => {
			if (p < 0.001) return 'p < 0.001';
			if (p < 0.01) return `p = ${p.toFixed(3)}`;

			return `p = ${p.toFixed(2)}`;
		};
	}
})();

/**
 * Significance level string.
 */
export const significance_ = (p: number): '***' | '**' | '*' | 'n.s.' => {
	if (p < 0.001) return '***';
	if (p < 0.01) return '**';
	if (p < 0.05) return '*';
	return 'n.s.';
}

/**
 * Coefficient of variation.
 */
export const cv_ = (f: IFunctionStatistics): number => {
	return f.mean > 0 ? f.stdDev / f.mean : 0;
}

/**
 * CSS class for CV color coding.
 */
export const cvClass_ = (cv: number): string => {
	if (cv < 0.02) return 'text-green';
	if (cv < 0.05) return 'text-cyan';
	if (cv < 0.1) return 'text-yellow';
	return 'text-red';
}

/**
 * Locale-formatted number.
 */
export const formatNumber_ = (n: number): string => {
	const locale = getLocale();
	return n.toLocaleString(locale);
}

export const formatPercent_ = (() => {
	try {
		const locale = getLocale();
		const formatter = new Intl.NumberFormat(locale, {
			style: 'percent',
			notation: 'compact',
			minimumSignificantDigits: 3,
			maximumSignificantDigits: 3,
		});

		return (n: number) => formatter.format(n);
	} catch (e) {
		void e;

		return (n: number): string => {
			if (n >= 1) {
				return `${(n * 100).toFixed(0)}%`;
			} else if (n >= 0.1) {
				return `${(n * 100).toFixed(1)}%`;
			} else if (n >= 0.01) {
				return `${(n * 100).toFixed(2)}%`;
			} else {
				return `${(n * 100).toFixed(3)}%`;
			}
		};
	}
})();

export const format3SD_ = (() => {
	try {
		const locale = getLocale();
		const formatter = new Intl.NumberFormat(locale, {
			style: 'decimal',
			notation: 'compact',
			minimumSignificantDigits: 3,
			maximumSignificantDigits: 3,
		});

		return (n: number) => formatter.format(n);
	} catch (e) {
		void e;

		return (n: number): string => {
			const a = Math.abs(n);
			if (a >= 100) {
				return `${n.toFixed(0)}`;
			}
			if (a >= 10) {
				return `${n.toFixed(1)}`;
			} else if (a >= 1) {
				return `${n.toFixed(2)}`;
			} else if (a >= 0.1) {
				return `${n.toFixed(3)}`;
			} else if (a >= 0.01) {
				return `${n.toFixed(4)}`;
			} else {
				return `${n.toFixed(5)}`;
			}
		};
	}
})();
