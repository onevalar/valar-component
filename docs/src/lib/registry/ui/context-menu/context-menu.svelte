<script lang="ts">
	import {
		Menu as SdkMenu,
		type MenuActionDetails,
		type MenuCheckedChangeDetails,
		type MenuController,
		type MenuDismissReason,
		type MenuOpenChangeReason,
		type MenuPayloadChangeReason,
		type MenuValueChangeDetails,
	} from "@ui-sdk/svelte/menu";
	import type { ChangeDetails, DismissAttemptDetails } from "@ui-sdk/core";
	import { getContext, setContext, type Snippet } from "svelte";
	import { CONTEXT_MENU_POLICY_KEY, type ContextMenuDismissPolicy } from "./context.js";

	const PARENT_ESCAPE_KEY = Symbol.for("valar-dialog-parent-escape");

	let {
		open = $bindable(),
		defaultOpen,
		modal: modalProp,
		loop,
		delay,
		dismissible,
		controller,
		container,
		dir: _dir,
		onOpenChange,
		onOpenChangeComplete,
		onPayloadChange,
		onAction,
		onCheckedChange,
		onValueChange,
		onDismissAttempt,
		children,
	}: {
		open?: boolean;
		defaultOpen?: boolean;
		modal?: boolean | "pointer";
		loop?: boolean;
		delay?: number;
		dismissible?: boolean;
		controller?: MenuController<unknown>;
		container?: Element | DocumentFragment | null;
		dir?: "ltr" | "rtl";
		onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		onPayloadChange?: (
			payload: unknown,
			details: ChangeDetails<MenuPayloadChangeReason>
		) => void;
		onAction?: (value: string, details: MenuActionDetails) => unknown;
		onCheckedChange?: (checked: boolean, details: MenuCheckedChangeDetails) => void;
		onValueChange?: (value: string, details: MenuValueChangeDetails) => void;
		onDismissAttempt?: (details: DismissAttemptDetails<MenuDismissReason>) => void;
		children?: Snippet;
	} = $props();

	let policy = $state<ContextMenuDismissPolicy>({});
	let policyReady = $state(typeof document === "undefined");
	const parentEscape = getContext<(() => void) | undefined>(PARENT_ESCAPE_KEY);
	setContext(CONTEXT_MENU_POLICY_KEY, {
		set(next: ContextMenuDismissPolicy) {
			policy = next;
		},
	});

	$effect(() => {
		policyReady = true;
	});

	const resolvedModal = $derived(
		modalProp ??
			(policy.trapFocus === false ||
			policy.interactOutsideBehavior === "ignore" ||
			policy.interactOutsideBehavior === "defer-otherwise-ignore"
				? false
				: undefined)
	);
	const resolvedOpen = $derived(open === undefined ? undefined : policyReady ? open : false);

	function handleOpenChange(next: boolean, details: ChangeDetails<MenuOpenChangeReason>) {
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
			details.event?.stopPropagation();
		}
	}
</script>

<SdkMenu
	bind:open={
		() => resolvedOpen,
		(next) => {
			if (open !== undefined) open = next;
		}
	}
	{defaultOpen}
	modal={resolvedModal}
	{loop}
	{delay}
	presentation="popover"
	{dismissible}
	{controller}
	{container}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
	{onPayloadChange}
	{onAction}
	{onCheckedChange}
	{onValueChange}
	{onDismissAttempt}
>
	{@render children?.()}
</SdkMenu>
