<script lang="ts">
	import {
		DialogContent as SdkContent,
		type DialogFinalFocus,
		type DialogInitialFocus,
	} from "@ui-sdk/svelte/dialog";
	import type { StyleProperties } from "svelte-toolbelt";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import DialogClose from "./dialog-close.svelte";
	import DialogOverlay from "./dialog-overlay.svelte";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import {
		DIALOG_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		toStyleString,
		type DialogDismissPolicy,
		type DialogPolicyContext,
	} from "./context.js";

	export type DialogPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		style,
		portalProps,
		container: containerProp,
		inline: inlineProp,
		forceMount = false,
		keepMounted,
		overlayClass,
		appearance = "default",
		children,
		closeLabel = "关闭",
		showCloseButton = true,
		initialFocus: initialFocusProp,
		finalFocus: finalFocusProp,
		onOpenAutoFocus,
		onCloseAutoFocus,
		interactOutsideBehavior,
		escapeKeydownBehavior,
		onInteractOutside,
		onEscapeKeydown,
		trapFocus,
		preventScroll: _preventScroll,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		DialogDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			portalProps?: DialogPortalProps;
			container?: Element | DocumentFragment | null;
			inline?: boolean;
			forceMount?: boolean;
			keepMounted?: boolean;
			overlayClass?: string;
			appearance?: "default" | "editor";
			children?: Snippet;
			showCloseButton?: boolean;
			/** Screen reader text of the close button. */
			closeLabel?: string;
			initialFocus?: DialogInitialFocus;
			finalFocus?: DialogFinalFocus;
			onOpenAutoFocus?: (event: Event) => void;
			onCloseAutoFocus?: (event: Event) => void;
			preventScroll?: boolean;
		} = $props();

	const policyContext = getContext<DialogPolicyContext | undefined>(DIALOG_POLICY_KEY);
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
		if (!onOpenAutoFocus) return undefined;
		return () => {
			const before = document.activeElement;
			const event = new Event("openAutoFocus", { cancelable: true });
			onOpenAutoFocus(event);
			if (event.defaultPrevented) {
				if (document.activeElement !== before && document.activeElement instanceof HTMLElement) {
					return document.activeElement;
				}
				return before instanceof HTMLElement ? before : null;
			}
			return (
				ref?.querySelector<HTMLElement>(
					'[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
				) ?? undefined
			);
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
			data-slot="dialog-overlay"
			data-open=""
			data-state="open"
			aria-hidden="true"
			class={`cn-dialog-overlay fixed inset-0 isolate z-50 ${overlayClass ?? ""}`}
		></div>
	{/if}
{:else}
	<DialogOverlay class={overlayClass} />
{/if}
<SdkContent
	initialFocus={resolvedInitialFocus}
	finalFocus={resolvedFinalFocus}
	keepMounted={resolvedKeepMounted}
	inline={resolvedInline}
	container={resolvedContainer}
	data-slot="dialog-content"
	data-appearance={appearance}
	class={cn(
		"cn-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none",
		appearance === "editor" && "cn-dialog-editor",
		appearance === "default" && showCloseButton && "[&>[data-slot=dialog-header]]:pe-5",
		className
	)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			{...refAttachment}
			data-slot="dialog-content"
			aria-labelledby={hasExplicitAriaLabel ? undefined : (props["aria-labelledby"] as string | undefined)}
			data-state={state.open ? "open" : "closed"}
			onkeydown={(event) => {
				(props.onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
				const nestedOverlay =
					event.target instanceof Element
						? event.target.closest(
								'[data-slot="dialog-content"],[data-slot="alert-dialog-content"],[data-slot="sheet-content"],[data-slot="popover-content"],[data-slot="dropdown-menu-content"],[data-slot="context-menu-content"],[data-slot="menubar-content"],[data-slot="select-content"],[data-slot="tooltip-content"],[data-slot="hover-card-content"]'
							)
						: null;
				if (
					event.key === "Escape" &&
					!event.defaultPrevented &&
					!event.isComposing &&
					(!nestedOverlay || nestedOverlay === event.currentTarget) &&
					policyContext?.isModal()
				) {
					policyContext.requestEscapeClose(event);
				}
			}}
		>
			{@render children?.()}
			{#if showCloseButton}
				<DialogClose>
					{#snippet child({ props: closeProps })}
						<Button variant="ghost" class="cn-dialog-close" size="icon-sm" {...closeProps}>
							<IconPlaceholder
								lucide="XIcon"
								tabler="IconX"
								hugeicons="Cancel01Icon"
								phosphor="XIcon"
								remixicon="RiCloseLine"
							/>
							<span class="sr-only">{closeLabel}</span>
						</Button>
					{/snippet}
				</DialogClose>
			{/if}
		</div>
	{/snippet}
</SdkContent>
