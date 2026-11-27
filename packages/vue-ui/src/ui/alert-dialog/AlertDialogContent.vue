<script setup lang="ts">
import { AlertDialogContent as SdkContent } from "@ui-sdk/vue/alert-dialog";
import type { DialogFinalFocus, DialogInitialFocus } from "@ui-sdk/vue/dialog";
import { cn } from "cn";
import {
	computed,
	getCurrentInstance,
	inject,
	onBeforeUnmount,
	useAttrs,
	watchEffect,
	type ComponentPublicInstance,
	type HTMLAttributes,
} from "vue";
import { DIALOG_CONTEXT_KEY, resolvePortalContainer } from "../dialog/context";
import AlertDialogOverlay from "./AlertDialogOverlay.vue";

defineOptions({ inheritAttrs: false });

export interface AlertDialogPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		size?: "default" | "sm";
		appearance?: "default" | "confirmation" | "danger";
		focusCancel?: boolean;
		portalProps?: AlertDialogPortalProps;
		container?: Element | DocumentFragment | null;
		inline?: boolean;
		forceMount?: boolean;
		keepMounted?: boolean;
		initialFocus?: DialogInitialFocus;
		finalFocus?: DialogFinalFocus;
		disableOutsidePointerEvents?: boolean;
	}>(),
	{
		size: "default",
		appearance: "default",
		focusCancel: false,
		inline: undefined,
		forceMount: undefined,
		keepMounted: undefined,
		disableOutsidePointerEvents: undefined,
	}
);

const emit = defineEmits<{
	openAutoFocus: [event: Event];
	closeAutoFocus: [event: Event];
	escapeKeyDown: [event: KeyboardEvent];
	pointerDownOutside: [event: Event];
	focusOutside: [event: Event];
	interactOutside: [event: Event];
}>();

const ctx = inject(DIALOG_CONTEXT_KEY, null);
const instance = getCurrentInstance();
const attrs = useAttrs();
let contentEl: HTMLElement | null = null;

watchEffect(() => {
	if (!ctx) return;
	const vprops = instance?.vnode.props ?? {};
	ctx.policy.value = {
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
const hasExplicitAriaLabel = computed(
	() => Boolean(attrs["aria-label"]) && !attrs["aria-labelledby"]
);

const hasOpenAutoFocus = computed(() => Boolean(instance?.vnode.props?.onOpenAutoFocus));
const hasCloseAutoFocus = computed(() => Boolean(instance?.vnode.props?.onCloseAutoFocus));

const resolvedInitialFocus = computed<DialogInitialFocus | undefined>(() => {
	if (props.initialFocus !== undefined) return props.initialFocus;
	return () => {
		if (hasOpenAutoFocus.value) {
			const before = document.activeElement;
			const event = new Event("openAutoFocus", { cancelable: true });
			if (contentEl) Object.defineProperty(event, "target", { value: contentEl });
			emit("openAutoFocus", event);
			if (event.defaultPrevented) {
				if (document.activeElement !== before && document.activeElement instanceof HTMLElement) {
					return document.activeElement;
				}
				return before instanceof HTMLElement ? before : contentEl;
			}
		}
		if (props.focusCancel && contentEl) {
			const cancel = contentEl.querySelector<HTMLElement>(
				'[data-slot="alert-dialog-cancel"]:not(:disabled,[aria-disabled="true"])'
			);
			if (cancel) return cancel;
		}
		return undefined;
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
	<AlertDialogOverlay v-if="!resolvedInline" @mousedown.prevent />
	<SdkContent
		v-bind="$attrs"
		:initial-focus="resolvedInitialFocus"
		:final-focus="resolvedFinalFocus"
		:keep-mounted="resolvedKeepMounted"
		:inline="resolvedInline"
		:container="resolvedContainer"
		data-slot="alert-dialog-content"
		:data-size="size"
		:data-appearance="appearance"
		:class="
			cn(
				'cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none',
				appearance === 'danger' && 'cn-alert-dialog-danger',
				props.class
			)
		"
	>
		<template #render="{ props: part, state }">
			<div
				v-bind="{ ...part, ref: undefined }"
				:ref="trackRef(part.ref)"
				data-slot="alert-dialog-content"
				:aria-labelledby="
					attrs['aria-labelledby']
						? (attrs['aria-labelledby'] as string)
						: hasExplicitAriaLabel
							? undefined
							: (part['aria-labelledby'] as string | undefined)
				"
				:data-state="state.open ? 'open' : 'closed'"
			>
				<slot />
			</div>
		</template>
	</SdkContent>
</template>
