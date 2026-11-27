<script setup lang="ts">
import { ArrowUpIcon, PaperclipIcon, XIcon } from "@lucide/vue";
import { computed, inject, nextTick, ref, shallowRef } from "vue";
import DescriptionEditor from "./DescriptionEditor.vue";
import { issuePortal } from "./controls.js";
import { isComposing } from "./editor-core.js";
import { descriptionFromText } from "./model.js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../alert-dialog";
import { Button } from "../button";
import type { IssueComment, IssueCommentDraft } from "./activity-model.js";
import type { Editor } from "@tiptap/core";

const props = defineProps<{
	mode: "post" | "reply" | "edit";
	chinese: boolean;
	initial?: IssueComment;
}>();
const emit = defineEmits<{ commit: [draft: IssueCommentDraft]; cancel: [] }>();
const portal = inject(issuePortal);
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const startingContent = props.initial?.content ?? descriptionFromText(props.initial?.body ?? "");
const originalFiles = [...(props.initial?.attachments ?? [])];
const files = shallowRef(originalFiles);
const opened = ref(props.mode === "edit");
const body = ref(props.initial?.body ?? "");
const changed = ref(false);
const discardOpen = ref(false);
let discarded = false;
const editor = shallowRef<Editor | null>(null);
const form = ref<HTMLFormElement>();
const fileInput = ref<HTMLInputElement>();
const canSubmit = computed(() => !!body.value.trim() || files.value.length > 0);
const dirty = computed(
	() =>
		changed.value ||
		files.value.length !== originalFiles.length ||
		files.value.some((file, index) => file !== originalFiles[index])
);
const collapsedReply = computed(
	() => props.mode === "reply" && !opened.value && !files.value.length
);
const label = computed(() =>
	props.mode === "reply"
		? t("回复", "Reply")
		: props.mode === "edit"
			? t("编辑评论", "Edit comment")
			: t("评论", "Comment")
);
const emptyLabel = computed(() =>
	props.mode === "reply" ? t("回复此线程…", "Leave a reply…") : t("发表评论…", "Leave a comment…")
);
const submitLabel = computed(() =>
	props.mode === "reply"
		? t("发表回复", "Post reply")
		: props.mode === "edit"
			? t("保存评论", "Save comment")
			: t("发表评论", "Post comment")
);
const iconClass =
	"size-6 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground [&_svg]:size-3.5";

function focusPlaceholder() {
	form.value?.querySelector<HTMLButtonElement>("[data-comment-placeholder]")?.focus();
}
function clear() {
	body.value = "";
	files.value = [];
	changed.value = false;
}
async function discard() {
	discarded = true;
	discardOpen.value = false;
	if (props.mode === "edit") emit("cancel");
	else {
		clear();
		opened.value = false;
		await nextTick();
		focusPlaceholder();
	}
}
function cancel() {
	if (dirty.value) {
		discarded = false;
		discardOpen.value = true;
	} else void discard();
}
function keys(event: KeyboardEvent) {
	if (event.defaultPrevented || isComposing(event)) return false;
	if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
		event.preventDefault();
		if (!event.repeat && canSubmit.value) form.value?.requestSubmit();
		return true;
	}
	if (event.key === "Escape" && (opened.value || files.value.length) && !discardOpen.value) {
		event.preventDefault();
		event.stopPropagation();
		if (!event.repeat) cancel();
		return true;
	}
	return false;
}
function post() {
	if (!canSubmit.value || (props.mode === "edit" && !dirty.value)) return;
	const current = editor.value;
	emit("commit", {
		body: body.value.trim(),
		content: current && !current.isEmpty ? current.getJSON() : undefined,
		attachments: [...files.value],
	});
	if (props.mode === "edit") return;
	clear();
	current?.commands.clearContent(false);
	if (current) current.commands.focus();
	else focusPlaceholder();
}
function read(current: Editor) {
	body.value = current.getText({ blockSeparator: "\n" });
	changed.value = props.initial
		? JSON.stringify(current.getJSON()) !== JSON.stringify(startingContent)
		: !current.isEmpty;
}
function addFiles(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	files.value = [...files.value, ...Array.from(input.files ?? [])];
	input.value = "";
}
function removeFile(index: number) {
	files.value = files.value.filter((_, i) => i !== index);
	form.value?.querySelector<HTMLButtonElement>("[data-comment-attach]")?.focus();
}
function closeAutoFocus(event: Event) {
	event.preventDefault();
	if (!discarded) {
		if (editor.value) editor.value.commands.focus();
		else focusPlaceholder();
	}
}
</script>

<template>
	<form
		ref="form"
		:aria-label="mode === 'post' ? t('新评论', 'New comment') : label"
		:class="[
			'min-w-0',
			mode === 'post' &&
				'rounded-[8px] border border-(--activity-border) bg-(--activity-card) px-4 py-3',
			mode === 'reply' && [
				'border-t border-(--activity-border) px-4',
				collapsedReply ? 'py-2.5' : 'py-3',
			],
		]"
		@keydown="keys"
		@submit.prevent="post"
	>
		<div :class="['flex min-w-0 gap-2', collapsedReply ? 'items-center' : 'flex-col']">
			<div class="min-w-0 flex-1">
				<DescriptionEditor
					v-if="opened"
					:content="startingContent"
					:chinese="chinese"
					:comment-label="label"
					:comment-placeholder="mode !== 'edit' && !changed ? emptyLabel : undefined"
					focus-on-mount
					:on-keys="keys"
					@ready="editor = $event"
					@change="read"
				/>
				<Button
					v-else
					variant="ghost"
					data-comment-placeholder=""
					class="h-6 w-full min-w-0 justify-start rounded-sm px-0 py-0 text-start text-[15px] font-normal text-(--activity-placeholder) hover:bg-transparent"
					@click="opened = true"
					>{{ emptyLabel }}</Button
				>
				<ul
					v-if="files.length"
					:aria-label="t('评论附件', 'Comment attachments')"
					class="mt-2 flex flex-wrap gap-1.5"
				>
					<li
						v-for="(file, index) in files"
						:key="index"
						class="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-(--activity-border) ps-2 text-xs"
					>
						<span class="truncate">{{ file.name }}</span>
						<Button
							size="icon-xs"
							variant="ghost"
							:aria-label="t('移除附件 ', 'Remove attachment ') + file.name"
							@click="removeFile(index)"
							><XIcon aria-hidden="true"
						/></Button>
					</li>
				</ul>
			</div>
			<div class="flex items-center justify-end gap-2">
				<input ref="fileInput" type="file" hidden multiple @change="addFiles" />
				<Button
					variant="ghost"
					:class="iconClass"
					:aria-label="t('为评论添加附件', 'Attach files to comment')"
					data-comment-attach=""
					@click="fileInput?.click()"
					><PaperclipIcon aria-hidden="true"
				/></Button>
				<template v-if="mode === 'edit'">
					<Button
						variant="ghost"
						size="sm"
						class="ms-auto h-7 rounded-full text-xs"
						@click="cancel"
						>{{ t("取消编辑", "Cancel edit") }}</Button
					>
					<Button
						type="submit"
						variant="secondary"
						size="sm"
						:disabled="!canSubmit || !dirty"
						aria-keyshortcuts="Meta+Enter Control+Enter"
						class="h-7 rounded-full text-xs"
						>{{ submitLabel }}</Button
					>
				</template>
				<Button
					v-else
					type="submit"
					:disabled="!canSubmit"
					:aria-label="submitLabel"
					aria-keyshortcuts="Meta+Enter Control+Enter"
					:class="[
						iconClass,
						'bg-(--detail-accent) text-white hover:bg-(--detail-accent)/90 disabled:bg-accent disabled:text-muted-foreground',
					]"
					><ArrowUpIcon aria-hidden="true"
				/></Button>
			</div>
		</div>
	</form>
	<AlertDialog v-model:open="discardOpen">
		<AlertDialogContent
			appearance="confirmation"
			focus-cancel
			:portal-props="portal"
			@close-auto-focus="closeAutoFocus"
			@escape-key-down="
				(event: KeyboardEvent) => {
					if (isComposing(event)) event.preventDefault();
				}
			"
		>
			<AlertDialogHeader>
				<AlertDialogTitle>{{ t("放弃评论修改？", "Discard comment changes?") }}</AlertDialogTitle>
				<AlertDialogDescription>{{
					t("草稿中的修改将被清除。", "The changes in this draft will be discarded.")
				}}</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter
				><AlertDialogCancel>{{ t("继续编辑", "Keep editing") }}</AlertDialogCancel
				><AlertDialogAction @click="discard">{{
					t("放弃修改", "Discard changes")
				}}</AlertDialogAction></AlertDialogFooter
			>
		</AlertDialogContent>
	</AlertDialog>
</template>
