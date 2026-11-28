<script setup lang="ts">
import { MenuGroup as SdkGroup } from "@ui-sdk/vue/menu";
import { computed, provide, ref } from "vue";
import { checkboxGroupKey, inMenuGroupKey } from "./parts.js";

const props = defineProps<{ modelValue?: string[]; defaultValue?: string[] }>();
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();
const local = ref(props.defaultValue ?? []);
const values = computed(() => props.modelValue ?? local.value);

provide(inMenuGroupKey, true);
provide(checkboxGroupKey, {
	values,
	set(value, checked) {
		if (values.value.includes(value) === checked) return;
		const next = checked ? [...values.value, value] : values.value.filter((item) => item !== value);
		local.value = next;
		emit("update:modelValue", next);
	},
});
</script>

<template>
	<SdkGroup>
		<template #render="{ props: part }">
			<div v-bind="part" data-slot="dropdown-menu-checkbox-group">
				<slot :model-value="values" />
			</div>
		</template>
	</SdkGroup>
</template>
