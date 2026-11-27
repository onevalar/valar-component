<script setup lang="ts">
import { ChevronsUpDownIcon, CircleCheckIcon } from "@lucide/vue";
import { computed, ref, useId, watch } from "vue";
import ActivityComment from "./ActivityComment.vue";
import CommentComposer from "./CommentComposer.vue";
import { Button } from "../button";
import type {
	IssueActivityOptions,
	IssueCommentDraft,
	IssueCommentThread,
} from "./activity-model.js";

const props = defineProps<{
	entry: IssueCommentThread;
	activity: IssueActivityOptions;
	chinese: boolean;
}>();
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const id = useId();
const expanded = ref(false);
const root = ref<HTMLLIElement>();
let focusTarget: boolean | null = null;
const resolved = computed(() => !!props.entry.resolution);
const names = computed(() =>
	new Intl.ListFormat(props.chinese ? "zh-CN" : "en").format([
		...new Map(
			[props.entry, ...props.entry.replies].map(({ author }) => [author.id, author.name])
		).values(),
	])
);
const count = computed(() => props.entry.replies.length + 1);
const conclusion = computed(() =>
	props.entry.replies.find(({ id }) => id === props.entry.resolution?.replyId)
);
watch(
	resolved,
	(value) => {
		if (!value) expanded.value = false;
		if (focusTarget !== value) return;
		focusTarget = null;
		root.value
			?.querySelector<HTMLButtonElement>(value ? "[data-thread-summary]" : "[data-thread-options]")
			?.focus();
	},
	{ flush: "post" }
);
function resolve(next: boolean, replyId?: string) {
	focusTarget = next;
	if (next) expanded.value = false;
	props.activity.collaboration?.onAction({
		type: "resolve",
		threadId: props.entry.id,
		resolved: next,
		replyId,
	});
}
function react(commentId: string, emoji: string, active: boolean) {
	props.activity.collaboration?.onAction({
		type: "react",
		emoji,
		active,
		comment: { threadId: props.entry.id, commentId },
	});
}
function edit(commentId: string, draft: IssueCommentDraft) {
	props.activity.onAction({ type: "edit", threadId: props.entry.id, commentId, draft });
}
</script>

<template>
	<li
		ref="root"
		data-slot="issue-comment-thread"
		class="min-w-0 rounded-[8px] border border-(--activity-border) bg-(--activity-card)"
	>
		<Button
			v-if="entry.resolution"
			data-thread-summary=""
			variant="ghost"
			shape="square"
			:aria-expanded="expanded"
			:aria-controls="id"
			:title="`${t('解决者', 'Resolved by')} · ${entry.resolution.by.name}`"
			class="h-auto min-h-11 w-full justify-start gap-2 rounded-[7px] bg-(--detail-control) px-4 py-2 text-start text-[13px] font-normal whitespace-normal text-muted-foreground hover:bg-accent hover:text-foreground"
			@click="expanded = !expanded"
		>
			<CircleCheckIcon class="size-3.5 shrink-0" aria-hidden="true" />
			<span class="min-w-0 flex-1"
				><span class="block truncate">{{
					expanded
						? t("收起已解决线程", "Collapse resolved thread")
						: t(
								`已解决 · ${count} 条评论 · ${names}`,
								`${count} resolved ${count === 1 ? "comment" : "comments"} from ${names}`
							)
				}}</span>
				<span v-if="!expanded && conclusion?.body" class="block truncate text-xs">{{
					conclusion.body
				}}</span></span
			>
			<ChevronsUpDownIcon class="size-3.5 shrink-0" aria-hidden="true" />
		</Button>
		<div :id="id" :hidden="resolved && !expanded">
			<ActivityComment
				:comment="entry"
				:chinese="chinese"
				:viewer="activity.viewer"
				:resolved="resolved"
				:on-reaction="
					activity.collaboration ? (emoji, active) => react(entry.id, emoji, active) : undefined
				"
				:on-resolution="activity.collaboration ? resolve : undefined"
				@edit="edit(entry.id, $event)"
			/>
			<ol
				v-if="entry.replies.length"
				:aria-label="t('线程回复', 'Thread replies')"
				class="border-t border-(--activity-border)"
			>
				<li
					v-for="reply in entry.replies"
					:key="reply.id"
					:class="[
						'not-first:border-t not-first:border-(--activity-border)',
						entry.resolution?.replyId === reply.id && 'bg-accent',
					]"
				>
					<ActivityComment
						:comment="reply"
						:chinese="chinese"
						:viewer="activity.viewer"
						reply
						:resolved="resolved"
						:on-reaction="
							activity.collaboration ? (emoji, active) => react(reply.id, emoji, active) : undefined
						"
						:on-resolution="
							activity.collaboration ? (value) => resolve(value, reply.id) : undefined
						"
						@edit="edit(reply.id, $event)"
					/>
				</li>
			</ol>
			<CommentComposer
				mode="reply"
				:chinese="chinese"
				@commit="activity.onAction({ type: 'reply', threadId: entry.id, draft: $event })"
			/>
		</div>
	</li>
</template>
