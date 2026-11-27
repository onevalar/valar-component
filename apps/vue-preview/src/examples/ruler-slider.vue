<script setup lang="ts">
import { RulerSlider } from "@valar/vue-ui/ruler-slider";
import { ref } from "vue";

const distance = ref(3.25);
const committed = ref<number>();
</script>

<template>
	<section aria-label="Route estimate" class="grid w-full max-w-md gap-3 p-6 text-sm">
		<RulerSlider
			v-model="distance"
			label="Distance"
			name="distance"
			:min="1.25"
			:max="11.25"
			:step="0.5"
			:major-every="4"
			unit="km"
			@value-commit="committed = $event"
		/>
		<p role="status">
			{{ committed === undefined ? "Adjust the distance" : `Committed: ${committed} km` }}
		</p>
	</section>
</template>
