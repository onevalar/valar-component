<script lang="ts">
	import { Label as SdkLabel } from "@ui-sdk/svelte/label";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLLabelAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		required = false,
		"data-slot": dataSlot = "label",
		children,
		child,
		style,
		...restProps
	}: Omit<HTMLLabelAttributes, "style"> & {
		ref?: HTMLElement | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		style?: HTMLLabelAttributes["style"] | Parameters<typeof styleToString>[0];
		appearance?: "default" | "settings";
		required?: boolean;
		"data-slot"?: string;
	} = $props();

	const refKey = createAttachmentKey();
	const attachRef = (element: HTMLElement) => {
		ref = element;
		return () => {
			if (ref === element) ref = null;
		};
	};
</script>

<SdkLabel
	data-appearance={appearance}
	class={cn(
		"cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
		"cn-label-layout",
		appearance === "settings" && "cn-label-appearance-settings",
		className
	)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps}
>
	{#snippet render({ props })}
		{#if child}
			{@render child({ props: { ...props, "data-slot": dataSlot, [refKey]: attachRef } })}
		{:else}
			<label {...props} data-slot={dataSlot} {@attach attachRef}>
				{@render children?.()}
				{#if required}
					<span data-slot="label-required" aria-hidden="true" class="text-destructive">*</span>
				{/if}
			</label>
		{/if}
	{/snippet}
</SdkLabel>
