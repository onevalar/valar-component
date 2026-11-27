<script setup lang="ts">
import { watch } from "vue";
import { emojiName } from "./reaction-emoji.js";
import { Button } from "../button";
import type { IssueReaction } from "./activity-model.js";

const props = defineProps<{
	reactions: readonly IssueReaction[];
	chinese: boolean;
	viewerId: string;
	focusPicker: () => void;
}>();
const emit = defineEmits<{ reaction: [emoji: string, active: boolean] }>();
const active = (reaction: IssueReaction) =>
	reaction.users.some((user) => user.id === props.viewerId);
let removed: HTMLElement | null = null;
watch(
	() => props.reactions,
	() => {
		if (removed && !removed.isConnected) {
			if (removed.ownerDocument.activeElement === removed.ownerDocument.body) props.focusPicker();
			removed = null;
		}
	},
	{ flush: "post" }
);
function toggle(reaction: IssueReaction, event: MouseEvent) {
	const pressed = active(reaction);
	removed = pressed && reaction.users.length === 1 ? (event.currentTarget as HTMLElement) : null;
	emit("reaction", reaction.emoji, !pressed);
}
</script>

<template>
	<div
		v-if="reactions.length"
		role="group"
		:aria-label="chinese ? '表情回应' : 'Reactions'"
		class="flex min-w-0 flex-wrap items-center gap-1"
	>
		<Button
			v-for="reaction in reactions"
			:key="reaction.emoji"
			variant="outline"
			size="xs"
			shape="pill"
			:aria-pressed="active(reaction)"
			:aria-label="`${emojiName(reaction.emoji, chinese)} ${reaction.users.length}`"
			:title="reaction.users.map(({ name }) => name).join(chinese ? '、' : ', ')"
			class="h-6 min-w-9 gap-1 rounded-full border-(--activity-border,var(--border)) bg-(--detail-control) px-1.5 text-xs font-normal text-muted-foreground shadow-none hover:bg-accent aria-pressed:border-(--detail-accent)/55 aria-pressed:bg-(--detail-accent)/15 aria-pressed:text-foreground"
			@click="toggle(reaction, $event)"
			><span aria-hidden="true" class="text-sm">{{ reaction.emoji }}</span
			>{{ reaction.users.length }}</Button
		>
	</div>
</template>
