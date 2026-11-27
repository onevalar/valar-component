<script setup lang="ts">
import { Bubble, BubbleContent } from "@valar/vue-ui/bubble";
import { Button } from "@valar/vue-ui/button";
import { Marker, MarkerContent } from "@valar/vue-ui/marker";
import { Message, MessageContent } from "@valar/vue-ui/message";
import { computed, nextTick, ref, useTemplateRef } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const text = (en: string, zh: string) => (props.chinese ? zh : en);
const thread = computed(() => [
	{
		id: "rename",
		question: text("Rename the button component to Action.", "将按钮组件重命名为 Action。"),
		answer: text(
			"Renamed Button to Action in components/ui/button.tsx.",
			"已在 components/ui/button.tsx 中将 Button 重命名为 Action。"
		),
		checkpoint: text("Button renamed", "按钮已重命名"),
	},
	{
		id: "docs",
		question: text("Update the docs to match.", "同步更新文档。"),
		answer: text("Updated the Button page to say Action.", "已将 Button 文档页更新为 Action。"),
	},
]);
const visible = ref(thread.value.length);
const restoreButtons = useTemplateRef<HTMLButtonElement[]>("restoreButtons");
const continueButton = useTemplateRef<HTMLButtonElement>("continueButton");

async function changeThread(length: number) {
	visible.value = length;
	await nextTick();
	if (length < thread.value.length) continueButton.value?.focus();
	else restoreButtons.value?.[0]?.focus();
}
</script>

<template>
	<section
		:aria-label="text('Checkpoint', '检查点')"
		:lang="chinese ? 'zh-CN' : 'en'"
		class="grid w-full max-w-md gap-3 p-4 text-sm"
	>
		<template
			v-for="({ id, question, answer, checkpoint }, index) in thread.slice(0, visible)"
			:key="id"
		>
			<Message align="end"
				><MessageContent
					><Bubble align="end" variant="muted"
						><BubbleContent>{{ question }}</BubbleContent></Bubble
					></MessageContent
				></Message
			>
			<Message
				><MessageContent
					><p class="wrap-anywhere">{{ answer }}</p></MessageContent
				></Message
			>
			<Marker v-if="checkpoint" variant="separator">
				<MarkerContent class="inline-flex flex-wrap items-center gap-2">
					{{ checkpoint }}
					<Button
						v-if="index + 1 < visible"
						as-child
						size="xs"
						variant="outline"
						class="text-foreground"
					>
						<button
							ref="restoreButtons"
							type="button"
							:aria-label="text(`Restore to ${checkpoint}`, `恢复至：${checkpoint}`)"
							@click="changeThread(index + 1)"
						>
							{{ text("Restore", "恢复") }}
						</button>
					</Button>
				</MarkerContent>
			</Marker>
		</template>
		<Button
			v-if="visible < thread.length"
			as-child
			size="sm"
			variant="outline"
			class="justify-self-start"
		>
			<button ref="continueButton" type="button" @click="changeThread(visible + 1)">
				{{ text("Continue", "继续") }}
			</button>
		</Button>
		<span class="sr-only" role="status">{{
			visible < thread.length
				? text(
						"Restored the checkpoint. Later messages were removed.",
						"已恢复检查点并移除之后的消息。"
					)
				: ""
		}}</span>
	</section>
</template>
