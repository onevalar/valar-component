<script setup lang="ts">
import { MoreHorizontalIcon } from "@lucide/vue";
import { computed, inject, nextTick, ref } from "vue";
import CommentComposer from "./CommentComposer.vue";
import ReactionChips from "./ReactionChips.vue";
import ReactionPicker from "./ReactionPicker.vue";
import RichDescription from "./RichDescription.js";
import { dateText } from "./activity-copy.js";
import { iconControl, issuePortal } from "./controls.js";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import type { IssueActivityUser, IssueComment, IssueCommentDraft } from "./activity-model.js";

const props = defineProps<{
	comment: IssueComment;
	viewer: IssueActivityUser;
	chinese: boolean;
	reply?: boolean;
	resolved: boolean;
	onReaction?: (emoji: string, active: boolean) => void;
	onResolution?: (resolved: boolean) => void;
}>();
const emit = defineEmits<{ edit: [draft: IssueCommentDraft] }>();
const portal = inject(issuePortal);
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const own = computed(() => props.comment.author.id === props.viewer.id);
const editing = ref(false);
const trigger = ref<HTMLButtonElement>();
const picker = ref<InstanceType<typeof ReactionPicker>>();
let moved = false;
function startEdit() {
	moved = true;
	editing.value = true;
}
function changeResolution() {
	moved = true;
	trigger.value?.focus();
	props.onResolution?.(!props.resolved);
}
async function closeEdit() {
	editing.value = false;
	await nextTick();
	trigger.value?.focus();
}
function edit(draft: IssueCommentDraft) {
	emit("edit", draft);
	void closeEdit();
}
function pick(emoji: string) {
	props.onReaction?.(
		emoji,
		!props.comment.reactions?.some(
			(item) => item.emoji === emoji && item.users.some(({ id }) => id === props.viewer.id)
		)
	);
}
</script>

<template>
	<article
		class="min-w-0 px-4 py-3"
		:aria-label="reply ? t('线程回复', 'Thread reply') : t('评论内容', 'Comment content')"
	>
		<header class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
			<span
				aria-hidden="true"
				class="inline-grid size-[18px] shrink-0 place-items-center rounded-full bg-(--activity-avatar) text-[8px] text-(--activity-avatar-foreground)"
				>{{ comment.author.initials ?? comment.author.name.slice(0, 2) }}</span
			>
			<span class="min-w-0 truncate font-medium">{{ comment.author.name }}</span>
			<time :datetime="comment.createdAt" class="shrink-0 text-xs text-muted-foreground">{{
				dateText(comment.createdAt, chinese)
			}}</time>
			<span v-if="comment.editedAt" class="shrink-0 text-xs text-muted-foreground">{{
				t("已编辑", "Edited")
			}}</span>
			<div
				v-if="!editing && (own || onResolution || onReaction)"
				class="ms-auto flex shrink-0 items-center gap-2"
			>
				<ReactionPicker
					v-if="onReaction"
					ref="picker"
					:chinese="chinese"
					:label="reply ? t('回应回复', 'React to reply') : t('回应评论', 'React to comment')"
					@select="pick"
				/>
				<DropdownMenu
					v-if="own || onResolution"
					:modal="false"
					@update:open="
						(open: boolean) => {
							if (open) moved = false;
						}
					"
				>
					<DropdownMenuTrigger as-child
						><button
							ref="trigger"
							type="button"
							:aria-label="t('评论选项', 'Comment options')"
							:data-thread-options="!reply ? '' : undefined"
							:class="[iconControl, 'size-6']"
						>
							<MoreHorizontalIcon aria-hidden="true" /></button
					></DropdownMenuTrigger>
					<DropdownMenuContent
						appearance="surface"
						align="end"
						:portal-props="portal"
						@close-auto-focus="
							(event: Event) => {
								if (moved) event.preventDefault();
							}
						"
					>
						<DropdownMenuItem v-if="own" @select="startEdit">{{
							t("编辑评论", "Edit comment")
						}}</DropdownMenuItem>
						<DropdownMenuItem v-if="onResolution" @select="changeResolution">{{
							resolved ? t("重新打开线程", "Reopen thread") : t("解决线程", "Resolve thread")
						}}</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
		<div :class="['mt-1 min-w-0', reply && 'ps-[26px]']">
			<CommentComposer
				v-if="editing && own"
				mode="edit"
				:chinese="chinese"
				:initial="comment"
				@cancel="closeEdit"
				@commit="edit"
			/>
			<template v-else>
				<RichDescription
					v-if="comment.content"
					:content="comment.content"
					slot="issue-comment-body"
				/>
				<p
					v-else-if="comment.body"
					data-slot="issue-comment-body"
					class="text-[15px] leading-6 wrap-anywhere whitespace-pre-wrap"
				>
					{{ comment.body }}
				</p>
				<ul
					v-if="comment.attachments?.length"
					:aria-label="t('评论附件', 'Comment attachments')"
					class="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground"
				>
					<li
						v-for="(file, index) in comment.attachments"
						:key="index"
						class="max-w-full truncate rounded-full border border-(--activity-border) px-2 py-1"
					>
						{{ file.name }}
					</li>
				</ul>
				<ReactionChips
					v-if="onReaction"
					:reactions="comment.reactions ?? []"
					:chinese="chinese"
					:viewer-id="viewer.id"
					:focus-picker="() => picker?.focus()"
					@reaction="onReaction"
					class="mt-2"
				/>
			</template>
		</div>
	</article>
</template>
