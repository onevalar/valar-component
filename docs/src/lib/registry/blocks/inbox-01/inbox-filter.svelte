<script lang="ts">
	import { tick } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { fields, type Filter, type FilterField } from "./data.js";
	import type { Snippet } from "svelte";

	let {
		initialField,
		triggerRef = $bindable(null),
		label,
		triggerClass,
		filters,
		options,
		labels,
		portal,
		chinese,
		onToggle,
		trigger: content,
	}: {
		initialField?: FilterField;
		triggerRef?: HTMLButtonElement | null;
		label: string;
		triggerClass: string;
		filters: Partial<Record<FilterField, Filter>>;
		options: Record<FilterField, readonly { id: string; label: string }[]>;
		labels: Record<FilterField, string>;
		portal: { to: string };
		chinese: boolean;
		onToggle: (field: FilterField, option: string) => void;
		trigger: Snippet;
	} = $props();
	let field = $state<FilterField>();
	let search = $state<HTMLInputElement | null>(null);
	const text = (zh: string, en: string) => (chinese ? zh : en);

	async function changeField(next?: FilterField) {
		field = next;
		await tick();
		search?.focus();
	}
</script>

<Popover.Root
	onOpenChange={(open) => {
		if (open) field = initialField;
	}}
>
	{#if initialField}
		<Popover.Trigger class={triggerClass} aria-label={label}>{@render content()}</Popover.Trigger>
	{:else}
		<Tooltip.Hint {label} keys={["F"]} {portal}>
			{#snippet trigger({ props })}
				<Popover.Trigger
					{...props}
					bind:ref={triggerRef}
					class={triggerClass}
					aria-label={label}
					aria-keyshortcuts="F"
				>
					{@render content()}
				</Popover.Trigger>
			{/snippet}
		</Tooltip.Hint>
	{/if}
	<Popover.Content
		appearance="surface"
		portalProps={portal}
		align="end"
		role="dialog"
		aria-label={text("筛选通知", "Filter notifications")}
		class="w-56 max-w-[calc(100vw-2rem)] gap-0 p-0"
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			search?.focus();
		}}
	>
		{#if field}
			<Button
				variant="ghost"
				size="sm"
				class="h-8 w-full justify-start rounded-b-none border-b border-border px-3 text-xs"
				onclick={() => changeField()}
			>
				<span aria-hidden="true">‹</span>{labels[field]}
			</Button>
		{/if}
		{#key field}
			<Command.Root class="rounded-xl bg-transparent">
				<Command.Input
					bind:ref={search}
					aria-label={text("搜索筛选项", "Search filters")}
					placeholder={field ? text("筛选…", "Filter…") : text("添加筛选…", "Add filter…")}
				/>
				<Command.List class="max-h-64">
					<Command.Empty>{text("没有匹配的选项", "No matching options")}</Command.Empty>
					<Command.Group>
						{#if field}
							{@const current = field}
							{#each options[current] as option (option.id)}
								{@const checked = filters[current]?.values.includes(option.id) ?? false}
								<Command.Item
									value={option.label}
									class="min-h-8 gap-2 rounded-md text-[13px]"
									onSelect={() => onToggle(current, option.id)}
								>
									<span
										class="grid size-3.5 place-items-center rounded-[3px] border border-border text-[10px] text-foreground"
										aria-hidden="true">{checked ? "✓" : ""}</span
									>
									{option.label}
									{#if checked}<span class="sr-only">{text("已勾选", "Checked")}</span>{/if}
								</Command.Item>
							{/each}
						{:else}
							{#each fields as item (item)}
								<Command.Item
									value={labels[item]}
									class="min-h-8 justify-between rounded-md text-[13px]"
									onSelect={() => changeField(item)}
								>
									{labels[item]} <span aria-hidden="true">›</span>
								</Command.Item>
							{/each}
						{/if}
					</Command.Group>
				</Command.List>
			</Command.Root>
		{/key}
	</Popover.Content>
</Popover.Root>
