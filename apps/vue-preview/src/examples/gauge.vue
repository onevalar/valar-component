<script setup lang="ts">
import { Gauge, GaugeArc } from "@valar/vue-ui/gauge";
</script>

<template>
	<section aria-label="Quota usage" class="flex flex-wrap items-start gap-5 p-6 text-sm">
		<figure class="grid w-24 gap-2 text-center">
			<Gauge
				:value="132"
				label="Compute quota"
				value-text="132 percent, over quota"
				tone="danger"
			/>
			<figcaption>Compute</figcaption>
		</figure>
		<figure class="grid w-24 gap-2 text-center">
			<svg viewBox="0 0 100 90" aria-hidden="true"><GaugeArc :value="null" /></svg>
			<figcaption>Storage unavailable</figcaption>
		</figure>
	</section>
</template>
