<script setup lang="ts">
import { Badge } from "@valar/vue-ui/badge";
import { Button } from "@valar/vue-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/vue-ui/code-block";
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
const stage = ref(2);
const done = computed(() => stage.value === 2);
const title = computed(() =>
	done.value
		? text("Ran the research subagent", "研究子代理已完成")
		: text("Running the research subagent", "研究子代理正在运行")
);
const steps = [
	{
		command: "grep -rn cacheKey scripts",
		output: "scripts/optimize-images.ts:14: const cacheKey = process.env.COMMIT_SHA",
	},
	{
		command: "sed -n 13,15p scripts/optimize-images.ts",
		output:
			'const cacheDir = ".next/cache/images"\nconst cacheKey = process.env.COMMIT_SHA\nconst cached = await restoreCache(cacheDir, cacheKey)',
	},
];
</script>

<template>
	<section
		:aria-label="text('Subagent', '子代理')"
		:lang="chinese ? 'zh-CN' : 'en'"
		class="grid w-full max-w-md gap-3 p-4 text-sm"
	>
		<Trace>
			<TraceLine v-if="stage === 0" status="running"
				><TraceIcon>◌</TraceIcon><TraceTitle>{{ title }}</TraceTitle></TraceLine
			>
			<TraceCollapsible v-else default-open>
				<TraceCollapsibleTrigger>
					<TraceLine :status="done ? undefined : 'running'">
						<TraceIcon>{{ done ? "✓" : "◌" }}</TraceIcon
						><TraceTitle>{{ title }}</TraceTitle>
						<TraceDescription v-if="done">{{ text("48s", "48 秒") }}</TraceDescription>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<TraceCollapsibleContent class="grid gap-2">
					<div class="flex flex-wrap gap-1.5">
						<Badge variant="secondary">{{
							text("Research model (fixture)", "研究模型（示例）")
						}}</Badge
						><Badge variant="outline">runCommand</Badge>
					</div>
					<p>
						{{
							text(
								"Find out why image optimization reruns on every deploy.",
								"查明为什么每次部署都会重新优化图片。"
							)
						}}
					</p>
					<Trace>
						<template v-for="({ command, output }, index) in steps" :key="command">
							<TraceLine v-if="index >= stage" status="running"
								><TraceIcon>◌</TraceIcon
								><TraceTitle class="wrap-anywhere whitespace-normal">{{
									text(`Running ${command}`, `正在运行 ${command}`)
								}}</TraceTitle></TraceLine
							>
							<TraceCollapsible v-else>
								<TraceCollapsibleTrigger
									><TraceLine
										><TraceIcon>✓</TraceIcon
										><TraceTitle class="wrap-anywhere whitespace-normal">{{
											text(`Ran ${command}`, `已运行 ${command}`)
										}}</TraceTitle></TraceLine
									></TraceCollapsibleTrigger
								>
								<TraceCollapsibleContent
									><CodeBlock size="sm"><CodeBlockContent wrap :code="output" /></CodeBlock
								></TraceCollapsibleContent>
							</TraceCollapsible>
						</template>
					</Trace>
					<p v-if="done">
						{{
							text(
								"The cache key uses the commit SHA, so every deployment misses the cache.",
								"缓存键使用提交 SHA，因此每次部署都未命中缓存。"
							)
						}}
					</p>
				</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
		<span class="sr-only" role="status">{{ title }}</span>
		<Button
			class="justify-self-start"
			size="sm"
			variant="outline"
			@click="stage = done ? 0 : stage + 1"
			>{{ done ? text("Replay", "重播") : text("Next step", "下一步") }}</Button
		>
	</section>
</template>
