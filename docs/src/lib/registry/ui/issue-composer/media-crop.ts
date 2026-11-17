export type IssueImageCrop = { left: number; top: number; right: number; bottom: number };

export const fullImageCrop: IssueImageCrop = { left: 0, top: 0, right: 1, bottom: 1 };

export function readImageCrop(value: unknown): IssueImageCrop | undefined {
	if (!value || typeof value !== "object") return;
	const { left, top, right, bottom } = value as Partial<IssueImageCrop>;
	if (
		typeof left !== "number" ||
		typeof top !== "number" ||
		typeof right !== "number" ||
		typeof bottom !== "number"
	)
		return;
	if (!(left >= 0 && top >= 0 && right <= 1 && bottom <= 1 && right > left && bottom > top)) return;
	return { left, top, right, bottom };
}

export async function cropIssueImage(source: string, bounds: IssueImageCrop): Promise<Blob> {
	const image = new Image();
	if (/^https?:/.test(source)) image.crossOrigin = "anonymous";
	image.src = source;
	await image.decode();
	const left = Math.min(image.naturalWidth - 1, Math.round(bounds.left * image.naturalWidth));
	const top = Math.min(image.naturalHeight - 1, Math.round(bounds.top * image.naturalHeight));
	const width = Math.max(1, Math.round(bounds.right * image.naturalWidth) - left);
	const height = Math.max(1, Math.round(bounds.bottom * image.naturalHeight) - top);
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Canvas is unavailable");
	context.drawImage(image, left, top, width, height, 0, 0, width, height);
	return new Promise((resolve, reject) =>
		canvas.toBlob((value) => {
			if (value) resolve(value);
			else reject(new Error("Unable to crop image"));
		}, "image/png")
	);
}
