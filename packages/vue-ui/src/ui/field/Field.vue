<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import { fieldVariants, type FieldAppearance, type FieldOrientation } from ".";

const props = withDefaults(defineProps<{
	class?: HTMLAttributes["class"];
	appearance?: FieldAppearance;
	orientation?: FieldOrientation;
}>(), { appearance: "default", orientation: "vertical" });
</script>

<template>
	<div role="group" data-slot="field" :data-orientation="orientation" :data-appearance="appearance" :class="cn(fieldVariants({ appearance, orientation }), props.class)">
		<slot />
	</div>
</template>
