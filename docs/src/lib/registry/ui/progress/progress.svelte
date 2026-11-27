<script lang="ts">
	import {
		Progress as SdkProgress,
		ProgressIndicator,
		ProgressValue,
	} from "@ui-sdk/svelte/progress";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		min = 0,
		max = 100,
		value = 0,
		style,
		...restProps
	}: WithoutChildren<WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "style">>> & {
		appearance?: "default" | "project";
		min?: number;
		max?: number;
		value?: number | null;
		style?: string | null | Parameters<typeof styleToString>[0];
	} = $props();

	const projectClass = $derived(appearance === "project" && "cn-progress-project");
	const lower = $derived(Number.isFinite(min) ? min : 0);
	const upper = $derived(Math.max(lower, Number.isFinite(max) ? max : 100));
	const currentValue = $derived(
		value === null ? null : Math.min(upper, Math.max(lower, Number.isNaN(value) ? lower : value))
	);
	const refProps = {
		[createAttachmentKey()]: (element: HTMLDivElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
</script>

<SdkProgress
	{...refProps}
	data-slot="progress"
	data-progress-root=""
	data-state={currentValue === null
		? "indeterminate"
		: currentValue === upper
			? "loaded"
			: "loading"}
	data-min={lower}
	data-max={upper}
	data-value={currentValue ?? undefined}
	data-appearance={appearance === "project" ? "project" : undefined}
	class={cn(
		"cn-progress relative flex w-full items-center overflow-x-hidden",
		projectClass,
		className
	)}
	value={currentValue}
	min={lower}
	max={upper}
	getValueLabel={upper === lower && currentValue !== null ? () => "0%" : undefined}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps}
>
	{#if appearance === "project"}
		<ProgressValue aria-hidden="true"
			>{#snippet children({ percent })}{percent === null
					? "—"
					: `${upper === lower ? 0 : Math.round(percent)}%`}{/snippet}</ProgressValue
		>
	{:else}
		<ProgressIndicator
			data-slot="progress-indicator"
			class={cn(
				"cn-progress-indicator h-full shrink-0 rounded-[inherit] transition-[width] duration-150 data-indeterminate:mx-auto motion-safe:data-indeterminate:animate-pulse motion-reduce:transition-none",
				upper === lower && currentValue !== null && "w-0!"
			)}
			style={currentValue === null ? "width:35%" : undefined}
		/>
	{/if}
</SdkProgress>
