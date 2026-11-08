// Native adaptation of TokenPlan DitherFill.tsx. Copyright (c) 2026 onevalar.
// MIT: see LICENSE.md. This file has no Arc Pro provenance or dependency.
export const textures = ["dither", "lines", "halftone", "hatch"] as const;
export type Texture = (typeof textures)[number];
export type FillTexture = Texture | "solid";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const BAND = 46,
	STIFFNESS = 140,
	TRACK = 0.55;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
	const t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};
const cover: Record<FillTexture, (x: number, y: number, fill: number, px: number) => number> = {
	dither(x, y, fill) {
		const size = 3.5,
			i = Math.floor(x / size),
			j = Math.floor(y / size);
		if (BAYER[(j & 3) * 4 + (i & 3)] >= lerp(4.5, 16.5, fill)) return 0;
		const dot = size * lerp(0.62, 1.01, smooth(0.55, 0.95, fill));
		return x - i * size < dot && y - j * size < dot ? 1 : 0;
	},
	lines(x, _y, fill, px) {
		return clamp((lerp(1, 4.2, Math.pow(fill, 1.6)) - Math.abs((x % 8) - 4)) / px + 0.5, 0, 1);
	},
	halftone(x, y, fill, px) {
		const pitch = 5,
			radius = lerp(1.05, 3.4, fill),
			row = Math.floor(y / pitch);
		let distance = 1e9;
		for (let j = row - 1; j <= row + 1; j++) {
			const offset = j & 1 ? pitch / 2 : 0;
			const cx = Math.round((x - offset - pitch / 2) / pitch) * pitch + offset + pitch / 2;
			const cy = j * pitch + pitch / 2;
			for (const dx of [-pitch, 0, pitch])
				distance = Math.min(distance, Math.hypot(x - cx - dx, y - cy));
		}
		return clamp((radius - distance) / px + 0.5, 0, 1);
	},
	solid(_x, _y, fill) {
		return fill >= 0.5 ? 1 : 0;
	},
	hatch(x, y, fill, px) {
		const u = (((x + y) % 8) + 8) % 8;
		return clamp(
			(lerp(0.7, 3, Math.pow(fill, 1.4)) - Math.abs(u - 4) / Math.SQRT2) / px + 0.5,
			0,
			1
		);
	},
};

/** Browser-only lifecycle owned by the component effect. No work survives destroy(). */
export function createTextureFill(
	el: HTMLSpanElement,
	canvas: HTMLCanvasElement,
	texture: FillTexture,
	value: number,
	intro: boolean
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("TextureFill requires a Canvas 2D context");
	const motion = matchMedia("(prefers-reduced-motion: reduce)");
	const colorCanvas = document.createElement("canvas");
	colorCanvas.width = colorCanvas.height = 1;
	const colorContext = colorCanvas.getContext("2d");
	if (!colorContext) throw new Error("TextureFill requires a Canvas 2D color context");
	const s = {
		pos: intro && !motion.matches ? 0 : clamp(value / 100, 0, 1),
		target: clamp(value / 100, 0, 1),
		vel: 0,
		spread: 0,
		w: 0,
		dpr: 1,
		raf: 0,
		last: 0,
		color: "",
		rgb: [0, 0, 0],
	};
	let image: ImageData | null = null;
	let disposed = false;
	function draw() {
		if (!image || disposed) return;
		const color = getComputedStyle(el).color;
		if (color !== s.color) {
			s.color = color;
			colorContext!.fillStyle = color;
			colorContext!.fillRect(0, 0, 1, 1);
			s.rgb = [...colorContext!.getImageData(0, 0, 1, 1).data.slice(0, 3)];
		}
		const width = image.width,
			height = image.height,
			data = image.data,
			px = 1 / s.dpr,
			edge = s.pos * s.w;
		const band = Math.min(BAND, edge * 2, (s.w - edge) * 2) + s.spread;
		const center = edge - Math.sign(s.vel) * s.spread * 0.18;
		const lo = Math.max(center - band / 2, edge * 0.45),
			hi = Math.max(lo + 1e-3, center + band / 2);
		const fill = new Float32Array(width),
			alpha = new Float32Array(width);
		for (let i = 0; i < width; i++) {
			const amount = edge <= 0 ? 0 : 1 - smooth(lo, hi, (i + 0.5) * px);
			fill[i] = amount;
			alpha[i] = lerp(TRACK, 1, smooth(0.15, 0.85, amount)) * 255;
		}
		for (let y = 0, offset = 0; y < height; y++) {
			for (let x = 0; x < width; x++, offset += 4) {
				const amount = fill[x];
				data[offset] = s.rgb[0];
				data[offset + 1] = s.rgb[1];
				data[offset + 2] = s.rgb[2];
				data[offset + 3] =
					(amount > 0.995 ? 1 : cover[texture]((x + 0.5) * px, (y + 0.5) * px, amount, px)) *
					alpha[x];
			}
		}
		ctx!.putImageData(image, 0, 0);
	}
	function frame(now: number) {
		if (disposed) return;
		const dt = Math.min(0.033, (now - s.last) / 1000);
		s.last = now;
		if (motion.matches || !s.w) {
			s.pos = s.target;
			s.vel = 0;
			s.spread = 0;
		} else {
			s.vel +=
				(STIFFNESS * (s.target - s.pos) - (2 * Math.sqrt(STIFFNESS) * s.vel) / s.w) * s.w * dt;
			s.pos += (s.vel / s.w) * dt;
			if (Math.abs(s.target - s.pos) < 1e-4 && Math.abs(s.vel) < 0.5) {
				s.pos = s.target;
				s.vel = 0;
			}
			const want = Math.min(170, Math.abs(s.vel) * 0.4);
			s.spread += (want - s.spread) * (1 - Math.exp(-dt * (want > s.spread ? 18 : 5)));
			if (!want && s.spread < 0.05) s.spread = 0;
		}
		draw();
		s.raf = s.pos !== s.target || s.spread > 0 ? requestAnimationFrame(frame) : 0;
	}
	function kick() {
		if (disposed) return;
		if (motion.matches) {
			cancelAnimationFrame(s.raf);
			s.raf = 0;
			s.pos = s.target;
			s.vel = 0;
			s.spread = 0;
			draw();
		} else if (!s.raf) {
			s.last = performance.now();
			s.raf = requestAnimationFrame(frame);
		}
	}
	function resize() {
		const rect = el.getBoundingClientRect();
		s.dpr = Math.min(devicePixelRatio || 1, 3);
		s.w = rect.width;
		canvas.width = Math.max(1, Math.round(rect.width * s.dpr));
		canvas.height = Math.max(1, Math.round(rect.height * s.dpr));
		image = ctx!.createImageData(canvas.width, canvas.height);
		draw();
		kick();
	}
	const recolor = new MutationObserver(() => {
		if (!s.raf) draw();
	});
	for (let node: Element | null = el; node; node = node.parentElement)
		recolor.observe(node, { attributes: true });
	const observer = new ResizeObserver(resize);
	observer.observe(el);
	motion.addEventListener("change", kick);
	resize();
	return {
		update(next: number) {
			s.target = clamp(next / 100, 0, 1);
			kick();
		},
		destroy() {
			disposed = true;
			observer.disconnect();
			recolor.disconnect();
			motion.removeEventListener("change", kick);
			cancelAnimationFrame(s.raf);
		},
	};
}
