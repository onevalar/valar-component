<script setup lang="ts">
import { TooltipArrow as SdkArrow, TooltipContent as SdkContent } from "@ui-sdk/vue/tooltip";
import type { Anchor, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { computed, inject, type Component, type HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";
import { resolvePortalContainer, TOOLTIP_DISABLED_KEY } from "./context";

defineOptions({ inheritAttrs: false });

export interface TooltipPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		class?: HTMLAttributes["class"];
		appearance?: "default" | "surface";
		side?: Side;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
		arrowPadding?: number;
		anchor?: Anchor | string | null;
		arrowClasses?: string;
		portalProps?: TooltipPortalProps;
		inline?: boolean;
		container?: Element | DocumentFragment | null;
		avoidCollisions?: boolean;
	}>(),
	{
		appearance: "default",
		side: "top",
		align: "center",
		sideOffset: 6,
		alignOffset: 0,
		collisionPadding: 8,
		inline: undefined,
	}
);

const disabled = inject(TOOLTIP_DISABLED_KEY, null);
const resolvedInline = computed(() => props.inline ?? props.portalProps?.disabled ?? false);
const resolvedContainer = computed(() =>
	resolvedInline.value
		? undefined
		: (props.container ?? resolvePortalContainer(props.portalProps?.to))
);
</script>

<template>
	<SdkContent
		v-if="!disabled"
		v-bind="$attrs"
		:side="props.side"
		:align="props.align"
		:side-offset="props.sideOffset"
		:align-offset="props.alignOffset"
		:collision-padding="props.collisionPadding"
		:arrow-padding="props.arrowPadding"
		:anchor="props.anchor"
		:container="resolvedContainer"
		:class="
			cn(
				'cn-tooltip-content cn-overlay-surface z-50 w-fit max-w-[min(20rem,calc(100vw-1rem),var(--available-width,100vw))] origin-(--transform-origin) wrap-anywhere [&>*]:min-w-0',
				props.appearance === 'surface' && 'animate-none!',
				props.class
			)
		"
		:style="{
			'--reka-tooltip-content-transform-origin': 'var(--transform-origin)',
			'--reka-tooltip-content-available-width': 'var(--available-width)',
			'--reka-tooltip-content-available-height': 'var(--available-height)',
		}"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as ?? 'div'"
				:as-child="props.asChild"
				:part="{
					...part,
					'data-slot': part.hidden === undefined || part.hidden === false ? 'tooltip-content' : undefined,
					'data-appearance': props.appearance,
					'data-side': (part['data-side'] as string | undefined) ?? props.side,
					'data-align': (part['data-align'] as string | undefined) ?? props.align,
					'data-state': state.open ? 'open' : 'closed',
				}"
			>
				<slot />
				<SdkArrow
					v-if="props.appearance === 'default' && props.arrowClasses !== undefined"
					data-slot="tooltip-arrow"
					aria-hidden="true"
					:class="cn('cn-tooltip-arrow fill-popover bg-foreground stroke-border', props.arrowClasses)"
				/>
			</DisclosureElement>
		</template>
	</SdkContent>
</template>
