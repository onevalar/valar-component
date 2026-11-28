<script lang="ts">
	import { Input as SdkInput } from "@ui-sdk/svelte/input";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		defaultValue,
		defaultvalue,
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();

	const classes = $derived(
		cn(
			"cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
			className
		)
	);
	const refProps = {
		[createAttachmentKey()]: (element: HTMLInputElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={classes}
		type="file"
		defaultValue={defaultValue ?? defaultvalue}
		bind:files
		bind:value
		{...restProps}
	/>
{:else if !type || /^(text|search|email|tel|url|password)$/i.test(type)}
	<SdkInput
		{...refProps}
		{...restProps}
		{type}
		disabled={restProps.disabled ?? undefined}
		required={restProps.required ?? undefined}
		class={classes}
		value={value == null ? undefined : String(value)}
		defaultValue={defaultValue ?? defaultvalue}
		onValueChange={(next: string) => {
			value = next;
		}}
	>
		{#snippet render({ props }: { props: Record<string, unknown> })}
			<input {...props} data-slot={dataSlot} />
		{/snippet}
	</SdkInput>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={classes}
		{type}
		defaultValue={defaultValue ?? defaultvalue}
		bind:value
		{...restProps}
	/>
{/if}
