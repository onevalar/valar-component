<script lang="ts">
	import { tick } from "svelte";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
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
	<Bubble.Reactions
		appearance="comment"
		role="group"
		aria-label={chinese ? "表情回应" : "Reactions"}
	>
		{#each reactions as reaction (reaction.emoji)}
			{@const active = reaction.users.some((user) => user.id === viewerId)}
			{@const title = reaction.users.map((user) => user.name).join(chinese ? "、" : ", ")}
			<Bubble.Reaction
				pressed={active}
				aria-label={emojiName(reaction.emoji, chinese) + " " + reaction.users.length}
				{title}
				onclick={(event) => toggle(reaction, active, event)}
			>
				<span aria-hidden="true" class="text-sm">{reaction.emoji}</span>{reaction.users.length}
			</Bubble.Reaction>
		{/each}
	</Bubble.Reactions>
{/if}
