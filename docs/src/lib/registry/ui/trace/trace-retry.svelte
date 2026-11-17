<script lang="ts" module>
	export type TraceRetryState = "idle" | "pending" | "success" | "error";
</script>

<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import type { ButtonProps } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import { cn } from "$lib/utils.js";
	import Action from "./trace-action.svelte";

	let {
		ref = $bindable(null),
		state: retryState = $bindable<TraceRetryState>("idle"),
		disabled = false,
		label,
		messages,
		onRetry,
		...restProps
	}: Omit<ButtonProps, "aria-disabled" | "children" | "href" | "loading" | "onclick" | "type"> & {
		state?: TraceRetryState;
		label: string;
		messages: Record<Exclude<TraceRetryState, "idle">, string>;
		onRetry: () => void | Promise<void>;
	} = $props();

	let inFlight = $state(false);
	const pending = $derived(inFlight || retryState === "pending");

	async function retry() {
		if (disabled || inFlight || retryState === "pending" || retryState === "success") return;
		inFlight = true;
		retryState = "pending";
		try {
			await onRetry();
			if (retryState === "pending") retryState = "success";
		} catch {
			if (retryState === "pending") retryState = "error";
		} finally {
			inFlight = false;
		}
	}
</script>

<span
	data-slot="trace-retry"
	data-state={retryState}
	class="flex min-w-0 flex-wrap items-center gap-2"
>
	<Action
		bind:ref
		{disabled}
		{...restProps}
		type="button"
		loading={pending}
		aria-disabled={retryState === "success" || undefined}
		onclick={retry}
	>
		{#if pending}
			<Spinner aria-hidden="true" data-icon="inline-start" class="size-3.5" />
		{:else}
			<IconPlaceholder
				lucide="RotateCwIcon"
				tabler="IconRotateClockwise"
				hugeicons="RefreshIcon"
				phosphor="ArrowClockwiseIcon"
				remixicon="RiRefreshLine"
				aria-hidden="true"
				data-icon="inline-start"
				class="size-3.5"
			/>
		{/if}
		{label}
	</Action>
	<span
		role="status"
		data-slot="trace-retry-feedback"
		class={cn(
			"min-w-0 text-xs/4 wrap-anywhere empty:sr-only",
			retryState === "error" ? "text-destructive" : "text-muted-foreground"
		)}
	>
		{retryState === "idle" ? "" : messages[retryState]}
	</span>
</span>
