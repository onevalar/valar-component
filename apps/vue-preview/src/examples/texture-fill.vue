<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { TextureFill } from "@valar/vue-ui/texture-fill";
import { ref } from "vue";

const usage = ref(37);
</script>

<template>
	<section aria-label="Build minutes" class="grid w-full max-w-sm gap-3 p-6 text-sm">
		<div
			role="meter"
			aria-label="Build quota"
			:aria-valuemin="0"
			:aria-valuemax="100"
			:aria-valuenow="Math.min(usage, 100)"
			:aria-valuetext="`${usage} percent used`"
		>
			<p class="mb-2">{{ usage }}% of build minutes</p>
			<TextureFill :value="usage" texture="hatch" class="h-10 w-full rounded-md text-primary" />
		</div>
		<div class="flex flex-wrap gap-2">
			<Button
				v-for="value in [0, 37, 132]"
				:key="value"
				type="button"
				size="sm"
				variant="outline"
				@click="usage = value"
				>{{ value }}%</Button
			>
		</div>
	</section>
</template>
