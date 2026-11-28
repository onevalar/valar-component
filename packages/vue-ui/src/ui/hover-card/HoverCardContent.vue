<script setup lang="ts">
import { HoverCardContent as SdkContent } from "@ui-sdk/vue/hover-card";
import type { Anchor, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { computed, type Component, type HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";
import { resolvePortalContainer } from "../tooltip/context";

defineOptions({ inheritAttrs: false });

export interface HoverCardPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		class?: HTMLAttributes["class"];
		appearance?: "default" | "profile";
		side?: Side;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
		arrowPadding?: number;
		anchor?: Anchor | string | null;
		keepMounted?: boolean;
		forceMount?: boolean;
		portalProps?: HoverCardPortalProps;
		inline?: boolean;
		container?: Element | DocumentFragment | null;
		avoidCollisions?: boolean;
	}>(),
	{
		align: "center",
		side: "bottom",
		sideOffset: 4,
		alignOffset: 0,
		collisionPadding: 8,
		appearance: "default",
		keepMounted: undefined,
		forceMount: undefined,
		inline: undefined,
	}
);

const resolvedInline = computed(() => props.inline ?? props.portalProps?.disabled ?? false);
const resolvedContainer = computed(() =>
	resolvedInline.value
		? undefined
		: (props.container ?? resolvePortalContainer(props.portalProps?.to))
);
const resolvedKeepMounted = computed(
	() => props.keepMounted ?? props.forceMount ?? props.portalProps?.forceMount
);
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
		:keep-mounted="resolvedKeepMounted"
		:container="resolvedContainer"
		:class="
			cn(
				'cn-hover-card-content z-50 origin-(--transform-origin) outline-hidden [--bits-link-preview-content-available-height:var(--available-height)] [--bits-link-preview-content-available-width:var(--available-width)]',
				props.appearance === 'profile' && 'cn-hover-card-profile',
				props.class
			)
		"
		:style="{
			'--reka-hover-card-content-transform-origin': 'var(--transform-origin)',
			'--reka-hover-card-content-available-width': 'var(--available-width)',
			'--reka-hover-card-content-available-height': 'var(--available-height)',
		}"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as ?? 'div'"
				:as-child="props.asChild"
				:part="{
					...part,
					'data-slot': 'hover-card-content',
					'data-appearance': props.appearance,
					'data-side': (part['data-side'] as string | undefined) ?? props.side,
					'data-align': (part['data-align'] as string | undefined) ?? props.align,
					'data-state': state.open ? 'open' : 'closed',
				}"
			>
				<slot />
			</DisclosureElement>
		</template>
	</SdkContent>
</template>
