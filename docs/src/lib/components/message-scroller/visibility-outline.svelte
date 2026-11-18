<script lang="ts">
	import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { getMessageText } from "$lib/ai-sdk.js";
	import {
		useMessageScroller,
		useMessageScrollerVisibility,
	} from "$lib/registry/ui/message-scroller/index.js";
	import type { UIMessage } from "ai";

	let { userMessages }: { userMessages: UIMessage[] } = $props();

	const { scrollToMessage } = useMessageScroller();
	const visibility = useMessageScrollerVisibility();

	function getTrimmedMessageText(message: UIMessage) {
		const text = getMessageText(message);

		return text.length > 42 ? `${text.slice(0, 39)}...` : text;
	}
</script>

<HoverCard.Root openDelay={0} closeDelay={0}>
	<HoverCard.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				type="button"
				aria-label="Open transcript outline"
				class="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring/50"
			>
				{#each userMessages as message (message.id)}
					<span
						data-current={message.id === visibility.currentAnchorId}
						class="h-0.5 w-4 rounded-full bg-muted-foreground/40 data-[current=true]:bg-foreground"
					></span>
				{/each}
			</button>
		{/snippet}
	</HoverCard.Trigger>
	<HoverCard.Content
		align="center"
		side="left"
		sideOffset={-28}
		class="flex w-64 flex-col gap-1 rounded-2xl p-1"
	>
		{#each userMessages as message (message.id)}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				shape="square"
				aria-current={visibility.currentAnchorId === message.id ? "location" : undefined}
				class="min-h-7 w-full justify-start rounded-xl px-2 py-1.5 text-left font-normal aria-current:bg-accent aria-current:text-accent-foreground"
				onclick={() =>
					scrollToMessage(message.id, {
						align: "start",
						behavior: "smooth",
					})}
			>
				<span class="line-clamp-1 min-w-0">{getTrimmedMessageText(message)}</span>
			</Button>
		{/each}
	</HoverCard.Content>
</HoverCard.Root>
