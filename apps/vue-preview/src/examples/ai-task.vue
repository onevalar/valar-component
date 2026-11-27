<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/vue-ui/trace";
import { computed, ref } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const text = (en: string, zh: string) => (props.chinese ? zh : en);
const stage = ref(0);
const open = ref<boolean>();
const running = computed(() => stage.value < 2);
const title = computed(() =>
	running.value
		? text("Updating the page metadata", "正在更新页面元数据")
		: text("Failed to update the page metadata", "更新页面元数据失败")
);
function advance() {
	if (running.value) stage.value++;
	else {
		open.value = undefined;
		stage.value = 0;
	}
}
</script>

<template>
	<section
		:aria-label="text('Task', '任务')"
		:lang="chinese ? 'zh-CN' : 'en'"
		class="grid w-full max-w-md gap-3 p-4 text-sm"
	>
		<Trace>
			<TraceCollapsible>
				<TraceCollapsibleTrigger
					><TraceLine
						><TraceIcon>✓</TraceIcon
						><TraceTitle>{{
							text("Found the project files", "已找到项目文件")
						}}</TraceTitle></TraceLine
					></TraceCollapsibleTrigger
				>
				<TraceCollapsibleContent>
					<Trace>
						<TraceLine
							><TraceTitle>{{
								text("Searched for generateMetadata", "已搜索 generateMetadata")
							}}</TraceTitle></TraceLine
						>
						<TraceLine
							><TraceTitle>{{
								text("Read app/layout.tsx", "已读取 app/layout.tsx")
							}}</TraceTitle></TraceLine
						>
					</Trace>
				</TraceCollapsibleContent>
			</TraceCollapsible>
			<TraceCollapsible :open="open ?? running" @update:open="open = $event">
				<TraceCollapsibleTrigger
					><TraceLine :status="running ? 'running' : 'error'"
						><TraceIcon>{{ running ? "◌" : "!" }}</TraceIcon
						><TraceTitle>{{ title }}</TraceTitle></TraceLine
					></TraceCollapsibleTrigger
				>
				<TraceCollapsibleContent>
					<Trace>
						<TraceLine :status="stage === 0 ? 'running' : undefined"
							><TraceIcon>{{ stage === 0 ? "◌" : "✓" }}</TraceIcon
							><TraceTitle>{{
								stage === 0
									? text("Editing app/layout.tsx", "正在编辑 app/layout.tsx")
									: text("Edited app/layout.tsx", "已编辑 app/layout.tsx")
							}}</TraceTitle></TraceLine
						>
						<TraceLine v-if="stage > 0" :status="running ? 'running' : 'error'"
							><TraceIcon>{{ running ? "◌" : "!" }}</TraceIcon
							><TraceTitle>{{
								running
									? text("Editing app/page.tsx", "正在编辑 app/page.tsx")
									: text("Could not edit app/page.tsx", "无法编辑 app/page.tsx")
							}}</TraceTitle></TraceLine
						>
					</Trace>
				</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
		<p class="text-muted-foreground" role="status">
			{{
				running
					? text("The next step appears only after it starts.", "步骤开始后才会显示。")
					: text(
							"The sample page was read-only. No files were changed.",
							"示例页面为只读，未修改任何文件。"
						)
			}}
		</p>
		<Button class="justify-self-start" size="sm" variant="outline" @click="advance">{{
			running ? text("Next step", "下一步") : text("Replay", "重播")
		}}</Button>
	</section>
</template>
