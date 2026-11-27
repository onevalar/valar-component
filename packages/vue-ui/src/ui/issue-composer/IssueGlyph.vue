<script setup lang="ts">
import { CheckIcon, XIcon } from "@lucide/vue";
import { computed } from "vue";
import type { IssueStatus, IssuePriority } from "./issue-options";

const props = defineProps<{ value: IssueStatus | IssuePriority }>();
const statusStyles = {
	backlog: "border-dashed border-current",
	todo: "border-current",
	progress:
		"border-amber-500 bg-[linear-gradient(90deg,var(--color-amber-500)_50%,transparent_50%)]",
	done: "border-indigo-500 bg-indigo-500 text-white",
	canceled: "border-current",
};
const levels = { high: 3, medium: 2, low: 1 };
const statusStyle = computed(() =>
	props.value in statusStyles ? statusStyles[props.value as IssueStatus] : undefined
);
</script>

<template>
	<span
		v-if="statusStyle"
		class="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border"
		:class="statusStyle"
		aria-hidden="true"
	>
		<CheckIcon v-if="value === 'done'" class="size-2.5" />
		<XIcon v-else-if="value === 'canceled'" class="size-2.5" />
	</span>
	<span v-else class="inline-flex size-3.5 shrink-0 items-center justify-center" aria-hidden="true">
		<span
			v-if="value === 'urgent'"
			class="grid size-3.5 place-items-center rounded-[3px] bg-orange-600 text-[10px] leading-none font-semibold text-white"
			>!</span
		>
		<span v-else-if="value === 'none'" class="text-xs leading-none tracking-tighter">···</span>
		<template v-else-if="value === 'high' || value === 'medium' || value === 'low'">
			<span
				v-for="bar in 3"
				:key="bar"
				class="mx-px w-0.5 self-end rounded-full bg-current"
				:style="{ height: `${3 + bar * 3}px`, opacity: bar <= levels[value] ? 1 : 0.25 }"
			/>
		</template>
	</span>
</template>
