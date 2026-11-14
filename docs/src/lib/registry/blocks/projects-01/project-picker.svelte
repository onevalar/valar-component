<script lang="ts">
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import type { Option } from "./data.js";
	import type { Snippet } from "svelte";

	let {
		label,
		placeholder,
		empty,
		options,
		selected,
		onSelect,
		portal,
		children,
		multiple = false,
		disabled = false,
	}: {
		label: string;
		placeholder: string;
		empty: string;
		options: readonly Option[];
		selected: readonly string[];
		onSelect: (id: string) => void;
		portal: { to: string };
		children: Snippet;
		multiple?: boolean;
		disabled?: boolean;
	} = $props();

	let open = $state(false);
	let search = $state<HTMLInputElement | null>(null);
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		aria-label={label}
		{disabled}
		class="inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-border bg-(--project-control) px-2 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60 aria-expanded:bg-accent [&_svg]:size-3.5"
		>{@render children()}</Popover.Trigger
	>
	<Popover.Content
		appearance="surface"
		portalProps={portal}
		role="dialog"
		aria-label={label}
		align="start"
		sideOffset={5}
		class="w-[226px] max-w-[calc(100vw-24px)] gap-0 p-1.5"
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			search?.focus();
		}}
	>
		<Command.Root class="rounded-lg bg-transparent">
			<Command.Input bind:ref={search} {placeholder} aria-label={placeholder} />
			<Command.List class="max-h-52 overflow-auto">
				<Command.Empty>{empty}</Command.Empty>
				{#each options as option (option.id)}
					<Command.Item
						value={option.label}
						data-checked={selected.includes(option.id)}
						aria-current={selected.includes(option.id) ? "true" : undefined}
						class="min-h-8 text-[13px]"
						onSelect={() => {
							onSelect(option.id);
							if (!multiple) open = false;
						}}
					>
						{#if option.color}<span class="size-3 shrink-0 rounded-full border {option.color}"
							></span>{/if}
						{option.label}
						{#if option.detail}<span class="text-xs text-muted-foreground">{option.detail}</span
							>{/if}
					</Command.Item>
				{/each}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
