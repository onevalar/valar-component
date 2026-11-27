<script setup lang="ts">
import { Bubble, BubbleContent } from "@valar/vue-ui/bubble";
import { Button } from "@valar/vue-ui/button";
import { Message, MessageContent } from "@valar/vue-ui/message";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleTrigger,
	TraceCollapsibleContent,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/vue-ui/trace";
import { computed, ref, watch } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const t = (english: string, zh: string) => (props.chinese ? zh : english);
const locale = computed(() => (props.chinese ? 1 : 0));
const tasks = [
	{
		title: ["Add a dark variant to the theme tokens", "为主题令牌添加深色变体"],
		detail: [
			"Set surface, border, and text values for both modes.",
			"为浅色和深色模式分别设置表面、边框和文字颜色。",
		],
	},
	{ title: ["Read the theme from a cookie", "从 Cookie 读取主题"] },
	{ title: ["Add a toggle to the settings page", "在设置页添加开关"] },
	{
		title: ["Check contrast on the charts", "检查图表对比度"],
		detail: [
			"Verify chart labels and series in both modes.",
			"在两种模式下验证图表标签和数据系列。",
		],
	},
];
const completed = ref(tasks.length);
const running = computed(() => completed.value < tasks.length);
const sections = computed(() => [
	{
		done: false,
		label: t(`${tasks.length - completed.value} to do`, `${tasks.length - completed.value} 项待办`),
	},
	{ done: true, label: t(`${completed.value} completed`, `${completed.value} 项已完成`) },
]);

watch(completed, (count, _, onCleanup) => {
	if (count === tasks.length) return;
	const timer = setTimeout(() => (completed.value = count + 1), 1400);
	onCleanup(() => clearTimeout(timer));
});
</script>

<template>
	<section
		:aria-label="t('Agent queue', '助手任务队列')"
		class="mx-auto flex w-full max-w-md min-w-0 flex-col gap-4 px-4 py-6 text-sm"
	>
		<Message align="end"
			><MessageContent
				><Bubble align="end" variant="muted"
					><BubbleContent>{{
						t("Add dark mode to the settings page.", "为设置页面添加深色模式。")
					}}</BubbleContent></Bubble
				></MessageContent
			></Message
		>
		<Message
			><MessageContent class="gap-3">
				<Trace>
					<TraceCollapsible v-for="{ done, label } in sections" :key="String(done)" default-open>
						<TraceCollapsibleTrigger
							><TraceLine
								><TraceIcon>{{ done ? "✓" : "≡" }}</TraceIcon
								><TraceTitle>{{ label }}</TraceTitle></TraceLine
							></TraceCollapsibleTrigger
						>
						<TraceCollapsibleContent>
							<Trace>
								<template v-for="({ title, detail }, index) in tasks" :key="index">
									<component
										:is="detail ? TraceCollapsible : 'div'"
										v-if="index < completed === done"
									>
										<component :is="detail ? TraceCollapsibleTrigger : 'div'">
											<TraceLine :status="index === completed ? 'running' : undefined">
												<TraceIcon
													><svg
														viewBox="0 0 16 16"
														fill="none"
														stroke="currentColor"
														stroke-width="1.25"
													>
														<circle cx="8" cy="8" r="6" />
														<path v-if="done" d="m5 8 2 2 4-4" />
														<circle
															v-else-if="index === completed"
															cx="8"
															cy="8"
															r="2"
															fill="currentColor"
															stroke="none"
														/></svg
												></TraceIcon>
												<TraceTitle class="whitespace-normal"
													>{{ title[locale]
													}}<span v-if="index === completed" class="sr-only">
														· {{ t("In progress", "进行中") }}</span
													></TraceTitle
												>
											</TraceLine>
										</component>
										<TraceCollapsibleContent v-if="detail">{{
											detail[locale]
										}}</TraceCollapsibleContent>
									</component>
								</template>
								<p v-if="done ? completed === 0 : !running" class="text-xs text-muted-foreground">
									{{
										done
											? t("Nothing completed yet.", "尚无已完成的任务。")
											: t("No remaining tasks.", "没有剩余任务。")
									}}
								</p>
							</Trace>
						</TraceCollapsibleContent>
					</TraceCollapsible>
				</Trace>
				<p role="status">
					{{
						running
							? t(
									`${completed} of ${tasks.length} tasks completed.`,
									`已完成 ${completed}/${tasks.length} 项任务。`
								)
							: t(
									"Dark mode is in. The toggle is under Settings → Appearance.",
									"已添加深色模式。开关位于「设置 → 外观」。"
								)
					}}
				</p>
			</MessageContent></Message
		>
		<Button
			variant="outline"
			size="sm"
			class="self-start"
			:aria-disabled="running"
			@click="!running && (completed = 0)"
		>
			{{ running ? t("Replaying…", "正在重播…") : t("Replay", "重播") }}
		</Button>
	</section>
</template>
