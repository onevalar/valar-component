<script setup lang="ts">
import { SmileIcon } from "@lucide/vue";
import { computed, inject, ref, useId } from "vue";
import { iconControl, issuePortal } from "./controls.js";
import { isComposing } from "./editor-core.js";
import { emojiMatches, emojiName } from "./reaction-emoji.js";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

const props = defineProps<{ label: string; chinese: boolean }>();
const emit = defineEmits<{ select: [emoji: string] }>();
const portal = inject(issuePortal);
const headingId = useId();
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const open = ref(false);
const query = ref("");
const input = ref<HTMLInputElement>();
const trigger = ref<HTMLButtonElement>();
const results = ref<HTMLDivElement>();
const matches = computed(() => emojiMatches(query.value));
defineExpose({ focus: () => trigger.value?.focus() });

function pick(value: string) {
	emit("select", value);
	open.value = false;
}
function keys(event: KeyboardEvent) {
	if (isComposing(event) || event.altKey || event.metaKey || event.ctrlKey) return;
	const buttons = [...(results.value?.querySelectorAll("button") ?? [])];
	const index = buttons.indexOf(event.target as HTMLButtonElement);
	if (index < 0) {
		if (event.key === "Enter" && matches.value.length) {
			event.preventDefault();
			if (!event.repeat) pick(matches.value[0]);
		} else if (event.key === "ArrowDown" && buttons.length) {
			event.preventDefault();
			buttons[0].focus();
		}
		return;
	}
	const side = results.value && getComputedStyle(results.value).direction === "rtl" ? -1 : 1;
	const step = { ArrowLeft: -side, ArrowRight: side, ArrowUp: -8, ArrowDown: 8 }[event.key];
	if (!step) return;
	event.preventDefault();
	const next = index + step;
	if (event.key === "ArrowUp" && next < 0) input.value?.focus();
	else buttons[Math.min(Math.max(next, 0), buttons.length - 1)]?.focus();
}
function focusSearch(event: Event) {
	event.preventDefault();
	input.value?.focus({ preventScroll: true });
}
</script>

<template>
	<Popover
		:open="open"
		@update:open="
			(next) => {
				if (next) query = '';
				open = next;
			}
		"
	>
		<PopoverTrigger as-child>
			<button
				ref="trigger"
				type="button"
				:aria-label="label"
				:title="label"
				:class="[iconControl, 'size-7']"
			>
				<SmileIcon aria-hidden="true" />
			</button>
		</PopoverTrigger>
		<PopoverContent
			as-child
			appearance="surface"
			:portal-props="portal"
			align="end"
			class="w-[272px]! max-w-[calc(100vw-24px)] gap-0 p-0!"
			@open-auto-focus="focusSearch"
			@escape-key-down="
				(event: KeyboardEvent) => {
					if (isComposing(event)) event.preventDefault();
				}
			"
			@keydown="keys"
		>
			<div :aria-labelledby="headingId">
				<span :id="headingId" class="sr-only">{{ t("选择表情", "Choose emoji") }}</span>
				<input
					ref="input"
					v-model="query"
					data-slot="input"
					type="search"
					:aria-label="t('搜索表情', 'Search emoji')"
					:placeholder="t('搜索或粘贴表情…', 'Search or paste emoji…')"
					class="h-9 w-full min-w-0 rounded-t-xl border-b border-border bg-transparent px-3 text-xs focus:outline-1 focus:-outline-offset-1 focus:outline-ring"
				/>
				<div class="max-h-60 overflow-auto px-2 pt-2 pb-2.5">
					<template v-if="matches.length">
						<p class="px-1 pb-1 text-xs text-muted-foreground">
							{{ query.trim() ? t("搜索结果", "Search results") : t("常用表情", "Common emoji") }}
						</p>
						<div ref="results" class="grid grid-cols-8">
							<Button
								v-for="emoji in matches"
								:key="emoji"
								variant="ghost"
								size="icon-xs"
								:aria-label="emojiName(emoji, chinese)"
								:title="emojiName(emoji, chinese)"
								class="grid aspect-square size-auto place-items-center rounded text-base font-normal hover:bg-accent"
								@click="pick(emoji)"
								>{{ emoji }}</Button
							>
						</div>
					</template>
					<p v-else role="status" class="px-2 py-3 text-center text-xs text-muted-foreground">
						{{ t("没有匹配的表情", "No matching emoji") }}
					</p>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>
