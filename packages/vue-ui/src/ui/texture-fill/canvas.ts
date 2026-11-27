// TokenPlan DitherFill.tsx, revision c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4, via Valar Texture Fill.
// Copyright (c) 2026 Robin Ebers (OpenUsage), onevalar (TokenPlan modifications); MIT (see LICENSE).
// Keep in sync with packages/react-ui/src/texture-fill-canvas.ts; both SDKs ship standalone.
export const textures = ["dither", "lines", "halftone", "hatch"] as const;
export type Texture = (typeof textures)[number];
export type FillTexture = Texture | "solid";

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const BAND = 46;
const STIFFNESS = 140;
const TRACK = 0.55;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
	const t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};

const cover: Record<FillTexture, (x: number, y: number, fill: number, px: number) => number> = {
	dither(x, y, fill) {
		const size = 3.5;
		const i = Math.floor(x / size);
		const j = Math.floor(y / size);
		if (BAYER[(j & 3) * 4 + (i & 3)] >= lerp(4.5, 16.5, fill)) return 0;
		const dot = size * lerp(0.62, 1.01, smooth(0.55, 0.95, fill));
		return x - i * size < dot && y - j * size < dot ? 1 : 0;
	},
	lines(x, _y, fill, px) {
		return clamp((lerp(1, 4.2, Math.pow(fill, 1.6)) - Math.abs((x % 8) - 4)) / px + 0.5, 0, 1);
	},
	halftone(x, y, fill, px) {
		const pitch = 5;
		const radius = lerp(1.05, 3.4, fill);
		const row = Math.floor(y / pitch);
		let distance = Infinity;
		for (let j = row - 1; j <= row + 1; j++) {
			const offset = j & 1 ? pitch / 2 : 0;
			const cx = Math.round((x - offset - pitch / 2) / pitch) * pitch + offset + pitch / 2;
			const cy = j * pitch + pitch / 2;
			for (let dx = -pitch; dx <= pitch; dx += pitch) {
				distance = Math.min(distance, Math.hypot(x - cx - dx, y - cy));
			}
		}
		return clamp((radius - distance) / px + 0.5, 0, 1);
	},
	hatch(x, y, fill, px) {
		const u = (((x + y) % 8) + 8) % 8;
		return clamp(
			(lerp(0.7, 3, Math.pow(fill, 1.4)) - Math.abs(u - 4) / Math.SQRT2) / px + 0.5,
			0,
			1
		);
	},
	solid(_x, _y, fill) {
		return fill >= 0.5 ? 1 : 0;
	},
};

function paintTexture(
	image: ImageData,
	fill: Float32Array,
	alpha: Float32Array,
	texture: FillTexture,
	rgb: Uint8ClampedArray,
	px: number,
	width: number,
	position: number,
	velocity: number,
	spread: number
) {
	const edge = position * width;
	const band = Math.min(BAND, edge * 2, (width - edge) * 2) + spread;
	const center = edge - Math.sign(velocity) * spread * 0.18;
	const lo = Math.max(center - band / 2, edge * 0.45);
	const hi = Math.max(lo + 1e-3, center + band / 2);
	for (let x = 0; x < image.width; x++) {
		const amount = edge <= 0 ? 0 : 1 - smooth(lo, hi, (x + 0.5) * px);
		fill[x] = amount;
		alpha[x] = lerp(TRACK, 1, smooth(0.15, 0.85, amount)) * 255;
	}
	const { data } = image;
	const coverage = cover[texture];
	for (let y = 0, offset = 0; y < image.height; y++) {
		for (let x = 0; x < image.width; x++, offset += 4) {
			const amount = fill[x];
			data[offset] = rgb[0];
			data[offset + 1] = rgb[1];
			data[offset + 2] = rgb[2];
			data[offset + 3] =
				(amount > 0.995 ? 1 : coverage((x + 0.5) * px, (y + 0.5) * px, amount, px)) * alpha[x];
		}
	}
}

function context2d(canvas: HTMLCanvasElement) {
	const context = canvas.getContext("2d");
	if (!context) throw new Error("TextureFill requires a Canvas 2D context");
	return context;
}

/** Owns one canvas, one texture, and only browser-side resources. */
export function createTextureFill(
	element: HTMLElement,
	canvas: HTMLCanvasElement,
	texture: FillTexture,
	value: number,
	intro: boolean
) {
	const context = context2d(canvas);
	const colorCanvas = document.createElement("canvas");
	colorCanvas.width = colorCanvas.height = 1;
	const colorContext = context2d(colorCanvas);
	const motion = matchMedia("(prefers-reduced-motion: reduce)");
	let target = clamp(value / 100, 0, 1);
	let position = intro && !motion.matches ? 0 : target;
	let velocity = 0;
	let spread = 0;
	let width = 0;
	let dpr = 1;
	let raf: number | undefined;
	let last = 0;
	let color = "";
	const rgb = new Uint8ClampedArray(3);
	let image: ImageData | undefined;
	let fill = new Float32Array(0);
	let alpha = new Float32Array(0);
	let resolution: MediaQueryList | undefined;
	let disposed = false;

	function draw() {
		if (!image || disposed) return;
		const current = getComputedStyle(element).color;
		if (current !== color) {
			color = current;
			colorContext.clearRect(0, 0, 1, 1);
			colorContext.fillStyle = current;
			colorContext.fillRect(0, 0, 1, 1);
			rgb.set(colorContext.getImageData(0, 0, 1, 1).data.subarray(0, 3));
		}
		paintTexture(image, fill, alpha, texture, rgb, 1 / dpr, width, position, velocity, spread);
		context.putImageData(image, 0, 0);
	}

	function snap() {
		if (raf !== undefined) cancelAnimationFrame(raf);
		raf = undefined;
		position = target;
		velocity = spread = 0;
	}

	function frame(now: number) {
		raf = undefined;
		if (disposed) return;
		const dt = clamp((now - last) / 1000, 0, 0.033);
		last = now;
		if (motion.matches || !width) {
			snap();
		} else {
			velocity +=
				(STIFFNESS * (target - position) - (2 * Math.sqrt(STIFFNESS) * velocity) / width) *
				width *
				dt;
			position += (velocity / width) * dt;
			if (Math.abs(target - position) < 1e-4 && Math.abs(velocity) < 0.5) {
				position = target;
				velocity = 0;
			}
			const want = Math.min(170, Math.abs(velocity) * 0.4);
			spread += (want - spread) * (1 - Math.exp(-dt * (want > spread ? 18 : 5)));
			if (!want && spread < 0.05) spread = 0;
			if (position !== target || velocity !== 0 || spread > 0) raf = requestAnimationFrame(frame);
		}
		draw();
	}

	function kick() {
		if (disposed) return;
		if (motion.matches || !width) {
			snap();
			draw();
		} else if (raf === undefined && (position !== target || velocity !== 0 || spread > 0)) {
			last = performance.now();
			raf = requestAnimationFrame(frame);
		}
	}

	function resize() {
		if (disposed) return;
		const rect = element.getBoundingClientRect();
		dpr = Math.min(devicePixelRatio || 1, 3);
		width = rect.width;
		const nextWidth = Math.max(1, Math.round(rect.width * dpr));
		const nextHeight = Math.max(1, Math.round(rect.height * dpr));
		if (!image || image.width !== nextWidth || image.height !== nextHeight) {
			canvas.width = nextWidth;
			canvas.height = nextHeight;
			image = context.createImageData(nextWidth, nextHeight);
			fill = new Float32Array(nextWidth);
			alpha = new Float32Array(nextWidth);
		}
		if (!motion.matches && width) draw();
		kick();
	}

	function watchResolution() {
		if (disposed) return;
		resolution?.removeEventListener("change", watchResolution);
		resolution = matchMedia(`(resolution: ${devicePixelRatio || 1}dppx)`);
		resolution.addEventListener("change", watchResolution);
		resize();
	}

	const recolor = new MutationObserver(() => {
		if (raf === undefined) draw();
	});
	for (let node: Element | null = element; node; node = node.parentElement) {
		recolor.observe(node, { attributes: true });
	}
	const observer = new ResizeObserver(resize);
	observer.observe(element);
	motion.addEventListener("change", kick);
	watchResolution();

	return {
		update(next: number) {
			if (disposed) return;
			target = clamp(next / 100, 0, 1);
			kick();
		},
		destroy() {
			disposed = true;
			observer.disconnect();
			recolor.disconnect();
			motion.removeEventListener("change", kick);
			resolution?.removeEventListener("change", watchResolution);
			if (raf !== undefined) cancelAnimationFrame(raf);
			raf = undefined;
		},
	};
}
