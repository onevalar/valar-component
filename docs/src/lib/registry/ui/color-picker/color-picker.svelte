<script lang="ts" module>
	import type { Content as PopoverContent } from "$lib/registry/ui/popover/index.js";
	import type { ComponentProps } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { normalizeHex, type ColorFormat } from "./color.js";

	export { normalizeHex };

	export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		/** Visible label; also names the trigger and the inputs. */
		label: string;
		/** Hex color such as `#1e40af` (or `#1e40af80` when `alpha` is enabled). Shorthand input is expanded. */
		value?: string;
		/** Optional swatches offered for one-click selection. */
		presets?: string[];
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
		/** Popover Content configuration; portals remain enabled unless explicitly disabled. */
		contentProps?: Omit<ComponentProps<typeof PopoverContent>, "children" | "child">;
		onValueChange?: (value: string) => void;
	};

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

	import { normalizeHexColor } from "./color.js";
</script>

<script lang="ts">
	import {
		ColorPicker as SdkColorPicker,
		createColorPickerController,
	} from "@ui-sdk/svelte/color-picker";
	import { onDestroy, onMount, untrack } from "svelte";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { cn } from "$lib/utils.js";
	import {
		formatColor,
		hexToRgba,
		hslaToRgba,
		hsvaToRgba,
		isLightColor,
		oklchaToRgba,
		parseColorInput,
		rgbaToCss,
		rgbaToHex,
		rgbaToHsla,
		rgbaToHsva,
		rgbaToOklcha,
		type RgbaColor,
	} from "./color.js";

	let {
		label,
		value = $bindable("#000000"),
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
		class: className,
		...restProps
	}: ColorPickerProps = $props();

	const generated = $props.id();
	const id = $derived(idProp ?? generated);
	const current = $derived(normalizeHexColor(value, alpha) ?? "#000000");
	const rgba = $derived(hexToRgba(current, alpha) ?? { r: 0, g: 0, b: 0, a: 1 });
	const controller = createColorPickerController();

	let hue = $state(untrack(() => rgbaToHsva(hexToRgba(normalizeHexColor(value, alpha) ?? "#000000", alpha) ?? { r: 0, g: 0, b: 0, a: 1 }).h));
	let activeFormat = $state<ColorFormat>(untrack(() => initialFormat));
	let swatchTab = $state<"presets" | "recent">("presets");
	let hexText = $state("");
	let open = $state(false);
	let root = $state<HTMLDivElement | null>(null);
	let editorOwned = $state(false);
	let composing = false;
	let eyeDropperSupported = $state(false);
	let pickingEyeDropper = $state(false);
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let recentColors = $state<string[]>([]);
	let lastKeyboardCommitAt = 0;
	let dragging: "area" | "hue" | "alpha" | null = null;

	const hsva = $derived(rgbaToHsva(rgba, hue));
	const hsla = $derived(rgbaToHsla(rgba, hue));
	const oklcha = $derived(rgbaToOklcha(rgba, hue));
	const alphaPercent = $derived(Math.round(rgba.a * 100));
	const cssColor = $derived(rgbaToCss(rgba));
	const opaqueRgbCss = $derived(`rgb(${rgba.r} ${rgba.g} ${rgba.b})`);
	const pureHueCss = $derived(`hsl(${Math.round(hue)} 100% 50%)`);
	const formattedValue = $derived(formatColor(rgba, activeFormat, alpha, hue));

	// Partial typing like "#1e" or a CSS function prefix is allowed; impossible chars are flagged.
	const hexInvalid = $derived.by(() => {
		const t = hexText.trim();
		if (!t) return false;
		if (/^(?:rgb|rgba|hsl|hsla|oklch)\b/i.test(t)) return false;
		const limit = alpha ? 8 : 6;
		return !new RegExp(`^#?[\\da-f]{0,${limit}}$`, "i").test(t);
	});

	const normalizedPresets = $derived.by(() => {
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
	});

	const renderedRecent = $derived.by(() => {
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
	});

	const effectiveSwatchTab = $derived<"presets" | "recent">(
		normalizedPresets.length && renderedRecent.length
			? swatchTab
			: normalizedPresets.length
				? "presets"
				: "recent"
	);
	const activeSwatches = $derived(
		effectiveSwatchTab === "presets" ? normalizedPresets : renderedRecent
	);

	onMount(() => {
		editorOwned = !!root?.closest('[role="dialog"][data-component-tuner]');
		eyeDropperSupported = typeof window !== "undefined" && "EyeDropper" in window;
		if (showRecent) {
			recentColors = readRecent(recentKey, alpha);
		}
	});

	onDestroy(() => clearTimeout(copyTimer));

	$effect(() => {
		const { r, g, b } = rgba;
		if (Math.max(r, g, b) - Math.min(r, g, b) > 0) {
			hue = rgbaToHsva(rgba, untrack(() => hue)).h;
		}
	});

	$effect(() => {
		if (disabled && open) {
			open = false;
		} else if (open) {
			hexText = untrack(() => current);
			composing = false;
			if (showRecent) recentColors = readRecent(recentKey, alpha);
		}
	});

	function setHex(next: string | undefined, commitRecent = false) {
		if (disabled || !next) return;
		const normalized = normalizeHexColor(next, alpha);
		if (!normalized) return;
		if (normalized !== current) {
			controller.setValue(normalized, { reason: "input-commit" });
		}
		if (commitRecent) recordRecent(normalized);
	}

	function onColorChange(next: string) {
		const normalized = normalizeHexColor(next, alpha);
		if (!normalized) return;
		value = normalized;
		onValueChange?.(normalized);
	}

	function editHex(next: string, isComposing = false) {
		hexText = next;
		if (composing || isComposing) return;
		const trimmed = next.trim();
		if (/^#?[\da-f]{6}$/i.test(trimmed) || (alpha && /^#?[\da-f]{8}$/i.test(trimmed))) {
			setHex(trimmed);
		}
	}

	function applyRgba(next: RgbaColor, commitRecent = false) {
		const hex = rgbaToHex(next, alpha);
		setHex(hex, commitRecent);
		hexText = hex;
	}

	function recordRecent(hex: string, replaceRecent = false) {
		if (!showRecent) return;
		const normalized = normalizeHexColor(hex, alpha);
		if (!normalized) return;
		const now = Date.now();
		const base =
			replaceRecent && recentColors.length > 0 && now - lastKeyboardCommitAt < 1500
				? recentColors.slice(1)
				: recentColors;
		lastKeyboardCommitAt = replaceRecent ? now : 0;
		const next = [normalized, ...base.filter((item) => item !== normalized)].slice(0, MAX_RECENT);
		recentColors = next;
		writeRecent(recentKey, next);
	}

	function commitHexText() {
		if (composing) {
			hexText = current;
			return;
		}
		const parsed = parseColorInput(hexText, alpha);
		if (parsed) {
			if (Math.max(parsed.r, parsed.g, parsed.b) - Math.min(parsed.r, parsed.g, parsed.b) > 0) {
				hue = rgbaToHsva(parsed, hue).h;
			}
			applyRgba(parsed, true);
		} else {
			hexText = current;
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
		const nextHue = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * 360;
		hue = nextHue >= 360 ? 359.99 : nextHue;
		applyRgba(hsvaToRgba({ h: hue, s: hsva.s, v: hsva.v, a: rgba.a }));
	}

	function updateAlphaFromPointer(el: HTMLElement, clientX: number) {
		const rect = el.getBoundingClientRect();
		if (!rect.width) return;
		const nextAlpha = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
		applyRgba({ ...rgba, a: Math.round(nextAlpha * 100) / 100 });
	}

	function onAreaKeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? 10 : 1;
		let s = hsva.s;
		let v = hsva.v;
		if (event.key === "ArrowLeft") s = Math.max(0, s - step);
		else if (event.key === "ArrowRight") s = Math.min(100, s + step);
		else if (event.key === "ArrowUp") v = Math.min(100, v + step);
		else if (event.key === "ArrowDown") v = Math.max(0, v - step);
		else if (event.key === "Home") s = 0;
		else if (event.key === "End") s = 100;
		else return;
		event.preventDefault();
		applyRgba(hsvaToRgba({ h: hue, s, v, a: rgba.a }));
		recordRecent(current, true);
	}

	function onHueKeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? 15 : 1;
		let next = hue;
		if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(0, hue - step);
		else if (event.key === "ArrowRight" || event.key === "ArrowUp")
			next = Math.min(359, hue + step);
		else if (event.key === "Home") next = 0;
		else if (event.key === "End") next = 359;
		else return;
		event.preventDefault();
		hue = next;
		applyRgba(hsvaToRgba({ h: hue, s: hsva.s, v: hsva.v, a: rgba.a }));
		recordRecent(current, true);
	}

	function onAlphaKeydown(event: KeyboardEvent) {
		const step = event.shiftKey ? 10 : 1;
		let pct = alphaPercent;
		if (event.key === "ArrowLeft" || event.key === "ArrowDown") pct = Math.max(0, pct - step);
		else if (event.key === "ArrowRight" || event.key === "ArrowUp") pct = Math.min(100, pct + step);
		else if (event.key === "Home") pct = 0;
		else if (event.key === "End") pct = 100;
		else return;
		event.preventDefault();
		applyRgba({ ...rgba, a: pct / 100 });
		recordRecent(current, true);
	}

	function updateRgbChannel(channel: "r" | "g" | "b", raw: string) {
		const n = Number.parseInt(raw, 10);
		if (!Number.isFinite(n)) return;
		const next = { ...rgba, [channel]: Math.min(255, Math.max(0, n)) };
		applyRgba(next, true);
	}

	function updateHslChannel(channel: "h" | "s" | "l", raw: string) {
		const n = Number.parseFloat(raw);
		if (!Number.isFinite(n)) return;
		const next = {
			...hsla,
			[channel]:
				channel === "h" ? ((n % 360) + 360) % 360 : Math.min(100, Math.max(0, Math.round(n))),
		};
		if (channel === "h") hue = next.h;
		applyRgba(hslaToRgba(next), true);
	}

	function updateOklchChannel(channel: "l" | "c" | "h", raw: string) {
		const n = Number.parseFloat(raw);
		if (!Number.isFinite(n)) return;
		const next = {
			...oklcha,
			[channel]:
				channel === "l"
					? Math.min(1, Math.max(0, n))
					: channel === "c"
						? Math.min(0.4, Math.max(0, n))
						: ((n % 360) + 360) % 360,
		};
		applyRgba(oklchaToRgba(next), true);
	}

	function updateAlphaInput(raw: string) {
		const n = Number.parseInt(raw, 10);
		if (!Number.isFinite(n)) return;
		const pct = Math.min(100, Math.max(0, n));
		applyRgba({ ...rgba, a: pct / 100 }, true);
	}

	async function pickWithEyeDropper() {
		if (!eyeDropperSupported || pickingEyeDropper) return;
		pickingEyeDropper = true;
		try {
			const EyeDropperCtor = (
				window as unknown as {
					EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> };
				}
			).EyeDropper;
			const result = await new EyeDropperCtor().open();
			if (result?.sRGBHex) {
				const parsed = hexToRgba(result.sRGBHex, false);
				if (parsed) {
					applyRgba({ ...parsed, a: 1 }, true);
				}
			}
		} catch {
			// User pressed Escape or dismissed the native eyedropper.
		} finally {
			pickingEyeDropper = false;
		}
	}

	function copyFormatted() {
		navigator.clipboard
			?.writeText(formattedValue)
			.then(() => {
				copied = true;
				clearTimeout(copyTimer);
				copyTimer = setTimeout(() => (copied = false), 1500);
			})
			.catch(() => {});
	}
</script>

<SdkColorPicker
	{controller}
	value={current}
	space="srgb"
	format="hex"
	{disabled}
	{name}
	onValueChange={onColorChange}
	data-slot="color-picker"
	data-disabled={disabled || undefined}
	class={cn("grid gap-2", "cn-color-picker", className)}
	{...restProps}
>
	{#snippet render({ props, state, children })}
		<div bind:this={root} {...props}>{@render children?.(state)}</div>
	{/snippet}
	<span id={`${id}-label`} class="text-[13px] leading-[17px] font-medium text-foreground"
		>{label}</span
	>
	<Popover.Root bind:open>
		<Popover.Trigger
			{disabled}
			aria-labelledby={`${id}-label ${id}-value`}
			class="flex h-8 w-full items-center gap-2 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2.5 text-[13px] text-foreground outline-none transition-colors duration-150 hover:bg-accent/50 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] dark:hover:bg-[lch(12%_1_272)]"
		>
			<span
				data-slot="color-picker-swatch"
				class={cn(
					CHECKER_CLASS,
					"relative size-4 shrink-0 overflow-hidden rounded-[4px] border-[0.5px] border-black/15 dark:border-white/20"
				)}
			>
				<span class="absolute inset-0 block" style:background={cssColor}></span>
			</span>
			<span id={`${id}-value`} class="min-w-0 truncate font-mono text-xs tabular-nums"
				>{current}</span
			>
			{#if alpha && alphaPercent < 100}
				<span class="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
					>{alphaPercent}%</span
				>
			{/if}
			<svg
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				class={cn(
					"size-3.5 shrink-0 text-muted-foreground",
					!(alpha && alphaPercent < 100) && "ml-auto"
				)}
			>
				<path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
			</svg>
		</Popover.Trigger>

		<Popover.Content
			aria-label={label}
			align="start"
			{...contentProps}
			data-slot="color-picker-content"
			data-color-picker-editor={editorOwned || undefined}
			class={cn(
				"grid w-64 gap-3",
				"cn-color-picker-content [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
				contentProps?.class
			)}
		>
			<!-- 1. Interactive 2D Saturation / Value color board -->
			<div
				role="slider"
				tabindex={disabled ? -1 : 0}
				data-slot="color-picker-area"
				aria-label={`${label}：饱和度与明度`}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(hsva.s)}
				aria-valuetext={`饱和度 ${Math.round(hsva.s)}%，明度 ${Math.round(hsva.v)}%`}
				class="[forced-color-adjust:none] relative h-26 w-full cursor-crosshair overflow-hidden rounded-md select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
				style:background-color={pureHueCss}
				style:background-image="linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent)"
				onpointerdown={(event) => {
					if (disabled) return;
					event.currentTarget.focus();
					event.currentTarget.setPointerCapture(event.pointerId);
					dragging = "area";
					updateAreaFromPointer(event.currentTarget, event.clientX, event.clientY);
				}}
				onpointermove={(event) => {
					if (dragging !== "area") return;
					updateAreaFromPointer(event.currentTarget, event.clientX, event.clientY);
				}}
				onpointerup={() => {
					if (dragging !== "area") return;
					dragging = null;
					recordRecent(current);
				}}
				onpointercancel={() => {
					dragging = null;
				}}
				onkeydown={onAreaKeydown}
			>
				<span
					aria-hidden="true"
					class="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.45),0_1px_3px_rgb(0_0_0/0.35)]"
					style:left={`${hsva.s}%`}
					style:top={`${100 - hsva.v}%`}
					style:background={opaqueRgbCss}
				></span>
			</div>

			<!-- 2. Eyedropper + live preview swatch + Hue & Alpha sliders -->
			<div class="flex items-center gap-2">
				{#if eyeDropperSupported}
					<button
						type="button"
						aria-label={`${label}：吸管取色`}
						title="吸管取色"
						disabled={disabled || pickingEyeDropper}
						onclick={pickWithEyeDropper}
						class="inline-flex size-7 shrink-0 items-center justify-center rounded-md border-[0.5px] border-border bg-background text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
					>
						<svg
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.4"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							class="size-3.5"
						>
							<path d="m11.8 2.2 2 2-1.8 1.8.8.8-1 1-3.6-3.6 1-1 .8.8 1.8-1.8Z" />
							<path d="m8.2 5.8-5.1 5.1a1.4 1.4 0 0 0-.4 1v1.4h1.4c.4 0 .7-.1 1-.4l5.1-5.1" />
						</svg>
					</button>
				{/if}

				<div
					data-slot="color-picker-preview"
					aria-hidden="true"
					class={cn(
						CHECKER_CLASS,
						"relative size-7 shrink-0 overflow-hidden rounded-md border-[0.5px] border-black/15 dark:border-white/20"
					)}
				>
					<span class="absolute inset-0 block" style:background={cssColor}></span>
				</div>

				<div class="grid min-w-0 flex-1 gap-2">
					<!-- Hue slider -->
					<div
						role="slider"
						tabindex={disabled ? -1 : 0}
						data-slot="color-picker-hue"
						aria-label={`${label}：色相`}
						aria-valuemin={0}
						aria-valuemax={360}
						aria-valuenow={Math.round(hue)}
						aria-valuetext={`${Math.round(hue)}°`}
						class="[forced-color-adjust:none] relative h-2.5 w-full cursor-pointer rounded-full select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
						style:background="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
						onpointerdown={(event) => {
							if (disabled) return;
							event.currentTarget.focus();
							event.currentTarget.setPointerCapture(event.pointerId);
							dragging = "hue";
							updateHueFromPointer(event.currentTarget, event.clientX);
						}}
						onpointermove={(event) => {
							if (dragging !== "hue") return;
							updateHueFromPointer(event.currentTarget, event.clientX);
						}}
						onpointerup={() => {
							if (dragging !== "hue") return;
							dragging = null;
							recordRecent(current);
						}}
						onpointercancel={() => {
							dragging = null;
						}}
						onkeydown={onHueKeydown}
					>
						<span
							aria-hidden="true"
							class="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_2px_rgb(0_0_0/0.3)]"
							style:left={`${(hue / 360) * 100}%`}
							style:background={pureHueCss}
						></span>
					</div>

					<!-- Alpha slider -->
					{#if alpha}
						<div
							role="slider"
							tabindex={disabled ? -1 : 0}
							data-slot="color-picker-alpha"
							aria-label={`${label}：不透明度`}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={alphaPercent}
							aria-valuetext={`${alphaPercent}%`}
							class={cn(
								CHECKER_CLASS,
								"relative h-2.5 w-full cursor-pointer rounded-full select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
							)}
							onpointerdown={(event) => {
								if (disabled) return;
								event.currentTarget.focus();
								event.currentTarget.setPointerCapture(event.pointerId);
								dragging = "alpha";
								updateAlphaFromPointer(event.currentTarget, event.clientX);
							}}
							onpointermove={(event) => {
								if (dragging !== "alpha") return;
								updateAlphaFromPointer(event.currentTarget, event.clientX);
							}}
							onpointerup={() => {
								if (dragging !== "alpha") return;
								dragging = null;
								recordRecent(current);
							}}
							onpointercancel={() => {
								dragging = null;
							}}
							onkeydown={onAlphaKeydown}
						>
							<span
								aria-hidden="true"
								class="pointer-events-none absolute inset-0 rounded-full"
								style:background={`linear-gradient(to right, transparent, ${opaqueRgbCss})`}
							></span>
							<span
								aria-hidden="true"
								class="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_2px_rgb(0_0_0/0.3)]"
								style:left={`${alphaPercent}%`}
								style:background={cssColor}
							></span>
						</div>
					{/if}
				</div>
			</div>

			<!-- 3. Format switcher + Copy + Editable channel inputs -->
			<div class="grid gap-1.5">
				<div class="flex items-center justify-between gap-1.5">
					<div
						role="group"
						aria-label={`${label}：色值格式`}
						class="grid flex-1 grid-cols-4 rounded-md bg-muted/70 p-0.5"
					>
						{#each FORMATS as item (item.id)}
							<button
								type="button"
								aria-pressed={activeFormat === item.id}
								onclick={() => {
									activeFormat = item.id;
									hexText = current;
								}}
								class={cn(
									"h-5.5 rounded-[5px] text-[10px] font-medium tracking-wide outline-none transition-colors duration-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring",
									activeFormat === item.id
										? "bg-background text-foreground shadow-xs"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{item.label}
							</button>
						{/each}
					</div>
					<button
						type="button"
						aria-label={copied ? "已复制色值" : "复制当前色值"}
						title={copied ? "已复制" : `复制 ${formattedValue}`}
						onclick={copyFormatted}
						class="inline-flex size-6.5 shrink-0 items-center justify-center rounded-md border-[0.5px] border-border bg-background text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring"
					>
						{#if copied}
							<svg
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
								class="size-3.5 text-foreground"
							>
								<path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
							</svg>
						{:else}
							<svg
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								stroke-width="1.4"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
								class="size-3.5"
							>
								<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
								<path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
							</svg>
						{/if}
					</button>
				</div>

				{#if activeFormat === "hex"}
					<div class="flex items-center gap-1.5">
						<input
							type="text"
							aria-label={`${label}：十六进制`}
							aria-invalid={hexInvalid || undefined}
							aria-describedby={hexInvalid ? `${id}-error` : undefined}
							spellcheck="false"
							autocomplete="off"
							maxlength={alpha ? 36 : 7}
							value={hexText}
							oncompositionstart={() => (composing = true)}
							oncompositionend={(event) => {
								composing = false;
								editHex(event.currentTarget.value);
							}}
							oninput={(event) =>
								editHex(event.currentTarget.value, event instanceof InputEvent && event.isComposing)}
							onkeydown={(event) => {
								if (event.key !== "Enter" || event.isComposing || composing) return;
								event.preventDefault();
								commitHexText();
							}}
							onblur={commitHexText}
							class="h-7.5 w-full min-w-0 flex-1 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring aria-invalid:border-destructive dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]"
						/>
						{#if alpha}
							<div class="relative flex w-14 shrink-0 items-center">
								<input
									type="number"
									min={0}
									max={100}
									aria-label={`${label}：不透明度百分比`}
									value={alphaPercent}
									onchange={(event) => updateAlphaInput(event.currentTarget.value)}
									class="h-7.5 w-full rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white pr-4.5 pl-1.5 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span
									aria-hidden="true"
									class="pointer-events-none absolute right-1.5 font-mono text-[10px] text-muted-foreground"
									>%</span
								>
							</div>
						{/if}
					</div>
					{#if hexInvalid}
						<p
							id={`${id}-error`}
							role="alert"
							class="flex items-start gap-1 text-[11px] text-destructive"
						>
							<svg
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
								class="mt-0.5 size-3 shrink-0"
							>
								<circle cx="8" cy="8" r="6" />
								<path d="M8 5.25v3" />
								<path d="M8 10.75h.01" />
							</svg>
							<span>只能输入十六进制字符 0-9、a-f，如 #1e40af。</span>
						</p>
					{/if}
				{:else if activeFormat === "rgb"}
					<div class={cn("grid gap-1", alpha ? "grid-cols-4" : "grid-cols-3")}>
						{#each [
							{ key: "r" as const, label: "R", value: rgba.r },
							{ key: "g" as const, label: "G", value: rgba.g },
							{ key: "b" as const, label: "B", value: rgba.b },
						] as ch (ch.key)}
							<label class="grid gap-1">
								<input
									type="number"
									min={0}
									max={255}
									aria-label={`${label}：${ch.label}`}
									value={ch.value}
									onchange={(event) => updateRgbChannel(ch.key, event.currentTarget.value)}
									class="h-7.5 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-1 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground"
									>{ch.label}</span
								>
							</label>
						{/each}
						{#if alpha}
							<label class="grid gap-1">
								<input
									type="number"
									min={0}
									max={100}
									aria-label={`${label}：不透明度百分比`}
									value={alphaPercent}
									onchange={(event) => updateAlphaInput(event.currentTarget.value)}
									class="h-7.5 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-1 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">A%</span>
							</label>
						{/if}
					</div>
				{:else if activeFormat === "hsl"}
					<div class={cn("grid gap-1", alpha ? "grid-cols-4" : "grid-cols-3")}>
						{#each [
							{ key: "h" as const, label: "H", value: hsla.h, max: 360 },
							{ key: "s" as const, label: "S%", value: hsla.s, max: 100 },
							{ key: "l" as const, label: "L%", value: hsla.l, max: 100 },
						] as ch (ch.key)}
							<label class="grid gap-1">
								<input
									type="number"
									min={0}
									max={ch.max}
									aria-label={`${label}：${ch.label}`}
									value={ch.value}
									onchange={(event) => updateHslChannel(ch.key, event.currentTarget.value)}
									class="h-7.5 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-1 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground"
									>{ch.label}</span
								>
							</label>
						{/each}
						{#if alpha}
							<label class="grid gap-1">
								<input
									type="number"
									min={0}
									max={100}
									aria-label={`${label}：不透明度百分比`}
									value={alphaPercent}
									onchange={(event) => updateAlphaInput(event.currentTarget.value)}
									class="h-7.5 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-1 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">A%</span>
							</label>
						{/if}
					</div>
				{:else}
					<div class={cn("grid gap-1", alpha ? "grid-cols-4" : "grid-cols-3")}>
						{#each [
							{ key: "l" as const, label: "L", value: Number(oklcha.l.toFixed(2)), max: 1, step: 0.01 },
							{ key: "c" as const, label: "C", value: Number(oklcha.c.toFixed(2)), max: 0.4, step: 0.01 },
							{ key: "h" as const, label: "H", value: Math.round(oklcha.h), max: 360, step: 1 },
						] as ch (ch.key)}
							<label class="grid gap-1">
								<input
									type="number"
									min={0}
									max={ch.max}
									step={ch.step}
									aria-label={`${label}：OKLCH ${ch.label}`}
									value={ch.value}
									onchange={(event) => updateOklchChannel(ch.key, event.currentTarget.value)}
									class="h-7.5 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-1 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground"
									>{ch.label}</span
								>
							</label>
						{/each}
						{#if alpha}
							<label class="grid gap-1">
								<input
									type="number"
									min={0}
									max={100}
									aria-label={`${label}：不透明度百分比`}
									value={alphaPercent}
									onchange={(event) => updateAlphaInput(event.currentTarget.value)}
									class="h-7.5 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-1 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">A%</span>
							</label>
						{/if}
					</div>
				{/if}
			</div>

			<!-- 4. Presets & Recent swatches (fixed single-tier footer so popover height never jumps) -->
			{#if normalizedPresets.length || renderedRecent.length}
				<div class="grid gap-1.5 border-t-[0.5px] border-border/80 pt-2">
					<div class="flex items-center gap-3">
						{#if normalizedPresets.length && renderedRecent.length}
							<button
								type="button"
								aria-pressed={effectiveSwatchTab === "presets"}
								onclick={() => (swatchTab = "presets")}
								class={cn(
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
								onclick={() => (swatchTab = "recent")}
								class={cn(
									"inline-flex items-center gap-1 text-[11px] font-medium outline-none transition-colors focus-visible:underline",
									effectiveSwatchTab === "recent"
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								最近使用
								<span class="font-mono text-[10px] tabular-nums text-muted-foreground"
									>{renderedRecent.length}</span
								>
							</button>
						{:else if normalizedPresets.length}
							<span class="text-[11px] font-medium text-muted-foreground">预设色</span>
						{:else}
							<span class="text-[11px] font-medium text-muted-foreground">最近使用</span>
						{/if}
					</div>
					<div
						role="group"
						aria-label={effectiveSwatchTab === "presets" ? `${label}：预设` : `${label}：最近使用`}
						class="flex flex-wrap gap-1.5"
					>
						{#each activeSwatches as item (item.hex)}
							<button
								type="button"
								aria-label={item.hex}
								title={item.hex}
								aria-pressed={item.hex === current}
								class={cn(
									CHECKER_CLASS,
									"relative inline-flex size-5.5 items-center justify-center overflow-hidden rounded-[5px] border-[0.5px] border-black/15 outline-none transition-colors duration-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-white/20"
								)}
								onclick={() => {
									setHex(item.hex, true);
									hexText = current;
								}}
							>
								<span class="absolute inset-0 block" style:background={rgbaToCss(item.rgba)}></span>
								{#if item.hex === current}
									<svg
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
										class="relative z-10 size-3"
										style:color={item.light ? "#0f172a" : "#ffffff"}
									>
										<path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</Popover.Content>
	</Popover.Root>
</SdkColorPicker>
