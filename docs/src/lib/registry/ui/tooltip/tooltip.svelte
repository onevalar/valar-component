<script lang="ts" generics="T = never">
	import {
		Tooltip as SdkTooltip,
		createTooltipController,
		type TooltipController,
		type TooltipOpenChangeReason,
		type TooltipPayloadChangeReason,
	} from "@ui-sdk/svelte/tooltip";
	import type { ChangeDetails } from "@ui-sdk/core";
	import { getContext, onDestroy, setContext, type Snippet } from "svelte";
	import {
		TOOLTIP_FOCUS_KEY,
		TOOLTIP_POLICY_KEY,
		TOOLTIP_PROVIDER_KEY,
		type TooltipDismissPolicy,
		type TooltipProviderContext,
	} from "./context.js";

	const PARENT_ESCAPE_KEY = Symbol.for("valar-dialog-parent-escape");

	let {
		open = $bindable(),
		defaultOpen,
		delayDuration,
		delay,
		closeDelay,
		disabled: disabledProp,
		disableHoverableContent: _disableHoverableContent,
		disableCloseOnTriggerClick,
		toggleable,
		closeOnPress,
		type,
		shortcut,
		controller,
		container,
		onOpenChange,
		onOpenChangeComplete,
		onPayloadChange,
		children,
	}: {
		open?: boolean;
		defaultOpen?: boolean;
		delayDuration?: number;
		delay?: number;
		closeDelay?: number;
		disabled?: boolean;
		disableHoverableContent?: boolean;
		disableCloseOnTriggerClick?: boolean;
		toggleable?: boolean;
		closeOnPress?: boolean;
		type?: "label" | "description";
		shortcut?: string;
		controller?: TooltipController<T>;
		container?: Element | DocumentFragment | null;
		onOpenChange?: (open: boolean, details?: ChangeDetails<TooltipOpenChangeReason>) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		onPayloadChange?: (
			payload: unknown,
			details: ChangeDetails<TooltipPayloadChangeReason>
		) => void;
		children?: Snippet;
	} = $props();

	const provider = getContext<TooltipProviderContext | undefined>(TOOLTIP_PROVIDER_KEY);
	const parentEscape = getContext<(() => void) | undefined>(PARENT_ESCAPE_KEY);
	const resolvedDisabled = $derived(disabledProp ?? provider?.disabled ?? false);
	const resolvedDelay = $derived(delay ?? delayDuration ?? provider?.delayDuration ?? 500);
	const internalController = createTooltipController<T>();
	const resolvedController = $derived(controller ?? internalController);

	let hoverTimer: ReturnType<typeof setTimeout> | null = null;
	let wasOpen = false;

	function cancelPendingHoverOpen() {
		if (hoverTimer !== null) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
	}

	function scheduleHoverOpen() {
		if (resolvedDisabled) return;
		cancelPendingHoverOpen();
		const wait = provider?.isWarm() ? 0 : resolvedDelay;
		if (wait <= 0) {
			focusContext.openedByHoverTimer = true;
			void resolvedController.open();
			return;
		}
		hoverTimer = setTimeout(() => {
			hoverTimer = null;
			focusContext.openedByHoverTimer = true;
			void resolvedController.open();
		}, wait);
	}

	onDestroy(() => {
		cancelPendingHoverOpen();
		if (wasOpen) {
			provider?.notifyOpen(false);
			wasOpen = false;
		}
	});

	const focusContext = {
		get controller() {
			return resolvedController as TooltipController<unknown>;
		},
		get disabled() {
			return resolvedDisabled;
		},
		get delayDuration() {
			return resolvedDelay;
		},
		pointerDown: false,
		pointerEnteredAt: 0,
		openedByHoverTimer: false,
		lastDismissedAt: -Infinity,
		cancelPendingHoverOpen,
		scheduleHoverOpen,
	};
	setContext(TOOLTIP_FOCUS_KEY, focusContext);

	let policy: TooltipDismissPolicy = {};
	setContext(TOOLTIP_POLICY_KEY, {
		set(next: TooltipDismissPolicy) {
			policy = next;
		},
		get disabled() {
			return resolvedDisabled;
		},
	});

	function handleOpenChange(next: boolean, details: ChangeDetails<TooltipOpenChangeReason>) {
		if (resolvedDisabled && next) {
			details.cancel();
			return;
		}
		if (next) {
			// Enforce per-Provider warm group isolation so a tooltip open in another Provider
			// does not collapse this Provider's configured hover delay to 0ms.
			if (
				details.reason === "trigger-hover" &&
				resolvedDelay > 0 &&
				provider &&
				!provider.isWarm()
			) {
				const elapsed =
					focusContext.pointerEnteredAt > 0
						? performance.now() - focusContext.pointerEnteredAt
						: 0;
				if (elapsed < resolvedDelay - 30) {
					details.cancel();
					cancelPendingHoverOpen();
					const remaining = Math.max(0, Math.round(resolvedDelay - elapsed));
					hoverTimer = setTimeout(() => {
						hoverTimer = null;
						focusContext.openedByHoverTimer = true;
						void resolvedController.open();
					}, remaining);
					return;
				}
			}
		} else {
			cancelPendingHoverOpen();
			focusContext.openedByHoverTimer = false;
		}
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
		if (!details.canceled && next !== wasOpen) {
			wasOpen = next;
			provider?.notifyOpen(next);
		}
		if (!next && !details.canceled && details.reason === "escape-key") {
			focusContext.lastDismissedAt = performance.now();
			details.event?.stopPropagation();
		}
	}
</script>

<SdkTooltip
	bind:open
	{defaultOpen}
	delay={resolvedDelay}
	{closeDelay}
	disabled={resolvedDisabled}
	{toggleable}
	closeOnPress={disableCloseOnTriggerClick ? false : closeOnPress}
	{type}
	{shortcut}
	controller={resolvedController}
	{container}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
	{onPayloadChange}
>
	{@render children?.()}
</SdkTooltip>
