<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { applyLink, createIssueEditor, format, isComposing, tools } from "./editor-core.js";
import { richTextClass } from "./model.js";
import { Button } from "../button";
import type { Editor, JSONContent } from "@tiptap/core";

const props = defineProps<{
	content: JSONContent;
	chinese: boolean;
	focusOnMount: boolean;
	commentLabel?: string;
	commentPlaceholder?: string;
	onKeys?: (event: KeyboardEvent) => boolean;
}>();
const emit = defineEmits<{ ready: [editor: Editor | null]; change: [editor: Editor] }>();
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const id = useId();
const host = ref<HTMLDivElement>();
const input = ref<HTMLInputElement>();
const toolbar = ref<string[]>([]);
const linkOpen = ref(false);
const linkValue = ref("");
const invalid = ref(false);
let editor: Editor | undefined;
const label = () => props.commentLabel ?? t("问题描述", "Issue description");

async function openLink() {
	linkValue.value = editor?.getAttributes("link").href ?? "";
	invalid.value = false;
	linkOpen.value = true;
	await nextTick();
	input.value?.focus();
}
function closeLink() {
	linkOpen.value = false;
	editor?.commands.focus();
}
function saveLink() {
	if (!editor) return;
	if (applyLink(editor, linkValue.value)) closeLink();
	else {
		invalid.value = true;
		input.value?.focus();
	}
}
function linkKeys(event: KeyboardEvent) {
	if (isComposing(event) || (event.key !== "Enter" && event.key !== "Escape")) return;
	event.preventDefault();
	event.stopPropagation();
	if (!event.repeat) event.key === "Enter" ? saveLink() : closeLink();
}

onMounted(() => {
	if (!host.value) return;
	editor = createIssueEditor({
		element: host.value,
		content: props.content,
		label: label(),
		comment: !!props.commentLabel,
		focus: props.focusOnMount,
		onChange: (current) => emit("change", current),
		onKeys: (event) => {
			if (props.onKeys?.(event)) return true;
			if (
				event.key.toLowerCase() === "k" &&
				(event.ctrlKey || event.metaKey) &&
				!isComposing(event)
			) {
				event.preventDefault();
				if (!event.repeat) void openLink();
				return true;
			}
			return false;
		},
		onFormats: (value) => {
			toolbar.value = value;
		},
	});
	emit("ready", editor);
});
onBeforeUnmount(() => {
	editor?.destroy();
	emit("ready", null);
});
watch(label, (value) => editor?.view.dom.setAttribute("aria-label", value));
</script>

<template>
	<div :class="commentLabel ? 'min-w-0' : 'rounded-lg border border-border bg-(--detail-control)'">
		<div
			v-if="!commentLabel"
			role="group"
			:aria-label="t('文本格式', 'Text formatting')"
			class="flex flex-wrap gap-0.5 border-b border-border p-1"
		>
			<Button
				v-for="tool in tools"
				:key="tool.key"
				variant="ghost"
				size="icon-xs"
				:class="[
					'h-6 min-w-6 px-1 text-xs text-muted-foreground aria-pressed:bg-accent aria-pressed:text-foreground',
					tool.class,
				]"
				:aria-label="t(tool.zh, tool.en)"
				:title="t(tool.zh, tool.en)"
				:aria-keyshortcuts="'shortcut' in tool ? tool.shortcut : undefined"
				:aria-pressed="toolbar.includes(tool.key)"
				@mousedown.prevent
				@click="editor && format(editor, tool.key)"
				>{{ tool.symbol }}</Button
			>
			<Button
				variant="ghost"
				size="sm"
				class="h-6 px-2 text-xs text-muted-foreground aria-pressed:bg-accent"
				:aria-expanded="linkOpen"
				:aria-pressed="toolbar.includes('link')"
				aria-keyshortcuts="Meta+K Control+K"
				@mousedown.prevent
				@click="openLink"
				>{{ t("链接", "Link") }}</Button
			>
		</div>
		<div v-if="linkOpen" class="border-b border-border p-2">
			<div class="flex flex-wrap items-center gap-1.5">
				<input
					ref="input"
					v-model="linkValue"
					data-slot="input"
					:aria-label="t('链接地址', 'Link address')"
					:aria-invalid="invalid"
					:aria-describedby="invalid ? `${id}-link-error` : undefined"
					placeholder="https://"
					class="h-7 min-w-0 flex-1 rounded-md border border-border bg-(--detail-control) px-2 text-xs focus:outline-1 focus:-outline-offset-1 focus:outline-ring"
					@input="invalid = false"
					@keydown="linkKeys"
				/>
				<Button variant="ghost" size="xs" @click="closeLink">{{
					t("关闭链接输入", "Close link input")
				}}</Button>
				<Button variant="outline" size="xs" @click="saveLink">{{
					t("应用链接", "Apply link")
				}}</Button>
			</div>
			<p v-if="invalid" :id="`${id}-link-error`" role="alert" class="mt-1 text-xs text-destructive">
				{{
					t("请输入有效的 HTTP、HTTPS 或邮件链接。", "Enter a valid HTTP, HTTPS, or mailto link.")
				}}
			</p>
		</div>
		<div class="relative">
			<span
				v-if="commentPlaceholder"
				aria-hidden="true"
				class="pointer-events-none absolute start-0 top-0 text-[15px] leading-6 text-(--activity-placeholder)"
				>{{ commentPlaceholder }}</span
			>
			<div
				ref="host"
				:class="[
					richTextClass,
					'focus-within:outline-1 focus-within:-outline-offset-1 focus-within:outline-ring',
					!commentLabel && 'p-3',
				]"
			/>
		</div>
	</div>
</template>
