<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from "@valar/vue-ui/toggle-group";
import { ref } from "vue";

const formats = ref<string[]>([]);
</script>

<template>
	<section
		aria-label="Toggle Group examples"
		class="grid w-full max-w-sm justify-items-start gap-4 p-6 text-sm"
	>
		<ToggleGroup
			v-model="formats"
			type="multiple"
			appearance="toolbar"
			aria-label="Text formatting"
		>
			<ToggleGroupItem value="bold" aria-label="Bold">
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 12h9a4 4 0 0 1 0 8H6zM6 4h8a4 4 0 1 1 0 8H6z" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="italic" aria-label="Italic">
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				>
					<path d="M19 4h-9M14 20H5M15 4 9 20" />
				</svg>
			</ToggleGroupItem>
		</ToggleGroup>
		<p :class="{ 'font-bold': formats.includes('bold'), italic: formats.includes('italic') }">
			Draft a project update.
		</p>
	</section>
</template>
