<script lang="ts">
	import {
		Dialog as SdkDialog,
		type DialogController,
		type DialogDismissAttemptDetails,
		type DialogOpenChangeDetails,
		type DialogPayloadChangeReason,
	} from "@ui-sdk/svelte/dialog";
	import type { ChangeDetails } from "@ui-sdk/core";
	import { getContext, setContext, type Snippet } from "svelte";
	import {
		ALERT_DIALOG_POLICY_KEY,
		type AlertDialogDismissPolicy,
	} from "./context.js";

	const PARENT_ESCAPE_KEY = Symbol.for("valar-dialog-parent-escape");

	let {
		open = $bindable(false),
		defaultOpen,
		controller,
		dismissible,
		persistentElements,
		pendingAnnouncement,
		container,
		onOpenChange,
		onOpenChangeComplete,
		onPayloadChange,
		onDismissAttempt,
		children,
	}: {
		open?: boolean;
		defaultOpen?: boolean;
		controller?: DialogController<unknown, unknown>;
		dismissible?: boolean;
		persistentElements?: (Element | string)[] | (() => Element[]);
		pendingAnnouncement?: string;
		container?: Element | DocumentFragment | null;
		onOpenChange?: (open: boolean, details?: DialogOpenChangeDetails) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		onPayloadChange?: (
			payload: unknown,
			details: ChangeDetails<DialogPayloadChangeReason>
		) => void;
		onDismissAttempt?: (details: DialogDismissAttemptDetails) => void;
		children?: Snippet;
	} = $props();

	let policy = $state<AlertDialogDismissPolicy>({});
	const effectiveModal = $derived(policy.trapFocus === false ? false : true);
	const parentEscape = getContext<(() => void) | undefined>(PARENT_ESCAPE_KEY);
	const closeOnOutsidePress = $derived(
		policy.interactOutsideBehavior === "close" ||
			policy.interactOutsideBehavior === "defer-otherwise-close"
	);

	setContext(ALERT_DIALOG_POLICY_KEY, {
		set(next: AlertDialogDismissPolicy) {
			policy = next;
		},
		isOpen: () => Boolean(open),
		isModal: () => effectiveModal,
	});

	function handleOpenChange(next: boolean, details: DialogOpenChangeDetails) {
		if (!next) {
			if (
				details.reason === "outside-press" &&
				(policy.interactOutsideBehavior === undefined ||
					policy.interactOutsideBehavior === "ignore" ||
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
			details.event?.stopPropagation();
		}
	}
</script>

<SdkDialog
	bind:open
	{defaultOpen}
	modal={effectiveModal}
	{closeOnOutsidePress}
	presentation="dialog"
	{controller}
	{dismissible}
	{persistentElements}
	{pendingAnnouncement}
	{container}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
	{onPayloadChange}
	{onDismissAttempt}
>
	{@render children?.()}
</SdkDialog>
