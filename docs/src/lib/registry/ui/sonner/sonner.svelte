<script lang="ts">
	import { mode } from "mode-watcher";
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
	toastOptions={{
		classes: {
			toast: "cn-toast cn-sonner-layout",
		},
	}}
	{...restProps}
>
	{#snippet loadingIcon()}
		<IconPlaceholder
			lucide="Loader2Icon"
			tabler="IconLoader"
			hugeicons="Loading03Icon"
			phosphor="SpinnerIcon"
			remixicon="RiLoaderLine"
			class="size-4 animate-spin"
		/>
	{/snippet}
	{#snippet successIcon()}
		<IconPlaceholder
			lucide="CircleCheckIcon"
			tabler="IconCircleCheck"
			hugeicons="CheckmarkCircle02Icon"
			phosphor="CheckCircleIcon"
			remixicon="RiCheckboxCircleLine"
			class="size-4"
		/>
	{/snippet}
	{#snippet errorIcon()}
		<IconPlaceholder
			lucide="OctagonXIcon"
			tabler="IconAlertOctagon"
			hugeicons="MultiplicationSignCircleIcon"
			phosphor="XCircleIcon"
			remixicon="RiErrorWarningLine"
			class="size-4"
		/>
	{/snippet}
	{#snippet infoIcon()}
		<IconPlaceholder
			lucide="InfoIcon"
			tabler="IconInfoCircle"
			hugeicons="InformationCircleIcon"
			phosphor="InfoIcon"
			remixicon="RiInformationLine"
			class="size-4"
		/>
	{/snippet}
	{#snippet warningIcon()}
		<IconPlaceholder
			lucide="TriangleAlertIcon"
			tabler="IconAlertTriangle"
			hugeicons="Alert02Icon"
			phosphor="WarningIcon"
			remixicon="RiCloseCircleLine"
			class="size-4"
		/>
	{/snippet}
</Sonner>

<style>
	/* Unlayered, like Sonner's own defaults. Custom/unstyled and caller inline styles win. */
	:global(.cn-toast[data-sonner-toast][data-styled="true"]) {
		padding-inline: var(--valar-toast-padding-x, 16px);
		padding-block: var(--valar-toast-padding-y, 16px);
		gap: var(--valar-toast-gap, 6px);
	}
</style>
