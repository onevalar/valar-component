<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@valar/vue-ui/hover-card";
import { Progress } from "@valar/vue-ui/progress";
import { computed, ref, useId } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const limit = 128_000;
const usage = [
	{ en: "Input", zh: "输入", value: 8420 },
	{ en: "Output", zh: "输出", value: 1260 },
	{ en: "Reasoning", zh: "推理", value: 980 },
];
const used = usage.reduce((total, row) => total + row.value, 0);
const percent = Math.round((used / limit) * 100);
const lang = computed(() => (props.chinese ? "zh-CN" : "en"));
const number = computed(() => new Intl.NumberFormat(lang.value));
const panelId = useId();
const triggerId = `${panelId}-trigger`;
const open = ref(false);
const pinned = ref(false);

function dismiss() {
	pinned.value = false;
	open.value = false;
}
function dismissOutside(event: CustomEvent<{ originalEvent: PointerEvent }>) {
	const target = event.detail.originalEvent.target;
	if (target instanceof Element && target.closest("button")?.id === triggerId) {
		event.preventDefault();
	} else {
		dismiss();
	}
}
function togglePinned() {
	if (pinned.value) dismiss();
	else {
		pinned.value = true;
		open.value = true;
	}
}
</script>

<template>
	<div :lang="lang" class="flex w-full min-w-0 justify-center py-12">
		<HoverCard
			:open="open"
			:open-delay="10"
			:close-delay="100"
			@update:open="
				(next) => {
					if (!pinned) open = next;
				}
			"
		>
			<HoverCardTrigger as-child>
				<Button
					:id="triggerId"
					variant="outline"
					size="sm"
					:aria-expanded="open"
					:aria-controls="open ? panelId : undefined"
					@click="togglePinned"
				>
					{{ chinese ? `已用 ${percent}% 上下文` : `${percent}% context` }}
				</Button>
			</HoverCardTrigger>
			<HoverCardContent
				:id="panelId"
				:lang="lang"
				class="grid w-64 gap-3"
				@escape-key-down="dismiss"
				@pointer-down-outside="dismissOutside"
			>
				<div class="flex justify-between gap-3">
					<span class="font-medium">{{ chinese ? "上下文" : "Context" }}</span>
					<span class="text-muted-foreground tabular-nums"
						>{{ number.format(used) }} / {{ number.format(limit) }}</span
					>
				</div>
				<Progress :value="percent" :aria-label="chinese ? '已用上下文' : 'Context used'" />
				<dl class="grid gap-1">
					<div v-for="row in usage" :key="row.en" class="flex justify-between gap-3">
						<dt class="text-muted-foreground">{{ chinese ? row.zh : row.en }}</dt>
						<dd class="tabular-nums">{{ number.format(row.value) }}</dd>
					</div>
				</dl>
			</HoverCardContent>
		</HoverCard>
	</div>
</template>
