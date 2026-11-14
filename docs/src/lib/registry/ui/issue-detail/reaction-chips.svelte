<script lang="ts">
	import { tick } from "svelte";
	import { emojiName } from "./reaction-emoji.js";
	import type { IssueReaction } from "./activity-model.js";

	let {
		reactions,
		chinese,
		viewerId,
		addButton,
		onReaction,
	}: {
		reactions: readonly IssueReaction[];
		chinese: boolean;
		viewerId: string;
		addButton: HTMLButtonElement | null;
		onReaction: (emoji: string, active: boolean) => void;
	} = $props();

	async function toggle(reaction: IssueReaction, active: boolean, event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		onReaction(reaction.emoji, !active);
		await tick();
		if (!button.isConnected) addButton?.focus();
	}
</script>

{#if reactions.length}
	<div
		role="group"
		aria-label={chinese ? "表情回应" : "Reactions"}
		class="flex flex-wrap items-center gap-1"
	>
		{#each reactions as reaction (reaction.emoji)}
			{@const active = reaction.users.some((user) => user.id === viewerId)}
			{@const title = reaction.users.map((user) => user.name).join(chinese ? "、" : ", ")}
			<button
				type="button"
				aria-pressed={active}
				aria-label={emojiName(reaction.emoji, chinese) + " " + reaction.users.length}
				{title}
				class="inline-flex h-6 min-w-9 items-center justify-center gap-1 rounded-full border border-(--activity-border,var(--border)) bg-(--detail-control) px-1.5 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-pressed:border-(--detail-accent)/55 aria-pressed:bg-(--detail-accent)/15 aria-pressed:text-foreground"
				onclick={(event) => toggle(reaction, active, event)}
			>
				<span aria-hidden="true" class="text-sm">{reaction.emoji}</span>{reaction.users.length}
			</button>
		{/each}
	</div>
{/if}
