<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type NumberFieldProps = WithElementRef<
		Omit<
			HTMLInputAttributes,
			"value" | "defaultValue" | "type" | "min" | "max" | "step" | "children"
		>,
		HTMLInputElement
	> & {
		value?: number;
		defaultValue?: number;
		appearance?: "default" | "amount";
		min?: number;
		max?: number;
		step?: number;
		locale?: string;
		formatOptions?: Intl.NumberFormatOptions;
		onValueChange?: (value: number | undefined) => void;
		decrementLabel?: string;
		incrementLabel?: string;
		invalidMessage?: string;
	};
</script>

<script lang="ts">
	import { NumberParser } from "@internationalized/number";
	import { onMount, untrack } from "svelte";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		appearance = "default",
		defaultValue,
		value = $bindable<number | undefined>(),
		min,
		max,
		step = 1,
		locale = "zh-CN",
		formatOptions,
		onValueChange,
		decrementLabel = "减小",
		incrementLabel = "增大",
		invalidMessage = "请输入有效的数字。",
		class: className,
		name,
		form,
		disabled = false,
		readonly = false,
		required = false,
		oninput,
		onblur,
		onkeydown,
		oncompositionstart,
		oncompositionend,
		...restProps
	}: NumberFieldProps = $props();

	const amountRoot = cn(
		"flex h-7 w-24 max-w-full min-w-0 items-center gap-1 rounded-[8px] bg-transparent px-2.5 text-xs font-[450]",
		"[--number-field-amount-rest-border:lch(91.9%_0_282)] [--number-field-amount-focus:lch(53%_52.26_286.91)] dark:[--number-field-amount-rest-border:lch(25.905%_2.38_272)] dark:[--number-field-amount-focus:lch(47.918%_59.303_288.421)]",
		"[--number-field-amount-border:var(--number-field-amount-rest-border)] shadow-[inset_0_0_0_0.5px_var(--number-field-amount-border)]",
		"focus-within:[--number-field-amount-border:var(--number-field-amount-focus)] focus-within:shadow-[inset_0_0_0_1px_var(--number-field-amount-border)] has-aria-invalid:[--number-field-amount-border:var(--destructive)] data-disabled:opacity-50"
	);
	const amountInput = cn(
		"h-full w-full min-w-0 bg-transparent py-1.5 pe-3 text-xs font-[450] text-[color:lch(20%_1_282)] outline-none placeholder:text-[color:lch(40%_1_282)] disabled:cursor-not-allowed",
		"dark:text-[color:lch(91.201%_1.65_272)] dark:placeholder:text-[color:lch(64.805%_1.65_272)]"
	);

	const isAmount = $derived(appearance === "amount");
	const initialValue = untrack(() => {
		if (value === undefined && defaultValue !== undefined) value = defaultValue;
		return value;
	});
	const formatter = $derived(
		isAmount
			? new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 })
			: new Intl.NumberFormat(locale, {
					...(!formatOptions?.style || formatOptions.style === "decimal"
						? { maximumFractionDigits: 12 }
						: {}),
					...formatOptions,
				})
	);
	const parser = $derived(
		isAmount ? new NumberParser("en-US") : new NumberParser(locale, formatOptions)
	);
	let text = $state(untrack(() => (value === undefined ? "" : formatter.format(value))));
	let lastValue: number | undefined = untrack(() => value);
	let lastFormatter = untrack(() => formatter);
	let composing = false;
	const parsed = $derived(text.trim() === "" ? undefined : parser.parse(text));
	const invalid = $derived(
		text.trim() !== "" &&
			(parsed === undefined ||
				!Number.isFinite(parsed) ||
				(isAmount && value !== undefined && (!Number.isSafeInteger(value) || value < 0)))
	);
	const outOfRange = $derived(
		parsed !== undefined &&
			((min !== undefined && parsed < min) || (max !== undefined && parsed > max))
	);

	// Do not reformat an edit echoed through bind:value. External updates still win.
	$effect(() => {
		const next = value;
		const currentFormatter = formatter;
		untrack(() => {
			if (!Object.is(next, lastValue) || currentFormatter !== lastFormatter)
				text = next === undefined ? "" : currentFormatter.format(next);
			lastValue = next;
			lastFormatter = currentFormatter;
		});
	});
	$effect(() => {
		if (ref)
			ref.setCustomValidity(
				!disabled && !readonly && (invalid || outOfRange) ? invalidMessage : ""
			);
	});

	function update(next: number | undefined) {
		if (Object.is(value, next)) return;
		lastValue = next;
		value = next;
		onValueChange?.(next);
	}
	function edit(input: HTMLInputElement, inputType?: string) {
		if (!isAmount) {
			text = input.value;
			if (composing || disabled || readonly) return;
			update(parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined);
			return;
		}
		if (composing || disabled || readonly) return;

		const raw = input.value;
		const digits = raw.replace(/[^0-9]/g, "");
		const next = digits === "" ? undefined : Number(digits);
		const acceptable = next === undefined || Number.isSafeInteger(next);
		const display = acceptable ? (next === undefined ? "" : formatter.format(next)) : text;
		if (raw !== display) {
			let remainingDigits = raw
				.slice(input.selectionStart ?? raw.length)
				.replace(/[^0-9]/g, "").length;
			let caret = display.length;
			while (caret > 0 && remainingDigits > 0) {
				caret--;
				if (display[caret] !== ",") remainingDigits--;
			}
			// A backspace that removes a separator moves past it so the next one removes a digit.
			if (inputType === "deleteContentBackward" && next === value && display[caret - 1] === ",")
				caret--;
			input.value = display;
			input.setSelectionRange(caret, caret);
		}
		if (!acceptable) return;
		text = display;
		update(next);
	}
	function normalize(number: number) {
		const increment = Number.isFinite(step) && step > 0 ? step : 1;
		const base = min ?? 0;
		const snapped = base + Math.round((number - base) / increment) * increment;
		// Remove floating-point addition noise without implying arbitrary precision.
		const rounded = Number(snapped.toPrecision(15));
		return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded));
	}
	function commit() {
		if (isAmount || composing || disabled || readonly) return;
		if (text.trim() === "") {
			update(undefined);
			return;
		}
		if (parsed === undefined || !Number.isFinite(parsed)) return;
		const next = normalize(parsed);
		text = formatter.format(next);
		update(parser.parse(text));
	}
	function spin(direction: number) {
		if (disabled || readonly || composing) return;
		const current = parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;
		const increment = Number.isFinite(step) && step > 0 ? step : 1;
		const base = min ?? 0;
		const position = ((current ?? base) - base) / increment;
		const grid =
			direction > 0
				? Math.floor(position + 1e-10) + direction
				: Math.ceil(position - 1e-10) + direction;
		const next = normalize(
			current === undefined ? (min ?? Math.min(0, max ?? 0)) : base + grid * increment
		);
		text = formatter.format(next);
		update(parser.parse(text));
		ref?.focus();
	}
	function keydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		onkeydown?.(event);
		if (isAmount || event.defaultPrevented || event.isComposing || composing || disabled || readonly) return;
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			spin(event.key === "ArrowUp" ? 1 : -1);
		} else if (event.key === "PageUp" || event.key === "PageDown") {
			event.preventDefault();
			spin(event.key === "PageUp" ? 10 : -10);
		} else if (event.key === "Home" && min !== undefined) {
			event.preventDefault();
			update(min);
			text = formatter.format(min);
		} else if (event.key === "End" && max !== undefined) {
			event.preventDefault();
			update(max);
			text = formatter.format(max);
		} else if (event.key === "Enter") commit();
	}
	onMount(() => {
		const owner = ref?.form;
		let resetTimer: ReturnType<typeof setTimeout>;
		function reset(event: Event) {
			clearTimeout(resetTimer);
			// Native reset buttons may run microtasks before the browser resets input.value.
			resetTimer = setTimeout(() => {
				if (event.defaultPrevented) return;
				update(initialValue);
				text = initialValue === undefined ? "" : formatter.format(initialValue);
				// Reset also clears the DOM when the reactive value was already the initial value.
				if (ref) ref.value = text;
			}, 0);
		}
		owner?.addEventListener("reset", reset);
		return () => {
			clearTimeout(resetTimer);
			owner?.removeEventListener("reset", reset);
		};
	});
</script>

<div
	data-slot="number-field"
	data-appearance={appearance}
	data-disabled={disabled || undefined}
	class={cn(
		!isAmount &&
			"flex min-h-10 w-full items-center rounded-md border border-input bg-background text-foreground shadow-xs focus-within:border-ring has-aria-invalid:border-destructive",
		!isAmount && "cn-number-field",
		isAmount && amountRoot,
		className
	)}
>
	{#if isAmount}
		<span
			data-slot="number-field-currency"
			aria-hidden="true"
			class="shrink-0 text-[color:lch(40%_1_282)] dark:text-[color:lch(64.805%_1.65_272)]"
		>$</span>
	{:else}
		<button
			type="button"
			data-slot="number-field-decrement"
			aria-label={decrementLabel}
			disabled={disabled || readonly || (value !== undefined && min !== undefined && value <= min)}
			class={cn(
				"size-10 shrink-0 rounded-s-md text-lg hover:bg-muted focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-40",
				"cn-number-field-decrement"
			)}
			onpointerdown={(event) => event.preventDefault()}
			onclick={() => spin(-1)}>−</button
		>
	{/if}
	<input
		{...restProps}
		bind:this={ref}
		type="text"
		role={isAmount ? undefined : "spinbutton"}
		inputmode={isAmount ? "numeric" : "decimal"}
		data-slot="number-field-input"
		data-appearance={appearance}
		class={cn(
			!isAmount &&
				"h-10 w-full min-w-0 bg-transparent px-2 text-center text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
			!isAmount && "cn-number-field-input",
			isAmount && amountInput
		)}
		{form}
		{disabled}
		{readonly}
		{required}
		value={text}
		aria-valuemin={isAmount ? undefined : min}
		aria-valuemax={isAmount ? undefined : max}
		aria-valuenow={isAmount ? undefined : value}
		aria-valuetext={isAmount ? undefined : text}
		aria-invalid={invalid || outOfRange || restProps["aria-invalid"] || undefined}
		oninput={(event) => {
			edit(event.currentTarget, event instanceof InputEvent ? event.inputType : undefined);
			oninput?.(event);
		}}
		onblur={(event) => {
			commit();
			onblur?.(event);
		}}
		onkeydown={keydown}
		oncompositionstart={(event) => {
			composing = true;
			oncompositionstart?.(event);
		}}
		oncompositionend={(event) => {
			composing = false;
			edit(event.currentTarget);
			oncompositionend?.(event);
		}}
	/>
	{#if !isAmount}
		<button
			type="button"
			data-slot="number-field-increment"
			aria-label={incrementLabel}
			disabled={disabled || readonly || (value !== undefined && max !== undefined && value >= max)}
			class={cn(
				"size-10 shrink-0 rounded-e-md text-lg hover:bg-muted focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-40",
				"cn-number-field-increment"
			)}
			onpointerdown={(event) => event.preventDefault()}
			onclick={() => spin(1)}>+</button
		>
	{/if}
</div>
{#if name}
	<input type="hidden" {name} {form} {disabled} value={value ?? ""} />
{/if}
