<script lang="ts">
	import { Accordion } from "@ui-sdk/svelte/accordion";
	import { styleToString, type StyleProperties } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import { setAccordionOrientation } from "./context.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type ValueProps<T> = { value?: T; defaultValue?: T; onValueChange?: (value: T) => void };

	let {
		ref = $bindable(null),
		value = $bindable(),
		defaultValue,
		type,
		orientation = "vertical",
		loop = true,
		class: className,
		style,
		child,
		children,
		onValueChange,
		onkeydown,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
		ref?: HTMLElement | null;
		style?: StyleProperties | string | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		orientation?: "horizontal" | "vertical";
		loop?: boolean;
		disabled?: boolean;
	} & (
			| ({ type: "single" } & ValueProps<string>)
			| ({ type: "multiple" } & ValueProps<string[]>)
		) = $props();

	function initializeValue() {
		if (value === undefined) value = defaultValue ?? (type === "multiple" ? [] : "");
	}
	initializeValue();
	$effect.pre(initializeValue);

	setAccordionOrientation(() => orientation);
	const refKey = createAttachmentKey();
	function setRef(element: HTMLElement) {
		ref = element;
		return () => {
			ref = null;
		};
	}

	function values(value: string | string[] | undefined) {
		return value === undefined
			? undefined
			: Array.isArray(value)
				? value
				: value === ""
					? []
					: [value];
	}

	function change(next: string[]) {
		// Both public overloads are narrowed by `type`; Core uses arrays in either mode.
		if (type === "multiple") {
			value = next;
			(onValueChange as ValueProps<string[]>["onValueChange"])?.(next);
		} else {
			value = next[0] ?? "";
			(onValueChange as ValueProps<string>["onValueChange"])?.(value);
		}
	}

	// Keep the legacy keyboard navigation that the SDK intentionally omits.
	const navigate: NonNullable<HTMLAttributes<HTMLDivElement>["onkeydown"]> = (event) => {
		onkeydown?.(event);
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
			return;
		const root = event.currentTarget;
		const target = event.target;
		if (!(target instanceof HTMLElement) || target.closest('[data-slot="accordion"]') !== root)
			return;
		const rtl = getComputedStyle(root).direction === "rtl";
		const next = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
		const previous = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
		if (![previous, next, "Home", "End"].includes(event.key)) return;
		const triggers = [
			...root.querySelectorAll<HTMLElement>(
				'[data-slot="accordion-trigger"]:not(:disabled):not([data-disabled])'
			),
		].filter((trigger) => trigger.closest('[data-slot="accordion"]') === root);
		const index = triggers.indexOf(target);
		if (index < 0) return;
		event.preventDefault();
		let destination =
			event.key === "Home"
				? 0
				: event.key === "End"
					? triggers.length - 1
					: index + (event.key === next ? 1 : -1);
		if (loop) destination = (destination + triggers.length) % triggers.length;
		triggers[destination]?.focus();
	};
</script>

<Accordion
	value={values(value)}
	multiple={type === "multiple"}
	onValueChange={change}
	onkeydown={navigate}
	data-slot="accordion"
	data-accordion-root=""
	data-orientation={orientation}
	class={cn("cn-accordion flex w-full flex-col", className)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps}
>
	{#snippet render({ props })}
		{@const attributes = { ...props, [refKey]: setRef }}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<div {...attributes}>{@render children?.()}</div>
		{/if}
	{/snippet}
</Accordion>
