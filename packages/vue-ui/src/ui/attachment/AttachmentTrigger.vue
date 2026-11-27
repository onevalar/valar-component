<script setup lang="ts">
import { Button as SdkButton } from "@ui-sdk/vue/button";
import { cn } from "cn";
import { computed, type HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		type?: "button" | "submit" | "reset";
		href?: string;
		disabled?: boolean;
		tabindex?: HTMLAttributes["tabindex"];
	}>(),
	{ type: "button" }
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const link = computed(() => props.href !== undefined);

function onClick(event: MouseEvent) {
	if (props.disabled) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}
	emit("click", event);
}
</script>

<template>
	<!-- Compose a DialogTrigger onto this control, keeping actions as siblings. -->
	<component
		:is="link ? 'a' : SdkButton"
		v-bind="$attrs"
		data-slot="attachment-trigger"
		:class="cn('cn-attachment-trigger rounded-[inherit] disabled:cursor-default', props.class)"
		:href="link && !disabled ? href : undefined"
		:type="link ? undefined : type"
		:disabled="link ? undefined : disabled"
		:role="link && disabled ? 'link' : $attrs.role"
		:aria-disabled="link && disabled ? true : $attrs['aria-disabled']"
		:tabindex="link && disabled ? -1 : tabindex"
		@click="onClick"
	>
		<slot />
		<template v-if="!link" #render="{ props: part }">
			<button v-bind="part" data-slot="attachment-trigger"><slot /></button>
		</template>
	</component>
</template>
