<script lang="ts">
	import { AvatarImage as SdkImage } from "@ui-sdk/svelte/avatar";
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
		alt,
		style,
		...restProps
	}: AvatarPrimitive.ImageProps = $props();
	const backend = useAvatarBackend();
	const classes = $derived(cn("cn-avatar-image aspect-square size-full object-cover", className));
	const elementStyle = $derived(typeof style === "object" && style ? styleToString(style) : style);
	const refProps = {
		[createAttachmentKey()]: (element: HTMLImageElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
</script>

{#if !backend || backend.legacy()}
	<AvatarPrimitive.Image
		bind:ref
		{child}
		{children}
		{alt}
		data-slot="avatar-image"
		class={classes}
		{style}
		{...restProps}
	/>
{:else}
	<SdkImage
		{...refProps}
		{alt}
		data-slot="avatar-image"
		data-avatar-image=""
		class={classes}
		{...restProps}
	>
		{#snippet render({ props, state })}
			{@const attributes = {
				...props,
				"data-status": state.loadingStatus === "idle" ? "loading" : state.loadingStatus,
				style: state.loadingStatus === "loaded" ? elementStyle : `${elementStyle ?? ""};display:none`,
			}}
			{#if child}
				{@render child({ props: attributes })}
			{:else}
				<img {...attributes} {alt} />
			{/if}
		{/snippet}
	</SdkImage>
{/if}
