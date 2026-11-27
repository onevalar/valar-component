<script setup lang="ts">
import IconPlaceholder from "@/registry/bases/reka/components/icon-placeholder/IconPlaceholder.vue";
import { Button } from "@/registry/bases/reka/ui/button";
import {
	DialogContent as SdkContent,
	type DialogFinalFocus,
	type DialogInitialFocus,
} from "@ui-sdk/vue/dialog";
import { cn } from "cn";
import {
	computed,
	getCurrentInstance,
	inject,
	onBeforeUnmount,
	useAttrs,
	watchEffect,
	type Component,
	type ComponentPublicInstance,
	type HTMLAttributes,
} from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";
import DialogClose from "./DialogClose.vue";
import DialogOverlay from "./DialogOverlay.vue";
import { DIALOG_CONTEXT_KEY, resolvePortalContainer } from "./context";

defineOptions({ inheritAttrs: false });

export interface DialogPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		class?: HTMLAttributes["class"];
		showCloseButton?: boolean;
		showOverlay?: boolean;
		overlayClass?: HTMLAttributes["class"];
		closeLabel?: string;
		initialFocus?: DialogInitialFocus;
		finalFocus?: DialogFinalFocus;
		keepMounted?: boolean;
		forceMount?: boolean;
		inline?: boolean;
		container?: Element | DocumentFragment | null;
		portalProps?: DialogPortalProps;
		trapFocus?: boolean;
		disableOutsidePointerEvents?: boolean;
	}>(),
	{
		showCloseButton: true,
		showOverlay: true,
		closeLabel: "关闭",
		keepMounted: undefined,
		forceMount: undefined,
		inline: undefined,
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
const attrs = useAttrs();
let contentEl: HTMLElement | null = null;

watchEffect(() => {
	if (!ctx) return;
	const vprops = instance?.vnode.props ?? {};
	ctx.policy.value = {
		onInteractOutside: vprops.onInteractOutside ? (event) => emit("interactOutside", event) : undefined,
		onPointerDownOutside: vprops.onPointerDownOutside
			? (event) => emit("pointerDownOutside", event)
			: undefined,
		onEscapeKeyDown: vprops.onEscapeKeyDown ? (event) => emit("escapeKeyDown", event) : undefined,
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
const resolvedDataSlot = computed(
	() => (attrs["data-slot"] as string | undefined) ?? "dialog-content"
);
const hasExplicitAriaLabel = computed(
	() => Boolean(attrs["aria-label"]) && !attrs["aria-labelledby"]
);

const hasOpenAutoFocus = computed(() => Boolean(instance?.vnode.props?.onOpenAutoFocus));
const hasCloseAutoFocus = computed(() => Boolean(instance?.vnode.props?.onCloseAutoFocus));

const resolvedInitialFocus = computed<DialogInitialFocus | undefined>(() => {
	if (props.initialFocus !== undefined) return props.initialFocus;
	if (!hasOpenAutoFocus.value) return undefined;
	return () => {
		const before = document.activeElement;
		const event = new Event("openAutoFocus", { cancelable: true });
		if (contentEl) Object.defineProperty(event, "target", { value: contentEl });
		emit("openAutoFocus", event);
		if (event.defaultPrevented) {
			if (document.activeElement !== before && document.activeElement instanceof HTMLElement) {
				return document.activeElement;
			}
			return before instanceof HTMLElement ? before : null;
		}
		return (
			contentEl?.querySelector<HTMLElement>(
				'[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
			) ?? undefined
		);
	};
});

const resolvedFinalFocus = computed<DialogFinalFocus | undefined>(() => {
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

let latestSdkRef: unknown = null;
function stableBindRef(node: Element | ComponentPublicInstance | null) {
	contentEl = node instanceof HTMLElement ? node : null;
	if (typeof latestSdkRef === "function") latestSdkRef(node);
	else if (latestSdkRef && typeof latestSdkRef === "object" && "value" in latestSdkRef) {
		(latestSdkRef as { value: unknown }).value = node;
	}
}
function trackRef(sdkRef: unknown) {
	latestSdkRef = sdkRef;
	return stableBindRef;
}
</script>

<template>
	<DialogOverlay v-if="props.showOverlay && !resolvedInline" :class="props.overlayClass" />
	<SdkContent
		v-bind="$attrs"
		:initial-focus="resolvedInitialFocus"
		:final-focus="resolvedFinalFocus"
		:keep-mounted="resolvedKeepMounted"
		:inline="resolvedInline"
		:container="resolvedContainer"
		:data-slot="resolvedDataSlot"
		:class="
			cn(
				'cn-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none',
				props.class
			)
		"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as ?? 'div'"
				:as-child="props.asChild"
				:part="{
					...part,
					ref: trackRef(part.ref),
					...(attrs['aria-labelledby']
						? { 'aria-labelledby': attrs['aria-labelledby'] }
						: hasExplicitAriaLabel
							? { 'aria-labelledby': undefined }
							: {}),
					'data-slot': resolvedDataSlot,
					'data-state': state.open ? 'open' : 'closed',
				}"
			>
				<slot />
				<DialogClose v-if="props.showCloseButton" as-child>
					<Button variant="ghost" class="cn-dialog-close" size="icon-sm">
						<IconPlaceholder
							lucide="XIcon"
							tabler="IconX"
							hugeicons="Cancel01Icon"
							phosphor="XIcon"
							remixicon="RiCloseLine"
						/>
						<span class="sr-only">{{ props.closeLabel }}</span>
					</Button>
				</DialogClose>
			</DisclosureElement>
		</template>
	</SdkContent>
</template>
