<script setup lang="ts">
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentTitle,
} from "@valar/vue-ui/attachment";
import { Bubble, BubbleContent } from "@valar/vue-ui/bubble";
import { Button } from "@valar/vue-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/vue-ui/code-block";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@valar/vue-ui/input-group";
import { Message, MessageContent } from "@valar/vue-ui/message";
import {
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerRoot,
	MessageScrollerViewport,
} from "@valar/vue-ui/message-scroller";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceLine,
	TraceTitle,
} from "@valar/vue-ui/trace";
import { computed, ref, watch } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const t = (en: string, zh: string) => (props.chinese ? zh : en);
const locale = computed(() => (props.chinese ? 1 : 0));
const script = [
	{
		prompt: ["Add a dark mode toggle to the settings page.", "为设置页面添加深色模式开关。"],
		thought: [
			"First check how themes are configured in the sample project.",
			"先检查示例项目中的主题配置。",
		],
		result: "src/routes/+layout.svelte\nModeWatcher is already configured.",
		reply: [
			[
				"The sample project already has a theme provider, so the toggle only needs to change the active mode.",
				"示例项目已经配置了主题提供器，开关只需切换当前模式。",
			],
			[
				"The new ModeToggle lives next to the Appearance heading and offers Light and Dark options.",
				"新的 ModeToggle 位于「外观」标题旁，提供浅色和深色选项。",
			],
			[
				"The selected mode is saved so the setting survives a page refresh.",
				"所选模式会保存，刷新页面后仍然有效。",
			],
		],
	},
	{
		prompt: ["Make it follow the system setting by default.", "默认跟随系统设置。"],
		thought: [
			"Look at the theme provider's default mode in the sample.",
			"查看示例中主题提供器的默认模式。",
		],
		result: '<ModeWatcher defaultMode="system" />',
		reply: [
			[
				"New visitors now get the theme from their operating system.",
				"新访客现在会使用操作系统的主题。",
			],
			[
				"The toggle includes a System option, so anyone who picked Light or Dark can switch back.",
				"开关新增了「系统」选项，选择过浅色或深色的用户可以切换回来。",
			],
			[
				"Explicit choices still take precedence over system changes.",
				"用户明确选择的模式仍优先于系统变化。",
			],
		],
	},
	{
		prompt: ["Run the build before I ship it.", "发布前运行构建。"],
		thought: [
			"Review the sample build output for compilation and prerender errors.",
			"检查示例构建输出中的编译与预渲染错误。",
		],
		result: "✓ Built in 4.2s\n✓ Prerendered 12 pages",
		reply: [
			["In the sample output, the build passes.", "示例输出显示构建通过。"],
			[
				"Compilation finished in 4.2 seconds, and all 12 static pages were generated.",
				"编译耗时 4.2 秒，全部 12 个静态页面已生成。",
			],
			["The theme change is ready for review.", "主题修改可提交审核。"],
		],
	},
];
type LocalFile = { id: number; file: File };
type Turn = {
	id: number;
	prompt: string;
	scenario: number;
	files: LocalFile[];
	step: number;
	stopped: boolean;
};
const finalStep = 5;
const turns = ref<Turn[]>([]);
const draft = ref<string | null>(null);
const files = ref<LocalFile[]>([]);
const picker = ref<HTMLInputElement | null>(null);
const form = ref<HTMLFormElement | null>(null);
let nextId = 0;
const latest = computed(() => turns.value.at(-1));
const busy = computed(() => !!latest.value && isRunning(latest.value));
const nextScenario = computed(() => turns.value.filter((turn) => turn.scenario >= 0).length);
const suggested = computed(() => script[nextScenario.value]?.prompt[locale.value] ?? "");
const text = computed({
	get: () => draft.value ?? (busy.value ? "" : suggested.value),
	set: (value) => (draft.value = value),
});

function isRunning(turn: Turn) {
	return !turn.stopped && turn.step < finalStep;
}
watch([latest, () => latest.value?.step, busy], ([turn, , running], _, onCleanup) => {
	if (!turn || !running) return;
	const timer = setTimeout(() => {
		if (!turn.stopped) turn.step++;
	}, 480);
	onCleanup(() => clearTimeout(timer));
});

function focus() {
	form.value?.querySelector("textarea")?.focus();
}
function send() {
	const prompt = text.value.trim();
	if (busy.value || (!prompt && files.value.length === 0)) return;
	turns.value.push({
		id: ++nextId,
		prompt,
		scenario: prompt && prompt === suggested.value ? nextScenario.value : -1,
		files: files.value,
		step: 0,
		stopped: false,
	});
	draft.value = null;
	files.value = [];
	focus();
}
function reset() {
	turns.value = [];
	draft.value = null;
	files.value = [];
	focus();
}
function stop() {
	if (latest.value) latest.value.stopped = true;
	focus();
}
function remove(id: number) {
	files.value = files.value.filter((item) => item.id !== id);
	focus();
}
function attach(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	files.value.push(...Array.from(input.files ?? [], (file) => ({ id: ++nextId, file })));
	input.value = "";
}
function onEnter(event: KeyboardEvent) {
	if (event.shiftKey || event.isComposing || event.keyCode === 229) return;
	event.preventDefault();
	form.value?.requestSubmit();
}
</script>

<template>
	<section
		:aria-label="t('Chat example', '对话示例')"
		class="mx-auto flex h-[min(36rem,90dvh)] min-h-88 w-full max-w-2xl flex-col overflow-hidden rounded-xl border-[0.5px] border-border bg-background text-sm"
	>
		<header
			class="flex shrink-0 items-center justify-between gap-3 border-b-[0.5px] border-border px-4 py-2.5 sm:px-6"
		>
			<div>
				<h2 class="font-medium">{{ t("New Thread", "新对话") }}</h2>
				<p class="text-xs text-muted-foreground">
					{{ t("A scripted chat, running locally.", "在本地运行的脚本对话。") }}
				</p>
			</div>
			<Button
				variant="ghost"
				size="sm"
				:disabled="busy || (!turns.length && draft === null && !files.length)"
				@click="reset"
				>{{ t("Reset conversation", "重置对话") }}</Button
			>
		</header>
		<div class="min-h-0 flex-1">
			<div v-if="!turns.length" class="grid h-full place-content-center gap-1 p-4 text-center">
				<h3 class="text-base font-medium">{{ t("What should we build?", "我们要构建什么？") }}</h3>
				<p class="text-muted-foreground">
					{{
						t("Send the sample prompt to see the reply stream.", "发送示例提示词，查看流式回复。")
					}}
				</p>
			</div>
			<MessageScrollerProvider v-else auto-scroll default-scroll-position="last-anchor">
				<MessageScrollerRoot>
					<MessageScrollerViewport :aria-label="t('Transcript', '对话记录')">
						<MessageScrollerContent :aria-busy="busy" class="gap-4 px-4 py-4 sm:px-6">
							<template v-for="turn in turns" :key="turn.id">
								<MessageScrollerItem :message-id="`question-${turn.id}`" scroll-anchor>
									<Message align="end"
										><MessageContent
											><Bubble align="end" variant="muted"
												><BubbleContent class="whitespace-pre-wrap">
													{{ turn.prompt }}
													<p
														v-if="turn.files.length"
														class="text-xs wrap-anywhere text-muted-foreground"
													>
														{{ t("Attachments", "附件") }}:
														{{ turn.files.map(({ file }) => file.name).join(", ") }}
													</p>
												</BubbleContent></Bubble
											></MessageContent
										></Message
									>
								</MessageScrollerItem>
								<MessageScrollerItem :message-id="`reply-${turn.id}`">
									<Message
										><MessageContent class="gap-2 text-[15px]/6">
											<Trace v-if="turn.scenario >= 0">
												<TraceCollapsible
													><TraceCollapsibleTrigger
														><TraceLine
															:status="isRunning(turn) && turn.step === 0 ? 'running' : undefined"
															><TraceTitle>{{
																t("Work summary", "工作摘要")
															}}</TraceTitle></TraceLine
														></TraceCollapsibleTrigger
													>
													<TraceCollapsibleContent>{{
														script[turn.scenario].thought[locale]
													}}</TraceCollapsibleContent>
												</TraceCollapsible>
												<TraceCollapsible v-if="turn.step >= 2"
													><TraceCollapsibleTrigger
														><TraceLine
															><TraceTitle>{{
																t("Sample tool output", "示例工具输出")
															}}</TraceTitle></TraceLine
														></TraceCollapsibleTrigger
													>
													<TraceCollapsibleContent
														><CodeBlock size="sm"
															><CodeBlockContent
																wrap
																:code="script[turn.scenario].result" /></CodeBlock
													></TraceCollapsibleContent>
												</TraceCollapsible>
												<TraceLine v-else-if="turn.step === 1 && isRunning(turn)" status="running"
													><TraceTitle>{{
														t("Checking sample output…", "正在检查示例输出…")
													}}</TraceTitle></TraceLine
												>
											</Trace>
											<p
												v-for="(paragraph, index) in script[turn.scenario]?.reply.slice(
													0,
													Math.max(0, turn.step - 2)
												)"
												:key="index"
											>
												{{ paragraph[locale] }}
											</p>
											<p v-if="turn.scenario < 0 && !isRunning(turn) && !turn.stopped">
												{{
													t(
														"This demo only knows the scripted turns. Send the suggested prompt or reset to start over.",
														"此演示只识别预设对话。请发送建议的提示词，或重置后重新开始。"
													)
												}}
											</p>
											<p
												v-if="isRunning(turn) && turn.step < 3"
												class="text-sm text-muted-foreground"
											>
												{{ t("Thinking…", "正在思考…") }}
											</p>
											<p v-if="turn.stopped" class="text-sm text-muted-foreground">
												{{ t("Reply stopped.", "回复已停止。") }}
											</p>
										</MessageContent></Message
									>
								</MessageScrollerItem>
							</template>
						</MessageScrollerContent>
					</MessageScrollerViewport>
					<MessageScrollerButton :label="t('Jump to latest', '跳到最新消息')" />
				</MessageScrollerRoot>
			</MessageScrollerProvider>
		</div>
		<p role="status" class="sr-only">
			{{
				busy
					? t("Generating a reply", "正在生成回复")
					: latest?.stopped
						? t("Reply stopped", "回复已停止")
						: latest
							? t("Reply complete", "回复已完成")
							: ""
			}}
		</p>
		<form ref="form" class="shrink-0 px-4 pt-2 pb-4 sm:px-6" @submit.prevent="send">
			<input ref="picker" type="file" multiple hidden @change="attach" />
			<InputGroup appearance="composer">
				<InputGroupAddon
					v-if="files.length"
					align="block-start"
					class="max-h-24 flex-wrap gap-1.5 overflow-y-auto"
					:aria-label="t('Attachments', '附件')"
				>
					<Attachment v-for="{ id, file } in files" :key="id" size="sm" class="max-w-full min-w-0">
						<AttachmentContent
							><AttachmentTitle :title="file.name">{{
								file.name
							}}</AttachmentTitle></AttachmentContent
						>
						<AttachmentActions
							><AttachmentAction
								:aria-label="`${t('Remove', '移除')} ${file.name}`"
								@click="remove(id)"
								><span aria-hidden="true">×</span></AttachmentAction
							></AttachmentActions
						>
					</Attachment>
				</InputGroupAddon>
				<InputGroupTextarea
					v-model="text"
					name="message"
					:rows="2"
					class="max-h-28"
					:readonly="busy"
					:aria-label="t('Message', '消息')"
					:placeholder="t('Ask the agent…', '向助手提问…')"
					@keydown.enter="onEnter"
				/>
				<InputGroupAddon align="block-end" class="justify-end gap-2">
					<InputGroupButton
						size="icon-xs"
						shape="pill"
						:disabled="busy"
						:aria-label="t('Attach files', '添加文件')"
						@click="picker?.click()"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						>
							<path d="M8 3v10M3 8h10" />
						</svg>
					</InputGroupButton>
					<InputGroupButton
						v-if="busy"
						size="icon-xs"
						shape="pill"
						variant="default"
						:aria-label="t('Stop reply', '停止回复')"
						@click="stop"
					>
						<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
							<rect x="4" y="4" width="8" height="8" rx="1" />
						</svg>
					</InputGroupButton>
					<InputGroupButton
						v-else
						type="submit"
						size="icon-xs"
						shape="pill"
						variant="default"
						:disabled="!text.trim() && !files.length"
						:aria-label="t('Send', '发送')"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M8 13V3m-4 4 4-4 4 4" />
						</svg>
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</form>
	</section>
</template>
