export type Hsv = { hue: number; saturation: number; brightness: number };

export function fromHex(hex: string, fallbackHue = 0): Hsv {
	const red = parseInt(hex.slice(1, 3), 16) / 255;
	const green = parseInt(hex.slice(3, 5), 16) / 255;
	const blue = parseInt(hex.slice(5, 7), 16) / 255;
	const brightness = Math.max(red, green, blue);
	const distance = brightness - Math.min(red, green, blue);
	let hue = fallbackHue;
	if (distance) {
		const sector =
			brightness === red
				? (green - blue) / distance
				: brightness === green
					? (blue - red) / distance + 2
					: (red - green) / distance + 4;
		hue = ((sector + 6) % 6) * 60;
	}
	return { hue, saturation: brightness ? distance / brightness : 0, brightness };
}

export function toHex({ hue, saturation, brightness }: Hsv): string {
	const sector = (hue / 60) % 6;
	const chroma = brightness * saturation;
	const middle = chroma * (1 - Math.abs((sector % 2) - 1));
	const base = brightness - chroma;
	const segments = [
		[chroma, middle, 0],
		[middle, chroma, 0],
		[0, chroma, middle],
		[0, middle, chroma],
		[middle, 0, chroma],
		[chroma, 0, middle]
	];
	const rgb = segments[Math.floor(sector)]!;
	return `#${rgb
		.map((channel) =>
			Math.round((channel + base) * 255)
				.toString(16)
				.padStart(2, "0")
		)
		.join("")}`;
}
