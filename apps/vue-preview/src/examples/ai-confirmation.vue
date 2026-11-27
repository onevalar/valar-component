<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@valar/vue-ui/item";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@valar/vue-ui/trace";
import { nextTick, ref, useTemplateRef, watch } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const text = (en: string, zh: string) => (props.chinese ? zh : en);
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
		:aria-label="text('Confirmation', '确认')"
		:lang="chinese ? 'zh-CN' : 'en'"
		class="grid w-full max-w-md gap-3 p-4 text-sm"
	>
		<Item v-if="decision === 'pending'" variant="outline" size="sm">
			<ItemMedia variant="icon" aria-hidden="true">›_</ItemMedia>
			<ItemContent class="basis-40">
				<ItemTitle>{{ text("Remove the sample build folder?", "移除示例构建目录？") }}</ItemTitle>
				<ItemDescription>{{
					text("This is a preview. No files will change.", "此操作仅用于预览，不会改动文件。")
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
			role="status"
			tabindex="-1"
			class="rounded-md focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
		>
			<Trace v-if="decision !== 'pending'">
				<TraceLine :status="decision === 'running' ? 'running' : undefined">
					<TraceIcon>›_</TraceIcon>
					<TraceTitle>{{
						decision === "running"
							? text("Simulating cleanup", "正在模拟清理")
							: decision === "approved"
								? text("Simulated cleanup completed", "模拟清理已完成")
								: text("Denied cleanup", "已拒绝清理")
					}}</TraceTitle>
				</TraceLine>
			</Trace>
		</div>
		<Button
			v-if="decision !== 'pending'"
			class="justify-self-start"
			size="sm"
			variant="outline"
			@click="reset"
			>{{ text("Reset", "重置") }}</Button
		>
	</section>
</template>
