<script lang="ts">
import type { PopoverContent as PopoverPanel } from "../popover";
import type { HTMLAttributes } from "vue";
import { normalizeHex, normalizeHexColor, type ColorFormat } from "./color";

export { normalizeHex };

export type ColorPickerContentProps = Omit<
	InstanceType<typeof PopoverPanel>["$props"],
	"key" | "ref" | "as" | "asChild"
> &
	HTMLAttributes;

export interface ColorPickerProps {
	/** Visible label; also names the trigger and inputs. */
	label: string;
	/** Hex color such as `#1e40af` (or `#1e40af80` when `alpha` is enabled). */
	modelValue?: string;
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
	id?: string;
	class?: HTMLAttributes["class"];
	contentProps?: ColorPickerContentProps;
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
</script>

<script setup lang="ts">
import {
	ColorPicker as SdkColorPicker,
	createColorPickerController,
} from "@ui-sdk/vue/color-picker";
import { cn } from "cn";
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
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
} from "./color";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ColorPickerProps>(), {
	defaultValue: "#000000",
	presets: () => [],
	alpha: true,
	format: "hex",
	showRecent: true,
	recentKey: DEFAULT_RECENT_KEY,
});
const emit = defineEmits<{ "update:modelValue": [value: string]; valueChange: [value: string] }>();

const fallbackId = useId();
const id = computed(() => props.id ?? fallbackId);
const panelLabelId = `valar-color-picker-panel-${fallbackId}`;
const localValue = ref(props.defaultValue);
const controller = createColorPickerController();

const current = computed(
	() => normalizeHexColor(props.modelValue ?? localValue.value, props.alpha) ?? "#000000"
);
const rgba = computed<RgbaColor>(
	() => hexToRgba(current.value, props.alpha) ?? { r: 0, g: 0, b: 0, a: 1 }
);

const hue = ref(rgbaToHsva(rgba.value).h);
const activeFormat = ref<ColorFormat>(props.format);
const swatchTab = ref<"presets" | "recent">("presets");
const open = ref(false);
const draft = ref<string>();
const eyeDropperSupported = ref(false);
const pickingEyeDropper = ref(false);
const copied = ref(false);
const recentColors = ref<string[]>([]);

let composing = false;
let dragging: "area" | "hue" | "alpha" | null = null;
let copyTimer: ReturnType<typeof setTimeout> | undefined;
let lastKeyboardCommitAt = 0;

const hsva = computed(() => rgbaToHsva(rgba.value, hue.value));
const hsla = computed(() => rgbaToHsla(rgba.value, hue.value));
const oklcha = computed(() => rgbaToOklcha(rgba.value, hue.value));
const alphaPercent = computed(() => Math.round(rgba.value.a * 100));
const cssColor = computed(() => rgbaToCss(rgba.value));
const opaqueRgbCss = computed(() => `rgb(${rgba.value.r} ${rgba.value.g} ${rgba.value.b})`);
const pureHueCss = computed(() => `hsl(${Math.round(hue.value)} 100% 50%)`);
const formattedValue = computed(() =>
	formatColor(rgba.value, activeFormat.value, props.alpha, hue.value)
);

const hexText = computed(() => draft.value ?? current.value);
const hexInvalid = computed(() => {
	const t = hexText.value.trim();
	if (!t) return false;
	if (/^(?:rgb|rgba|hsl|hsla|oklch)\b/i.test(t)) return false;
	const limit = props.alpha ? 8 : 6;
	return !new RegExp(`^#?[\\da-f]{0,${limit}}$`, "i").test(t);
});

const normalizedPresets = computed(() => {
	const seen = new Set<string>();
	const out: { hex: string; rgba: RgbaColor; light: boolean }[] = [];
	for (const item of props.presets) {
		const hex = normalizeHexColor(item, props.alpha);
		if (!hex || seen.has(hex)) continue;
		const parsed = hexToRgba(hex, props.alpha);
		if (!parsed) continue;
		seen.add(hex);
		out.push({ hex, rgba: parsed, light: isLightColor(parsed) });
	}
	return out;
});

const renderedRecent = computed(() => {
	if (!props.showRecent) return [];
	const out: { hex: string; rgba: RgbaColor; light: boolean }[] = [];
	for (const item of recentColors.value) {
		const hex = normalizeHexColor(item, props.alpha);
		if (!hex) continue;
		const parsed = hexToRgba(hex, props.alpha);
		if (!parsed) continue;
		out.push({ hex, rgba: parsed, light: isLightColor(parsed) });
	}
	return out;
});

const effectiveSwatchTab = computed<"presets" | "recent">(() =>
	normalizedPresets.value.length && renderedRecent.value.length
		? swatchTab.value
		: normalizedPresets.value.length
			? "presets"
			: "recent"
);
const activeSwatches = computed(() =>
	effectiveSwatchTab.value === "presets" ? normalizedPresets.value : renderedRecent.value
);

const rgbChannels = computed(() => [
	{ key: "r" as const, label: "R", value: rgba.value.r },
	{ key: "g" as const, label: "G", value: rgba.value.g },
	{ key: "b" as const, label: "B", value: rgba.value.b },
]);
const hslChannels = computed(() => [
	{ key: "h" as const, label: "H", value: hsla.value.h, max: 360 },
	{ key: "s" as const, label: "S%", value: hsla.value.s, max: 100 },
	{ key: "l" as const, label: "L%", value: hsla.value.l, max: 100 },
]);
const oklchChannels = computed(() => [
	{ key: "l" as const, label: "L", value: Number(oklcha.value.l.toFixed(2)), max: 1, step: 0.01 },
	{
		key: "c" as const,
		label: "C",
		value: Number(oklcha.value.c.toFixed(2)),
		max: 0.4,
		step: 0.01,
	},
	{ key: "h" as const, label: "H", value: Math.round(oklcha.value.h), max: 360, step: 1 },
]);

const content = computed(() => {
	const { class: _, ...options } = props.contentProps ?? {};
	return options;
});

onMounted(() => {
	eyeDropperSupported.value = typeof window !== "undefined" && "EyeDropper" in window;
	if (props.showRecent) {
		recentColors.value = readRecent(props.recentKey, props.alpha);
	}
});

onBeforeUnmount(() => {
	clearTimeout(copyTimer);
});

watch(
	() => props.disabled,
	(disabled) => {
		if (disabled) open.value = false;
	}
);

watch(rgba, (next) => {
	if (Math.max(next.r, next.g, next.b) - Math.min(next.r, next.g, next.b) > 0) {
		hue.value = rgbaToHsva(next, hue.value).h;
	}
});

function recordRecent(hex: string, replaceRecent = false) {
	if (!props.showRecent) return;
	const normalized = normalizeHexColor(hex, props.alpha);
	if (!normalized) return;
	const now = Date.now();
	const base =
		replaceRecent && recentColors.value.length > 0 && now - lastKeyboardCommitAt < 1500
			? recentColors.value.slice(1)
			: recentColors.value;
	lastKeyboardCommitAt = replaceRecent ? now : 0;
	const next = [normalized, ...base.filter((item) => item !== normalized)].slice(0, MAX_RECENT);
	recentColors.value = next;
	writeRecent(props.recentKey, next);
}

function onColorChange(next: string) {
	const normalized = normalizeHexColor(next, props.alpha);
	if (!normalized) return;
	if (props.modelValue === undefined) localValue.value = normalized;
	emit("update:modelValue", normalized);
	emit("valueChange", normalized);
}

function setHex(next: string | undefined, commitRecent = false) {
	if (props.disabled || !next) return;
	const normalized = normalizeHexColor(next, props.alpha);
	if (!normalized) return;
	if (normalized !== current.value) {
		controller.setValue(normalized, { reason: "input-commit" });
	}
	if (commitRecent) recordRecent(normalized);
}

function applyRgba(next: RgbaColor, commitRecent = false) {
	const hex = rgbaToHex(next, props.alpha);
	setHex(hex, commitRecent);
	draft.value = undefined;
}

function setOpen(next: boolean) {
	if (next && props.disabled) return;
	if (next) {
		draft.value = undefined;
		composing = false;
		if (props.showRecent) recentColors.value = readRecent(props.recentKey, props.alpha);
	}
	open.value = next;
}

function editHex(event: Event) {
	const next = (event.currentTarget as HTMLInputElement).value;
	draft.value = next;
	if (composing || (event as InputEvent).isComposing) return;
	const trimmed = next.trim();
	if (/^#?[\da-f]{6}$/i.test(trimmed) || (props.alpha && /^#?[\da-f]{8}$/i.test(trimmed))) {
		setHex(trimmed);
	}
}

function commitHexText(event: Event) {
	if (composing) {
		draft.value = undefined;
		return;
	}
	const raw = (event.currentTarget as HTMLInputElement).value;
	const parsed = parseColorInput(raw, props.alpha);
	if (parsed) {
		if (Math.max(parsed.r, parsed.g, parsed.b) - Math.min(parsed.r, parsed.g, parsed.b) > 0) {
			hue.value = rgbaToHsva(parsed, hue.value).h;
		}
		applyRgba(parsed, true);
	} else {
		draft.value = undefined;
	}
}

function onHexKeyDown(event: KeyboardEvent) {
	if (event.key !== "Enter" || event.isComposing || composing) return;
	event.preventDefault();
	commitHexText(event);
}

function updateAreaFromPointer(el: HTMLElement, clientX: number, clientY: number) {
	const rect = el.getBoundingClientRect();
	if (!rect.width || !rect.height) return;
	const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * 100;
	const v = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height)) * 100;
	applyRgba(hsvaToRgba({ h: hue.value, s, v, a: rgba.value.a }));
}

function updateHueFromPointer(el: HTMLElement, clientX: number) {
	const rect = el.getBoundingClientRect();
	if (!rect.width) return;
	const nextHue = Math.min(360, Math.max(0, ((clientX - rect.left) / rect.width) * 360));
	hue.value = nextHue;
	applyRgba(hsvaToRgba({ h: nextHue, s: hsva.value.s, v: hsva.value.v, a: rgba.value.a }));
}

function updateAlphaFromPointer(el: HTMLElement, clientX: number) {
	const rect = el.getBoundingClientRect();
	if (!rect.width) return;
	const nextAlpha = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
	applyRgba({ ...rgba.value, a: nextAlpha });
}

function onAreaPointerDown(event: PointerEvent) {
	if (props.disabled) return;
	const el = event.currentTarget as HTMLElement;
	el.focus();
	el.setPointerCapture(event.pointerId);
	dragging = "area";
	updateAreaFromPointer(el, event.clientX, event.clientY);
}

function onAreaPointerMove(event: PointerEvent) {
	if (dragging !== "area") return;
	updateAreaFromPointer(event.currentTarget as HTMLElement, event.clientX, event.clientY);
}

function onAreaPointerUp() {
	if (dragging !== "area") return;
	dragging = null;
	recordRecent(current.value);
}

function onHuePointerDown(event: PointerEvent) {
	if (props.disabled) return;
	const el = event.currentTarget as HTMLElement;
	el.focus();
	el.setPointerCapture(event.pointerId);
	dragging = "hue";
	updateHueFromPointer(el, event.clientX);
}

function onHuePointerMove(event: PointerEvent) {
	if (dragging !== "hue") return;
	updateHueFromPointer(event.currentTarget as HTMLElement, event.clientX);
}

function onHuePointerUp() {
	if (dragging !== "hue") return;
	dragging = null;
	recordRecent(current.value);
}

function onAlphaPointerDown(event: PointerEvent) {
	if (props.disabled) return;
	const el = event.currentTarget as HTMLElement;
	el.focus();
	el.setPointerCapture(event.pointerId);
	dragging = "alpha";
	updateAlphaFromPointer(el, event.clientX);
}

function onAlphaPointerMove(event: PointerEvent) {
	if (dragging !== "alpha") return;
	updateAlphaFromPointer(event.currentTarget as HTMLElement, event.clientX);
}

function onAlphaPointerUp() {
	if (dragging !== "alpha") return;
	dragging = null;
	recordRecent(current.value);
}

function onPointerCancel() {
	dragging = null;
}

function onAreaKeyDown(event: KeyboardEvent) {
	if (props.disabled) return;
	const step = event.shiftKey ? 10 : 2;
	let s = hsva.value.s;
	let v = hsva.value.v;
	if (event.key === "ArrowRight") s = Math.min(100, s + step);
	else if (event.key === "ArrowLeft") s = Math.max(0, s - step);
	else if (event.key === "ArrowUp") v = Math.min(100, v + step);
	else if (event.key === "ArrowDown") v = Math.max(0, v - step);
	else if (event.key === "Home") s = 0;
	else if (event.key === "End") s = 100;
	else return;
	event.preventDefault();
	const next = hsvaToRgba({ h: hue.value, s, v, a: rgba.value.a });
	applyRgba(next);
	recordRecent(rgbaToHex(next, props.alpha), true);
}

function onHueKeyDown(event: KeyboardEvent) {
	if (props.disabled) return;
	const step = event.shiftKey ? 15 : 3;
	let nextHue = hue.value;
	if (event.key === "ArrowRight" || event.key === "ArrowUp")
		nextHue = Math.min(360, hue.value + step);
	else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
		nextHue = Math.max(0, hue.value - step);
	else if (event.key === "Home") nextHue = 0;
	else if (event.key === "End") nextHue = 360;
	else return;
	event.preventDefault();
	hue.value = nextHue;
	const next = hsvaToRgba({ h: nextHue, s: hsva.value.s, v: hsva.value.v, a: rgba.value.a });
	applyRgba(next);
	recordRecent(rgbaToHex(next, props.alpha), true);
}

function onAlphaKeyDown(event: KeyboardEvent) {
	if (props.disabled || !props.alpha) return;
	const step = event.shiftKey ? 0.1 : 0.02;
	let nextAlpha = rgba.value.a;
	if (event.key === "ArrowRight" || event.key === "ArrowUp")
		nextAlpha = Math.min(1, rgba.value.a + step);
	else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
		nextAlpha = Math.max(0, rgba.value.a - step);
	else if (event.key === "Home") nextAlpha = 0;
	else if (event.key === "End") nextAlpha = 1;
	else return;
	event.preventDefault();
	const next = { ...rgba.value, a: nextAlpha };
	applyRgba(next);
	recordRecent(rgbaToHex(next, props.alpha), true);
}

function updateRgbChannel(channel: "r" | "g" | "b", event: Event) {
	const n = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);
	if (!Number.isFinite(n)) return;
	applyRgba({ ...rgba.value, [channel]: Math.min(255, Math.max(0, n)) }, true);
}

function updateHslChannel(channel: "h" | "s" | "l", event: Event) {
	const n = Number.parseFloat((event.currentTarget as HTMLInputElement).value);
	if (!Number.isFinite(n)) return;
	const next = { ...hsla.value };
	if (channel === "h") {
		next.h = ((n % 360) + 360) % 360;
		hue.value = next.h;
	} else {
		next[channel] = Math.min(100, Math.max(0, n));
	}
	applyRgba(hslaToRgba(next), true);
}

function updateOklchChannel(channel: "l" | "c" | "h", event: Event) {
	const n = Number.parseFloat((event.currentTarget as HTMLInputElement).value);
	if (!Number.isFinite(n)) return;
	const next = { ...oklcha.value };
	if (channel === "l") next.l = Math.min(1, Math.max(0, n));
	else if (channel === "c") next.c = Math.min(0.4, Math.max(0, n));
	else next.h = ((n % 360) + 360) % 360;
	applyRgba(oklchaToRgba(next), true);
}

function updateAlphaInput(event: Event) {
	const n = Number.parseFloat((event.currentTarget as HTMLInputElement).value);
	if (!Number.isFinite(n)) return;
	applyRgba({ ...rgba.value, a: Math.min(100, Math.max(0, n)) / 100 }, true);
}

async function pickWithEyeDropper() {
	if (!eyeDropperSupported.value || pickingEyeDropper.value || props.disabled) return;
	const ctor = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
	if (!ctor) return;
	pickingEyeDropper.value = true;
	try {
		const result = await new ctor().open();
		if (result?.sRGBHex) {
			const parsed = hexToRgba(result.sRGBHex, false);
			if (parsed) {
				applyRgba({ ...parsed, a: props.alpha ? rgba.value.a : 1 }, true);
			}
		}
	} catch {
		// User cancelled the screen eyedropper.
	} finally {
		pickingEyeDropper.value = false;
	}
}

function copyFormatted() {
	navigator.clipboard
		?.writeText(formattedValue.value)
		.then(() => {
			copied.value = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied.value = false), 1500);
		})
		.catch(() => {});
}

function selectSwatch(hex: string) {
	setHex(hex, true);
	draft.value = undefined;
}
</script>

<template>
	<SdkColorPicker
		v-bind="$attrs"
		:id="props.id"
		:controller="controller"
		:value="current"
		space="srgb"
		format="hex"
		:disabled="disabled"
		:name="name"
		@value-change="onColorChange"
		data-slot="color-picker"
		:data-disabled="disabled || undefined"
		:class="cn('grid gap-2', props.class)"
	>
		<span :id="`${id}-label`" class="text-[13px] leading-[17px] font-medium text-foreground">{{
			label
		}}</span>
		<Popover :open="open && !disabled" @update:open="setOpen">
			<PopoverTrigger
				:disabled="disabled"
				:aria-labelledby="`${id}-label ${id}-value`"
				class="flex h-8 w-full items-center gap-2 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2.5 text-[13px] text-foreground outline-none transition-colors duration-150 hover:bg-accent/50 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] dark:hover:bg-[lch(12%_1_272)]"
			>
				<span
					data-slot="color-picker-swatch"
					aria-hidden="true"
					:class="
						cn(
							CHECKER_CLASS,
							'relative size-4 shrink-0 overflow-hidden rounded-[4px] border-[0.5px] border-black/15 dark:border-white/20'
						)
					"
				>
					<span class="absolute inset-0 block" :style="{ background: cssColor }" />
				</span>
				<span :id="`${id}-value`" class="min-w-0 truncate font-mono text-xs tabular-nums">{{
					current
				}}</span>
				<span
					v-if="alpha && alphaPercent < 100"
					class="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
					>{{ alphaPercent }}%</span
				>
				<svg
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					:class="
						cn('size-3.5 shrink-0 text-muted-foreground', !(alpha && alphaPercent < 100) && 'ml-auto')
					"
				>
					<path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
				</svg>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				v-bind="content"
				as-child
				data-slot="color-picker-content"
				:class="
					cn(
						'grid w-64 gap-3 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]',
						props.contentProps?.class
					)
				"
			>
				<!-- The slotted root overrides Reka's trigger-derived dialog name. -->
				<div
					:aria-labelledby="
						content['aria-labelledby'] ?? (content['aria-label'] ? undefined : panelLabelId)
					"
				>
					<span :id="panelLabelId" class="sr-only">{{ label }}</span>

					<!-- 1. Interactive 2D Saturation / Value color board -->
					<div
						role="slider"
						:tabindex="disabled ? -1 : 0"
						data-slot="color-picker-area"
						:aria-label="`${label}：饱和度与明度`"
						:aria-valuemin="0"
						:aria-valuemax="100"
						:aria-valuenow="Math.round(hsva.s)"
						:aria-valuetext="`饱和度 ${Math.round(hsva.s)}%，明度 ${Math.round(hsva.v)}%`"
						class="[forced-color-adjust:none] relative h-26 w-full cursor-crosshair overflow-hidden rounded-md select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
						:style="{
							backgroundColor: pureHueCss,
							backgroundImage:
								'linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent)',
						}"
						@pointerdown="onAreaPointerDown"
						@pointermove="onAreaPointerMove"
						@pointerup="onAreaPointerUp"
						@pointercancel="onPointerCancel"
						@keydown="onAreaKeyDown"
					>
						<span
							aria-hidden="true"
							class="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.45),0_1px_3px_rgb(0_0_0/0.35)]"
							:style="{
								left: `${hsva.s}%`,
								top: `${100 - hsva.v}%`,
								background: opaqueRgbCss,
							}"
						/>
					</div>

					<!-- 2. Eyedropper + live preview swatch + Hue & Alpha sliders -->
					<div class="flex items-center gap-2">
						<button
							v-if="eyeDropperSupported"
							type="button"
							:aria-label="`${label}：吸管取色`"
							title="吸管取色"
							:disabled="disabled || pickingEyeDropper"
							@click="pickWithEyeDropper"
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

						<div
							data-slot="color-picker-preview"
							aria-hidden="true"
							:class="
								cn(
									CHECKER_CLASS,
									'relative size-7 shrink-0 overflow-hidden rounded-md border-[0.5px] border-black/15 dark:border-white/20'
								)
							"
						>
							<span class="absolute inset-0 block" :style="{ background: cssColor }" />
						</div>

						<div class="grid min-w-0 flex-1 gap-2">
							<!-- Hue slider -->
							<div
								role="slider"
								:tabindex="disabled ? -1 : 0"
								data-slot="color-picker-hue"
								:aria-label="`${label}：色相`"
								:aria-valuemin="0"
								:aria-valuemax="360"
								:aria-valuenow="Math.round(hue)"
								:aria-valuetext="`${Math.round(hue)}°`"
								class="[forced-color-adjust:none] relative h-2.5 w-full cursor-pointer rounded-full select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15"
								style="background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
								@pointerdown="onHuePointerDown"
								@pointermove="onHuePointerMove"
								@pointerup="onHuePointerUp"
								@pointercancel="onPointerCancel"
								@keydown="onHueKeyDown"
							>
								<span
									aria-hidden="true"
									class="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_2px_rgb(0_0_0/0.3)]"
									:style="{ left: `${(hue / 360) * 100}%`, background: pureHueCss }"
								/>
							</div>

							<!-- Alpha slider -->
							<div
								v-if="alpha"
								role="slider"
								:tabindex="disabled ? -1 : 0"
								data-slot="color-picker-alpha"
								:aria-label="`${label}：不透明度`"
								:aria-valuemin="0"
								:aria-valuemax="100"
								:aria-valuenow="alphaPercent"
								:aria-valuetext="`${alphaPercent}%`"
								:class="
									cn(
										CHECKER_CLASS,
										'relative h-2.5 w-full cursor-pointer rounded-full select-none touch-none outline-none ring-1 ring-inset ring-black/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:ring-white/15'
									)
								"
								@pointerdown="onAlphaPointerDown"
								@pointermove="onAlphaPointerMove"
								@pointerup="onAlphaPointerUp"
								@pointercancel="onPointerCancel"
								@keydown="onAlphaKeyDown"
							>
								<span
									aria-hidden="true"
									class="pointer-events-none absolute inset-0 rounded-full"
									:style="{ background: `linear-gradient(to right, transparent, ${opaqueRgbCss})` }"
								/>
								<span
									aria-hidden="true"
									class="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_2px_rgb(0_0_0/0.3)]"
									:style="{ left: `${alphaPercent}%`, background: cssColor }"
								/>
							</div>
						</div>
					</div>

					<!-- 3. Format switcher + Copy + Editable channel inputs -->
					<div class="grid gap-1.5">
						<div class="flex items-center justify-between gap-1.5">
							<div
								role="group"
								:aria-label="`${label}：色值格式`"
								class="grid flex-1 grid-cols-4 rounded-md bg-muted/70 p-0.5"
							>
								<button
									v-for="item of FORMATS"
									:key="item.id"
									type="button"
									:aria-pressed="activeFormat === item.id"
									@click="
										activeFormat = item.id;
										draft = undefined;
									"
									:class="
										cn(
											'h-5.5 rounded-[5px] text-[10px] font-medium tracking-wide outline-none transition-colors duration-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring',
											activeFormat === item.id
												? 'bg-background text-foreground shadow-xs'
												: 'text-muted-foreground hover:text-foreground'
										)
									"
								>
									{{ item.label }}
								</button>
							</div>
							<button
								type="button"
								:aria-label="copied ? '已复制色值' : '复制当前色值'"
								:title="copied ? '已复制' : `复制 ${formattedValue}`"
								@click="copyFormatted"
								class="inline-flex size-6.5 shrink-0 items-center justify-center rounded-md border-[0.5px] border-border bg-background text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring"
							>
								<svg
									v-if="copied"
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
								<svg
									v-else
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
							</button>
						</div>

						<template v-if="activeFormat === 'hex'">
							<div class="flex items-center gap-1.5">
								<input
									type="text"
									:aria-label="`${label}：十六进制`"
									:aria-invalid="hexInvalid || undefined"
									:aria-describedby="hexInvalid ? `${id}-error` : undefined"
									spellcheck="false"
									autocomplete="off"
									:maxlength="alpha ? 36 : 7"
									:value="hexText"
									@compositionstart="composing = true"
									@compositionend="
										composing = false;
										editHex($event);
									"
									@input="editHex"
									@keydown="onHexKeyDown"
									@blur="commitHexText"
									class="h-7.5 w-full min-w-0 flex-1 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring aria-invalid:border-destructive dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]"
								/>
								<div v-if="alpha" class="relative flex w-14 shrink-0 items-center">
									<input
										type="number"
										:min="0"
										:max="100"
										:aria-label="`${label}：不透明度百分比`"
										:value="alphaPercent"
										@change="updateAlphaInput"
										class="h-7.5 w-full rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white pr-4.5 pl-1.5 text-center font-mono text-[11px] tabular-nums text-foreground outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									/>
									<span
										aria-hidden="true"
										class="pointer-events-none absolute right-1.5 font-mono text-[10px] text-muted-foreground"
										>%</span
									>
								</div>
							</div>
							<p
								v-if="hexInvalid"
								:id="`${id}-error`"
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
						</template>

						<div
							v-else-if="activeFormat === 'rgb'"
							:class="cn('grid gap-1', alpha ? 'grid-cols-4' : 'grid-cols-3')"
						>
							<label v-for="ch of rgbChannels" :key="ch.key" class="grid gap-1">
								<input
									type="number"
									:min="0"
									:max="255"
									:aria-label="`${label}：${ch.label}`"
									:value="ch.value"
									@change="updateRgbChannel(ch.key, $event)"
									:class="CHANNEL_INPUT_CLASS"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">{{
									ch.label
								}}</span>
							</label>
							<label v-if="alpha" class="grid gap-1">
								<input
									type="number"
									:min="0"
									:max="100"
									:aria-label="`${label}：不透明度百分比`"
									:value="alphaPercent"
									@change="updateAlphaInput"
									:class="CHANNEL_INPUT_CLASS"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">A%</span>
							</label>
						</div>

						<div
							v-else-if="activeFormat === 'hsl'"
							:class="cn('grid gap-1', alpha ? 'grid-cols-4' : 'grid-cols-3')"
						>
							<label v-for="ch of hslChannels" :key="ch.key" class="grid gap-1">
								<input
									type="number"
									:min="0"
									:max="ch.max"
									:aria-label="`${label}：${ch.label}`"
									:value="ch.value"
									@change="updateHslChannel(ch.key, $event)"
									:class="CHANNEL_INPUT_CLASS"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">{{
									ch.label
								}}</span>
							</label>
							<label v-if="alpha" class="grid gap-1">
								<input
									type="number"
									:min="0"
									:max="100"
									:aria-label="`${label}：不透明度百分比`"
									:value="alphaPercent"
									@change="updateAlphaInput"
									:class="CHANNEL_INPUT_CLASS"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">A%</span>
							</label>
						</div>

						<div v-else :class="cn('grid gap-1', alpha ? 'grid-cols-4' : 'grid-cols-3')">
							<label v-for="ch of oklchChannels" :key="ch.key" class="grid gap-1">
								<input
									type="number"
									:min="0"
									:max="ch.max"
									:step="ch.step"
									:aria-label="`${label}：OKLCH ${ch.label}`"
									:value="ch.value"
									@change="updateOklchChannel(ch.key, $event)"
									:class="CHANNEL_INPUT_CLASS"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">{{
									ch.label
								}}</span>
							</label>
							<label v-if="alpha" class="grid gap-1">
								<input
									type="number"
									:min="0"
									:max="100"
									:aria-label="`${label}：不透明度百分比`"
									:value="alphaPercent"
									@change="updateAlphaInput"
									:class="CHANNEL_INPUT_CLASS"
								/>
								<span class="text-center text-[10px] font-medium text-muted-foreground">A%</span>
							</label>
						</div>
					</div>

					<!-- 4. Presets & Recent swatches (fixed single-tier footer) -->
					<div
						v-if="normalizedPresets.length || renderedRecent.length"
						class="grid gap-1.5 border-t-[0.5px] border-border/80 pt-2"
					>
						<div class="flex items-center gap-3">
							<template v-if="normalizedPresets.length && renderedRecent.length">
								<button
									type="button"
									:aria-pressed="effectiveSwatchTab === 'presets'"
									@click="swatchTab = 'presets'"
									:class="
										cn(
											'text-[11px] font-medium outline-none transition-colors focus-visible:underline',
											effectiveSwatchTab === 'presets'
												? 'text-foreground'
												: 'text-muted-foreground hover:text-foreground'
										)
									"
								>
									预设色
								</button>
								<button
									type="button"
									:aria-pressed="effectiveSwatchTab === 'recent'"
									@click="swatchTab = 'recent'"
									:class="
										cn(
											'inline-flex items-center gap-1 text-[11px] font-medium outline-none transition-colors focus-visible:underline',
											effectiveSwatchTab === 'recent'
												? 'text-foreground'
												: 'text-muted-foreground hover:text-foreground'
										)
									"
								>
									最近使用
									<span class="font-mono text-[10px] tabular-nums text-muted-foreground">{{
										renderedRecent.length
									}}</span>
								</button>
							</template>
							<span
								v-else-if="normalizedPresets.length"
								class="text-[11px] font-medium text-muted-foreground"
								>预设色</span
							>
							<span v-else class="text-[11px] font-medium text-muted-foreground">最近使用</span>
						</div>
						<div
							role="group"
							:aria-label="
								effectiveSwatchTab === 'presets' ? `${label}：预设` : `${label}：最近使用`
							"
							class="flex flex-wrap gap-1.5"
						>
							<button
								v-for="item of activeSwatches"
								:key="item.hex"
								type="button"
								:aria-label="item.hex"
								:title="item.hex"
								:aria-pressed="item.hex === current"
								:class="
									cn(
										CHECKER_CLASS,
										'relative inline-flex size-5.5 items-center justify-center overflow-hidden rounded-[5px] border-[0.5px] border-black/15 outline-none transition-colors duration-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring dark:border-white/20'
									)
								"
								@click="selectSwatch(item.hex)"
							>
								<span
									class="absolute inset-0 block"
									:style="{ background: rgbaToCss(item.rgba) }"
								/>
								<svg
									v-if="item.hex === current"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
									class="relative z-10 size-3"
									:style="{ color: item.light ? '#0f172a' : '#ffffff' }"
								>
									<path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	</SdkColorPicker>
</template>
