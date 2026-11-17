<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLSelectAttributes } from "svelte/elements";

	type NativeSelectProps = Omit<WithElementRef<HTMLSelectAttributes, HTMLSelectElement>, "size"> & {
		size?: "sm" | "default";
		appearance?: "default" | "contact";
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size = "default",
		appearance = "default",
		dir,
		children,
		...restProps
	}: NativeSelectProps = $props();

	const contactSelect = cn(
		"h-10 w-full min-w-0 appearance-none rounded-[8px] border ps-2.5 pe-8 text-base/6 font-normal outline-none min-[641px]:text-sm/[21px]",
		"border-[lch(91.9%_0_282)] bg-[lch(96.5%_0_282)] text-[color:lch(19.588%_1.25_282)] scheme-light dark:border-white/5 dark:bg-white/5 dark:text-[#f7f8f8] dark:scheme-dark",
		"focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-[#5e69d1] aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive disabled:pointer-events-none"
	);
</script>

<div
	class={cn(
		"cn-native-select-wrapper group/native-select relative has-[select:disabled]:opacity-50",
		appearance === "contact" ? "w-full min-w-0" : "w-fit",
		className
	)}
	data-slot="native-select-wrapper"
	data-appearance={appearance}
	data-size={size}
	{dir}
>
	<select
		bind:value
		bind:this={ref}
		data-slot="native-select"
		data-appearance={appearance}
		data-size={size}
		class={appearance === "contact"
			? contactSelect
			: "cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed"}
		{dir}
		{...restProps}
	>
		{@render children?.()}
	</select>
	{#if appearance === "contact"}
		<IconPlaceholder
			lucide="ChevronsUpDownIcon"
			tabler="IconSelector"
			hugeicons="UnfoldMoreIcon"
			phosphor="CaretUpDownIcon"
			remixicon="RiExpandUpDownLine"
			class="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-[color:lch(40%_1_282)] select-none dark:text-[#9c9da1]"
			aria-hidden
			data-slot="native-select-icon"
		/>
	{:else}
		<IconPlaceholder
			lucide="ChevronDownIcon"
			tabler="IconSelector"
			hugeicons="UnfoldMoreIcon"
			phosphor="CaretDownIcon"
			remixicon="RiArrowDownSLine"
			class="cn-native-select-icon pointer-events-none absolute select-none"
			aria-hidden
			data-slot="native-select-icon"
		/>
	{/if}
</div>
