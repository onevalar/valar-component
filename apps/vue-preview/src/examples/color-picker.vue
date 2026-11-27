<script setup lang="ts">
import { ColorPicker } from "@valar/vue-ui/color-picker";
import { ref } from "vue";

const PRESETS = [
	"#2563eb",
	"#0f766e",
	"#b45309",
	"#be123c",
	"#7c3aed",
	"#0284c7",
	"#16a34a",
	"#18181b",
];

const color = ref("#2563eb");
</script>

<template>
	<form aria-label="Appearance settings" class="grid w-full max-w-xs gap-3 p-6 text-sm">
		<ColorPicker
			v-model="color"
			label="工作区强调色"
			name="accent"
			:presets="PRESETS"
		/>
		<p role="status" class="font-mono text-xs tabular-nums text-muted-foreground">{{ color }}</p>
	</form>
</template>
