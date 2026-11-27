<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceDescription,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/vue-ui/trace";
import { computed, ref } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const text = (en: string, zh: string) => (props.chinese ? zh : en);
const done = ref(1);
const steps = computed(() => [
	text("Add dark theme tokens", "添加深色主题令牌"),
	text("Read the saved theme on the server", "在服务器读取已保存的主题"),
	text("Add a toggle to Settings", "在设置中添加切换开关"),
	text("Check contrast on the charts", "检查图表对比度"),
]);
const complete = computed(() => done.value === steps.value.length);
const progress = computed(() =>
	text(
		`${done.value} of ${steps.value.length} done`,
		`已完成 ${done.value}/${steps.value.length} 步`
	)
);
</script>

<template>
	<section
		:aria-label="text('Plan', '计划')"
		:lang="chinese ? 'zh-CN' : 'en'"
		class="grid w-full max-w-md gap-3 p-4 text-sm"
	>
		<Trace>
			<TraceCollapsible default-open>
				<TraceCollapsibleTrigger>
					<TraceLine :status="complete ? undefined : 'running'">
						<TraceIcon>{{ complete ? "✓" : "↳" }}</TraceIcon>
						<TraceTitle class="whitespace-normal">{{
							text("Plan: add dark mode", "计划：添加深色模式")
						}}</TraceTitle>
						<TraceDescription>{{ progress }}</TraceDescription>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<TraceCollapsibleContent class="grid gap-2">
					<p>
						{{
							text(
								"Save the theme in a cookie so the page renders in the right colors on load.",
								"将主题保存在 Cookie 中，让页面初次加载时就显示正确的配色。"
							)
						}}
					</p>
					<Trace role="list">
						<TraceLine
							v-for="(step, index) in steps"
							:key="index"
							role="listitem"
							:status="index === done ? 'running' : index > done ? 'pending' : undefined"
						>
							<TraceIcon>{{ index < done ? "✓" : index === done ? "◉" : "○" }}</TraceIcon>
							<TraceTitle class="whitespace-normal"
								>{{ step
								}}<span class="sr-only">
									—
									{{
										index < done
											? text("Done", "已完成")
											: index === done
												? text("In progress", "进行中")
												: text("Pending", "待处理")
									}}</span
								></TraceTitle
							>
						</TraceLine>
					</Trace>
				</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
		<span class="sr-only" role="status">{{ progress }}</span>
		<Button
			class="justify-self-start"
			size="sm"
			variant="outline"
			@click="done = complete ? 0 : done + 1"
			>{{ complete ? text("Replay", "重播") : text("Complete next step", "完成当前步骤") }}</Button
		>
	</section>
</template>
