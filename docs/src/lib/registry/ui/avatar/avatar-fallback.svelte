<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import { useAvatarBackend } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		child,
		children,
		style,
		...restProps
	}: AvatarPrimitive.FallbackProps = $props();
	const backend = useAvatarBackend();
	const status = $derived(backend?.status());
	const elementStyle = $derived(typeof style === "object" && style ? styleToString(style) : style);
	const classes = $derived(
		cn(
			"cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs",
			className
		)
	);
	const refProps = {
		[createAttachmentKey()]: (element: HTMLSpanElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
</script>

{#if !backend || backend.legacy()}
	<AvatarPrimitive.Fallback
		bind:ref
		{child}
		{children}
		data-slot="avatar-fallback"
		class={classes}
		{style}
		{...restProps}
	/>
{:else}
	<!-- Valar keeps the fallback DOM and ref while the SDK image is loaded. -->
	{@const attributes = {
		...refProps,
		"data-slot": "avatar-fallback",
		"data-avatar-fallback": "",
		class: classes,
		...restProps,
		"data-status": status,
		style: status === "loaded" ? `${elementStyle ?? ""};display:none` : elementStyle,
	}}
	{#if child}
		{@render child({ props: attributes })}
	{:else}
		<span {...attributes}>{@render children?.()}</span>
	{/if}
{/if}
