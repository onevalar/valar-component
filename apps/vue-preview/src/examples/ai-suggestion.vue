<script setup lang="ts">
import { Bubble, BubbleContent } from "@valar/vue-ui/bubble";
import { Button } from "@valar/vue-ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@valar/vue-ui/input-group";
import { Message, MessageContent } from "@valar/vue-ui/message";
import { computed, ref } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const t = (english: string, zh: string) => (props.chinese ? zh : english);
const suggestions = [
	[
		"Add a dark mode toggle",
		"添加深色模式开关",
		"Added a theme toggle to the site header.",
		"已在网站页眉添加主题开关。",
	],
	[
		"Fix the failing build",
		"修复构建错误",
		"The build passed after restoring a missing import.",
		"补上缺失的导入后，构建已通过。",
	],
	[
		"Write tests for the form",
		"为表单编写测试",
		"Added tests for empty, invalid, and valid submissions.",
		"已添加空值、无效值和有效值的提交测试。",
	],
	[
		"Upgrade to Next.js 16",
		"升级到 Next.js 16",
		"Updated the two routes that needed asynchronous parameters.",
		"已更新两个需要异步参数的路由。",
	],
	[
		"Add a loading state",
		"添加加载状态",
		"Added a skeleton while the dashboard loads.",
		"已为仪表板添加加载骨架。",
	],
	[
		"Find unused dependencies",
		"查找未使用的依赖",
		"Found three packages that are not imported anywhere.",
		"发现了三个从未被导入的依赖。",
	],
];
const localized = computed(() =>
	suggestions.map(([en, zh, reply, replyZh]) => ({ label: t(en, zh), reply: t(reply, replyZh) }))
);
const text = ref("");
const turn = ref<{ prompt: string; index: number }>();
const form = ref<HTMLFormElement | null>(null);

function send(prompt: string) {
	turn.value = { prompt, index: localized.value.findIndex(({ label }) => label === prompt) };
	text.value = "";
}

function onEnter(event: KeyboardEvent) {
	if (event.shiftKey || event.isComposing || event.keyCode === 229) return;
	event.preventDefault();
	form.value?.requestSubmit();
}
</script>

<template>
	<section
		class="mx-auto grid w-full max-w-lg min-w-0 gap-4 px-4 py-6"
		:aria-label="t('Prompt suggestions', '提示词建议')"
	>
		<div aria-live="polite" class="grid min-w-0 gap-3">
			<template v-if="turn">
				<Message align="end"
					><MessageContent
						><Bubble align="end" variant="muted"
							><BubbleContent class="whitespace-pre-wrap">{{ turn.prompt }}</BubbleContent></Bubble
						></MessageContent
					></Message
				>
				<Message
					><MessageContent
						><p>
							{{
								localized[turn.index]?.reply ??
								t(
									"This demo only knows the suggested prompts. Pick one to see a sample reply.",
									"此演示只识别建议的提示词。选择一项即可查看示例回复。"
								)
							}}
						</p></MessageContent
					></Message
				>
			</template>
		</div>
		<div
			role="group"
			:aria-label="t('Suggested prompts', '建议的提示词')"
			class="flex min-w-0 [scrollbar-width:thin] gap-1.5 overflow-x-auto overscroll-x-contain pb-1"
		>
			<Button
				v-for="({ label }, index) in localized"
				:key="index"
				variant="outline"
				size="sm"
				shape="pill"
				class="shrink-0"
				@click="send(label)"
				>{{ label }}</Button
			>
		</div>
		<form ref="form" @submit.prevent="text.trim() && send(text.trim())">
			<InputGroup appearance="composer">
				<InputGroupTextarea
					v-model="text"
					name="message"
					:rows="2"
					:aria-label="t('Message', '消息')"
					:placeholder="t('Ask the agent to change your code…', '请助手修改你的代码…')"
					@keydown.enter="onEnter"
				/>
				<InputGroupAddon align="block-end">
					<InputGroupButton
						type="submit"
						size="icon-xs"
						shape="pill"
						variant="default"
						class="ms-auto"
						:disabled="!text.trim()"
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
