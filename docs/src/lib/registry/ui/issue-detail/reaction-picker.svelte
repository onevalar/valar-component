<script lang="ts">
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { emojiMatches, emojiName } from "./reaction-emoji.js";

	let {
		chinese,
		portal,
		label,
		trigger = $bindable(null),
		onSelect,
	}: {
		chinese: boolean;
		portal: { to: string };
		label: string;
		trigger?: HTMLButtonElement | null;
		onSelect: (emoji: string) => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	let open = $state(false);
	let query = $state("");
	let input = $state<HTMLInputElement | null>(null);
	let results = $state<HTMLDivElement>();
	const matches = $derived(emojiMatches(query));

	function pick(value: string) {
		onSelect(value);
		open = false;
	}

	function keydown(event: KeyboardEvent) {
		if (event.isComposing || event.altKey || event.metaKey || event.ctrlKey) return;
		const buttons = [...(results?.querySelectorAll("button") ?? [])];
		const index = buttons.indexOf(event.target as HTMLButtonElement);
		if (index < 0) {
			if (event.key === "Enter" && matches.length) {
				event.preventDefault();
				pick(matches[0]);
			} else if (event.key === "ArrowDown" && buttons.length) {
				event.preventDefault();
				buttons[0].focus();
			}
			return;
		}
		const movement: Record<string, number> = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -8,
			ArrowDown: 8,
		};
		const step = movement[event.key];
		if (!step) return;
		event.preventDefault();
		const next = index + step;
		if (event.key === "ArrowUp" && next < 0) input?.focus();
		else buttons[Math.min(Math.max(next, 0), buttons.length - 1)]?.focus();
	}
</script>

<Popover.Root
	bind:open
	onOpenChange={(value) => {
		if (value) query = "";
	}}
>
	<Popover.Trigger
		bind:ref={trigger}
		type="button"
		aria-label={label}
		title={label}
		class="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent"
	>
		<IconPlaceholder
			lucide="SmileIcon"
			tabler="IconMoodSmile"
			hugeicons="SmileIcon"
			phosphor="SmileyIcon"
			remixicon="RiEmotionLine"
			class="size-3.5"
			aria-hidden="true"
		/>
	</Popover.Trigger>
	<Popover.Content
		appearance="surface"
		portalProps={portal}
		role="dialog"
		aria-label={text("选择表情", "Choose emoji")}
		align="end"
		sideOffset={4}
		class="w-[272px] max-w-[calc(100vw-24px)] gap-0 p-0"
		onkeydown={keydown}
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			input?.focus();
		}}
	>
		<Input
			bind:ref={input}
			bind:value={query}
			type="search"
			aria-label={text("搜索表情", "Search emoji")}
			placeholder={text("搜索或粘贴表情…", "Search or paste emoji…")}
			class="h-9 rounded-b-none border-x-0 border-t-0 bg-transparent px-3 text-xs shadow-none focus-visible:border-border focus-visible:ring-0"
		/>
		<div class="max-h-60 overflow-auto px-2 pt-2 pb-2.5">
			{#if matches.length}
				<p class="px-1 pb-1 text-xs text-muted-foreground">
					{query.trim() ? text("搜索结果", "Search results") : text("常用表情", "Common emoji")}
				</p>
				<div bind:this={results} class="grid grid-cols-8">
					{#each matches as value (value)}
						<button
							type="button"
							class="grid aspect-square place-items-center rounded text-base hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
							aria-label={emojiName(value, chinese)}
							title={emojiName(value, chinese)}
							onclick={() => pick(value)}>{value}</button
						>
					{/each}
				</div>
			{:else}
				<p role="status" class="px-2 py-3 text-center text-xs text-muted-foreground">
					{text("没有匹配的表情", "No matching emoji")}
				</p>
			{/if}
		</div>
	</Popover.Content>
</Popover.Root>
