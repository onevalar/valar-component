<script setup lang="ts">
import { DatePicker, type Timeframe } from "@valar/vue-ui/date-picker";
import { ref } from "vue";

const target = ref<Timeframe | undefined>({ date: "2027-05-20", grain: "day" });
</script>

<template>
	<section aria-label="Project schedule" class="grid justify-items-start gap-3 p-6 text-sm">
		<DatePicker
			v-model="target"
			label="Target date"
			placeholder="Set target date"
			:min="{ date: '2027-05-12', grain: 'day' }"
			:max="{ date: '2027-10-15', grain: 'day' }"
		/>
		<p role="status">{{ target ? `${target.date} · ${target.grain}` : "No target date" }}</p>
	</section>
</template>
