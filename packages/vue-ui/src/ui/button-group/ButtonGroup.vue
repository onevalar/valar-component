<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import { buttonGroupVariants, type ButtonGroupOrientation, type ButtonGroupVariant } from ".";

const props = withDefaults(defineProps<{
	class?: HTMLAttributes["class"];
	orientation?: ButtonGroupOrientation;
	variant?: ButtonGroupVariant;
}>(), { orientation: "horizontal", variant: "default" });
</script>

<template>
	<div role="group" data-slot="button-group" :data-orientation="orientation" :data-variant="variant"
		:class="cn(buttonGroupVariants({ orientation, variant }), props.class)"><slot /></div>
</template>
