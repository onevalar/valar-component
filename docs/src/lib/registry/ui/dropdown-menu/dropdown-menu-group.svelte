<script lang="ts">
	import { MenuGroup as SdkGroup } from "@ui-sdk/svelte/menu";
	import { setContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { IN_MENU_GROUP_KEY, bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLElement | null;
		children?: Snippet;
	} = $props();

	setContext(IN_MENU_GROUP_KEY, true);

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkGroup {...restProps}>
	{#snippet render({ props })}
		<div {...props} data-slot="dropdown-menu-group" {...refAttachment}>
			{@render children?.()}
		</div>
	{/snippet}
</SdkGroup>
