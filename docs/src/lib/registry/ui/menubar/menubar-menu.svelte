<script lang="ts">
	import {
		Menu as SdkMenu,
		type MenuController,
		type MenuOpenChangeReason,
	} from "@ui-sdk/svelte/menu";
	import type { ChangeDetails } from "@ui-sdk/core";
	import { getContext, setContext, type Snippet } from "svelte";
	import {
		MENUBAR_POLICY_KEY,
		MENUBAR_VALUE_KEY,
		type MenubarDismissPolicy,
		type MenubarValueContext,
	} from "./context.js";

	const PARENT_ESCAPE_KEY = Symbol.for("valar-dialog-parent-escape");

	let {
		value,
		open = $bindable(),
		defaultOpen,
		modal: modalProp,
		loop,
		delay,
		controller,
		container,
		onOpenChange,
		onOpenChangeComplete,
		children,
	}: {
		value?: string;
		open?: boolean;
		defaultOpen?: boolean;
		modal?: boolean | "pointer";
		loop?: boolean;
		delay?: number;
		controller?: MenuController<unknown>;
		container?: Element | DocumentFragment | null;
		onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		children?: Snippet;
	} = $props();

	const generatedValue = $props.id();
	const menuValue = $derived(value ?? generatedValue);
	const bar = getContext<MenubarValueContext | undefined>(MENUBAR_VALUE_KEY);
	const parentEscape = getContext<(() => void) | undefined>(PARENT_ESCAPE_KEY);

	let policy = $state<MenubarDismissPolicy>({});
	setContext(MENUBAR_POLICY_KEY, {
		set(next: MenubarDismissPolicy) {
			policy = next;
		},
	});

	const resolvedModal = $derived(
		modalProp ??
			(policy.interactOutsideBehavior === "ignore" ||
			policy.interactOutsideBehavior === "defer-otherwise-ignore"
				? false
				: undefined)
	);

	const controlledOpen = $derived(
		open !== undefined
			? open
			: bar?.isControlled
				? bar.value === menuValue
				: undefined
	);

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
		if (!details.canceled) {
			if (open !== undefined) open = next;
			bar?.onMenuOpenChange(menuValue, next);
			if (!next && details.reason === "escape-key") {
				details.event?.stopPropagation();
			}
		}
	}
</script>

<SdkMenu
	open={controlledOpen}
	{defaultOpen}
	modal={resolvedModal}
	{loop}
	{delay}
	presentation="popover"
	{controller}
	{container}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
>
	{@render children?.()}
</SdkMenu>
