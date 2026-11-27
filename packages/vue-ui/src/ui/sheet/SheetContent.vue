<script lang="ts">
export type SheetSide = "top" | "right" | "bottom" | "left";
</script>

<script setup lang="ts">
import { XIcon } from "@lucide/vue";
import { cn } from "cn";
import { computed, getCurrentInstance, inject, type Component, type HTMLAttributes } from "vue";
import { Button } from "../button/index.js";
import { DIALOG_CONTEXT_KEY } from "../dialog/context";
import DialogContent, { type DialogPortalProps } from "../dialog/DialogContent.vue";
import { SheetClose, SheetOverlay } from "./index.js";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		class?: HTMLAttributes["class"];
		side?: SheetSide;
		appearance?: "default" | "details";
		portalProps?: DialogPortalProps;
		container?: Element | DocumentFragment | null;
		inline?: boolean;
		forceMount?: boolean;
		keepMounted?: boolean;
		showCloseButton?: boolean;
		closeLabel?: string;
		disableOutsidePointerEvents?: boolean;
	}>(),
	{
		side: "right",
		appearance: "default",
		showCloseButton: true,
		closeLabel: "关闭",
		inline: undefined,
		forceMount: undefined,
		keepMounted: undefined,
		disableOutsidePointerEvents: undefined,
	}
);

const emit = defineEmits<{
	openAutoFocus: [event: Event];
	closeAutoFocus: [event: Event];
	interactOutside: [event: Event];
	pointerDownOutside: [event: Event];
	focusOutside: [event: Event];
	escapeKeyDown: [event: KeyboardEvent];
}>();

const ctx = inject(DIALOG_CONTEXT_KEY, null);
const instance = getCurrentInstance();
const resolvedInline = computed(() => props.inline ?? props.portalProps?.disabled ?? false);
const forwardedListeners = computed(() => {
	const vprops = instance?.vnode.props ?? {};
	return {
		...(vprops.onOpenAutoFocus ? { onOpenAutoFocus: (e: Event) => emit("openAutoFocus", e) } : {}),
		...(vprops.onCloseAutoFocus ? { onCloseAutoFocus: (e: Event) => emit("closeAutoFocus", e) } : {}),
		...(vprops.onInteractOutside ? { onInteractOutside: (e: Event) => emit("interactOutside", e) } : {}),
		...(vprops.onPointerDownOutside
			? { onPointerDownOutside: (e: Event) => emit("pointerDownOutside", e) }
			: {}),
		...(vprops.onFocusOutside ? { onFocusOutside: (e: Event) => emit("focusOutside", e) } : {}),
		...(vprops.onEscapeKeyDown
			? { onEscapeKeyDown: (e: KeyboardEvent) => emit("escapeKeyDown", e) }
			: {}),
	};
});
function trapSheetTab(event: KeyboardEvent) {
	if (event.key !== "Tab" || event.defaultPrevented || ctx?.modal.value === false) return;
	const el = event.currentTarget;
	if (!(el instanceof HTMLElement)) return;
	const tabbables = Array.from(
		el.querySelectorAll<HTMLElement>(
			'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
		)
	).filter((node) => node.getClientRects().length > 0);
	if (!tabbables.length) return;
	const first = tabbables[0];
	const last = tabbables[tabbables.length - 1];
	const active = el.ownerDocument.activeElement;
	if (event.shiftKey && (active === first || active === el || !el.contains(active))) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && (active === last || !el.contains(active))) {
		event.preventDefault();
		first.focus();
	}
}
</script>

<template>
	<SheetOverlay
		v-if="!resolvedInline"
		:class="appearance === 'details' ? 'cn-sheet-details-overlay' : undefined"
	/>
	<DialogContent
		v-bind="{ ...$attrs, ...forwardedListeners }"
		:as="props.as"
		:as-child="props.asChild"
		:portal-props="props.portalProps"
		:container="props.container"
		:inline="props.inline"
		:force-mount="props.forceMount"
		:keep-mounted="props.keepMounted"
		:show-overlay="false"
		:show-close-button="false"
		:aria-modal="ctx?.modal.value !== false ? 'true' : undefined"
		data-slot="sheet-content"
		:data-side="side"
		:data-appearance="appearance"
		@keydown="trapSheetTab"
		:class="
			cn(
				'cn-sheet-content top-auto left-auto max-h-dvh translate-x-0 translate-y-0 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-10 data-[side=left]:data-[state=closed]:slide-out-to-left-10 data-[side=right]:data-[state=closed]:slide-out-to-right-10 data-[side=top]:data-[state=closed]:slide-out-to-top-10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:data-[state=open]:slide-in-from-bottom-10 data-[side=left]:data-[state=open]:slide-in-from-left-10 data-[side=right]:data-[state=open]:slide-in-from-right-10 data-[side=top]:data-[state=open]:slide-in-from-top-10 motion-reduce:animate-none! motion-reduce:transition-none',
				appearance === 'details' && 'cn-sheet-details',
				props.class
			)
		"
	>
		<slot />
		<SheetClose v-if="showCloseButton && !asChild" as-child>
			<Button variant="ghost" size="icon-sm" class="cn-sheet-close" :aria-label="closeLabel">
				<XIcon aria-hidden="true" />
			</Button>
		</SheetClose>
	</DialogContent>
</template>
