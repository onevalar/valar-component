<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	export type ConfirmActionState = "idle" | "confirming" | "pending" | "done" | "error";
	export type ConfirmActionMode = "press" | "hold" | "countdown";
	export type ConfirmActionProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		label: string;
		icon?: Snippet;
		prompt?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		pendingLabel?: string;
		doneLabel?: string;
		errorLabel?: string;
		retryLabel?: string;
		undoLabel?: string;
		undoingLabel?: string;
		cancelledLabel?: string;
		undoneLabel?: string;
		holdLabel?: string;
		tone?: "danger" | "neutral";
		confirmMode?: ConfirmActionMode;
		holdDuration?: number;
		countdown?: number;
		countdownLabel?: string;
		onConfirm?: () => void | Promise<unknown>;
		onUndo?: () => void | Promise<unknown>;
		onCancel?: () => void;
		state?: ConfirmActionState;
		defaultState?: ConfirmActionState;
		onStateChange?: (state: ConfirmActionState) => void;
		confirmTimeout?: number;
		resultTimeout?: number;
		cancelOnOutsidePress?: boolean;
		disabled?: boolean;
		fullWidth?: boolean;
		ref?: HTMLDivElement | null;
	};
</script>

<script lang="ts">
	import { onDestroy, onMount, tick, untrack } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import { cn } from "$lib/utils.js";
	import { createConfirmMorph } from "./morph.js";
	let {
		label,
		icon,
		prompt,
		confirmLabel = "Delete",
		cancelLabel = "Cancel",
		pendingLabel = "Deleting",
		doneLabel = "Deleted",
		errorLabel = "Couldn’t finish",
		retryLabel = "Retry",
		undoLabel = "Undo",
		undoingLabel = "Restoring",
		cancelledLabel = "Cancelled",
		undoneLabel = "Undone",
		holdLabel = "Press and hold",
		tone = "danger",
		confirmMode = "press",
		holdDuration = 1000,
		countdown = 3,
		countdownLabel,
		onConfirm,
		onUndo,
		onCancel,
		state: controlledState,
		defaultState = "idle",
		onStateChange,
		confirmTimeout = 6000,
		resultTimeout = 5000,
		cancelOnOutsidePress = true,
		disabled = false,
		fullWidth = false,
		ref = $bindable(null),
		class: className,
		onkeydown,
		onfocusin,
		onfocusout,
		onpointerenter,
		onpointerleave,
		...rest
	}: ConfirmActionProps = $props();
	let inner = $state<ConfirmActionState>(untrack(() => defaultState));
	const currentState = $derived(controlledState ?? inner);
	const uid = $props.id();
	let announcement = $state("");
	let working = $state<"confirm" | "undo">("confirm");
	let busy = false;
	let run = 0;
	let destroyed = false;
	let askedAt = 0;
	let hovered = $state(false);
	let focused = $state(false);
	let hidden = $state(false);
	let remaining = 0;
	let holding = $state(false);
	let holdTimer: ReturnType<typeof setTimeout> | undefined;
	let counting = $state(false);
	let seconds = $state(0);
	const face = $derived(currentState === "confirming" && counting ? "counting" : currentState);
	let content: HTMLDivElement;
	let morph: ReturnType<typeof createConfirmMorph> | undefined;
	onMount(() => {
		morph = createConfirmMorph(ref!, content);
		return () => morph?.destroy();
	});
	$effect.pre(() => {
		face;
		const controller = morph;
		const from = controller?.snapshot();
		void tick().then(() => {
			if (!destroyed) controller?.play(from);
		});
	});

	function stopHold() {
		clearTimeout(holdTimer);
		holding = false;
	}
	async function go(next: ConfirmActionState) {
		if (destroyed || currentState === next) return;
		const moveFocus =
			ref?.contains(document.activeElement) || document.activeElement === document.body;
		if (next === "confirming") askedAt = performance.now();
		if (next !== "confirming") {
			counting = false;
			stopHold();
		}
		expected = next;
		if (controlledState === undefined) inner = next;
		onStateChange?.(next);
		await tick();
		if (!destroyed && moveFocus)
			(ref?.querySelector<HTMLElement>("[data-autofocus]:not(:disabled)") ?? ref)?.focus({
				preventScroll: true,
			});
	}
	function cancel() {
		if (disabled || busy) return;
		run++;
		counting = false;
		stopHold();
		onCancel?.();
		announcement = cancelledLabel;
		void go("idle");
	}
	async function perform(kind: "confirm" | "undo") {
		if (disabled || busy || destroyed) return;
		busy = true;
		const token = ++run;
		working = kind;
		counting = false;
		stopHold();
		try {
			const result = (kind === "confirm" ? onConfirm : onUndo)?.();
			if (result && typeof result.then === "function") {
				announcement = kind === "confirm" ? pendingLabel : undoingLabel;
				void go("pending");
				await result;
			}
			if (destroyed || token !== run) return;
			announcement = kind === "undo" ? undoneLabel : doneLabel;
			void go(kind === "undo" ? "idle" : "done");
		} catch {
			if (destroyed || token !== run) return;
			announcement = errorLabel;
			void go("error");
		} finally {
			if (token === run) busy = false;
		}
	}
	function answer() {
		if (disabled || busy || currentState !== "confirming" || performance.now() - askedAt < 280)
			return;
		if (confirmMode === "countdown") {
			seconds = Math.max(1, Math.ceil(countdown));
			counting = true;
		} else void perform("confirm");
	}
	function startHold() {
		if (disabled || busy || holding || performance.now() - askedAt < 280) return;
		holding = true;
		holdTimer = setTimeout(
			() => {
				holding = false;
				void perform("confirm");
			},
			Math.max(0, holdDuration)
		);
	}
	function key(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || disabled) return;
		if (event.key === "Escape") {
			if (currentState === "confirming") {
				event.preventDefault();
				event.stopPropagation();
				cancel();
			} else if (currentState === "done" || currentState === "error") {
				event.preventDefault();
				run++;
				void go("idle");
			}
		}
	}

	// External state changes invalidate work, except transitions requested by this component.
	let expected: ConfirmActionState | undefined;
	$effect(() => {
		const observed = controlledState;
		if (observed !== undefined && observed !== expected) {
			run++;
			busy = false;
			counting = false;
			stopHold();
		}
		expected = observed;
	});
	$effect(() => {
		const current = currentState;
		remaining =
			current === "confirming"
				? confirmTimeout
				: current === "done" || current === "error"
					? resultTimeout
					: 0;
	});
	$effect(() => {
		const current = currentState;
		if (remaining <= 0 || hovered || focused || hidden || counting || disabled) return;
		const start = performance.now();
		const timer = setTimeout(() => {
			remaining = 0;
			if (current === "confirming") cancel();
			else {
				run++;
				void go("idle");
			}
		}, remaining);
		return () => {
			clearTimeout(timer);
			remaining = Math.max(0, remaining - (performance.now() - start));
		};
	});
	$effect(() => {
		if (!counting || currentState !== "confirming" || disabled) return;
		const timer = setInterval(() => {
			if (seconds <= 1) void perform("confirm");
			else seconds--;
		}, 1000);
		return () => clearInterval(timer);
	});
	$effect(() => {
		if (disabled || currentState !== "confirming") {
			stopHold();
			counting = false;
		}
	});
	$effect(() => {
		function visibility() {
			hidden = document.hidden;
		}
		visibility();
		document.addEventListener("visibilitychange", visibility);
		return () => document.removeEventListener("visibilitychange", visibility);
	});
	onDestroy(() => {
		destroyed = true;
		run++;
		busy = false;
		stopHold();
	});
</script>

<svelte:document
	onpointerdown={(event) => {
		if (
			currentState === "confirming" &&
			cancelOnOutsidePress &&
			!ref?.contains(event.target as Node)
		)
			cancel();
	}}
/>

<div
	bind:this={ref}
	data-slot="confirm-action"
	data-state={currentState}
	data-face={face}
	data-tone={tone}
	data-disabled={disabled || undefined}
	tabindex="-1"
	role="group"
	aria-label={label}
	aria-busy={currentState === "pending"}
	class={cn(
		"relative inline-flex min-w-0 items-center justify-center border bg-background p-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
		face === "confirming" || face === "counting" || face === "error"
			? "rounded-xl"
			: "rounded-full",
		fullWidth && "flex w-full justify-center",
		fullWidth && face === "idle" && "border-0 p-0",
		className
	)}
	{...rest}
	onkeydown={key}
	onfocusin={(event) => {
		focused = true;
		onfocusin?.(event);
	}}
	onfocusout={(event) => {
		if (!ref?.contains(event.relatedTarget as Node)) focused = false;
		onfocusout?.(event);
	}}
	onpointerenter={(event) => {
		hovered = true;
		onpointerenter?.(event);
	}}
	onpointerleave={(event) => {
		hovered = false;
		onpointerleave?.(event);
	}}
>
	<div
		bind:this={content}
		data-slot="confirm-action-content"
		class={cn(
			"inline-flex min-w-0 flex-wrap items-center justify-center gap-2",
			fullWidth && "w-full"
		)}
	>
		{#if face === "idle"}
			<Button
				variant="ghost"
				size="sm"
				class={fullWidth ? "min-h-11 w-full" : undefined}
				{disabled}
				data-autofocus
				onclick={() => {
					announcement = prompt ?? `${label}?`;
					void go("confirming");
				}}
			>
				{@render icon?.()}{label}
			</Button>
		{:else if face === "confirming"}
			<span id={`${uid}-prompt`} class="px-2">{prompt ?? `${label}?`}</span>
			<Button variant="ghost" size="sm" {disabled} onclick={cancel}>{cancelLabel}</Button>
			<Button
				variant={tone === "danger" ? "destructive" : "default"}
				size="sm"
				{disabled}
				data-autofocus
				aria-describedby={confirmMode === "hold" ? `${uid}-hold` : `${uid}-prompt`}
				data-holding={holding || undefined}
				onclick={() => {
					if (confirmMode !== "hold") answer();
				}}
				onpointerdown={(event) => {
					if (confirmMode === "hold" && event.button === 0) {
						event.currentTarget.setPointerCapture?.(event.pointerId);
						startHold();
					}
				}}
				onpointerup={stopHold}
				onpointercancel={stopHold}
				onlostpointercapture={stopHold}
				onblur={stopHold}
				onkeydown={(event) => {
					if (event.repeat) event.preventDefault();
					if (confirmMode === "hold" && [" ", "Enter"].includes(event.key)) {
						event.preventDefault();
						if (!event.repeat) startHold();
					}
				}}
				onkeyup={(event) => {
					if (confirmMode === "hold" && [" ", "Enter"].includes(event.key)) {
						event.preventDefault();
						stopHold();
					}
				}}
			>
				{confirmLabel}
			</Button>
			{#if confirmMode === "hold"}<span id={`${uid}-hold`} class="sr-only">{holdLabel}</span>{/if}
		{:else if face === "counting"}
			<span class="px-2">{countdownLabel ?? pendingLabel} {seconds}</span>
			<Button variant="ghost" size="sm" {disabled} data-autofocus onclick={cancel}
				>{cancelLabel}</Button
			>
		{:else if face === "pending"}
			<span class="inline-flex items-center gap-2 px-2 py-1">
				<Spinner aria-hidden="true" role="presentation" class="motion-reduce:animate-none" />
				{working === "undo" ? undoingLabel : pendingLabel}
			</span>
		{:else if face === "done"}
			<span class="px-2">{doneLabel}</span>
			{#if onUndo}<Button
					variant="ghost"
					size="sm"
					{disabled}
					data-autofocus
					onclick={() => perform("undo")}>{undoLabel}</Button
				>{/if}
		{:else}
			<span class="px-2 text-destructive">{errorLabel}</span>
			<Button variant="ghost" size="sm" {disabled} data-autofocus onclick={() => perform(working)}
				>{retryLabel}</Button
			>
		{/if}
	</div>
	<span role="status" aria-live="polite" class="sr-only">{announcement}</span>
</div>
