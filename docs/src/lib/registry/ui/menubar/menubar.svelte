<script lang="ts">
	import {
		Menubar as SdkMenubar,
		type MenubarController,
		type MenubarOrientation,
	} from "@ui-sdk/svelte/menubar";
	import { cn } from "$lib/utils.js";
	import { setContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { MENUBAR_VALUE_KEY, bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(),
		onValueChange,
		orientation,
		loop,
		disabled,
		modal,
		dir: _dir,
		controller,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLElement | null;
		value?: string;
		onValueChange?: (value: string) => void;
		orientation?: MenubarOrientation;
		loop?: boolean;
		disabled?: boolean;
		modal?: boolean | "pointer";
		dir?: "ltr" | "rtl";
		controller?: MenubarController;
		children?: Snippet;
	} = $props();

	let internalValue = $state("");
	const isControlled = $derived(value !== undefined);
	const currentValue = $derived(isControlled ? value : internalValue);

	setContext(MENUBAR_VALUE_KEY, {
		get value() {
			return currentValue;
		},
		get isControlled() {
			return isControlled;
		},
		onMenuOpenChange(menuValue: string, nextOpen: boolean) {
			if (nextOpen) {
				if (!isControlled) internalValue = menuValue;
				else value = menuValue;
				if (currentValue !== menuValue) onValueChange?.(menuValue);
			} else if (currentValue === menuValue) {
				if (!isControlled) internalValue = "";
				else value = "";
				onValueChange?.("");
			}
		},
	});

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkMenubar
	{orientation}
	{loop}
	{disabled}
	{modal}
	{controller}
	class={cn("cn-menubar flex items-center", className)}
	{...restProps}
>
	{#snippet render({ props })}
		<div {...props} data-slot="menubar" {...refAttachment}>
			{@render children?.()}
		</div>
	{/snippet}
</SdkMenubar>
