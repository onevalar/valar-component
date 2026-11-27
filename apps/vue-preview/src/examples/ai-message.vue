<script setup lang="ts">
import { Bubble, BubbleContent } from "@valar/vue-ui/bubble";
import { Button } from "@valar/vue-ui/button";
import {
	CodeBlock,
	CodeBlockActions,
	CodeBlockContent,
	CodeBlockCopyButton,
} from "@valar/vue-ui/code-block";
import { Message, MessageContent, MessageFooter } from "@valar/vue-ui/message";
import { Textarea } from "@valar/vue-ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@valar/vue-ui/tooltip";
import { computed, nextTick, onUnmounted, ref } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const t = (en: string, zh: string) => (props.chinese ? zh : en);
const code = 'import { Dialog, DialogContent, DialogTrigger } from "@valar/vue-ui/dialog";';
const icons = {
	copy: "M6 6h7v7H6zM4 11H3V3h8v1",
	check: "m3 8 3 3 7-7",
	edit: "m3 10 7-7 3 3-7 7H3zm6-6 3 3",
	good: "M5 7 7 3h2v4h4l-1 6H5zm-2 0h2v6H3z",
	bad: "m5 9 2 4h2V9h4l-1-6H5zM3 3h2v6H3z",
	retry: "M13 7a5 5 0 1 0-1.5 4.5M13 3v4H9",
};
const edited = ref<string>();
const question = computed(
	() =>
		edited.value ??
		t(
			"How do I add a settings dialog? It should open from the gear icon in the header.",
			"如何添加设置对话框？希望能从页眉的齿轮图标打开它。"
		)
);
const intro = computed(() =>
	t(
		"Import Dialog, then open it from the gear button in the site header.",
		"导入 Dialog，再从网站页眉的齿轮按钮打开它。"
	)
);
const guidance = computed(() =>
	t(
		"Wrap the gear button in DialogTrigger and put the form in DialogContent. Focus moves into the dialog on open. Press Escape to close it.",
		"用 DialogTrigger 包裹齿轮按钮，将表单放入 DialogContent。打开时焦点移入对话框，按 Escape 即可关闭。"
	)
);
const draft = ref<string | null>(null);
const example = ref<HTMLElement | null>(null);
const feedback = ref<"good" | "bad" | null>(null);
const copied = ref<"question" | "reply" | null>(null);
const status = ref<"copy-error" | "retried" | null>(null);
const retrying = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | undefined;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let copyRequest = 0;

onUnmounted(() => {
	copyRequest++;
	clearTimeout(copyTimer);
	clearTimeout(retryTimer);
});

async function copy(target: "question" | "reply") {
	const request = ++copyRequest;
	clearTimeout(copyTimer);
	copied.value = null;
	status.value = null;
	try {
		await navigator.clipboard.writeText(
			target === "question" ? question.value : `${intro.value}\n\n${code}\n\n${guidance.value}`
		);
		if (request !== copyRequest) return;
		copied.value = target;
		copyTimer = setTimeout(() => (copied.value = null), 2000);
	} catch {
		if (request === copyRequest) status.value = "copy-error";
	}
}

function retry() {
	if (retrying.value) return;
	retrying.value = true;
	feedback.value = null;
	status.value = null;
	retryTimer = setTimeout(() => {
		retrying.value = false;
		status.value = "retried";
	}, 700);
}

async function edit() {
	draft.value = question.value;
	await nextTick();
	example.value?.querySelector("textarea")?.focus();
}
function cancel() {
	draft.value = null;
	example.value?.querySelector<HTMLButtonElement>("[data-edit-message]")?.focus();
}
function save() {
	if (!draft.value?.trim()) return;
	edited.value = draft.value.trim();
	cancel();
	retry();
}

const actions = computed(
	() =>
		[
			[
				{
					id: "copy-question",
					label:
						copied.value === "question"
							? t("Copied message", "消息已复制")
							: t("Copy message", "复制消息"),
					icon: copied.value === "question" ? "check" : "copy",
					run: () => copy("question"),
				},
				{ id: "edit", label: t("Edit", "编辑"), icon: "edit", run: edit },
			],
			[
				{
					id: "copy-reply",
					label:
						copied.value === "reply"
							? t("Copied reply", "回复已复制")
							: t("Copy reply", "复制回复"),
					icon: copied.value === "reply" ? "check" : "copy",
					run: () => copy("reply"),
				},
				{
					id: "good",
					label: t("Good response", "回复有用"),
					icon: "good",
					pressed: feedback.value === "good",
					run: () => (feedback.value = feedback.value === "good" ? null : "good"),
				},
				{
					id: "bad",
					label: t("Bad response", "回复无用"),
					icon: "bad",
					pressed: feedback.value === "bad",
					run: () => (feedback.value = feedback.value === "bad" ? null : "bad"),
				},
				{
					id: "retry",
					label: t("Retry", "重试"),
					icon: "retry",
					disabled: retrying.value,
					run: retry,
				},
			],
		] as const
);
</script>

<template>
	<section
		ref="example"
		:aria-label="t('Message example', '消息示例')"
		class="mx-auto grid w-full max-w-md min-w-0 gap-6 px-4 py-6 text-[15px]/6"
	>
		<TooltipProvider>
			<Message
				v-for="(buttons, index) in actions"
				:key="index"
				:align="index === 0 ? 'end' : 'start'"
			>
				<MessageContent class="gap-2">
					<template v-if="index === 0">
						<Bubble v-if="draft === null" align="end" variant="muted"
							><BubbleContent class="whitespace-pre-wrap">{{ question }}</BubbleContent></Bubble
						>
						<form
							v-else
							class="grid min-w-0 gap-2"
							@submit.prevent="save"
							@keydown.esc="!$event.isComposing && ($event.stopPropagation(), cancel())"
						>
							<Textarea v-model="draft" :aria-label="t('Edit message', '编辑消息')" />
							<div class="flex justify-end gap-2">
								<Button size="sm" variant="ghost" @click="cancel">{{ t("Cancel", "取消") }}</Button>
								<Button type="submit" size="sm" :disabled="!draft.trim()">{{
									t("Save", "保存")
								}}</Button>
							</div>
						</form>
					</template>
					<div v-else class="grid min-w-0 gap-3" :aria-busy="retrying">
						<p v-if="retrying" class="text-muted-foreground">
							{{ t("Regenerating the sample reply…", "正在重新生成示例回复…") }}
						</p>
						<template v-else>
							<p>{{ intro }}</p>
							<CodeBlock size="sm"
								><CodeBlockActions
									><CodeBlockCopyButton
										:value="code"
										:copy-label="t('Copy code', '复制代码')"
										:copied-label="t('Code copied', '代码已复制')" /></CodeBlockActions
								><CodeBlockContent wrap line-numbers :code="code"
							/></CodeBlock>
							<p>{{ guidance }}</p>
						</template>
					</div>
					<MessageFooter :class="index === 1 && 'px-0'">
						<template v-for="action in buttons" :key="action.id">
							<Tooltip v-if="index === 0 || !retrying || action.id === 'retry'">
								<TooltipTrigger as-child>
									<Button
										:data-edit-message="action.id === 'edit' ? '' : undefined"
										size="icon-xs"
										shape="pill"
										variant="ghost"
										class="text-muted-foreground aria-pressed:bg-accent aria-pressed:text-foreground"
										:aria-label="action.label"
										:aria-pressed="'pressed' in action ? action.pressed : undefined"
										:aria-disabled="'disabled' in action ? action.disabled : undefined"
										@click="action.run"
									>
										<svg
											aria-hidden="true"
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											stroke-width="1.25"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path :d="icons[action.icon]" />
										</svg>
									</Button> </TooltipTrigger
								><TooltipContent>{{ action.label }}</TooltipContent>
							</Tooltip>
						</template>
					</MessageFooter>
				</MessageContent>
			</Message>
		</TooltipProvider>
		<p role="status" class="sr-only">
			{{
				copied
					? t("Copied to clipboard", "已复制到剪贴板")
					: status === "copy-error"
						? t("Could not access the clipboard", "无法访问剪贴板")
						: status === "retried"
							? t("Sample reply regenerated", "已重新生成示例回复")
							: ""
			}}
		</p>
	</section>
</template>
