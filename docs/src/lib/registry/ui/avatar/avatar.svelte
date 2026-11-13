<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		loadingStatus = $bindable("loading"),
		size = "default",
		appearance = "default",
		class: className,
		...restProps
	}: AvatarPrimitive.RootProps & {
		size?: "default" | "sm" | "lg";
		appearance?: "default" | "subscriber" | "member";
	} = $props();
</script>

<AvatarPrimitive.Root
	bind:ref
	bind:loadingStatus
	data-slot="avatar"
	data-size={size}
	data-appearance={appearance}
	class={cn(
		"cn-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
		appearance === "subscriber" && "cn-avatar-subscriber",
		appearance === "member" && "cn-avatar-member",
		className
	)}
	{...restProps}
/>
