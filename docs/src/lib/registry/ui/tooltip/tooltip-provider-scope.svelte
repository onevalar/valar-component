<script lang="ts">
	import { setContext, type Snippet } from "svelte";
	import { TOOLTIP_PROVIDER_KEY } from "./context.js";

	let {
		delayDuration = 500,
		skipDelayDuration = 300,
		disableHoverableContent: _disableHoverableContent,
		disabled = false,
		children,
	}: {
		delayDuration?: number;
		skipDelayDuration?: number;
		disableHoverableContent?: boolean;
		disabled?: boolean;
		children?: Snippet;
	} = $props();

	let openCount = 0;
	let lastClosedAt = -Infinity;

	setContext(TOOLTIP_PROVIDER_KEY, {
		get delayDuration() {
			return delayDuration;
		},
		get skipDelayDuration() {
			return skipDelayDuration;
		},
		get disabled() {
			return disabled;
		},
		isWarm() {
			return openCount > 0 || performance.now() - lastClosedAt < skipDelayDuration;
		},
		notifyOpen(isOpen: boolean) {
			if (isOpen) {
				openCount += 1;
			} else {
				openCount = Math.max(0, openCount - 1);
				lastClosedAt = performance.now();
			}
		},
	});
</script>

{@render children?.()}
