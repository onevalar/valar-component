<script lang="ts" module>
	import type { Content as PopoverContent } from "$lib/registry/ui/popover/index.js";
	import type { ComponentProps } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type ColorPickerPreset = string | { color: string; label: string };

	export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		/** Names the trigger and the inputs. Visible in the default appearance. */
		label: string;
		appearance?: "default" | "label";
		/** Six-digit hex color such as `#1e40af`. Shorthand input is expanded. */
		value?: string;
		/** Optional swatches offered for one-click selection. */
		presets?: readonly ColorPickerPreset[];
		labels?: Partial<{
			custom: string;
			palette: string;
			area: string;
			hue: string;
			invalidHex: string;
		}>;
		disabled?: boolean;
		/** Submitted as the six-digit hex value. */
		name?: string;
		/** Popover Content configuration; portals remain enabled unless explicitly disabled. */
		contentProps?: Omit<ComponentProps<typeof PopoverContent>, "children" | "child">;
		onValueChange?: (value: string) => void;
	};

	const HEX = /^#?([\da-f]{3}|[\da-f]{6})$/i;

	/** Returns a lowercase `#rrggbb`, or undefined for anything that is not a 3/6-digit hex. */
	export function normalizeHex(input: string): string | undefined {
		const match = HEX.exec(input.trim());
		if (!match) return undefined;
		const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join("") : match[1]!;
		return `#${digits.toLowerCase()}`;
	}
</script>

<script lang="ts">
	import { onMount, tick, untrack } from "svelte";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { Root as ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import Palette from "@lucide/svelte/icons/palette";
	import Plus from "@lucide/svelte/icons/plus";
	import { cn } from "$lib/utils.js";
	import { fromHex, toHex, type Hsv } from "./hsv.js";

	let {
		label,
		appearance = "default",
		value = $bindable("#000000"),
		presets = [],
		labels,
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
	const current = $derived(normalizeHex(value) ?? "#000000");
	const messages = $derived({
		custom: "Set custom color",
		palette: "Select default color",
		area: "Saturation and brightness",
		hue: "Hue",
		invalidHex: "Enter a valid hex color.",
		...labels
	});
	const swatches = $derived.by(() => {
		const colors = new Map<string, string>();
		for (const preset of presets) {
			const color = normalizeHex(typeof preset === "string" ? preset : preset.color);
			if (color && !colors.has(color)) {
				colors.set(color, typeof preset === "string" ? color : preset.label);
			}
		}
		return Array.from(colors, ([color, name]) => ({ color, name }));
	});
	let text = $state("");
	let open = $state(false);
	let custom = $state(false);
	let customError = $state(false);
	let hsv = $state<Hsv>({ hue: 0, saturation: 0, brightness: 0 });
	let customButton = $state<HTMLButtonElement | null>(null);
	let defaultButton = $state<HTMLButtonElement | null>(null);
	let root: HTMLDivElement;
	let editorOwned = $state(false);
	const labelPanelClass =
		"w-[414px] gap-0 rounded-[6px] border-[lch(86.5%_0_282)] bg-white p-4 dark:border-[lch(23.52%_1.93_272)] dark:bg-[lch(12.72%_.85_272)]";
	const paletteButtonClass =
		"grid size-[22px] shrink-0 place-items-center rounded-full border border-border text-muted-foreground outline-none hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";
	// A portaled panel keeps its editor ownership even outside the editor's DOM subtree.
	onMount(() => {
		editorOwned = !!root.closest('[role="dialog"][data-component-tuner]');
	});
	// Partial input such as "#1e" is still being typed; only impossible characters are errors.
	const invalid = $derived(!/^#?[\da-f]{0,6}$/i.test(text.trim()));

	$effect(() => {
		// Opening resets the text box to the real value.
		if (open) text = untrack(() => current);
		else custom = false;
	});
	$effect(() => {
		if (disabled) open = false;
	});

	function set(next: string | undefined) {
		if (!next || next === current) return;
		value = next;
		onValueChange?.(next);
	}
	function commitText() {
		set(normalizeHex(text));
		text = current;
	}
	async function switchPalette(showCustom: boolean) {
		custom = showCustom;
		if (custom) {
			text = current;
			hsv = fromHex(current);
			customError = false;
		}
		await tick();
		(custom ? defaultButton : customButton)?.focus();
	}
	function chooseLabelColor(color: string) {
		set(color);
		open = false;
	}

	function setCustomColor(next: Hsv) {
		hsv = next;
		text = toHex(next);
		customError = false;
		set(text);
	}

	function clamp(value: number, max = 1) {
		return Math.max(0, Math.min(max, value));
	}

	function pickPointer(event: PointerEvent & { currentTarget: HTMLElement }, axis: "area" | "hue") {
		const target = event.currentTarget;
		if (event.type === "pointerdown") {
			if (event.button !== 0) return;
			target.setPointerCapture(event.pointerId);
			target.focus({ preventScroll: true });
		} else if (!target.hasPointerCapture(event.pointerId)) return;
		const box = target.getBoundingClientRect();
		const y = clamp((event.clientY - box.top) / box.height);
		setCustomColor(
			axis === "hue"
				? { ...hsv, hue: y * 360 }
				: {
						...hsv,
						saturation: clamp((event.clientX - box.left) / box.width),
						brightness: 1 - y
					}
		);
	}
	function adjustArea(event: KeyboardEvent) {
		const step = event.shiftKey ? 0.1 : 0.01;
		let { saturation, brightness } = hsv;
		switch (event.key) {
			case "ArrowLeft":
				saturation = clamp(saturation - step);
				break;
			case "ArrowRight":
				saturation = clamp(saturation + step);
				break;
			case "ArrowUp":
				brightness = clamp(brightness + step);
				break;
			case "ArrowDown":
				brightness = clamp(brightness - step);
				break;
			default:
				return;
		}
		event.preventDefault();
		setCustomColor({ ...hsv, saturation, brightness });
	}
	function adjustHue(event: KeyboardEvent) {
		const step = event.shiftKey ? 10 : 1;
		let hue = hsv.hue;
		switch (event.key) {
			case "ArrowUp":
			case "ArrowRight":
				hue = clamp(hue + step, 360);
				break;
			case "ArrowDown":
			case "ArrowLeft":
				hue = clamp(hue - step, 360);
				break;
			case "Home":
				hue = 0;
				break;
			case "End":
				hue = 360;
				break;
			default:
				return;
		}
		event.preventDefault();
		setCustomColor({ ...hsv, hue });
	}
</script>

<div
	bind:this={root}
	data-slot="color-picker"
	data-appearance={appearance}
	data-disabled={disabled || undefined}
	class={cn("grid gap-2", "cn-color-picker", className)}
	{...restProps}
>
	<span id={`${id}-label`} class={appearance === "label" ? "sr-only" : "text-sm font-medium"}
		>{label}</span
	>
	<Popover.Root bind:open>
		<Popover.Trigger
			{disabled}
			aria-labelledby={`${id}-label ${id}-value`}
			class={appearance === "label"
				? "grid size-[25px] place-items-center rounded-[8px] bg-transparent px-2 outline-none hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
				: "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-2 text-sm shadow-xs outline-none hover:bg-muted focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50"}
		>
			<span
				data-slot="color-picker-swatch"
				class={appearance === "label"
					? "size-[9px] rounded-full"
					: "size-5 shrink-0 rounded-sm border"}
				style:background={current}
			></span>
			<span id={`${id}-value`} class={appearance === "label" ? "sr-only" : "font-mono text-xs"}
				>{current}</span
			>
		</Popover.Trigger>
		<Popover.Content
			aria-label={label}
			{...contentProps}
			data-slot="color-picker-content"
			data-color-picker-editor={editorOwned || undefined}
			data-color-picker-appearance={appearance}
			class={cn(
				"flex w-64 gap-3 overflow-hidden",
				"cn-color-picker-content",
				appearance === "label" && labelPanelClass,
				contentProps?.class
			)}
		>
			<ScrollArea
				type="hover"
				overscroll="contain"
				class="flex min-h-0 flex-col [gap:inherit]"
				viewportProps={{
					class:
						"h-auto min-h-0 [gap:inherit] [&>[data-scroll-area-content]]:grid [&>[data-scroll-area-content]]:[gap:inherit]"
				}}
			>
				{#if appearance === "label" && !custom}
					<div role="group" aria-label={label} class="flex flex-wrap items-center gap-4">
						{#each swatches as { color, name } (color)}
							<button
								type="button"
								aria-label={name}
								title={name}
								aria-pressed={color === current}
								class="size-[22px] shrink-0 rounded-full outline-none hover:opacity-85 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								style:background-color={color}
								onclick={() => chooseLabelColor(color)}
							></button>
						{/each}
						<button
							type="button"
							bind:this={customButton}
							aria-label={messages.custom}
							title={messages.custom}
							class={cn(paletteButtonClass, "ms-4")}
							onclick={() => switchPalette(true)}><Plus aria-hidden="true" class="size-3" /></button
						>
					</div>
				{:else if appearance === "label"}
					<div class="grid min-w-0 gap-4">
						<div class="flex h-[22px] items-center gap-2">
							<span
								aria-hidden="true"
								class="size-[22px] shrink-0 rounded-full"
								style:background-color={toHex(hsv)}
							></span>
							<label class="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
								<span>HEX</span>
								<input
									bind:value={text}
									aria-invalid={invalid || customError || undefined}
									aria-describedby={customError || invalid ? `${id}-color-error` : undefined}
									spellcheck="false"
									autocomplete="off"
									maxlength={7}
									class="h-[22px] w-18 min-w-0 rounded px-1 text-[13px] text-foreground outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-invalid:outline-1 aria-invalid:-outline-offset-1 aria-invalid:outline-destructive"
									oninput={(event) => {
										customError = false;
										const hex = normalizeHex(event.currentTarget.value);
										if (hex) hsv = fromHex(hex, hsv.hue);
									}}
									onkeydown={(event) => {
										if (event.key !== "Enter" || event.isComposing) return;
										event.preventDefault();
										const hex = normalizeHex(text);
										if (hex) chooseLabelColor(hex);
										else customError = true;
									}}
								/>
							</label>
							<button
								bind:this={defaultButton}
								type="button"
								aria-label={messages.palette}
								title={messages.palette}
								class={cn(paletteButtonClass, "ms-auto")}
								onclick={() => switchPalette(false)}
								><Palette aria-hidden="true" class="size-3" /></button
							>
						</div>
						{#if customError || invalid}<p
								id={`${id}-color-error`}
								role="alert"
								class="text-xs text-destructive"
							>
								{messages.invalidHex}
							</p>{/if}
						<div class="grid grid-cols-[minmax(0,350px)_6px] items-stretch gap-4 pe-2">
							<button
								type="button"
								data-slot="color-picker-area"
								aria-label={`${messages.area}: ${toHex(hsv)}`}
								aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
								class="relative h-[100px] min-w-0 touch-none select-none rounded-[4px] bg-[linear-gradient(to_top,black,transparent),linear-gradient(to_right,white,transparent)] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								style:background-color={`hsl(${hsv.hue} 100% 50%)`}
								onpointerdown={(event) => pickPointer(event, "area")}
								onpointermove={(event) => pickPointer(event, "area")}
								onkeydown={adjustArea}
							>
								<span
									aria-hidden="true"
									class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
									style:left={`${hsv.saturation * 100}%`}
									style:top={`${(1 - hsv.brightness) * 100}%`}
									style:background-color={toHex(hsv)}
								></span>
							</button>
							<div
								data-slot="color-picker-hue"
								role="slider"
								tabindex="0"
								aria-label={messages.hue}
								aria-orientation="vertical"
								aria-valuemin={0}
								aria-valuemax={360}
								aria-valuenow={Math.round(hsv.hue)}
								class="relative h-[100px] w-1.5 touch-none select-none rounded-[4px] bg-[linear-gradient(to_bottom,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								onpointerdown={(event) => pickPointer(event, "hue")}
								onpointermove={(event) => pickPointer(event, "hue")}
								onkeydown={adjustHue}
							>
								<span
									aria-hidden="true"
									class="pointer-events-none absolute left-1/2 h-1 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-white/70"
									style:top={`${(hsv.hue / 360) * 100}%`}
								></span>
							</div>
						</div>
					</div>
				{:else}
					<input
						type="color"
						aria-label={`${label}：色盘`}
						value={current}
						oninput={(event) => {
							set(normalizeHex(event.currentTarget.value));
							text = current;
						}}
						class="h-28 w-full cursor-pointer rounded-md border bg-transparent p-0"
					/>
					<label class="grid gap-1 text-xs text-muted-foreground"
						>十六进制
						<input
							type="text"
							aria-label={`${label}：十六进制`}
							aria-invalid={invalid || undefined}
							spellcheck="false"
							autocomplete="off"
							maxlength={7}
							bind:value={text}
							oninput={(event) => {
								// Apply full six-digit values live; shorthand applies on Enter or blur.
								const input = event.currentTarget.value;
								if (/^#?[\da-f]{6}$/i.test(input.trim())) set(normalizeHex(input));
							}}
							onkeydown={(event) => {
								if (event.key !== "Enter" || event.isComposing) return;
								event.preventDefault();
								commitText();
							}}
							onblur={commitText}
							class="h-8 rounded-md border border-input bg-background px-2 font-mono text-sm text-foreground outline-none focus-visible:border-ring aria-invalid:border-destructive"
						/>
					</label>
					{#if invalid}<p class="text-xs text-destructive">
							只能输入十六进制字符 0-9、a-f，如 #1e40af。
						</p>{/if}
					{#if swatches.length}
						<div role="group" aria-label={`${label}：预设`} class="flex flex-wrap gap-1.5">
							{#each swatches as { color, name } (color)}
								<button
									type="button"
									aria-label={name}
									aria-pressed={color === current}
									class="size-6 rounded-sm border outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring/50 aria-pressed:ring-2 aria-pressed:ring-inset aria-pressed:ring-foreground"
									style:background={color}
									onclick={() => {
										set(color);
										text = current;
									}}
								></button>
							{/each}
						</div>
					{/if}
				{/if}
			</ScrollArea>
		</Popover.Content>
	</Popover.Root>
	{#if name}<input type="hidden" {name} value={current} {disabled} />{/if}
</div>
