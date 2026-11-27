<script setup lang="ts">
import { Toggle as SdkToggle } from "@ui-sdk/vue/toggle";
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { ToggleEmits, ToggleProps } from "reka-ui";
import { shallowRef, type HTMLAttributes } from "vue";
import ToggleTrigger from "../../lib/ToggleTrigger";
import { toggleVariants, type ToggleSize, type ToggleVariant } from ".";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ToggleProps & {
	class?: HTMLAttributes["class"];
	size?: ToggleSize;
	variant?: ToggleVariant;
}>(), { size: "default", variant: "default", defaultValue: false, modelValue: undefined });
const emit = defineEmits<ToggleEmits>();
const { forwardRef } = useForwardExpose();
const element = shallowRef<HTMLElement | null>(null);
</script>

<template>
	<SdkToggle v-bind="$attrs" :model-value="modelValue === null ? false : modelValue" :default-pressed="defaultValue" :disabled="disabled" data-slot="toggle"
		:data-size="size" :data-variant="variant" :class="cn(toggleVariants({ size, variant }), props.class)"
		@update:model-value="emit('update:modelValue', $event)">
		<template #render="{ props: part, state }">
			<ToggleTrigger :ref="forwardRef" :as="as" :as-child="asChild" :set-element="value => element = value"
				:part="{ ...part, 'data-state': state.pressed ? 'on' : 'off' }">
				<slot :pressed="state.pressed" :model-value="modelValue === null ? null : state.pressed"
					:state="state.pressed ? 'on' : 'off'" :disabled="state.disabled" />
			</ToggleTrigger>
			<input v-if="name && (!element || element.closest('form'))" type="checkbox" :name="name" value="true"
				:checked="state.pressed" :required="required" :disabled="state.disabled" aria-hidden="true" tabindex="-1" class="sr-only" />
		</template>
	</SdkToggle>
</template>
