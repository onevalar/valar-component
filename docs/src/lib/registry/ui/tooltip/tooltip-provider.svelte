<script lang="ts">
	import type { ComponentProps } from "svelte";
	import TooltipProviderScope from "./tooltip-provider-scope.svelte";

	// Installed presets can override the default delay through this style class.
	const styleDelay = Number(/\bdelay-(\d+)\b/.exec("cn-tooltip-provider")?.[1] ?? 500);

	let {
		delayDuration = styleDelay,
		...restProps
	}: ComponentProps<typeof TooltipProviderScope> = $props();
</script>

<TooltipProviderScope {delayDuration} {...restProps} />
