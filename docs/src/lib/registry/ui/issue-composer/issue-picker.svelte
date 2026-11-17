<script lang="ts">
	import { computeCommandScore } from "bits-ui";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import { cn } from "$lib/utils.js";
	import type { IssueComposerOption } from "./issue-options.js";
	import type { Snippet } from "svelte";

	let {
		label,
		display,
		placeholder,
		options,
		selected,
		portal,
		onSelect,
		chinese,
		multiple = false,
		disabled = false,
		quickStart,
		class: className,
		children,
		glyph,
	}: {
		label: string;
		display: string;
		placeholder: string;
		options: readonly IssueComposerOption[];
		selected: readonly string[];
		portal: { to: string };
		onSelect: (id: string) => void;
		chinese: boolean;
		multiple?: boolean;
		disabled?: boolean;
		quickStart?: 0 | 1;
		class?: string;
		children?: Snippet;
		glyph?: Snippet<[IssueComposerOption]>;
	} = $props();

	let open = $state(false);
	let input = $state<HTMLInputElement | null>(null);
	const suggestions = $derived(multiple ? options.filter(({ id }) => selected.includes(id)) : []);
	const remaining = $derived(
		multiple ? options.filter(({ id }) => !selected.includes(id)) : options
	);

	function choose(id: string) {
		onSelect(id);
		if (!multiple) open = false;
	}

	function handleShortcut(event: KeyboardEvent) {
		if (
			quickStart === undefined ||
			input?.value ||
			event.isComposing ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			!/^\d$/.test(event.key)
		)
			return;
		const option = options[Number(event.key) - quickStart];
		if (option) {
			event.preventDefault();
			choose(option.id);
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		{disabled}
		aria-label={`${label} · ${display}`}
		class={cn(
			"inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-(--composer-chip) ps-1.5 pe-2 text-xs leading-none font-medium text-muted-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring enabled:hover:bg-accent enabled:hover:text-foreground disabled:cursor-default aria-expanded:bg-accent [&_svg]:size-3.5 [&_svg]:shrink-0",
			className
		)}
	>
		{@render children?.()}
		<span class="min-w-0 truncate">{display}</span>
	</Popover.Trigger>
	<Popover.Content
		appearance="surface"
		portalProps={portal}
		align="start"
		role="dialog"
		aria-label={label}
		class="w-[204px] max-w-[calc(100vw-16px)] gap-0 p-0"
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			input?.focus({ preventScroll: true });
		}}
	>
		<Command.Root
			class="rounded-[inherit] bg-transparent"
			disableInitialScroll
			filter={(_value, term, keywords) => computeCommandScore(keywords?.[0] ?? "", term)}
		>
			<Command.Input
				bind:ref={input}
				aria-label={placeholder}
				{placeholder}
				onkeydown={handleShortcut}
			/>
			<ScrollArea.Root type="hover" class="max-h-48 *:data-[slot=scroll-area-viewport]:max-h-48">
				<Command.List
					aria-multiselectable={multiple || undefined}
					class="max-h-none overflow-clip p-1"
				>
					<Command.Empty class="py-3 text-xs text-muted-foreground"
						>{chinese ? "没有匹配的选项" : "No matching options"}</Command.Empty
					>
					{#if suggestions.length}
						<Command.Group heading={chinese ? "建议" : "Suggestions"} class="p-0">
							{#each suggestions as option (option.id)}
								{@render row(option)}
							{/each}
						</Command.Group>
					{/if}
					{#each remaining as option (option.id)}
						{@render row(option)}
					{/each}
				</Command.List>
			</ScrollArea.Root>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#snippet row(option: IssueComposerOption)}
	{@const checked = selected.includes(option.id)}
	<Command.Item
		value={`option:${option.id}`}
		keywords={[option.label]}
		data-checked={checked && !multiple}
		aria-checked={multiple ? checked : undefined}
		aria-current={!multiple && checked ? "true" : undefined}
		class="min-h-8 gap-2 rounded-[7px]! py-0 ps-2.5 pe-3.5 text-[13px] font-[450]"
		onSelect={() => choose(option.id)}
	>
		{#if multiple}
			<span
				aria-hidden="true"
				class="grid size-3.5 shrink-0 place-items-center rounded-[3px] border border-border text-[10px] leading-none data-[checked=true]:border-transparent data-[checked=true]:bg-(--composer-accent) data-[checked=true]:text-white"
				data-checked={checked}>{checked ? "✓" : ""}</span
			>
		{/if}
		{@render glyph?.(option)}
		<span class="min-w-0 flex-1 wrap-anywhere">{option.label}</span>
		{#if quickStart !== undefined && !checked}
			<Command.Shortcut>{options.indexOf(option) + quickStart}</Command.Shortcut>
		{/if}
	</Command.Item>
{/snippet}
