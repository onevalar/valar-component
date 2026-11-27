<script setup lang="ts">
import { Radio, RadioIndicator } from "@ui-sdk/vue/radio";
import { cn } from "cn";
import { shallowRef, type Component, type ComponentPublicInstance, type HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
	defineProps<{
		value: string;
		disabled?: boolean;
		as?: string | Component;
		class?: HTMLAttributes["class"];
	}>(),
	{ as: "button" }
);
const emit = defineEmits<{ keydown: [event: KeyboardEvent] }>();
const element = shallowRef<HTMLElement | null>(null);
defineExpose({
	get $el() {
		return element.value;
	},
});

function itemProps(part: Record<string, unknown>) {
	return {
		...part,
		type: props.as === "button" ? part.type : undefined,
		ref: (node: Element | ComponentPublicInstance | null) => {
			(part.ref as ((node: unknown) => void) | undefined)?.(node);
			const root = node && "$el" in node ? node.$el : node;
			element.value = root instanceof HTMLElement ? root : null;
		},
	};
}

function keydown(event: KeyboardEvent) {
	emit("keydown", event);
	const horizontal =
		element.value?.closest('[data-slot="radio-group"]')?.getAttribute("aria-orientation") ===
		"horizontal";
	// The SDK otherwise handles both arrow axes and submits on Enter.
	const { key } = event;
	if (
		key === "Enter" ||
		(horizontal
			? key === "ArrowUp" || key === "ArrowDown"
			: key === "ArrowLeft" || key === "ArrowRight")
	) {
		event.preventDefault();
	}
}
</script>

<template>
	<Radio
		v-bind="$attrs"
		:value="value"
		:disabled="disabled"
		:class="
			cn(
				'cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50',
				props.class
			)
		"
		@keydown="keydown"
	>
		<template #render="{ props: part, state }">
			<component
				:is="as"
				v-bind="itemProps(part)"
				:disabled="state.disabled"
				:value="value"
				data-slot="radio-group-item"
				:data-state="state.checked ? 'checked' : 'unchecked'"
			>
				<slot :checked="state.checked" :required="state.required" :disabled="state.disabled">
					<RadioIndicator keep-mounted class="cn-radio-group-indicator" aria-hidden="true">
						<template #render="{ props: indicator }">
							<span v-bind="indicator" data-slot="radio-group-indicator">
								<span v-if="state.checked" class="cn-radio-group-indicator-icon" />
							</span>
						</template>
					</RadioIndicator>
				</slot>
			</component>
		</template>
	</Radio>
</template>
