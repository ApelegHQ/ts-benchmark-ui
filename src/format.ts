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

/**
 * Format milliseconds with automatic unit selection.
 */
export function formatTime_(ms: number): string {
	const a = Math.abs(ms);
	const sign = ms < 0 ? '−' : '';
	if (a === 0) return '0.00 ns';
	if (a < 0.000_001) return `${sign}${(a * 1e6).toFixed(2)} ns`;
	if (a < 0.001) return `${sign}${(a * 1e6).toFixed(2)} ns`;
	if (a < 1) return `${sign}${(a * 1e3).toFixed(2)} µs`;
	if (a < 1000) return `${sign}${a.toFixed(3)} ms`;
	return `${sign}${(a / 1000).toFixed(3)} s`;
}

/**
 * Format throughput as operations per second with SI suffix.
 */
export function formatOps_(ms: number): string {
	if (ms <= 0) return '∞ op/s';
	const ops = 1000 / ms;
	if (ops >= 1e12) return `${(ops / 1e12).toFixed(2)}T op/s`;
	if (ops >= 1e9) return `${(ops / 1e9).toFixed(2)}G op/s`;
	if (ops >= 1e6) return `${(ops / 1e6).toFixed(2)}M op/s`;
	if (ops >= 1e3) return `${(ops / 1e3).toFixed(2)}K op/s`;
	return `${ops.toFixed(2)} op/s`;
}

/**
 * Format a speed multiplier: e.g. `1.23×`.
 */
export function formatMultiplier_(r: number): string {
	if (r >= 100) return `${r.toFixed(0)}×`;
	if (r >= 10) return `${r.toFixed(1)}×`;
	return `${r.toFixed(2)}×`;
}

/**
 * Display a p-value in human-readable form.
 */
export function formatPValue_(p: number): string {
	if (p < 0.001) return 'p < 0.001';
	if (p < 0.01) return `p = ${p.toFixed(3)}`;
	return `p = ${p.toFixed(4)}`;
}

/**
 * Significance level string.
 */
export function significance_(p: number): '***' | '**' | '*' | 'n.s.' {
	if (p < 0.001) return '***';
	if (p < 0.01) return '**';
	if (p < 0.05) return '*';
	return 'n.s.';
}

/**
 * Coefficient of variation as a percentage.
 */
export function cvPercent_(f: IFunctionStatistics): number {
	return f.mean > 0 ? (f.stdDev / f.mean) * 100 : 0;
}

/**
 * CSS class for CV color coding.
 */
export function cvClass_(pct: number): string {
	if (pct < 2) return 'text-green';
	if (pct < 5) return 'text-cyan';
	if (pct < 10) return 'text-yellow';
	return 'text-red';
}

/**
 * Locale-formatted number.
 */
export function formatNumber_(n: number): string {
	return n.toLocaleString('en-US');
}
