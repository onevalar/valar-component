<script setup lang="ts">
import { Progress } from "@valar/vue-ui/progress";
import { Slider } from "@valar/vue-ui/slider";
import { computed, ref } from "vue";

const min = 10;
const max = 60;
const value = ref(35);
const locale = "fr-FR";
const percent = new Intl.NumberFormat(locale, { style: "percent" });
const readout = computed(() => percent.format((value.value - min) / (max - min)));
</script>

<template>
	<section aria-label="Progress examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<div class="grid gap-2">
			<div class="flex justify-between gap-2">
				<span>Import progress</span>
				<span aria-hidden="true" :lang="locale" class="text-muted-foreground tabular-nums">{{
					readout
				}}</span>
			</div>
			<Progress
				aria-label="Import progress"
				:min="min"
				:max="max"
				:value="value"
				:aria-valuetext="readout"
			/>
			<Slider
				v-model="value"
				type="single"
				:min="min"
				:max="max"
				:thumb-labels="['Adjust import progress']"
			/>
		</div>
		<div class="flex items-center justify-between gap-2">
			<span>Project completion</span>
			<Progress appearance="project" aria-label="Project completion" :value="72" />
		</div>
		<div class="grid gap-2">
			<span class="text-muted-foreground">Checking for duplicates…</span>
			<Progress aria-label="Duplicate check" :value="null" />
		</div>
	</section>
</template>
