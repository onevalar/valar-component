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
const phase = ref(2);
const open = ref<boolean>();
const done = computed(() => phase.value === 2);
const observation = computed(() =>
	text("Installing and compiling each take less than one minute.", "安装与编译各耗时不到一分钟。")
);
const conclusion = computed(() =>
	text(
		"Image optimization takes nearly four minutes because every deploy misses the cache.",
		"每次部署都未命中缓存，图片优化耗时接近四分钟。"
	)
);
function advance() {
	if (done.value) {
		open.value = undefined;
		phase.value = 0;
	} else phase.value++;
}
</script>

<template>
	<section
		:aria-label="text('Reasoning', '推理')"
		:lang="chinese ? 'zh-CN' : 'en'"
		class="grid w-full max-w-md gap-3 p-4 text-sm"
	>
		<Trace>
			<TraceLine v-if="phase === 0" status="running"
				><TraceIcon>◌</TraceIcon
				><TraceTitle>{{ text("Thinking", "正在思考") }}</TraceTitle></TraceLine
			>
			<TraceCollapsible v-else :open="open ?? !done" @update:open="open = $event">
				<TraceCollapsibleTrigger>
					<TraceLine :status="done ? undefined : 'running'">
						<TraceIcon>{{ done ? "✓" : "◌" }}</TraceIcon>
						<TraceTitle>{{
							done ? text("Thought", "已完成思考") : text("Thinking", "正在思考")
						}}</TraceTitle>
						<TraceDescription v-if="done">{{ text("12s", "12 秒") }}</TraceDescription>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<TraceCollapsibleContent class="whitespace-pre-wrap">{{
					done ? `${observation}\n\n${conclusion}` : observation
				}}</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
		<p role="status" class="text-muted-foreground">
			{{
				done
					? text("Image optimization is the bottleneck.", "图片优化是部署瓶颈。")
					: text("Replaying a recorded reasoning summary.", "正在回放推理摘要。")
			}}
		</p>
		<Button class="justify-self-start" size="sm" variant="outline" @click="advance">{{
			done ? text("Replay", "重播") : text("Next step", "下一步")
		}}</Button>
	</section>
</template>
