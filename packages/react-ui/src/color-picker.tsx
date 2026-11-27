"use client";

import * as React from "react";
import {
	ColorPicker as SdkColorPicker,
	createColorPickerController,
} from "@ui-sdk/react/color-picker";
import { cn } from "cn";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";
import {
	formatColor,
	hexToRgba,
	hslaToRgba,
	hsvaToRgba,
	isLightColor,
	normalizeHex,
	normalizeHexColor,
	oklchaToRgba,
	parseColorInput,
	rgbaToCss,
	rgbaToHex,
	rgbaToHsla,
	rgbaToHsva,
	rgbaToOklcha,
	type ColorFormat,
	type HslaColor,
	type HsvaColor,
	type OklchaColor,
	type RgbaColor,
} from "./color-picker-color.ts";

export {
	formatColor,
	hexToRgba,
	hslaToRgba,
	hsvaToRgba,
	isLightColor,
	normalizeHex,
	normalizeHexColor,
	oklchaToRgba,
	parseColorInput,
	rgbaToCss,
	rgbaToHex,
	rgbaToHsla,
	rgbaToHsva,
	rgbaToOklcha,
	type ColorFormat,
	type HslaColor,
	type HsvaColor,
	type OklchaColor,
	type RgbaColor,
};

export type ColorPickerContentProps = Omit<React.ComponentProps<typeof PopoverContent>, "children">;

export interface ColorPickerProps extends Omit<
	React.ComponentProps<"div">,
	"children" | "onChange"
> {
	/** Visible label; also names the trigger and inputs. */
	label: string;
	/** Hex color such as `#1e40af` (or `#1e40af80` when `alpha` is enabled). */
	value?: string;
	/** Initial hex color for uncontrolled usage. */
	defaultValue?: string;
	/** Optional swatches offered for one-click selection. */
	presets?: readonly string[];
	/** Enables the alpha slider, checkerboard preview and translucent `#rrggbbaa` values. */
	alpha?: boolean;
	/** Initial color input & copy format. */
	format?: ColorFormat;
	/** Remembers recently selected colors in the browser. */
	showRecent?: boolean;
	/** Storage key for recent colors when `showRecent` is true. */
	recentKey?: string;
	disabled?: boolean;
	/** Submitted as the normalized hex value (`#rrggbb` or `#rrggbbaa`). */
	name?: string;
	contentProps?: ColorPickerContentProps;
	onValueChange?: (value: string) => void;
}

const MAX_RECENT = 8;
const DEFAULT_RECENT_KEY = "valar-color-picker-recent";
const CHECKER_CLASS =
	"[forced-color-adjust:none] [--cp-a:lch(92%_0_282)] [--cp-b:lch(100%_0_282)] dark:[--cp-a:lch(22%_0.8_272)] dark:[--cp-b:lch(13%_0.6_272)] bg-[repeating-conic-gradient(var(--cp-a)_0_25%,var(--cp-b)_0_50%)] bg-[length:8px_8px]";
const FORMATS: readonly { id: ColorFormat; label: string }[] = [
	{ id: "hex", label: "HEX" },
	{ id: "rgb", label: "RGB" },
	{ id: "hsl", label: "HSL" },
	{ id: "oklch", label: "OKLCH" },
];

const CHANNEL_INPUT_CLASS =
	"h-7.5 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-1 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function readRecent(key: string, allowAlpha: boolean): string[] {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = JSON.parse(localStorage.getItem(key) ?? "[]");
		if (!Array.isArray(raw)) return [];
		const out: string[] = [];
		for (const entry of raw) {
			if (typeof entry !== "string") continue;
			const hex = normalizeHexColor(entry, allowAlpha);
			if (hex && !out.includes(hex)) out.push(hex);
			if (out.length >= MAX_RECENT) break;
		}
		return out;
	} catch {
		return [];
	}
}

function writeRecent(key: string, items: string[]) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(items.slice(0, MAX_RECENT)));
	} catch {
		// Ignore quota or privacy-mode storage failures.
	}
}

interface EyeDropperConstructor {
	new (): { open: () => Promise<{ sRGBHex: string }> };
}

export function ColorPicker({
	label,
	value,
	defaultValue = "#000000",
	presets = [],
	alpha = true,
	format: initialFormat = "hex",
	showRecent = true,
	recentKey = DEFAULT_RECENT_KEY,
	disabled = false,
	name,
	contentProps,
	onValueChange,
	id: idProp,
	className,
	...props
}: ColorPickerProps) {
	const fallbackId = React.useId();
	const id = idProp ?? fallbackId;
	const [localValue, setLocalValue] = React.useState(defaultValue);
	const [controller] = React.useState(createColorPickerController);
	const current = normalizeHexColor(value ?? localValue, alpha) ?? "#000000";
	const rgba = React.useMemo(
		() => hexToRgba(current, alpha) ?? { r: 0, g: 0, b: 0, a: 1 },
		[current, alpha]
	);

	const [hue, setHue] = React.useState(() => rgbaToHsva(rgba).h);
	const [activeFormat, setActiveFormat] = React.useState<ColorFormat>(initialFormat);
	const [swatchTab, setSwatchTab] = React.useState<"presets" | "recent">("presets");
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<string>();
	const [eyeDropperSupported, setEyeDropperSupported] = React.useState(false);
	const [pickingEyeDropper, setPickingEyeDropper] = React.useState(false);
	const [copied, setCopied] = React.useState(false);
	const [recentColors, setRecentColors] = React.useState<string[]>([]);

	const composing = React.useRef(false);
	const dragging = React.useRef<"area" | "hue" | "alpha" | null>(null);
	const copyTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const lastKeyboardCommitAt = React.useRef(0);
	const currentRef = React.useRef(current);
	currentRef.current = current;

	const hsva = React.useMemo(() => rgbaToHsva(rgba, hue), [rgba, hue]);
	const hsla = React.useMemo(() => rgbaToHsla(rgba, hue), [rgba, hue]);
	const oklcha = React.useMemo(() => rgbaToOklcha(rgba, hue), [rgba, hue]);
	const alphaPercent = Math.round(rgba.a * 100);
	const cssColor = rgbaToCss(rgba);
	const opaqueRgbCss = `rgb(${rgba.r} ${rgba.g} ${rgba.b})`;
	const pureHueCss = `hsl(${Math.round(hue)} 100% 50%)`;
	const formattedValue = formatColor(rgba, activeFormat, alpha, hue);

	const hexText = draft ?? current;
	const hexInvalid = React.useMemo(() => {
		const t = hexText.trim();
		if (!t) return false;
		if (/^(?:rgb|rgba|hsl|hsla|oklch)\b/i.test(t)) return false;
		const limit = alpha ? 8 : 6;
		return !new RegExp(`^#?[\\da-f]{0,${limit}}$`, "i").test(t);
	}, [hexText, alpha]);

	const normalizedPresets = React.useMemo(() => {
		const seen = new Set<string>();
		const out: { hex: string; rgba: RgbaColor; light: boolean }[] = [];
		for (const item of presets) {
			const hex = normalizeHexColor(item, alpha);
			if (!hex || seen.has(hex)) continue;
			const parsed = hexToRgba(hex, alpha);
			if (!parsed) continue;
			seen.add(hex);
			out.push({ hex, rgba: parsed, light: isLightColor(parsed) });
		}
		return out;
	}, [presets, alpha]);

	const renderedRecent = React.useMemo(() => {
		if (!showRecent) return [];
		const out: { hex: string; rgba: RgbaColor; light: boolean }[] = [];
		for (const item of recentColors) {
			const hex = normalizeHexColor(item, alpha);
			if (!hex) continue;
			const parsed = hexToRgba(hex, alpha);
			if (!parsed) continue;
			out.push({ hex, rgba: parsed, light: isLightColor(parsed) });
		}
		return out;
	}, [showRecent, recentColors, alpha]);

	const effectiveSwatchTab: "presets" | "recent" =
		normalizedPresets.length && renderedRecent.length
			? swatchTab
			: normalizedPresets.length
				? "presets"
				: "recent";
	const activeSwatches = effectiveSwatchTab === "presets" ? normalizedPresets : renderedRecent;
	const { className: contentClass, ...content } = contentProps ?? {};

	React.useEffect(() => {
		setEyeDropperSupported(typeof window !== "undefined" && "EyeDropper" in window);
		if (showRecent) {
			setRecentColors(readRecent(recentKey, alpha));
		}
	}, [showRecent, recentKey, alpha]);

	React.useEffect(() => {
		return () => clearTimeout(copyTimer.current);
	}, []);

	React.useEffect(() => {
		if (disabled) setOpen(false);
	}, [disabled]);

	React.useEffect(() => {
		const { r, g, b } = rgba;
		if (Math.max(r, g, b) - Math.min(r, g, b) > 0) {
			setHue((prev) => rgbaToHsva(rgba, prev).h);
		}
	}, [rgba]);

	const recordRecent = React.useCallback(
		(hex: string, replaceRecent = false) => {
			if (!showRecent) return;
			const normalized = normalizeHexColor(hex, alpha);
			if (!normalized) return;
			const now = Date.now();
			const shouldReplace = replaceRecent && now - lastKeyboardCommitAt.current < 1500;
			lastKeyboardCommitAt.current = replaceRecent ? now : 0;
			setRecentColors((prev) => {
				const base = shouldReplace && prev.length > 0 ? prev.slice(1) : prev;
				const next = [normalized, ...base.filter((item) => item !== normalized)].slice(
					0,
					MAX_RECENT
				);
				writeRecent(recentKey, next);
				return next;
			});
		},
		[showRecent, alpha, recentKey]
	);

	function onColorChange(next: string) {
		const normalized = normalizeHexColor(next, alpha);
		if (!normalized) return;
		if (value === undefined) setLocalValue(normalized);
		onValueChange?.(normalized);
	}

	function setHex(next: string | undefined, commitRecent = false) {
		if (disabled || !next) return;
		const normalized = normalizeHexColor(next, alpha);
		if (!normalized) return;
		if (normalized !== currentRef.current) {
			controller.setValue(normalized, { reason: "input-commit" });
		}
		if (commitRecent) recordRecent(normalized);
	}

	function applyRgba(next: RgbaColor, commitRecent = false) {
		const hex = rgbaToHex(next, alpha);
		setHex(hex, commitRecent);
		setDraft(undefined);
	}

	function onOpenChange(next: boolean) {
		if (next && disabled) return;
		if (next) {
			setDraft(undefined);
			composing.current = false;
			if (showRecent) setRecentColors(readRecent(recentKey, alpha));
		}
		setOpen(next);
	}

	function editHex(next: string, isComposing: boolean) {
		setDraft(next);
		if (composing.current || isComposing) return;
		const trimmed = next.trim();
		if (/^#?[\da-f]{6}$/i.test(trimmed) || (alpha && /^#?[\da-f]{8}$/i.test(trimmed))) {
			setHex(trimmed);
		}
	}

	function commitHexText(raw: string) {
		if (composing.current) {
			setDraft(undefined);
			return;
		}
		const parsed = parseColorInput(raw, alpha);
		if (parsed) {
			if (Math.max(parsed.r, parsed.g, parsed.b) - Math.min(parsed.r, parsed.g, parsed.b) > 0) {
				setHue((prev) => rgbaToHsva(parsed, prev).h);
			}
			applyRgba(parsed, true);
		} else {
			setDraft(undefined);
		}
	}

	function updateAreaFromPointer(el: HTMLElement, clientX: number, clientY: number) {
		const rect = el.getBoundingClientRect();
		if (!rect.width || !rect.height) return;
		const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * 100;
		const v = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height)) * 100;
		applyRgba(hsvaToRgba({ h: hue, s, v, a: rgba.a }));
	}

	function updateHueFromPointer(el: HTMLElement, clientX: number) {
		const rect = el.getBoundingClientRect();
		if (!rect.width) return;
		const nextHue = Math.min(360, Math.max(0, ((clientX - rect.left) / rect.width) * 360));
		setHue(nextHue);
		applyRgba(hsvaToRgba({ h: nextHue, s: hsva.s, v: hsva.v, a: rgba.a }));
	}

	function updateAlphaFromPointer(el: HTMLElement, clientX: number) {
		const rect = el.getBoundingClientRect();
		if (!rect.width) return;
		const nextAlpha = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
		applyRgba({ ...rgba, a: nextAlpha });
	}

	function onAreaKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
		if (disabled) return;
		const step = event.shiftKey ? 10 : 2;
		let s = hsva.s;
		let v = hsva.v;
		if (event.key === "ArrowRight") s = Math.min(100, s + step);
		else if (event.key === "ArrowLeft") s = Math.max(0, s - step);
		else if (event.key === "ArrowUp") v = Math.min(100, v + step);
		else if (event.key === "ArrowDown") v = Math.max(0, v - step);
		else if (event.key === "Home") s = 0;
		else if (event.key === "End") s = 100;
		else return;
		event.preventDefault();
		const next = hsvaToRgba({ h: hue, s, v, a: rgba.a });
		applyRgba(next);
		recordRecent(rgbaToHex(next, alpha), true);
	}

	function onHueKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
		if (disabled) return;
		const step = event.shiftKey ? 15 : 3;
		let nextHue = hue;
		if (event.key === "ArrowRight" || event.key === "ArrowUp") nextHue = Math.min(360, hue + step);
		else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
			nextHue = Math.max(0, hue - step);
		else if (event.key === "Home") nextHue = 0;
		else if (event.key === "End") nextHue = 360;
		else return;
		event.preventDefault();
		setHue(nextHue);
		const next = hsvaToRgba({ h: nextHue, s: hsva.s, v: hsva.v, a: rgba.a });
		applyRgba(next);
		recordRecent(rgbaToHex(next, alpha), true);
	}

	function onAlphaKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
		if (disabled || !alpha) return;
		const step = event.shiftKey ? 0.1 : 0.02;
		let nextAlpha = rgba.a;
		if (event.key === "ArrowRight" || event.key === "ArrowUp")
			nextAlpha = Math.min(1, rgba.a + step);
		else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
			nextAlpha = Math.max(0, rgba.a - step);
		else if (event.key === "Home") nextAlpha = 0;
		else if (event.key === "End") nextAlpha = 1;
		else return;
		event.preventDefault();
		const next = { ...rgba, a: nextAlpha };
		applyRgba(next);
		recordRecent(rgbaToHex(next, alpha), true);
	}

	function updateRgbChannel(channel: "r" | "g" | "b", raw: string) {
		const n = Number.parseInt(raw, 10);
		if (!Number.isFinite(n)) return;
		applyRgba({ ...rgba, [channel]: Math.min(255, Math.max(0, n)) }, true);
	}

	function updateHslChannel(channel: "h" | "s" | "l", raw: string) {
		const n = Number.parseFloat(raw);
		if (!Number.isFinite(n)) return;
		const next = { ...hsla };
		if (channel === "h") {
			next.h = ((n % 360) + 360) % 360;
			setHue(next.h);
		} else {
			next[channel] = Math.min(100, Math.max(0, n));
		}
		applyRgba(hslaToRgba(next), true);
	}

	function updateOklchChannel(channel: "l" | "c" | "h", raw: string) {
		const n = Number.parseFloat(raw);
		if (!Number.isFinite(n)) return;
		const next = { ...oklcha };
		if (channel === "l") next.l = Math.min(1, Math.max(0, n));
		else if (channel === "c") next.c = Math.min(0.4, Math.max(0, n));
		else next.h = ((n % 360) + 360) % 360;
		applyRgba(oklchaToRgba(next), true);
	}

	function updateAlphaInput(raw: string) {
		const n = Number.parseFloat(raw);
		if (!Number.isFinite(n)) return;
		applyRgba({ ...rgba, a: Math.min(100, Math.max(0, n)) / 100 }, true);
	}

	async function pickWithEyeDropper() {
		if (!eyeDropperSupported || pickingEyeDropper || disabled) return;
		const ctor = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
		if (!ctor) return;
		setPickingEyeDropper(true);
		try {
			const result = await new ctor().open();
			if (result?.sRGBHex) {
				const parsed = hexToRgba(result.sRGBHex, false);
				if (parsed) {
					applyRgba({ ...parsed, a: alpha ? rgba.a : 1 }, true);
				}
			}
		} catch {
			// User cancelled the screen eyedropper.
		} finally {
			setPickingEyeDropper(false);
		}
	}

	function copyFormatted() {
		navigator.clipboard
			?.writeText(formattedValue)
			.then(() => {
				setCopied(true);
				clearTimeout(copyTimer.current);
				copyTimer.current = setTimeout(() => setCopied(false), 1500);
			})
			.catch(() => {});
	}

	return (
		<SdkColorPicker
			{...props}
			id={idProp}
			controller={controller}
			value={current}
			space="srgb"
			format="hex"
			disabled={disabled}
			name={name}
			onValueChange={onColorChange}
			data-slot="color-picker"
			data-disabled={disabled || undefined}
			className={cn("grid gap-2", className)}
		>
			<span id={`${id}-label`} className="text-[13px] leading-[17px] font-medium text-foreground">
				{label}
			</span>
			<Popover open={open && !disabled} onOpenChange={onOpenChange}>
				<PopoverTrigger
					disabled={disabled}
					aria-labelledby={`${id}-label ${id}-value`}
					className="flex h-8 w-full items-center gap-2 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2.5 text-[13px] text-foreground outline-none transition-colors duration-150 hover:bg-accent/50 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] dark:hover:bg-[lch(12%_1_272)]"
				>
					<span
						data-slot="color-picker-swatch"
						aria-hidden="true"
						className={cn(
							CHECKER_CLASS,
							"relative size-4 shrink-0 overflow-hidden rounded-[4px] border-[0.5px] border-black/15 dark:border-white/20"
						)}
					>
						<span className="absolute inset-0 block" style={{ background: cssColor }} />
					</span>
					<span id={`${id}-value`} className="min-w-0 truncate font-mono text-xs tabular-nums">
						{current}
					</span>
					{alpha && alphaPercent < 100 && (
						<span className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
							{alphaPercent}%
						</span>
					)}
					<svg
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
						className={cn(
							"size-3.5 shrink-0 text-muted-foreground",
							!(alpha && alphaPercent < 100) && "ml-auto"
						)}
					>
						<path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
					</svg>
				</PopoverTrigger>
				<PopoverContent
					aria-labelledby={`${id}-label`}
					align="start"
					{...content}
					data-slot="color-picker-content"
					className={cn(
						"grid w-64 gap-3 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
						contentClass
					)}
				>
					{/* 1. Interactive 2D Saturation / Value color board */}
					<div
						role="slider"
						tabIndex={disabled ? -1 : 0}
						data-slot="color-picker-area"
						aria-label={`${label}：饱和度与明度`}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round(hsva.s)}
						aria-valuetext={`饱和度 ${Math.round(hsva.s)}%，明度 ${Math.round(hsva.v)}%`}
						className="[forced-color-adjust:none] relative h-26 w-full cursor-crosshair overflow-hidden rounded-md select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
						style={{
							backgroundColor: pureHueCss,
							backgroundImage:
								"linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent)",
						}}
						onPointerDown={(event) => {
							if (disabled) return;
							event.currentTarget.focus();
							event.currentTarget.setPointerCapture(event.pointerId);
							dragging.current = "area";
							updateAreaFromPointer(event.currentTarget, event.clientX, event.clientY);
						}}
						onPointerMove={(event) => {
							if (dragging.current !== "area") return;
							updateAreaFromPointer(event.currentTarget, event.clientX, event.clientY);
						}}
						onPointerUp={() => {
							if (dragging.current !== "area") return;
							dragging.current = null;
							recordRecent(currentRef.current);
						}}
						onPointerCancel={() => {
							dragging.current = null;
						}}
						onKeyDown={onAreaKeyDown}
					>
						<span
							aria-hidden="true"
							className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.45),0_1px_3px_rgb(0_0_0/0.35)]"
							style={{
								left: `${hsva.s}%`,
								top: `${100 - hsva.v}%`,
								background: opaqueRgbCss,
							}}
						/>
					</div>

					{/* 2. Eyedropper + live preview swatch + Hue & Alpha sliders */}
					<div className="flex items-center gap-2">
						{eyeDropperSupported && (
							<button
								type="button"
								aria-label={`${label}：吸管取色`}
								title="吸管取色"
								disabled={disabled || pickingEyeDropper}
								onClick={pickWithEyeDropper}
								className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border-[0.5px] border-border bg-background text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
							>
								<svg
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.4"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
									className="size-3.5"
								>
									<path d="m11.8 2.2 2 2-1.8 1.8.8.8-1 1-3.6-3.6 1-1 .8.8 1.8-1.8Z" />
									<path d="m8.2 5.8-5.1 5.1a1.4 1.4 0 0 0-.4 1v1.4h1.4c.4 0 .7-.1 1-.4l5.1-5.1" />
								</svg>
							</button>
						)}

						<div
							data-slot="color-picker-preview"
							aria-hidden="true"
							className={cn(
								CHECKER_CLASS,
								"relative size-7 shrink-0 overflow-hidden rounded-md border-[0.5px] border-black/15 dark:border-white/20"
							)}
						>
							<span className="absolute inset-0 block" style={{ background: cssColor }} />
						</div>

						<div className="grid min-w-0 flex-1 gap-2">
							{/* Hue slider */}
							<div
								role="slider"
								tabIndex={disabled ? -1 : 0}
								data-slot="color-picker-hue"
								aria-label={`${label}：色相`}
								aria-valuemin={0}
								aria-valuemax={360}
								aria-valuenow={Math.round(hue)}
								aria-valuetext={`${Math.round(hue)}°`}
								className="[forced-color-adjust:none] relative h-2.5 w-full cursor-pointer rounded-full select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
								style={{
									background:
										"linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
								}}
								onPointerDown={(event) => {
									if (disabled) return;
									event.currentTarget.focus();
									event.currentTarget.setPointerCapture(event.pointerId);
									dragging.current = "hue";
									updateHueFromPointer(event.currentTarget, event.clientX);
								}}
								onPointerMove={(event) => {
									if (dragging.current !== "hue") return;
									updateHueFromPointer(event.currentTarget, event.clientX);
								}}
								onPointerUp={() => {
									if (dragging.current !== "hue") return;
									dragging.current = null;
									recordRecent(currentRef.current);
								}}
								onPointerCancel={() => {
									dragging.current = null;
								}}
								onKeyDown={onHueKeyDown}
							>
								<span
									aria-hidden="true"
									className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_2px_rgb(0_0_0/0.3)]"
									style={{
										left: `${(hue / 360) * 100}%`,
										background: pureHueCss,
									}}
								/>
							</div>

							{/* Alpha slider */}
							{alpha && (
								<div
									role="slider"
									tabIndex={disabled ? -1 : 0}
									data-slot="color-picker-alpha"
									aria-label={`${label}：不透明度`}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-valuenow={alphaPercent}
									aria-valuetext={`${alphaPercent}%`}
									className={cn(
										CHECKER_CLASS,
										"relative h-2.5 w-full cursor-pointer rounded-full select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
									)}
									onPointerDown={(event) => {
										if (disabled) return;
										event.currentTarget.focus();
										event.currentTarget.setPointerCapture(event.pointerId);
										dragging.current = "alpha";
										updateAlphaFromPointer(event.currentTarget, event.clientX);
									}}
									onPointerMove={(event) => {
										if (dragging.current !== "alpha") return;
										updateAlphaFromPointer(event.currentTarget, event.clientX);
									}}
									onPointerUp={() => {
										if (dragging.current !== "alpha") return;
										dragging.current = null;
										recordRecent(currentRef.current);
									}}
									onPointerCancel={() => {
										dragging.current = null;
									}}
									onKeyDown={onAlphaKeyDown}
								>
									<span
										aria-hidden="true"
										className="pointer-events-none absolute inset-0 rounded-full"
										style={{ background: `linear-gradient(to right, transparent, ${opaqueRgbCss})` }}
									/>
									<span
										aria-hidden="true"
										className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_2px_rgb(0_0_0/0.3)]"
										style={{
											left: `${alphaPercent}%`,
											background: cssColor,
										}}
									/>
								</div>
							)}
						</div>
					</div>

					{/* 3. Format switcher + Copy + Editable channel inputs */}
					<div className="grid gap-1.5">
						<div className="flex items-center justify-between gap-1.5">
							<div
								role="group"
								aria-label={`${label}：色值格式`}
								className="grid flex-1 grid-cols-4 rounded-md bg-muted/70 p-0.5"
							>
								{FORMATS.map((item) => (
									<button
										key={item.id}
										type="button"
										aria-pressed={activeFormat === item.id}
										onClick={() => {
											setActiveFormat(item.id);
											setDraft(undefined);
										}}
										className={cn(
											"h-5.5 rounded-[5px] text-[10px] font-medium tracking-wide outline-none transition-colors duration-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring",
											activeFormat === item.id
												? "bg-background text-foreground shadow-xs"
												: "text-muted-foreground hover:text-foreground"
										)}
									>
										{item.label}
									</button>
								))}
							</div>
							<button
								type="button"
								aria-label={copied ? "已复制色值" : "复制当前色值"}
								title={copied ? "已复制" : `复制 ${formattedValue}`}
								onClick={copyFormatted}
								className="inline-flex size-6.5 shrink-0 items-center justify-center rounded-md border-[0.5px] border-border bg-background text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring"
							>
								{copied ? (
									<svg
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.6"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
										className="size-3.5 text-foreground"
									>
										<path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
									</svg>
								) : (
									<svg
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.4"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
										className="size-3.5"
									>
										<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
										<path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
									</svg>
								)}
							</button>
						</div>

						{activeFormat === "hex" ? (
							<>
								<div className="flex items-center gap-1.5">
									<input
										type="text"
										aria-label={`${label}：十六进制`}
										aria-invalid={hexInvalid || undefined}
										aria-describedby={hexInvalid ? `${id}-error` : undefined}
										spellCheck={false}
										autoComplete="off"
										maxLength={alpha ? 36 : 7}
										value={hexText}
										onCompositionStart={() => {
											composing.current = true;
										}}
										onCompositionEnd={(event) => {
											composing.current = false;
											editHex(event.currentTarget.value, false);
										}}
										onChange={(event) => editHex(event.currentTarget.value, composing.current)}
										onKeyDown={(event) => {
											if (
												event.key !== "Enter" ||
												event.nativeEvent.isComposing ||
												composing.current
											)
												return;
											event.preventDefault();
											commitHexText(event.currentTarget.value);
										}}
										onBlur={(event) => commitHexText(event.currentTarget.value)}
										className="h-7.5 w-full min-w-0 flex-1 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring aria-invalid:border-destructive dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]"
									/>
									{alpha && (
										<div className="relative flex w-14 shrink-0 items-center">
											<input
												type="number"
												min={0}
												max={100}
												aria-label={`${label}：不透明度百分比`}
												value={alphaPercent}
												onChange={(event) => updateAlphaInput(event.currentTarget.value)}
												className="h-7.5 w-full rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white pr-4.5 pl-1.5 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
											/>
											<span
												aria-hidden="true"
												className="pointer-events-none absolute right-1.5 font-mono text-[10px] text-muted-foreground"
											>
												%
											</span>
										</div>
									)}
								</div>
								{hexInvalid && (
									<p
										id={`${id}-error`}
										role="alert"
										className="flex items-start gap-1 text-[11px] text-destructive"
									>
										<svg
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
											className="mt-0.5 size-3 shrink-0"
										>
											<circle cx="8" cy="8" r="6" />
											<path d="M8 5.25v3" />
											<path d="M8 10.75h.01" />
										</svg>
										<span>只能输入十六进制字符 0-9、a-f，如 #1e40af。</span>
									</p>
								)}
							</>
						) : activeFormat === "rgb" ? (
							<div className={cn("grid gap-1", alpha ? "grid-cols-4" : "grid-cols-3")}>
								{(
									[
										{ key: "r", label: "R", value: rgba.r },
										{ key: "g", label: "G", value: rgba.g },
										{ key: "b", label: "B", value: rgba.b },
									] as const
								).map((ch) => (
									<label key={ch.key} className="grid gap-1">
										<input
											type="number"
											min={0}
											max={255}
											aria-label={`${label}：${ch.label}`}
											value={ch.value}
											onChange={(event) => updateRgbChannel(ch.key, event.currentTarget.value)}
											className={CHANNEL_INPUT_CLASS}
										/>
										<span className="text-center text-[10px] font-medium text-muted-foreground">
											{ch.label}
										</span>
									</label>
								))}
								{alpha && (
									<label className="grid gap-1">
										<input
											type="number"
											min={0}
											max={100}
											aria-label={`${label}：不透明度百分比`}
											value={alphaPercent}
											onChange={(event) => updateAlphaInput(event.currentTarget.value)}
											className={CHANNEL_INPUT_CLASS}
										/>
										<span className="text-center text-[10px] font-medium text-muted-foreground">
											A%
										</span>
									</label>
								)}
							</div>
						) : activeFormat === "hsl" ? (
							<div className={cn("grid gap-1", alpha ? "grid-cols-4" : "grid-cols-3")}>
								{(
									[
										{ key: "h", label: "H", value: hsla.h, max: 360 },
										{ key: "s", label: "S%", value: hsla.s, max: 100 },
										{ key: "l", label: "L%", value: hsla.l, max: 100 },
									] as const
								).map((ch) => (
									<label key={ch.key} className="grid gap-1">
										<input
											type="number"
											min={0}
											max={ch.max}
											aria-label={`${label}：${ch.label}`}
											value={ch.value}
											onChange={(event) => updateHslChannel(ch.key, event.currentTarget.value)}
											className={CHANNEL_INPUT_CLASS}
										/>
										<span className="text-center text-[10px] font-medium text-muted-foreground">
											{ch.label}
										</span>
									</label>
								))}
								{alpha && (
									<label className="grid gap-1">
										<input
											type="number"
											min={0}
											max={100}
											aria-label={`${label}：不透明度百分比`}
											value={alphaPercent}
											onChange={(event) => updateAlphaInput(event.currentTarget.value)}
											className={CHANNEL_INPUT_CLASS}
										/>
										<span className="text-center text-[10px] font-medium text-muted-foreground">
											A%
										</span>
									</label>
								)}
							</div>
						) : (
							<div className={cn("grid gap-1", alpha ? "grid-cols-4" : "grid-cols-3")}>
								{(
									[
										{ key: "l", label: "L", value: Number(oklcha.l.toFixed(2)), max: 1, step: 0.01 },
										{
											key: "c",
											label: "C",
											value: Number(oklcha.c.toFixed(2)),
											max: 0.4,
											step: 0.01,
										},
										{ key: "h", label: "H", value: Math.round(oklcha.h), max: 360, step: 1 },
									] as const
								).map((ch) => (
									<label key={ch.key} className="grid gap-1">
										<input
											type="number"
											min={0}
											max={ch.max}
											step={ch.step}
											aria-label={`${label}：OKLCH ${ch.label}`}
											value={ch.value}
											onChange={(event) => updateOklchChannel(ch.key, event.currentTarget.value)}
											className={CHANNEL_INPUT_CLASS}
										/>
										<span className="text-center text-[10px] font-medium text-muted-foreground">
											{ch.label}
										</span>
									</label>
								))}
								{alpha && (
									<label className="grid gap-1">
										<input
											type="number"
											min={0}
											max={100}
											aria-label={`${label}：不透明度百分比`}
											value={alphaPercent}
											onChange={(event) => updateAlphaInput(event.currentTarget.value)}
											className={CHANNEL_INPUT_CLASS}
										/>
										<span className="text-center text-[10px] font-medium text-muted-foreground">
											A%
										</span>
									</label>
								)}
							</div>
						)}
					</div>

					{/* 4. Presets & Recent swatches (fixed single-tier footer) */}
					{(normalizedPresets.length > 0 || renderedRecent.length > 0) && (
						<div className="grid gap-1.5 border-t-[0.5px] border-border/80 pt-2">
							<div className="flex items-center gap-3">
								{normalizedPresets.length > 0 && renderedRecent.length > 0 ? (
									<>
										<button
											type="button"
											aria-pressed={effectiveSwatchTab === "presets"}
											onClick={() => setSwatchTab("presets")}
											className={cn(
												"text-[11px] font-medium outline-none transition-colors focus-visible:underline",
												effectiveSwatchTab === "presets"
													? "text-foreground"
													: "text-muted-foreground hover:text-foreground"
											)}
										>
											预设色
										</button>
										<button
											type="button"
											aria-pressed={effectiveSwatchTab === "recent"}
											onClick={() => setSwatchTab("recent")}
											className={cn(
												"inline-flex items-center gap-1 text-[11px] font-medium outline-none transition-colors focus-visible:underline",
												effectiveSwatchTab === "recent"
													? "text-foreground"
													: "text-muted-foreground hover:text-foreground"
											)}
										>
											最近使用
											<span className="font-mono text-[10px] tabular-nums text-muted-foreground">
												{renderedRecent.length}
											</span>
										</button>
									</>
								) : normalizedPresets.length > 0 ? (
									<span className="text-[11px] font-medium text-muted-foreground">预设色</span>
								) : (
									<span className="text-[11px] font-medium text-muted-foreground">最近使用</span>
								)}
							</div>
							<div
								role="group"
								aria-label={
									effectiveSwatchTab === "presets" ? `${label}：预设` : `${label}：最近使用`
								}
								className="flex flex-wrap gap-1.5"
							>
								{activeSwatches.map((item) => (
									<button
										key={item.hex}
										type="button"
										aria-label={item.hex}
										title={item.hex}
										aria-pressed={item.hex === current}
										className={cn(
											CHECKER_CLASS,
											"relative inline-flex size-5.5 items-center justify-center overflow-hidden rounded-[5px] border-[0.5px] border-black/15 outline-none transition-colors duration-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-white/20"
										)}
										onClick={() => {
											setHex(item.hex, true);
											setDraft(undefined);
										}}
									>
										<span
											className="absolute inset-0 block"
											style={{ background: rgbaToCss(item.rgba) }}
										/>
										{item.hex === current && (
											<svg
												viewBox="0 0 16 16"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
												className="relative z-10 size-3"
												style={{ color: item.light ? "#0f172a" : "#ffffff" }}
											>
												<path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
											</svg>
										)}
									</button>
								))}
							</div>
						</div>
					)}
				</PopoverContent>
			</Popover>
		</SdkColorPicker>
	);
}
