<script setup lang="ts" generic="T extends string | string[] = string">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { ToggleGroupRoot, useForwardExpose, useForwardProps } from "reka-ui";
import type { AcceptableValue, ToggleGroupRootProps } from "reka-ui";
import { computed, provide, toRefs, type HTMLAttributes } from "vue";
import type { ToggleSize, ToggleVariant } from "../toggle";
import { toggleGroupStyle, type ToggleGroupAppearance } from "./context";

const props = withDefaults(defineProps<ToggleGroupRootProps<T> & {
	class?: HTMLAttributes["class"];
	appearance?: ToggleGroupAppearance;
	size?: ToggleSize;
	variant?: ToggleVariant;
	spacing?: number;
}>(), { appearance: "default", orientation: "horizontal", size: "default", variant: "default" });
const emit = defineEmits<{ "update:modelValue": [value: T] }>();
const forwarded = useForwardProps(reactiveOmit(props, "class", "appearance", "size", "variant", "spacing"));
const { forwardRef } = useForwardExpose();
const spacing = computed(() => props.spacing ?? (props.appearance === "toolbar" ? 1.5 : 0));
provide(toggleGroupStyle, { ...toRefs(props), spacing });

function update(value: AcceptableValue | AcceptableValue[] | undefined) {
	// Reka clears a single selection to undefined. Valar's public empty scalar is "".
	emit("update:modelValue", (value ?? "") as T);
}
</script>

<template>
	<ToggleGroupRoot :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="toggle-group" :data-appearance="appearance"
		:data-orientation="orientation" :data-size="size" :data-variant="variant" :data-spacing="spacing" :style="{ '--gap': spacing }"
		:class="cn('cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch', props.class)" @update:model-value="update">
		<slot v-bind="state" />
	</ToggleGroupRoot>
</template>
