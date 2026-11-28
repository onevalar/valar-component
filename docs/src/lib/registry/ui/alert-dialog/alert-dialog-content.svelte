<script lang="ts">
	import {
		DialogContent as SdkContent,
		type DialogFinalFocus,
		type DialogInitialFocus,
	} from "@ui-sdk/svelte/dialog";
	import type { StyleProperties } from "svelte-toolbelt";
	import { cn } from "$lib/utils.js";
	import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import {
		ALERT_DIALOG_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		toStyleString,
		type AlertDialogDismissPolicy,
		type AlertDialogPolicyContext,
	} from "./context.js";

	export type AlertDialogPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		style,
		size = "default",
		appearance = "default",
		focusCancel = false,
		portalProps,
		container: containerProp,
		inline: inlineProp,
		forceMount = false,
		keepMounted,
		interactOutsideBehavior = "ignore",
		escapeKeydownBehavior,
		onInteractOutside,
		onEscapeKeydown,
		initialFocus: initialFocusProp,
		finalFocus: finalFocusProp,
		onOpenAutoFocus,
		onCloseAutoFocus,
		trapFocus,
		preventScroll: _preventScroll,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		AlertDialogDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			size?: "default" | "sm";
			appearance?: "default" | "confirmation" | "danger";
			/** Places initial focus on an enabled Cancel button when one is present. */
			focusCancel?: boolean;
			portalProps?: AlertDialogPortalProps;
			container?: Element | DocumentFragment | null;
			inline?: boolean;
			forceMount?: boolean;
			keepMounted?: boolean;
			initialFocus?: DialogInitialFocus;
			finalFocus?: DialogFinalFocus;
			onOpenAutoFocus?: (event: Event) => void;
			onCloseAutoFocus?: (event: Event) => void;
			preventScroll?: boolean;
			children?: Snippet;
		} = $props();

	const policyContext = getContext<AlertDialogPolicyContext | undefined>(ALERT_DIALOG_POLICY_KEY);
	$effect(() => {
		policyContext?.set({
			interactOutsideBehavior,
			escapeKeydownBehavior,
			onInteractOutside,
			onEscapeKeydown,
			trapFocus,
		});
	});

	const resolvedInline = $derived(inlineProp ?? portalProps?.disabled ?? false);
	const resolvedContainer = $derived(
		resolvedInline ? undefined : (containerProp ?? resolvePortalContainer(portalProps?.to))
	);
	const resolvedKeepMounted = $derived(keepMounted ?? forceMount);

	const resolvedInitialFocus = $derived.by<DialogInitialFocus | undefined>(() => {
		if (initialFocusProp !== undefined) return initialFocusProp;
		if (resolvedInline && trapFocus === false) return "none";
		return () => {
			if (onOpenAutoFocus) {
				const before = document.activeElement;
				const event = new Event("openAutoFocus", { cancelable: true });
				onOpenAutoFocus(event);
				if (event.defaultPrevented) {
					if (document.activeElement !== before && document.activeElement instanceof HTMLElement) {
						return document.activeElement;
					}
					return before instanceof HTMLElement ? before : null;
				}
			}
			if (focusCancel) {
				const cancel = ref?.querySelector<HTMLButtonElement>(
					'button[data-slot="alert-dialog-cancel"]:not(:disabled,[aria-disabled="true"])'
				);
				if (cancel) return cancel;
			}
			return ref;
		};
	});

	const resolvedFinalFocus = $derived.by<DialogFinalFocus | undefined>(() => {
		if (finalFocusProp !== undefined) return finalFocusProp;
		if (resolvedInline && trapFocus === false) return "none";
		if (!onCloseAutoFocus) return undefined;
		return () => {
			const event = new Event("closeAutoFocus", { cancelable: true });
			onCloseAutoFocus(event);
			if (event.defaultPrevented) {
				return document.activeElement instanceof HTMLElement ? document.activeElement : null;
			}
			return undefined;
		};
	});

	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});
	const hasExplicitAriaLabel = $derived(
		Boolean((restProps as Record<string, unknown>)["aria-label"]) &&
			!(restProps as Record<string, unknown>)["aria-labelledby"]
	);
</script>

{#if resolvedInline && trapFocus === false}
	{#if policyContext?.isOpen()}
		<div
			data-slot="alert-dialog-overlay"
			data-open=""
			data-state="open"
			aria-hidden="true"
			class="cn-alert-dialog-overlay fixed inset-0 z-50"
			onmousedown={(event) => {
				if (interactOutsideBehavior === "ignore") event.preventDefault();
			}}
		></div>
	{/if}
{:else}
	<AlertDialogOverlay
		onmousedown={(event) => {
			if (interactOutsideBehavior === "ignore") event.preventDefault();
		}}
	/>
{/if}
<SdkContent
	initialFocus={resolvedInitialFocus}
	finalFocus={resolvedFinalFocus}
	keepMounted={resolvedKeepMounted}
	inline={resolvedInline}
	container={resolvedContainer}
	data-slot="alert-dialog-content"
	data-size={size}
	data-appearance={appearance}
	class={cn(
		"cn-alert-dialog-content group/alert-dialog-content pointer-events-auto fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none data-closed:pointer-events-none",
		appearance === "danger" && "cn-alert-dialog-danger",
		className
	)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			{...refAttachment}
			data-slot="alert-dialog-content"
			hidden={!state.open || undefined}
			inert={!state.open || undefined}
			role="alertdialog"
			aria-modal={policyContext?.isModal() ? "true" : undefined}
			aria-labelledby={hasExplicitAriaLabel ? undefined : (props["aria-labelledby"] as string | undefined)}
			data-state={state.open ? "open" : "closed"}
		>
			{@render children?.()}
		</div>
	{/snippet}
</SdkContent>
