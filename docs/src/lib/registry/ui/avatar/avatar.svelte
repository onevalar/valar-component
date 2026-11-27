<script lang="ts">
	import { Avatar as SdkAvatar, type AvatarLoadingStatus } from "@ui-sdk/svelte/avatar";
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { untrack } from "svelte";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import { setAvatarBackend } from "./context.js";

	let {
		ref = $bindable(null),
		loadingStatus = $bindable(),
		delayMs,
		onLoadingStatusChange,
		child,
		children,
		size = "default",
		appearance = "default",
		class: className,
		style,
		...restProps
	}: AvatarPrimitive.RootProps & {
		size?: "default" | "sm" | "lg";
		appearance?: "default" | "subscriber" | "member";
	} = $props();

	// SDK keeps a loaded image's status while its next source loads. Keep Bits
	// for callers that observe every loading transition or control the state/delay.
	const callerSetsStatus = untrack(() => loadingStatus !== undefined);
	const legacy = $derived(callerSetsStatus || !!onLoadingStatusChange || !!delayMs || !!child);
	setAvatarBackend(() => legacy, () => loadingStatus ?? "loading");
	const classes = $derived(
		cn(
			"cn-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
			appearance === "subscriber" && "cn-avatar-subscriber",
			appearance === "member" && "cn-avatar-member",
			className
		)
	);
	const refProps = {
		[createAttachmentKey()]: (element: HTMLDivElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
	function statusChange(status: AvatarLoadingStatus) {
		const next = status === "idle" ? "loading" : status;
		if (next === (loadingStatus ?? "loading")) return;
		loadingStatus = next;
		onLoadingStatusChange?.(next);
	}
</script>

{#if legacy}
	<AvatarPrimitive.Root
		bind:ref
		bind:loadingStatus={() => loadingStatus ?? "loading", (next) => (loadingStatus = next)}
		{delayMs}
		{onLoadingStatusChange}
		{child}
		{children}
		data-slot="avatar"
		data-size={size}
		data-appearance={appearance}
		class={classes}
		{style}
		{...restProps}
	/>
{:else}
	<SdkAvatar
		data-slot="avatar"
		data-avatar-root=""
		data-size={size}
		data-appearance={appearance}
		class={classes}
		style={style && typeof style === "object" ? styleToString(style) : style}
		{...restProps as Record<string, unknown>}
		onLoadingStatusChange={statusChange}
	>
		{#snippet render({ props, state })}
			<div
				{...props}
				{...refProps}
				data-status={state.loadingStatus === "idle" ? "loading" : state.loadingStatus}
			>
				{@render children?.()}
			</div>
		{/snippet}
	</SdkAvatar>
{/if}
