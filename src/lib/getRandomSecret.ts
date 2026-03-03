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
 * Converts a given buffer into a Base16 string (using a custom logic)
 *
 * The conversion is not a standard hexadecimal conversion. It performs specific
 * bitwise operations and character code translations, including:
 *
 * 1. Right shifting the value 4 bits and masking it with 0x0f, then OR'ing it
 * with 0x40.
 * 2. Right shifting the value 0 bits (leaving it unchanged) and masking it with
 * 0x0f, then OR'ing it with 0x40.
 * 3. Adding 1 to both of these values and converting them to ASCII characters.
 *
 * This gives a string with values in the range A-P. This range was chosen
 * because it is an acceptable range for most places and because of the ease
 * of calculation.
 *
 * @param buffer - The buffer that will be converted to a string
 * @returns The string representation of the buffer using the custom logic.
 */
const bufferToHex = (buffer: Uint8Array | number[]) =>
	Array.from(buffer)
		.map((v: number) =>
			String.fromCharCode(
				1 + (0x40 | ((v >> 4) & 0x0f)),
				1 + (0x40 | ((v >> 0) & 0x0f)),
			),
		)
		.join('');

/**
 * Generates a random secret string using the Crypto API.
 *
 * These secrets are as a flag to serve as a rudimentary check for message
 * provenance (browser sandbox), to generate canary parts in the enhanced
 * sandbox wrapper as well as to generate task IDs.
 *
 * @returns The randomly generated secret as a string.
 */
const getRandomSecret_ = crypto.getRandomValues
	? // If crypto.getRandomValues is available, use that.
		(): string =>
			bufferToHex(
				(
					crypto.getRandomValues as unknown as Crypto['getRandomValues']
				)(new Uint8Array(16)),
			)
	: // Otherwise, use fall back to Math.random. The values might be
		// predictable, but it should be fine as the strings generated are not
		// used in contexts that require secrecy as an absolute requirement.
		(): string =>
			bufferToHex(
				new Uint8Array(16).map(() => ((0, Math.random)() * 256) | 0),
			);

export default getRandomSecret_;
