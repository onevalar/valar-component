<script lang="ts">
	import {
		MenuSub as SdkSub,
		type MenuController,
		type MenuOpenChangeReason,
	} from "@ui-sdk/svelte/menu";
	import type { ChangeDetails } from "@ui-sdk/core";
	import { getContext, setContext, type Snippet } from "svelte";
	import { CONTEXT_MENU_SUB_POLICY_KEY, type ContextMenuDismissPolicy } from "./context.js";

	const PARENT_ESCAPE_KEY = Symbol.for("valar-dialog-parent-escape");

	let {
		open = $bindable(),
		defaultOpen,
		loop,
		delay,
		controller,
		onOpenChange,
		onOpenChangeComplete,
		children,
	}: {
		open?: boolean;
		defaultOpen?: boolean;
		loop?: boolean;
		delay?: number;
		controller?: MenuController<unknown>;
		onOpenChange?: (open: boolean, details?: ChangeDetails<MenuOpenChangeReason>) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		children?: Snippet;
	} = $props();

	let policy = $state<ContextMenuDismissPolicy>({});
	let triggerEl: HTMLElement | null = null;
	const parentEscape = getContext<(() => void) | undefined>(PARENT_ESCAPE_KEY);
	setContext(CONTEXT_MENU_SUB_POLICY_KEY, {
		set(next: ContextMenuDismissPolicy) {
			policy = next;
		},
		setTrigger(el: HTMLElement | null) {
			triggerEl = el;
		},
	});

	function handleOpenChange(next: boolean, details: ChangeDetails<MenuOpenChangeReason>) {
		const isEscapeKey =
			details.reason === "escape-key" &&
			(!(details.event instanceof KeyboardEvent) || details.event.key === "Escape");
		if (!next) {
			if (
				isEscapeKey &&
				(policy.escapeKeydownBehavior === "ignore" ||
					policy.escapeKeydownBehavior === "defer-otherwise-ignore")
			) {
				details.cancel();
				if (policy.escapeKeydownBehavior === "defer-otherwise-ignore") {
					parentEscape?.();
				}
				return;
			}
			if (isEscapeKey && policy.onEscapeKeydown) {
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
			const target = triggerEl;
			queueMicrotask(() => {
				if (target?.isConnected && document.activeElement !== target) {
					target.focus({ preventScroll: true });
				}
			});
		}
	}
</script>

<SdkSub
	bind:open
	{defaultOpen}
	{loop}
	{delay}
	{controller}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
>
	{@render children?.()}
</SdkSub>
