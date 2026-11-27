<script setup lang="ts">
import { Toggle } from "@valar/vue-ui/toggle";
import { ref } from "vue";

const bold = ref(false);
</script>

<template>
	<section aria-label="Toggle examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<div class="flex flex-wrap gap-2">
			<Toggle v-model="bold">
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
				Bold
			</Toggle>
			<Toggle variant="outline" size="sm" disabled>Locked style</Toggle>
		</div>
		<p :class="{ 'font-bold': bold }">Draft a project update.</p>
	</section>
</template>
