<script lang="ts">
	import { mode } from "mode-watcher";
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

	let { appearance = "default", ...restProps }: SonnerProps & {
		appearance?: "default" | "workspace";
	} = $props();

	const workspace = $derived(appearance === "workspace");
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	data-valar-appearance={workspace ? "workspace" : undefined}
	offset={workspace ? { right: 24, left: 24, bottom: 52 } : undefined}
	mobileOffset={workspace ? { right: 16, left: 16, bottom: 24 } : undefined}
	closeButton={workspace}
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
		{#if workspace}
			<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM8 4a.875.875 0 1 0 0 1.75A.875.875 0 0 0 8 4ZM7.25 7h1.5v5h-1.5V7Z"
				/>
			</svg>
		{:else}
			<IconPlaceholder
				lucide="InfoIcon"
				tabler="IconInfoCircle"
				hugeicons="InformationCircleIcon"
				phosphor="InfoIcon"
				remixicon="RiInformationLine"
				class="size-4"
			/>
		{/if}
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
	/* Sonner adds its own outer focus shadows to the toast and its actions. */
	:global([data-sonner-toaster] [data-sonner-toast]:focus-visible),
	:global([data-sonner-toaster] [data-sonner-toast][data-styled="true"] [data-close-button]:focus-visible) {
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.1), inset 0 0 0 1px var(--ring);
	}
	:global([data-sonner-toaster] [data-sonner-toast][data-styled="true"] [data-button]:focus-visible) {
		box-shadow: inset 0 0 0 1px var(--ring);
	}

	:global {
		[data-sonner-toaster][data-valar-appearance="workspace"] {
			width: 384px;
			font-family: inherit;
			--valar-workspace-toast-bg: lch(100% 0 282);
			--valar-workspace-toast-text: lch(10% 0 282);
			--valar-workspace-toast-secondary: lch(40% 1 282);
			--valar-workspace-toast-shadow:
				0 0 0 0.5px rgb(0 0 0 / 0.088),
				0 6px 18px rgb(0 0 0 / 0.02),
				0 3px 9px rgb(0 0 0 / 0.04),
				0 1px 1px rgb(0 0 0 / 0.04);

			&[data-sonner-theme="dark"] {
				--valar-workspace-toast-bg: lch(12.72% 0.85 272);
				--valar-workspace-toast-text: lch(100% 0 272);
				--valar-workspace-toast-secondary: lch(64.714% 1.425 272);
				--valar-workspace-toast-shadow:
					0 0 0 0.5px rgb(255 255 255 / 0.148),
					0 3px 8px rgb(0 0 0 / 0.125),
					0 2px 5px rgb(0 0 0 / 0.125),
					0 1px 1px rgb(0 0 0 / 0.125);
			}

			.cn-toast[data-sonner-toast][data-styled="true"] {
				width: 100%;
				min-height: 41px;
				padding: 12px;
				gap: 8px;
				border-width: 0.5px;
				border-radius: 12px;
				box-shadow: var(--valar-workspace-toast-shadow);

				&[data-rich-colors="false"] {
					background: var(--valar-workspace-toast-bg);
					color: var(--valar-workspace-toast-text);
					border: 0;

					[data-description],
					[data-icon] {
						color: var(--valar-workspace-toast-secondary);
					}
				}

				&:focus-visible {
					outline: 1px solid var(--ring);
					outline-offset: -1px;
				}

				:is([data-title], [data-description]) {
					line-height: 16px;
				}

				[data-description] {
					font-weight: 450;
				}

				[data-icon],
				[data-icon] svg {
					width: 16px;
					height: 16px;
					margin: 0;
				}

				[data-close-button] {
					position: static;
					order: 1;
					flex: none;
					width: 24px;
					height: 24px;
					margin-block: -4px;
					transform: none;
					border: 0;
					background: transparent;
					color: var(--valar-workspace-toast-secondary);
					transition: color 150ms;

					&:hover {
						background: transparent;
						color: var(--valar-workspace-toast-text);
					}

					&:focus-visible {
						box-shadow: inset 0 0 0 1px var(--ring);
					}

					svg {
						width: 12px;
						height: 12px;
					}
				}
			}

			@media (max-width: 600px) {
				&[data-x-position] {
					left: var(--mobile-offset-left);
					right: var(--mobile-offset-right);
					width: auto;
				}
			}
		}
	}
</style>
