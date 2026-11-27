<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/vue-ui/code-block";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@valar/vue-ui/item";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@valar/vue-ui/sheet";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/vue-ui/trace";
import { nextTick, ref, useTemplateRef, watch } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const text = (en: string, zh: string) => (props.chinese ? zh : en);
const manifest = JSON.stringify(
	{
		name: "sample-chat",
		private: true,
		scripts: { dev: "vite", check: "tsc --noEmit" },
		dependencies: { ai: "^7.0.0", "@ai-sdk/react": "^4.0.0" },
	},
	null,
	2
);
const decision = ref<"pending" | "running" | "approved" | "denied">("pending");
const status = useTemplateRef<HTMLDivElement>("status");
const denyButton = useTemplateRef<HTMLButtonElement>("denyButton");
watch(decision, (value, _, onCleanup) => {
	if (value !== "running") return;
	const timer = setTimeout(() => {
		decision.value = "approved";
	}, 650);
	onCleanup(() => clearTimeout(timer));
});

async function answer(approved: boolean) {
	decision.value = approved ? "running" : "denied";
	await nextTick();
	status.value?.focus();
}

async function reset() {
	decision.value = "pending";
	await nextTick();
	denyButton.value?.focus();
}
</script>

<template>
	<section
		:aria-label="text('Tool', '工具调用')"
		:lang="chinese ? 'zh-CN' : 'en'"
		class="grid w-full max-w-md gap-3 p-4 text-sm"
	>
		<Trace>
			<TraceCollapsible>
				<TraceCollapsibleTrigger
					><TraceLine
						><TraceIcon>›_</TraceIcon
						><TraceTitle>{{
							text("Ran node --version", "已运行 node --version")
						}}</TraceTitle></TraceLine
					></TraceCollapsibleTrigger
				>
				<TraceCollapsibleContent
					><CodeBlock size="sm"><CodeBlockContent wrap code="v24.22.2" /></CodeBlock
				></TraceCollapsibleContent>
			</TraceCollapsible>
			<TraceCollapsible default-open>
				<TraceCollapsibleTrigger
					><TraceLine status="error"
						><TraceIcon>›_</TraceIcon
						><TraceTitle>{{
							text("Failed to run pnpm --version", "运行 pnpm --version 失败")
						}}</TraceTitle></TraceLine
					></TraceCollapsibleTrigger
				>
				<TraceCollapsibleContent
					><CodeBlock size="sm" variant="destructive"
						><CodeBlockContent
							wrap
							:code="text('Command not found: pnpm', '找不到命令：pnpm')" /></CodeBlock
				></TraceCollapsibleContent>
			</TraceCollapsible>
			<Sheet>
				<SheetTrigger as-child>
					<Button variant="ghost" size="sm" class="w-fit max-w-full justify-start px-0">
						<TraceLine
							><TraceIcon>›_</TraceIcon
							><TraceTitle>{{ text("Read package.json", "已读取 package.json") }}</TraceTitle
							><TraceIcon>›</TraceIcon></TraceLine
						>
					</Button>
				</SheetTrigger>
				<SheetContent
					side="right"
					:close-label="text('Close output', '关闭输出')"
					:lang="chinese ? 'zh-CN' : 'en'"
				>
					<SheetHeader>
						<SheetTitle>package.json</SheetTitle>
						<SheetDescription>{{
							text("Recorded file output", "记录的文件输出")
						}}</SheetDescription>
					</SheetHeader>
					<CodeBlock class="mx-4 w-auto"
						><CodeBlockContent class="max-h-[60vh]" line-numbers wrap :code="manifest"
					/></CodeBlock>
				</SheetContent>
			</Sheet>
		</Trace>
		<Item v-if="decision === 'pending'" variant="outline" size="sm">
			<ItemMedia variant="icon" aria-hidden="true">›_</ItemMedia>
			<ItemContent class="basis-40">
				<ItemTitle>{{ text("Run npm --version?", "运行 npm --version？") }}</ItemTitle>
				<ItemDescription>{{
					text("Returns sample output only.", "仅返回示例输出。")
				}}</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button as-child size="sm" variant="outline"
					><button ref="denyButton" type="button" @click="answer(false)">
						{{ text("Deny", "拒绝") }}
					</button></Button
				>
				<Button size="sm" @click="answer(true)">{{ text("Approve", "批准") }}</Button>
			</ItemActions>
		</Item>
		<div
			ref="status"
			tabindex="-1"
			class="rounded-md focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
		>
			<Trace v-if="decision !== 'pending'">
				<TraceCollapsible v-if="decision === 'approved'" default-open>
					<TraceCollapsibleTrigger
						><TraceLine
							><TraceIcon>›_</TraceIcon
							><TraceTitle>{{
								text("Ran npm --version", "已运行 npm --version")
							}}</TraceTitle></TraceLine
						></TraceCollapsibleTrigger
					>
					<TraceCollapsibleContent
						><CodeBlock size="sm"><CodeBlockContent wrap code="11.6.2" /></CodeBlock
					></TraceCollapsibleContent>
				</TraceCollapsible>
				<TraceLine v-else :status="decision === 'running' ? 'running' : undefined"
					><TraceIcon>›_</TraceIcon
					><TraceTitle>{{
						decision === "running"
							? text("Running npm --version", "正在运行 npm --version")
							: text("Denied npm --version", "已拒绝运行 npm --version")
					}}</TraceTitle></TraceLine
				>
			</Trace>
		</div>
		<span class="sr-only" role="status">{{
			decision === "approved"
				? text("Fixture output is available.", "示例输出可用。")
				: decision === "denied"
					? text("Tool call denied.", "工具调用已拒绝。")
					: decision === "running"
						? text("Simulating tool output.", "正在模拟工具输出。")
						: ""
		}}</span>
		<Button
			v-if="decision !== 'pending'"
			class="justify-self-start"
			size="sm"
			variant="outline"
			@click="reset"
			>{{ text("Reset approval", "重置审批") }}</Button
		>
	</section>
</template>
