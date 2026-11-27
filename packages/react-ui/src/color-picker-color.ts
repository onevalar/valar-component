export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export type RgbaColor = {
	/** 0..255 */
	r: number;
	/** 0..255 */
	g: number;
	/** 0..255 */
	b: number;
	/** 0..1 */
	a: number;
};

export type HsvaColor = {
	/** 0..360 */
	h: number;
	/** 0..100 */
	s: number;
	/** 0..100 */
	v: number;
	/** 0..1 */
	a: number;
};

export type HslaColor = {
	/** 0..360 */
	h: number;
	/** 0..100 */
	s: number;
	/** 0..100 */
	l: number;
	/** 0..1 */
	a: number;
};

export type OklchaColor = {
	/** 0..1 */
	l: number;
	/** 0..0.4 */
	c: number;
	/** 0..360 */
	h: number;
	/** 0..1 */
	a: number;
};

const HEX_OPAQUE = /^#?([\da-f]{3}|[\da-f]{6})$/i;
const HEX_ANY = /^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 0) => {
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
};

/** Returns lowercase `#rrggbb`; anything other than 3- or 6-digit hex is invalid. */
export function normalizeHex(input: string): string | undefined {
	const match = HEX_OPAQUE.exec(input.trim());
	if (!match) return undefined;
	const raw = match[1]!;
	const digits = raw.length === 3 ? [...raw].map((c) => c + c).join("") : raw;
	return `#${digits.toLowerCase()}`;
}

/**
 * Normalizes 3/6-digit hex and (when `allowAlpha` is true) 4/8-digit hex.
 * Opaque values collapse cleanly to `#rrggbb`; translucent values serialize as `#rrggbbaa`.
 */
export function normalizeHexColor(input: string, allowAlpha = true): string | undefined {
	if (!allowAlpha) return normalizeHex(input);
	const match = HEX_ANY.exec(input.trim());
	if (!match) return undefined;
	const raw = match[1]!;
	let hex8: string;
	if (raw.length === 3) {
		hex8 = `${[...raw].map((c) => c + c).join("")}ff`;
	} else if (raw.length === 4) {
		hex8 = [...raw].map((c) => c + c).join("");
	} else if (raw.length === 6) {
		hex8 = `${raw}ff`;
	} else {
		hex8 = raw;
	}
	const lower = hex8.toLowerCase();
	return lower.endsWith("ff") ? `#${lower.slice(0, 6)}` : `#${lower}`;
}

export function hexToRgba(input: string, allowAlpha = true): RgbaColor | undefined {
	const normalized = normalizeHexColor(input, allowAlpha);
	if (!normalized) return undefined;
	const body = normalized.slice(1);
	const r = Number.parseInt(body.slice(0, 2), 16);
	const g = Number.parseInt(body.slice(2, 4), 16);
	const b = Number.parseInt(body.slice(4, 6), 16);
	const a = body.length === 8 ? Number.parseInt(body.slice(6, 8), 16) / 255 : 1;
	return { r, g, b, a };
}

export function rgbaToHex(rgba: RgbaColor, allowAlpha = true): string {
	const toByte = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
	const base = `#${toByte(rgba.r)}${toByte(rgba.g)}${toByte(rgba.b)}`;
	if (!allowAlpha) return base;
	const alphaByte = clamp(Math.round(rgba.a * 255), 0, 255);
	if (alphaByte >= 255) return base;
	return `${base}${alphaByte.toString(16).padStart(2, "0")}`;
}

export function rgbaToHsva(rgba: RgbaColor, preserveHue = 0): HsvaColor {
	const r = clamp(rgba.r, 0, 255) / 255;
	const g = clamp(rgba.g, 0, 255) / 255;
	const b = clamp(rgba.b, 0, 255) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = preserveHue;
	if (delta > 1e-6) {
		if (max === r) h = 60 * (((g - b) / delta) % 6);
		else if (max === g) h = 60 * ((b - r) / delta + 2);
		else h = 60 * ((r - g) / delta + 4);
		if (h < 0) h += 360;
	}
	const s = max === 0 ? 0 : (delta / max) * 100;
	const v = max * 100;
	return { h: round(h, 2), s: round(s, 2), v: round(v, 2), a: clamp(rgba.a, 0, 1) };
}

export function hsvaToRgba(hsva: HsvaColor): RgbaColor {
	const h = ((hsva.h % 360) + 360) % 360;
	const s = clamp(hsva.s, 0, 100) / 100;
	const v = clamp(hsva.v, 0, 100) / 100;
	const c = v * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = v - c;
	let r1 = 0;
	let g1 = 0;
	let b1 = 0;
	if (h < 60) [r1, g1, b1] = [c, x, 0];
	else if (h < 120) [r1, g1, b1] = [x, c, 0];
	else if (h < 180) [r1, g1, b1] = [0, c, x];
	else if (h < 240) [r1, g1, b1] = [0, x, c];
	else if (h < 300) [r1, g1, b1] = [x, 0, c];
	else [r1, g1, b1] = [c, 0, x];
	return {
		r: Math.round((r1 + m) * 255),
		g: Math.round((g1 + m) * 255),
		b: Math.round((b1 + m) * 255),
		a: clamp(hsva.a, 0, 1),
	};
}

export function rgbaToHsla(rgba: RgbaColor, preserveHue = 0): HslaColor {
	const r = clamp(rgba.r, 0, 255) / 255;
	const g = clamp(rgba.g, 0, 255) / 255;
	const b = clamp(rgba.b, 0, 255) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	const l = (max + min) / 2;

	let h = preserveHue;
	if (delta > 1e-6) {
		if (max === r) h = 60 * (((g - b) / delta) % 6);
		else if (max === g) h = 60 * ((b - r) / delta + 2);
		else h = 60 * ((r - g) / delta + 4);
		if (h < 0) h += 360;
	}
	const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	return {
		h: Math.round(h) % 360,
		s: Math.round(s * 100),
		l: Math.round(l * 100),
		a: clamp(rgba.a, 0, 1),
	};
}

export function hslaToRgba(hsla: HslaColor): RgbaColor {
	const h = ((hsla.h % 360) + 360) % 360;
	const s = clamp(hsla.s, 0, 100) / 100;
	const l = clamp(hsla.l, 0, 100) / 100;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let r1 = 0;
	let g1 = 0;
	let b1 = 0;
	if (h < 60) [r1, g1, b1] = [c, x, 0];
	else if (h < 120) [r1, g1, b1] = [x, c, 0];
	else if (h < 180) [r1, g1, b1] = [0, c, x];
	else if (h < 240) [r1, g1, b1] = [0, x, c];
	else if (h < 300) [r1, g1, b1] = [x, 0, c];
	else [r1, g1, b1] = [c, 0, x];
	return {
		r: Math.round((r1 + m) * 255),
		g: Math.round((g1 + m) * 255),
		b: Math.round((b1 + m) * 255),
		a: clamp(hsla.a, 0, 1),
	};
}

const srgbToLinear = (c: number) =>
	c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (c: number) =>
	c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

export function rgbaToOklcha(rgba: RgbaColor, preserveHue = 0): OklchaColor {
	const r = srgbToLinear(clamp(rgba.r, 0, 255) / 255);
	const g = srgbToLinear(clamp(rgba.g, 0, 255) / 255);
	const b = srgbToLinear(clamp(rgba.b, 0, 255) / 255);

	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const bLab = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	const C = Math.hypot(a, bLab);
	let H = preserveHue;
	if (C > 1e-4) {
		H = (Math.atan2(bLab, a) * 180) / Math.PI;
		if (H < 0) H += 360;
	}
	return {
		l: round(clamp(L, 0, 1), 3),
		c: round(clamp(C, 0, 0.4), 3),
		h: round(H, 1),
		a: clamp(rgba.a, 0, 1),
	};
}

export function oklchaToRgba(oklcha: OklchaColor): RgbaColor {
	const L = clamp(oklcha.l, 0, 1);
	const C = clamp(oklcha.c, 0, 0.4);
	const hRad = ((((oklcha.h % 360) + 360) % 360) * Math.PI) / 180;
	const a = C * Math.cos(hRad);
	const b = C * Math.sin(hRad);

	const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = L - 0.0894841775 * a - 1.291485548 * b;

	const l = l_ * l_ * l_;
	const m = m_ * m_ * m_;
	const s = s_ * s_ * s_;

	const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	return {
		r: Math.round(clamp(linearToSrgb(clamp(rLin, 0, 1)), 0, 1) * 255),
		g: Math.round(clamp(linearToSrgb(clamp(gLin, 0, 1)), 0, 1) * 255),
		b: Math.round(clamp(linearToSrgb(clamp(bLin, 0, 1)), 0, 1) * 255),
		a: clamp(oklcha.a, 0, 1),
	};
}

function parseAlphaToken(token: string | undefined): number | undefined {
	if (!token) return 1;
	const trimmed = token.trim();
	if (trimmed.endsWith("%")) {
		const n = Number.parseFloat(trimmed.slice(0, -1));
		return Number.isFinite(n) ? clamp(n / 100, 0, 1) : undefined;
	}
	const n = Number.parseFloat(trimmed);
	return Number.isFinite(n) ? clamp(n, 0, 1) : undefined;
}

/** Parses HEX/HEX8, RGB/RGBA, HSL/HSLA, and OKLCH CSS color strings. */
export function parseColorInput(input: string, allowAlpha = true): RgbaColor | undefined {
	const trimmed = input.trim();
	const fromHex = hexToRgba(trimmed, allowAlpha);
	if (fromHex) return fromHex;

	const rgbMatch =
		/^rgba?\(\s*([+-]?\d*\.?\d+)\s*[,\s]\s*([+-]?\d*\.?\d+)\s*[,\s]\s*([+-]?\d*\.?\d+)(?:\s*[,/]\s*([+-]?\d*\.?\d+%?))?\s*\)$/i.exec(
			trimmed
		);
	if (rgbMatch) {
		const a = parseAlphaToken(rgbMatch[4]);
		if (a === undefined) return undefined;
		return {
			r: clamp(Math.round(Number.parseFloat(rgbMatch[1]!)), 0, 255),
			g: clamp(Math.round(Number.parseFloat(rgbMatch[2]!)), 0, 255),
			b: clamp(Math.round(Number.parseFloat(rgbMatch[3]!)), 0, 255),
			a: allowAlpha ? a : 1,
		};
	}

	const hslMatch =
		/^hsla?\(\s*([+-]?\d*\.?\d+)(?:deg)?\s*[,\s]\s*([+-]?\d*\.?\d+)%?\s*[,\s]\s*([+-]?\d*\.?\d+)%?(?:\s*[,/]\s*([+-]?\d*\.?\d+%?))?\s*\)$/i.exec(
			trimmed
		);
	if (hslMatch) {
		const a = parseAlphaToken(hslMatch[4]);
		if (a === undefined) return undefined;
		return hslaToRgba({
			h: Number.parseFloat(hslMatch[1]!),
			s: Number.parseFloat(hslMatch[2]!),
			l: Number.parseFloat(hslMatch[3]!),
			a: allowAlpha ? a : 1,
		});
	}

	const oklchMatch =
		/^oklch\(\s*([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(?:deg)?(?:\s*\/\s*([+-]?\d*\.?\d+%?))?\s*\)$/i.exec(
			trimmed
		);
	if (oklchMatch) {
		const a = parseAlphaToken(oklchMatch[5]);
		if (a === undefined) return undefined;
		const rawL = Number.parseFloat(oklchMatch[1]!);
		const l = oklchMatch[2] === "%" ? rawL / 100 : rawL;
		return oklchaToRgba({
			l,
			c: Number.parseFloat(oklchMatch[3]!),
			h: Number.parseFloat(oklchMatch[4]!),
			a: allowAlpha ? a : 1,
		});
	}

	return undefined;
}

export function formatColor(
	rgba: RgbaColor,
	format: ColorFormat,
	allowAlpha = true,
	preserveHue = 0
): string {
	const alphaPct = Math.round(clamp(rgba.a, 0, 1) * 100);
	const showAlpha = allowAlpha && alphaPct < 100;
	if (format === "hex") {
		return rgbaToHex(rgba, allowAlpha);
	}
	if (format === "rgb") {
		const r = clamp(Math.round(rgba.r), 0, 255);
		const g = clamp(Math.round(rgba.g), 0, 255);
		const b = clamp(Math.round(rgba.b), 0, 255);
		return showAlpha ? `rgb(${r} ${g} ${b} / ${alphaPct}%)` : `rgb(${r} ${g} ${b})`;
	}
	if (format === "hsl") {
		const { h, s, l } = rgbaToHsla(rgba, preserveHue);
		return showAlpha ? `hsl(${h} ${s}% ${l}% / ${alphaPct}%)` : `hsl(${h} ${s}% ${l}%)`;
	}
	const { l, c, h } = rgbaToOklcha(rgba, preserveHue);
	return showAlpha ? `oklch(${l} ${c} ${h} / ${alphaPct}%)` : `oklch(${l} ${c} ${h})`;
}

export function rgbaToCss(rgba: RgbaColor): string {
	const r = clamp(Math.round(rgba.r), 0, 255);
	const g = clamp(Math.round(rgba.g), 0, 255);
	const b = clamp(Math.round(rgba.b), 0, 255);
	const a = round(clamp(rgba.a, 0, 1), 3);
	return a >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${a})`;
}

/**
 * Returns true when dark foreground ink has better WCAG contrast over this color than white.
 * For translucent colors, composites against a mid-light surface so checkmarks remain legible.
 */
export function isLightColor(rgba: RgbaColor): boolean {
	const a = clamp(rgba.a, 0, 1);
	const bg = 235;
	const r = (rgba.r * a + bg * (1 - a)) / 255;
	const g = (rgba.g * a + bg * (1 - a)) / 255;
	const b = (rgba.b * a + bg * (1 - a)) / 255;
	const lum = 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
	return lum > 0.36;
}
