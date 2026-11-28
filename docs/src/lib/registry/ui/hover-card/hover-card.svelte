<script lang="ts">
	import {
		HoverCard as SdkHoverCard,
		createHoverCardController,
		type HoverCardController,
		type HoverCardOpenChangeReason,
		type HoverCardPayloadChangeReason,
	} from "@ui-sdk/svelte/hover-card";
	import type { ChangeDetails } from "@ui-sdk/core";
	import { getContext, setContext, type Snippet } from "svelte";
	import {
		HOVER_CARD_FOCUS_KEY,
		HOVER_CARD_POLICY_KEY,
		type HoverCardDismissPolicy,
	} from "./context.js";

	const PARENT_ESCAPE_KEY = Symbol.for("valar-dialog-parent-escape");

	let {
		open = $bindable(),
		defaultOpen,
		openDelay,
		delay,
		closeDelay,
		disabled,
		controller,
		container,
		onOpenChange,
		onOpenChangeComplete,
		onPayloadChange,
		children,
	}: {
		open?: boolean;
		defaultOpen?: boolean;
		openDelay?: number;
		delay?: number;
		closeDelay?: number;
		disabled?: boolean;
		controller?: HoverCardController<unknown>;
		container?: Element | DocumentFragment | null;
		onOpenChange?: (open: boolean, details?: ChangeDetails<HoverCardOpenChangeReason>) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		onPayloadChange?: (
			payload: unknown,
			details: ChangeDetails<HoverCardPayloadChangeReason>
		) => void;
		children?: Snippet;
	} = $props();

	let policy: HoverCardDismissPolicy = {};
	const parentEscape = getContext<(() => void) | undefined>(PARENT_ESCAPE_KEY);
	const internalController = createHoverCardController();
	const resolvedController = $derived(controller ?? internalController);
	const focusContext = {
		get controller() {
			return resolvedController;
		},
		get disabled() {
			return Boolean(disabled);
		},
		pointerDown: false,
		lastDismissedAt: -Infinity,
	};
	setContext(HOVER_CARD_FOCUS_KEY, focusContext);
	setContext(HOVER_CARD_POLICY_KEY, {
		set(next: HoverCardDismissPolicy) {
			policy = next;
		},
	});

	function handleOpenChange(next: boolean, details: ChangeDetails<HoverCardOpenChangeReason>) {
		if (!next) {
			if (
				(details.reason === "outside-press" ||
					details.reason === "focus-out" ||
					details.reason === "window-blur") &&
				(policy.interactOutsideBehavior === "ignore" ||
					policy.interactOutsideBehavior === "defer-otherwise-ignore")
			) {
				details.cancel();
				return;
			}
			if (
				details.reason === "escape-key" &&
				(policy.escapeKeydownBehavior === "ignore" ||
					policy.escapeKeydownBehavior === "defer-otherwise-ignore")
			) {
				details.cancel();
				if (policy.escapeKeydownBehavior === "defer-otherwise-ignore") {
					parentEscape?.();
				}
				return;
			}
			if (details.reason === "outside-press" && policy.onInteractOutside) {
				const event = new CustomEvent("interactOutside", {
					cancelable: true,
					detail: { originalEvent: details.event },
				});
				policy.onInteractOutside(event);
				if (event.defaultPrevented) {
					details.cancel();
					return;
				}
			}
			if (details.reason === "escape-key" && policy.onEscapeKeydown) {
				const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
				policy.onEscapeKeydown(event);
				if (event.defaultPrevented) {
					details.cancel();
					return;
				}
			}
		}
		onOpenChange?.(next, details);
		if (!next && !details.canceled && details.reason === "escape-key") {
			focusContext.lastDismissedAt = performance.now();
			details.event?.stopPropagation();
		}
	}
</script>

<SdkHoverCard
	bind:open
	{defaultOpen}
	delay={delay ?? openDelay}
	{closeDelay}
	{disabled}
	controller={resolvedController}
	{container}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
	{onPayloadChange}
>
	{@render children?.()}
</SdkHoverCard>
