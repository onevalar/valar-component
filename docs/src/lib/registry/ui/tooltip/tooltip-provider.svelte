<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	// Installed presets can override the default delay through this style class.
	const styleDelay = Number(/\bdelay-(\d+)\b/.exec("cn-tooltip-provider")?.[1] ?? 500);

	let { delayDuration = styleDelay, ...restProps }: TooltipPrimitive.ProviderProps = $props();
</script>

<TooltipPrimitive.Provider {delayDuration} {...restProps} />
