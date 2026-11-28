<script lang="ts">
	import { MenuGroup as SdkGroup } from "@ui-sdk/svelte/menu";
	import { setContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { IN_MENU_GROUP_KEY, MENU_CHECKBOX_GROUP_KEY, bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		value = $bindable<string[]>([]),
		onValueChange,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLElement | null;
		value?: string[];
		onValueChange?: (value: string[]) => void;
		children?: Snippet;
	} = $props();

	setContext(IN_MENU_GROUP_KEY, true);
	setContext(MENU_CHECKBOX_GROUP_KEY, {
		get value() {
			return value;
		},
		setChecked(item: string, checked: boolean) {
			if (value.includes(item) === checked) return;
			const next = checked ? [...value, item] : value.filter((entry) => entry !== item);
			value = next;
			onValueChange?.(next);
		},
	});

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkGroup {...restProps}>
	{#snippet render({ props })}
		<div {...props} data-slot="dropdown-menu-checkbox-group" {...refAttachment}>
			{@render children?.()}
		</div>
	{/snippet}
</SdkGroup>
