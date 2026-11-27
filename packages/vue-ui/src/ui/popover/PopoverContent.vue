<script setup lang="ts">
import {
	PopoverContent as SdkContent,
	type PopoverFinalFocus,
	type PopoverInitialFocus,
} from "@ui-sdk/vue/popover";
import type { Anchor, Side } from "@ui-sdk/core";
import { cn } from "cn";
import {
	computed,
	getCurrentInstance,
	inject,
	onBeforeUnmount,
	useAttrs,
	watchEffect,
	type Component,
	type HTMLAttributes,
} from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";
import { POPOVER_CONTEXT_KEY, resolvePortalContainer } from "./context";

defineOptions({ inheritAttrs: false });

export interface PopoverPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		class?: HTMLAttributes["class"];
		appearance?: "default" | "surface" | "options";
		side?: Side;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
		arrowPadding?: number;
		anchor?: Anchor | string | null;
		initialFocus?: PopoverInitialFocus;
		finalFocus?: PopoverFinalFocus;
		keepMounted?: boolean;
		forceMount?: boolean;
		inline?: boolean;
		container?: Element | DocumentFragment | null;
		portalProps?: PopoverPortalProps;
		avoidCollisions?: boolean;
	}>(),
	{
		side: "bottom",
		align: "center",
		sideOffset: 4,
		alignOffset: 0,
		collisionPadding: 8,
		appearance: "default",
		forceMount: undefined,
		keepMounted: undefined,
		inline: undefined,
	}
);

const emit = defineEmits<{
	openAutoFocus: [event: Event];
	closeAutoFocus: [event: Event];
	interactOutside: [event: Event];
	escapeKeyDown: [event: KeyboardEvent];
}>();

const ctx = inject(POPOVER_CONTEXT_KEY, null);

watchEffect(() => {
	if (!ctx) return;
	ctx.policy.value = {
		onInteractOutside: (event) => emit("interactOutside", event),
		onEscapeKeyDown: (event) => emit("escapeKeyDown", event),
	};
});

onBeforeUnmount(() => {
	if (ctx) ctx.policy.value = {};
});

const resolvedInline = computed(() => props.inline ?? props.portalProps?.disabled ?? false);
const resolvedContainer = computed(() =>
	resolvedInline.value
		? undefined
		: (props.container ?? resolvePortalContainer(props.portalProps?.to))
);
const resolvedKeepMounted = computed(
	() => props.keepMounted ?? props.forceMount ?? props.portalProps?.forceMount
);
const attrs = useAttrs();
const instance = getCurrentInstance();
const resolvedDataSlot = computed(
	() => (attrs["data-slot"] as string | undefined) ?? "popover-content"
);
const hasExplicitAriaLabel = computed(
	() => Boolean(attrs["aria-label"]) && !attrs["aria-labelledby"]
);
const resolvedAnchor = computed(() => props.anchor ?? ctx?.anchor.value ?? undefined);

const hasOpenAutoFocus = computed(() => Boolean(instance?.vnode.props?.onOpenAutoFocus));
const hasCloseAutoFocus = computed(() => Boolean(instance?.vnode.props?.onCloseAutoFocus));

const resolvedInitialFocus = computed<PopoverInitialFocus | undefined>(() => {
	if (props.initialFocus !== undefined) return props.initialFocus;
	if (!hasOpenAutoFocus.value) return undefined;
	return () => {
		const event = new Event("openAutoFocus", { cancelable: true });
		emit("openAutoFocus", event);
		if (event.defaultPrevented) {
			return document.activeElement instanceof HTMLElement ? document.activeElement : null;
		}
		return undefined;
	};
});

const resolvedFinalFocus = computed<PopoverFinalFocus | undefined>(() => {
	if (props.finalFocus !== undefined) return props.finalFocus;
	if (!hasCloseAutoFocus.value) return undefined;
	return () => {
		const event = new Event("closeAutoFocus", { cancelable: true });
		emit("closeAutoFocus", event);
		if (event.defaultPrevented) {
			return document.activeElement instanceof HTMLElement ? document.activeElement : null;
		}
		return undefined;
	};
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
		:anchor="resolvedAnchor"
		:initial-focus="resolvedInitialFocus"
		:final-focus="resolvedFinalFocus"
		:keep-mounted="resolvedKeepMounted"
		:inline="resolvedInline"
		:container="resolvedContainer"
		:data-slot="resolvedDataSlot"
		:data-appearance="props.appearance"
		:class="
			cn(
				'cn-popover-content cn-overlay-surface cn-popover-viewport z-50 origin-(--transform-origin) outline-hidden',
				props.appearance === 'options' ? 'w-[330px]' : 'w-72',
				props.appearance === 'surface' && 'cn-overlay-menu-rows animate-none!',
				props.appearance === 'options' && 'cn-popover-options animate-none!',
				props.class
			)
		"
		:style="{
			'--reka-popover-content-available-height': 'var(--available-height)',
			'--reka-popover-content-available-width': 'var(--available-width)',
			'--reka-popover-content-transform-origin': 'var(--transform-origin)',
		}"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as ?? 'div'"
				:as-child="props.asChild"
				:part="{
					...part,
					...(attrs['aria-labelledby']
						? { 'aria-labelledby': attrs['aria-labelledby'] }
						: hasExplicitAriaLabel
							? { 'aria-labelledby': undefined }
							: {}),
					'data-slot': resolvedDataSlot,
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
