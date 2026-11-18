<script lang="ts" module>
	import type { Content as PopoverContent } from "$lib/registry/ui/popover/index.js";
	import type { ComponentProps } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		/** Visible label; also names the trigger and the inputs. */
		label: string;
		/** Six-digit hex color such as `#1e40af`. Shorthand input is expanded. */
		value?: string;
		/** Optional swatches offered for one-click selection. */
		presets?: string[];
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
	import { onMount, untrack } from "svelte";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { cn } from "$lib/utils.js";

	let {
		label,
		value = $bindable("#000000"),
		presets = [],
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
	let text = $state("");
	let open = $state(false);
	let root: HTMLDivElement;
	let editorOwned = $state(false);
	// A portaled panel keeps its editor ownership even outside the editor's DOM subtree.
	onMount(() => {
		editorOwned = !!root.closest('[role="dialog"][data-component-tuner]');
	});
	// Partial input such as "#1e" is still being typed; only impossible characters are errors.
	const invalid = $derived(!/^#?[\da-f]{0,6}$/i.test(text.trim()));

	$effect(() => {
		// Opening resets the text box to the real value.
		if (open) text = untrack(() => current);
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
</script>

<div
	bind:this={root}
	data-slot="color-picker"
	data-disabled={disabled || undefined}
	class={cn("grid gap-2", "cn-color-picker", className)}
	{...restProps}
>
	<span id={`${id}-label`} class="text-[13px] leading-[17px] font-medium text-foreground">{label}</span>
	<Popover.Root bind:open>
		<Popover.Trigger
			{disabled}
			aria-labelledby={`${id}-label ${id}-value`}
			class="flex h-8 w-full items-center gap-2 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2.5 text-[13px] text-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-accent/50 dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] dark:hover:bg-[lch(12%_1_272)] outline-none focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
		>
			<span
				data-slot="color-picker-swatch"
				class="size-4 shrink-0 rounded-[4px] border-[0.5px] border-black/15 dark:border-white/20"
				style:background={current}
			></span>
			<span id={`${id}-value`} class="font-mono text-xs tabular-nums">{current}</span>
		</Popover.Trigger>
		<Popover.Content
			aria-label={label}
			{...contentProps}
			data-slot="color-picker-content"
			data-color-picker-editor={editorOwned || undefined}
			class={cn("grid w-64 gap-3", "cn-color-picker-content", contentProps?.class)}
		>
			<input
				type="color"
				aria-label={`${label}：色盘`}
				value={current}
				oninput={(event) => {
					set(normalizeHex(event.currentTarget.value));
					text = current;
				}}
				class="h-24 w-full cursor-pointer overflow-hidden rounded-md border-[0.5px] border-border bg-transparent p-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
			/>
			<label class="grid gap-1 text-xs font-medium text-muted-foreground"
				>十六进制
				<input
					type="text"
					aria-label={`${label}：十六进制`}
					aria-invalid={invalid || undefined}
					spellcheck="false"
					autocomplete="off"
					maxlength={7}
					bind:value={text}
					oninput={() => {
						// Apply full six-digit values live; shorthand applies on Enter or blur.
						if (/^#?[\da-f]{6}$/i.test(text.trim())) set(normalizeHex(text));
					}}
					onkeydown={(event) => {
						if (event.key === "Enter") commitText();
					}}
					onblur={commitText}
					class="h-8 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2.5 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-invalid:border-destructive"
				/>
			</label>
			{#if invalid}<p class="text-xs text-destructive">
					只能输入十六进制字符 0-9、a-f，如 #1e40af。
				</p>{/if}
			{#if presets.length}
				<div role="group" aria-label={`${label}：预设`} class="flex flex-wrap gap-1.5">
					{#each presets as preset (preset)}
						{@const hex = normalizeHex(preset)}
						{#if hex}
							<button
								type="button"
								aria-label={hex}
								aria-pressed={hex === current}
								class="size-6 rounded-[5px] border-[0.5px] border-black/15 dark:border-white/20 outline-none transition-colors duration-100 focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-pressed:outline-solid aria-pressed:outline-2 aria-pressed:-outline-offset-2 aria-pressed:outline-white aria-pressed:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.45)]"
								style:background={hex}
								onclick={() => {
									set(hex);
									text = current;
								}}
							></button>
						{/if}
					{/each}
				</div>
			{/if}
		</Popover.Content>
	</Popover.Root>
	{#if name}<input type="hidden" {name} value={current} {disabled} />{/if}
</div>
