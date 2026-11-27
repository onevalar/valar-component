<script setup lang="ts">
import { SelectContent as SdkContent } from "@ui-sdk/vue/select";
import type { Anchor, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { computed, onBeforeUnmount, type ComponentPublicInstance, type HTMLAttributes } from "vue";
import { observeHighlightedReveal, resolvePortalContainer } from "./context";

defineOptions({ inheritAttrs: false });

export interface SelectPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
}

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		position?: "item-aligned" | "popper";
		side?: Side;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
		arrowPadding?: number;
		anchor?: Anchor | string | null;
		keepMounted?: boolean;
		forceMount?: boolean;
		container?: Element | DocumentFragment | null;
		portalProps?: SelectPortalProps;
		appearance?: "default" | "settings";
		avoidCollisions?: boolean;
		bodyLock?: boolean;
	}>(),
	{
		position: "popper",
		side: "bottom",
		align: "start",
		sideOffset: 4,
		alignOffset: 0,
		collisionPadding: 8,
		appearance: "default",
		keepMounted: undefined,
		forceMount: undefined,
	}
);

const resolvedContainer = computed(() =>
	props.portalProps?.disabled
		? undefined
		: (props.container ?? resolvePortalContainer(props.portalProps?.to))
);
const resolvedKeepMounted = computed(() => props.keepMounted ?? props.forceMount);

let stopReveal: (() => void) | undefined;
function bindContentRef(
	node: Element | ComponentPublicInstance | null,
	sdkRef: unknown
) {
	if (typeof sdkRef === "function") {
		sdkRef(node);
	} else if (sdkRef && typeof sdkRef === "object" && "value" in sdkRef) {
		(sdkRef as { value: unknown }).value = node;
	}
	stopReveal?.();
	stopReveal = node instanceof HTMLElement ? observeHighlightedReveal(node) : undefined;
}

onBeforeUnmount(() => {
	stopReveal?.();
});
</script>

<template>
	<SdkContent
		v-bind="$attrs"
		:side="props.side"
		:align="props.align"
		:side-offset="props.sideOffset"
		:align-offset="props.alignOffset"
		:collision-padding="props.collisionPadding"
		:arrow-padding="props.arrowPadding"
		:anchor="props.anchor"
		:align-item-with-trigger="props.position === 'item-aligned'"
		:keep-mounted="resolvedKeepMounted"
		:container="resolvedContainer"
		data-slot="select-content"
		:data-align-trigger="props.position === 'item-aligned'"
		:class="
			cn(
				'cn-select-content cn-overlay-surface relative z-50 max-h-(--available-height) min-w-[min(max(8rem,var(--anchor-width,8rem)),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none',
				props.appearance === 'settings' && 'cn-select-content-settings animate-none!',
				props.class
			)
		"
		:style="{
			'--reka-select-content-available-height': 'var(--available-height)',
			'--reka-select-content-transform-origin': 'var(--transform-origin)',
			'--reka-select-trigger-width': 'var(--anchor-width)',
		}"
	>
		<template #render="{ props: part, state }">
			<div
				v-bind="{ ...part, ref: undefined }"
				:ref="(node) => bindContentRef(node, part.ref)"
				:data-state="state.open ? 'open' : 'closed'"
			>
				<div
					:data-position="props.position"
					class="cn-select-viewport w-full min-w-(--anchor-width) scroll-my-1 px-1.5 py-1"
				>
					<slot />
				</div>
			</div>
		</template>
	</SdkContent>
</template>
