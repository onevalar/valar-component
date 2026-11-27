<script setup lang="ts">
import { ColorPicker } from "@valar/vue-ui/color-picker";
import { ref } from "vue";

const color = ref("#2563eb");
</script>

<template>
	<section aria-label="Appearance settings" class="grid w-full max-w-xs gap-3 p-6 text-sm">
		<ColorPicker
			v-model="color"
			label="工作区强调色"
			name="accent"
			:presets="['#2563eb', '#0f766e', '#b45309', '#be123c']"
		/>
		<p role="status">{{ color }}</p>
	</section>
</template>
