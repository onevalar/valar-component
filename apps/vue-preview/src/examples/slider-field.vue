<script setup lang="ts">
import { SliderField } from "@valar/vue-ui/slider-field";
import { ref } from "vue";

const value = ref(18);
</script>

<template>
	<section aria-label="Display settings" class="grid w-full max-w-md gap-3 p-6 text-sm">
		<SliderField
			v-model="value"
			label="Row spacing"
			name="spacing"
			:min="6"
			:max="54"
			:step="3"
			unit="px"
		/>
		<p role="status">{{ value }} pixels</p>
	</section>
</template>
