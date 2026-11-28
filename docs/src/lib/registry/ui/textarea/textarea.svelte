<script lang="ts">
	import { Textarea as SdkTextarea } from "@ui-sdk/svelte/textarea";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		value = $bindable(),
		defaultValue,
		defaultvalue,
		class: className,
		appearance = "default",
		"data-slot": dataSlot = "textarea",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {
		appearance?: "default" | "settings";
	} = $props();

	const refProps = {
		[createAttachmentKey()]: (element: HTMLTextAreaElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
	const initial = $derived(defaultValue ?? defaultvalue);
</script>

<SdkTextarea
	{...refProps}
	{...restProps}
	data-slot={dataSlot}
	data-appearance={appearance}
	class={cn(
		"cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
		appearance === "settings" && "cn-textarea-appearance-settings",
		className
	)}
	disabled={restProps.disabled ?? undefined}
	required={restProps.required ?? undefined}
	bind:value={
		() => (value == null ? undefined : String(value)),
		(next) => {
			value = next ?? "";
		}
	}
	defaultValue={initial == null ? undefined : String(initial)}
	autoResize={appearance === "default"}
>
	{#snippet render({ props }: { props: Record<string, unknown> })}
		<textarea {...props} data-slot={dataSlot}></textarea>
	{/snippet}
</SdkTextarea>
