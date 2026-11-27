<script setup lang="ts">
import { SearchIcon } from "@lucide/vue";
import { cn } from "cn";
import { computed, watch } from "vue";
import { useCommand } from "./context";
import { InputGroup, InputGroupAddon } from "../input-group";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<{
	modelValue?: string;
	defaultValue?: string;
	disabled?: boolean;
	class?: HTMLAttributes["class"];
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const { input, query, label, listId, activeId, onInputKeydown } = useCommand();

query.value = props.modelValue ?? props.defaultValue ?? "";
watch(
	() => props.modelValue,
	(value) => {
		if (value !== undefined) query.value = value;
	},
	{ flush: "sync" }
);

const text = computed({
	get: () => query.value,
	set: (value: string) => {
		if (value === query.value) return;
		if (props.modelValue === undefined) query.value = value;
		emit("update:modelValue", value);
	},
});

let composing = false;
function startComposition() {
	composing = true;
}
function finishComposition() {
	composing = false;
}

function onKeydown(event: KeyboardEvent) {
	if (composing || event.isComposing || event.keyCode === 229) {
		// Let the IME consume the key without triggering the overlay or host shortcuts.
		event.stopPropagation();
		return;
	}
	onInputKeydown(event);
}
</script>

<template>
	<div data-slot="command-input-wrapper" class="cn-command-input-wrapper">
		<InputGroup class="cn-command-input-group">
			<input
				ref="input"
				v-model="text"
				:aria-label="label ?? '搜索命令'"
				v-bind="$attrs"
				:disabled="disabled"
				data-slot="command-input"
				role="combobox"
				type="text"
				autocomplete="off"
				aria-autocomplete="list"
				aria-expanded="true"
				:aria-controls="listId"
				:aria-activedescendant="activeId"
				:class="
					cn(
						'cn-command-input cn-input-group-input min-w-0 flex-1 outline-hidden focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 in-data-[command-compact]:focus-visible:outline-solid! in-data-[command-dialog]:focus-visible:outline-solid! in-data-[command-dialog]:in-data-[command-close]:pe-11! in-data-[slot=combobox-content]:focus-visible:outline-solid!',
						props.class
					)
				"
				@compositionstart="startComposition"
				@compositionend="finishComposition"
				@change="finishComposition"
				@keydown="onKeydown"
			/>
			<InputGroupAddon aria-hidden="true">
				<SearchIcon class="cn-command-input-icon" />
			</InputGroupAddon>
		</InputGroup>
	</div>
</template>
