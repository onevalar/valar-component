<script lang="ts" module>
	export type Side = "top" | "right" | "bottom" | "left";
</script>

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
	import SheetClose from "./sheet-close.svelte";
	import SheetOverlay from "./sheet-overlay.svelte";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import {
		SHEET_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		toStyleString,
		type SheetDismissPolicy,
		type SheetPolicyContext,
	} from "./context.js";

	export type SheetPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		style,
		side = "right",
		appearance = "default",
		closeLabel = "关闭",
		showCloseButton = true,
		portalProps,
		container: containerProp,
		inline: inlineProp,
		forceMount = false,
		keepMounted,
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
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		SheetDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			portalProps?: SheetPortalProps;
			container?: Element | DocumentFragment | null;
			inline?: boolean;
			forceMount?: boolean;
			keepMounted?: boolean;
			side?: Side;
			appearance?: "default" | "details";
			showCloseButton?: boolean;
			/** Screen reader text of the close button. */
			closeLabel?: string;
			initialFocus?: DialogInitialFocus;
			finalFocus?: DialogFinalFocus;
			onOpenAutoFocus?: (event: Event) => void;
			onCloseAutoFocus?: (event: Event) => void;
			preventScroll?: boolean;
			children?: Snippet;
		} = $props();

	const policyContext = getContext<SheetPolicyContext | undefined>(SHEET_POLICY_KEY);
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
			return undefined;
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

	function trapSheetTab(event: KeyboardEvent) {
		if (event.key !== "Tab" || event.defaultPrevented || !policyContext?.isModal()) return;
		const el = event.currentTarget;
		if (!(el instanceof HTMLElement)) return;
		const tabbables = Array.from(
			el.querySelectorAll<HTMLElement>(
				'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
			)
		).filter((node) => node.getClientRects().length > 0);
		if (!tabbables.length) return;
		const first = tabbables[0];
		const last = tabbables[tabbables.length - 1];
		const active = el.ownerDocument.activeElement;
		if (event.shiftKey && (active === first || active === el || !el.contains(active))) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && (active === last || !el.contains(active))) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

{#if resolvedInline && trapFocus === false}
	{#if policyContext?.isOpen()}
		<div
			data-slot="sheet-overlay"
			data-open=""
			data-state="open"
			aria-hidden="true"
			class={`cn-sheet-overlay fixed inset-0 z-50 duration-100 motion-reduce:animate-none! data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 ${appearance === "details" ? "cn-sheet-details-overlay" : ""}`}
		></div>
	{/if}
{:else}
	<SheetOverlay class={appearance === "details" ? "cn-sheet-details-overlay" : undefined} />
{/if}
<SdkContent
	initialFocus={resolvedInitialFocus}
	finalFocus={resolvedFinalFocus}
	keepMounted={resolvedKeepMounted}
	inline={resolvedInline}
	container={resolvedContainer}
	data-slot="sheet-content"
	data-side={side}
	data-appearance={appearance}
	class={cn(
		"cn-sheet-content motion-reduce:animate-none! motion-reduce:transition-none data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
		appearance === "details" && "cn-sheet-details",
		className
	)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			{...refAttachment}
			data-slot="sheet-content"
			aria-labelledby={hasExplicitAriaLabel ? undefined : (props["aria-labelledby"] as string | undefined)}
			data-state={state.open ? "open" : "closed"}
			onkeydown={(event) => {
				(props.onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
				trapSheetTab(event);
			}}
		>
			{@render children?.()}
			{#if showCloseButton}
				<SheetClose>
					{#snippet child({ props: closeProps })}
						<Button variant="ghost" class="cn-sheet-close" size="icon-sm" {...closeProps}>
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
				</SheetClose>
			{/if}
		</div>
	{/snippet}
</SdkContent>
