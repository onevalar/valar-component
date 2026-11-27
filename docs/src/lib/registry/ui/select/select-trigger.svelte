<script lang="ts">
	import { SelectTrigger as SdkTrigger, type SelectController } from "@ui-sdk/svelte/select";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef, toStyleString } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		style,
		children,
		size = "default",
		disabled,
		controller,
		"aria-labelledby": ariaLabelledBy,
		...restProps
	}: Omit<HTMLButtonAttributes, "style" | "children"> & {
		ref?: HTMLButtonElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		size?: "sm" | "default" | "settings";
		disabled?: boolean;
		controller?: SelectController<string, boolean>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLButtonElement>((el) => {
		ref = el;
	});
</script>

<SdkTrigger
	{disabled}
	{controller}
	aria-labelledby={ariaLabelledBy}
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		"cn-select-trigger flex w-fit max-w-full min-w-0 items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:overflow-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const sdkLabelledBy = props["aria-labelledby"] as string | undefined}
		{@const resolvedLabelledBy =
			ariaLabelledBy ?? (sdkLabelledBy?.endsWith("-label") ? undefined : sdkLabelledBy)}
		<button
			{...props}
			{...refAttachment}
			aria-labelledby={resolvedLabelledBy}
			data-state={state.open ? "open" : "closed"}
		>
			{@render children?.()}
			<IconPlaceholder
				lucide="ChevronDownIcon"
				tabler="IconSelector"
				hugeicons="UnfoldMoreIcon"
				phosphor="CaretDownIcon"
				remixicon="RiArrowDownSLine"
				class="cn-select-trigger-icon pointer-events-none"
			/>
		</button>
	{/snippet}
</SdkTrigger>
