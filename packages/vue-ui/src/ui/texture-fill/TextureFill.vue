<script setup lang="ts">
import { cn } from "cn";
import { type HTMLAttributes, useTemplateRef, watch } from "vue";
import { createTextureFill, type FillTexture } from "./canvas.js";

export type TextureFillProps = {
	/** Finite percentage. The canvas is decorative; provide an accessible reading separately. */
	value: number;
	texture: FillTexture;
	intro?: boolean;
	class?: HTMLAttributes["class"];
};

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<TextureFillProps>(), { intro: false });
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
let renderer: ReturnType<typeof createTextureFill> | undefined;

watch(
	[canvas, () => props.texture],
	([element, texture], _previous, onCleanup) => {
		if (!element?.parentElement) return;
		const instance = createTextureFill(
			element.parentElement,
			element,
			texture,
			props.value,
			props.intro
		);
		renderer = instance;
		onCleanup(() => {
			instance.destroy();
			renderer = undefined;
		});
	},
	{ flush: "post" }
);
watch(
	() => props.value,
	(value) => renderer?.update(value),
	{ flush: "post" }
);
</script>

<template>
	<span
		v-bind="$attrs"
		data-slot="texture-fill"
		aria-hidden="true"
		:class="cn('block size-full overflow-hidden text-primary', props.class)"
	>
		<canvas ref="canvas" class="block size-full" />
	</span>
</template>
