<script lang="ts" module>
	import type { Popover as PopoverPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	export type ComboboxOption = {
		id: string;
		label: string;
		group?: string;
		keywords?: readonly string[];
		disabled?: boolean;
	};

	export type ComboboxProps = {
		label: string;
		placeholder: string;
		options: readonly ComboboxOption[];
		value?: readonly string[];
		open?: boolean;
		query?: string;
		multiple?: boolean;
		disabled?: boolean;
		empty?: string;
		loading?: boolean;
		loadingLabel?: string;
		error?: string;
		filter?: boolean;
		onSelect?: (id: string) => void;
		triggerProps?: Omit<PopoverPrimitive.TriggerProps, "children" | "child" | "class" | "disabled">;
		contentClass?: string;
		class?: string;
		align?: PopoverPrimitive.ContentProps["align"];
		side?: PopoverPrimitive.ContentProps["side"];
		sideOffset?: number;
		portalProps?: Omit<PopoverPrimitive.PortalProps, "children" | "child">;
		children?: Snippet;
		option?: Snippet<[ComboboxOption]>;
		footer?: Snippet;
	};
</script>

<script lang="ts">
	import { computeCommandScore } from "bits-ui";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { buttonVariants } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let {
		label,
		placeholder,
		options,
		value = $bindable([]),
		open = $bindable(false),
		query = $bindable(""),
		multiple = false,
		disabled = false,
		empty = "没有匹配的选项",
		loading = false,
		loadingLabel = "正在加载…",
		error,
		filter = true,
		onSelect,
		triggerProps,
		contentClass,
		class: className,
		align = "start",
		side = "bottom",
		sideOffset = 4,
		portalProps,
		children,
		option,
		footer,
	}: ComboboxProps = $props();

	let search = $state<HTMLInputElement | null>(null);
	const selectedLabel = $derived(
		value.length
			? value.map((id) => options.find((item) => item.id === id)?.label ?? id).join(", ")
			: label
	);
	const triggerLabel = $derived(
		triggerProps?.["aria-label"] ??
			(children || !value.length ? label : `${label}: ${selectedLabel}`)
	);
	const groupedOptions = $derived.by(() => {
		const groups = new Map<string, ComboboxOption[]>();
		for (const item of options) {
			const key = item.group ?? "";
			const group = groups.get(key);
			if (group) group.push(item);
			else groups.set(key, [item]);
		}
		return groups;
	});

	$effect(() => {
		if (!open) query = "";
	});

	function choose(item: ComboboxOption) {
		value = multiple
			? value.includes(item.id)
				? value.filter((id) => id !== item.id)
				: [...value, item.id]
			: [item.id];
		onSelect?.(item.id);
		if (!multiple) open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger {disabled} {...triggerProps}>
		{#snippet child({ props })}
			<button
				{...props}
				data-slot="combobox-trigger"
				aria-label={triggerLabel}
				class={className ??
					cn(buttonVariants({ variant: "outline", size: "sm" }), "cn-combobox-button")}
			>
				{#if children}
					{@render children()}
				{:else}
					<span class="min-w-0 truncate">{selectedLabel}</span>
					<IconPlaceholder
						lucide="ChevronDownIcon"
						tabler="IconChevronDown"
						hugeicons="ArrowDown01Icon"
						phosphor="CaretDownIcon"
						remixicon="RiArrowDownSLine"
						aria-hidden="true"
					/>
				{/if}
			</button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		appearance="surface"
		data-slot="combobox-content"
		{portalProps}
		{align}
		{side}
		{sideOffset}
		role="dialog"
		aria-label={label}
		class={cn("cn-combobox-panel", contentClass)}
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			search?.focus({ preventScroll: true });
		}}
	>
		<Command.Root
			{label}
			class="cn-combobox-command"
			shouldFilter={filter}
			filter={(_value, term, [optionLabel = "", ...keywords] = []) =>
				computeCommandScore(optionLabel, term, keywords)}
			disableInitialScroll
		>
			<Command.Input
				bind:ref={search}
				bind:value={query}
				{placeholder}
				aria-label={placeholder}
				class="cn-combobox-search"
			/>
			<Command.List
				aria-label={label}
				aria-multiselectable={multiple ? true : undefined}
				aria-busy={loading || undefined}
				class="cn-combobox-results"
			>
				{#if !loading && !error}
					<Command.Empty class="cn-combobox-message" role="status">{empty}</Command.Empty>
					{#each groupedOptions as [name, items] (name)}
						{#if name}
							<Command.Group heading={name} class="p-0">
								{#each items as item (item.id)}
									{@render renderOption(item)}
								{/each}
							</Command.Group>
						{:else}
							{#each items as item (item.id)}
								{@render renderOption(item)}
							{/each}
						{/if}
					{/each}
				{/if}
			</Command.List>
			{#if loading}
				<p class="cn-combobox-message" role="status">{loadingLabel}</p>
			{:else if error}
				<p class="cn-combobox-message" role="alert">{error}</p>
			{/if}
			{#if footer}
				<div class="cn-combobox-footer">{@render footer()}</div>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#snippet renderOption(item: ComboboxOption)}
	{@const selected = value.includes(item.id)}
	<Command.Item
		value={`option:${item.id}`}
		keywords={[item.label, ...(item.keywords ?? [])]}
		disabled={item.disabled}
		onSelect={() => choose(item)}
		class="cn-combobox-option"
	>
		{#snippet child({ props })}
			<div {...props} aria-selected={selected} data-checked={selected}>
				{#if option}
					{@render option(item)}
				{:else}
					<span class="min-w-0 flex-1 wrap-anywhere">{item.label}</span>
				{/if}
				{#if selected}
					<IconPlaceholder
						lucide="CheckIcon"
						tabler="IconCheck"
						hugeicons="Tick02Icon"
						phosphor="CheckIcon"
						remixicon="RiCheckLine"
						aria-hidden="true"
						class="cn-combobox-check"
					/>
				{:else}
					<span aria-hidden="true" class="cn-combobox-check"></span>
				{/if}
			</div>
		{/snippet}
	</Command.Item>
{/snippet}
