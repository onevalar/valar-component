<script setup lang="ts" generic="T extends string | number = string">
import { Tabs as SdkTabs } from "@ui-sdk/vue/tabs";
import { cn } from "cn";
import { useDirection, useForwardExpose } from "reka-ui";
import type { TabsRootEmits, TabsRootProps } from "reka-ui";
import { computed, provide, ref, shallowRef, type HTMLAttributes } from "vue";
import ToggleTrigger from "../../lib/ToggleTrigger";
import { tabsContext, tabsValue } from "./context";

const props = withDefaults(defineProps<TabsRootProps<T> & {
	class?: HTMLAttributes["class"];
	loop?: boolean;
	disabled?: boolean;
}>(), { orientation: "horizontal", loop: false, disabled: false, unmountOnHide: true });
const emit = defineEmits<TabsRootEmits<T>>();
const { forwardRef } = useForwardExpose();
const dir = useDirection(computed(() => props.dir));
const local = shallowRef(props.defaultValue);
const model = computed(() => props.modelValue ?? local.value);
const listLoop = ref<boolean>();
provide(tabsContext, {
	listLoop,
	disabled: computed(() => props.disabled),
	unmountOnHide: computed(() => props.unmountOnHide),
});

function update(next: string | null) {
	if (props.disabled || next === null) return;
	const value = (next.startsWith("n:") ? Number(next.slice(2)) : next.slice(2)) as T;
	if (props.modelValue === undefined) local.value = value;
	emit("update:modelValue", value);
}
</script>

<template>
	<SdkTabs :value="model === undefined ? null : tabsValue(model)" :orientation="orientation" :dir="dir"
		:activation="activationMode" :loop="listLoop ?? loop" @update:value="update"
		:data-disabled="disabled ? '' : undefined" :class="cn('cn-tabs group/tabs flex min-w-0 data-horizontal:flex-col', props.class)">
		<template #render="{ props: part }">
			<ToggleTrigger :ref="forwardRef" :as="as ?? 'div'" :as-child="asChild" :part="{ ...part, 'data-slot': 'tabs' }">
				<slot :model-value="model" />
			</ToggleTrigger>
		</template>
	</SdkTabs>
</template>
