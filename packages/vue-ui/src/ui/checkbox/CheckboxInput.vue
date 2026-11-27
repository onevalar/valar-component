<script setup lang="ts">
import { shallowRef, watch } from "vue";

const props = defineProps<{
	name: string;
	value?: unknown;
	checked: boolean;
	required?: boolean;
	disabled?: boolean;
}>();
const input = shallowRef<HTMLInputElement>();

watch(() => props.checked, checked => {
	const element = input.value;
	if (!element) return;
	// Keep Valar's observable native form events before the input's DOM update.
	// Mixed and checked are both successful controls and don't emit this pair.
	element.value = String(checked);
	element.dispatchEvent(new Event("input", { bubbles: true }));
	element.dispatchEvent(new Event("change", { bubbles: true }));
});
</script>

<template>
	<input
		ref="input"
		type="checkbox"
		:name="name"
		:value="value"
		:checked="checked"
		:required="required"
		:disabled="disabled"
		aria-hidden="true"
		data-hidden
		tabindex="-1"
		class="sr-only"
		style="top: -1px; left: -1px"
	/>
</template>
