<script lang="ts">
	import {
		Popover as SdkPopover,
		type PopoverController,
		type PopoverDismissReason,
		type PopoverOpenChangeReason,
		type PopoverPayloadChangeReason,
	} from "@ui-sdk/svelte/popover";
	import type { ChangeDetails, DismissAttemptDetails } from "@ui-sdk/core";
	import { setContext, type Snippet } from "svelte";
	import { POPOVER_POLICY_KEY, type PopoverDismissPolicy } from "./context.js";

	let {
		open = $bindable(),
		defaultOpen,
		modal,
		openOnHover,
		delay,
		closeDelay,
		presentation,
		controller,
		dismissible,
		container,
		onOpenChange,
		onOpenChangeComplete,
		onPayloadChange,
		onDismissAttempt,
		children,
	}: {
		open?: boolean;
		defaultOpen?: boolean;
		modal?: boolean | "trap-focus";
		openOnHover?: boolean;
		delay?: number;
		closeDelay?: number;
		presentation?: "auto" | "popover" | "sheet";
		controller?: PopoverController<unknown>;
		dismissible?: boolean;
		container?: Element | DocumentFragment | null;
		onOpenChange?: (open: boolean, details?: ChangeDetails<PopoverOpenChangeReason>) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		onPayloadChange?: (
			payload: unknown,
			details: ChangeDetails<PopoverPayloadChangeReason>
		) => void;
		onDismissAttempt?: (details: DismissAttemptDetails<PopoverDismissReason>) => void;
		children?: Snippet;
	} = $props();

	let policy: PopoverDismissPolicy = {};
	setContext(POPOVER_POLICY_KEY, {
		set(next: PopoverDismissPolicy) {
			policy = next;
		},
	});

	function handleOpenChange(next: boolean, details: ChangeDetails<PopoverOpenChangeReason>) {
		if (!next) {
			if (
				(details.reason === "outside-press" || details.reason === "focus-out") &&
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
				// @ui-sdk/core calls preventDefault() on the native Escape event before
				// firing onOpenChange; dispatch a fresh cancelable event so callers opt in
				// explicitly when preventing dismissal.
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
			// Prevent a consumed Escape from bubbling to an outer legacy Dialog/Sheet.
			details.event?.stopPropagation();
		}
	}
</script>

<SdkPopover
	bind:open
	{defaultOpen}
	{modal}
	{openOnHover}
	{delay}
	{closeDelay}
	{presentation}
	{controller}
	{dismissible}
	{container}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
	{onPayloadChange}
	{onDismissAttempt}
>
	{@render children?.()}
</SdkPopover>
