<script lang="ts">
	import { switchPrimitive } from "@ui-sdk/core/switch";
	import { usePart, usePrimitive } from "@ui-sdk/svelte/primitive";
	import { styleToString } from "svelte-toolbelt";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		size = "default",
		appearance = "default",
		id: userId,
		disabled = false,
		required = false,
		name,
		value = "on",
		type = "button",
		tabindex,
		style,
		onCheckedChange,
		onkeydown,
		onclick,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "style"> & {
		ref?: HTMLButtonElement | null;
		checked?: boolean;
		required?: boolean;
		style?: string | Record<string, string | number | null | undefined> | null;
		size?: "sm" | "default";
		appearance?: "default" | "settings";
		onCheckedChange?: (checked: boolean) => void;
	} = $props();

	const uid = $props.id();
	const handle = usePrimitive<typeof switchPrimitive>(switchPrimitive, () => ({
		id: userId ?? uid,
		checked,
		disabled: Boolean(disabled),
		required,
		onCheckedChange(next) {
			checked = next;
			onCheckedChange?.(next);
		}
	}));
	const root = usePart<typeof switchPrimitive, "root">(handle, "root");
	const thumb = usePart<typeof switchPrimitive, "thumb">(handle, "thumb");
	const inlineStyle = $derived(style && typeof style === "object" ? styleToString(style) : style);

	// Keep the button's native pointer default (including type="submit"),
	// while routing both keyboard and pointer switches through the SDK.
	const click: NonNullable<HTMLButtonAttributes["onclick"]> = (event) => {
		onclick?.(event);
		if (!event.defaultPrevented) handle.api.toggle({ reason: "press", event });
	};
	const keydown: NonNullable<HTMLButtonAttributes["onkeydown"]> = (event) => {
		onkeydown?.(event);
		if (event.defaultPrevented || disabled || (event.key !== "Enter" && event.key !== " ")) return;
		event.preventDefault();
		handle.api.toggle({ reason: "press", event });
	};
</script>

<button
	{...restProps}
	{...root.attrs}
	bind:this={ref}
	id={userId ?? uid}
	{type}
	{tabindex}
	style={inlineStyle}
	onclick={click}
	onkeydown={keydown}
	role="switch"
	data-slot="switch"
	data-switch-root=""
	data-state={checked ? "checked" : "unchecked"}
	data-size={size}
	data-appearance={appearance}
	class={cn(
		"cn-switch peer group/switch relative inline-flex items-center transition-[background-color,opacity] duration-150 ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 motion-reduce:transition-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
		className
	)}
>
	<span
		{...thumb.slot()}
		data-slot="switch-thumb"
		data-switch-thumb=""
		data-state={checked ? "checked" : "unchecked"}
		class={cn(
			"cn-switch-thumb pointer-events-none block shrink-0 ring-0 duration-100 ease-out motion-reduce:transition-none",
			"cn-switch-thumb-motion"
		)}
	></span>
</button>

{#if name !== undefined}
	<!-- For a standalone Switch, the form attribute has always belonged to the button. -->
	<input
		type="checkbox"
		{name}
		{value}
		{checked}
		defaultChecked={checked}
		{disabled}
		{required}
		aria-hidden="true"
		tabindex={-1}
		class="sr-only"
	/>
{/if}
