<script setup lang="ts">
import { TickMeter } from "@valar/vue-ui/tick-meter";
</script>

<template>
	<section aria-label="Quota by workspace" class="flex flex-wrap gap-4 p-6 text-sm">
		<figure class="grid w-24 gap-2 text-center">
			<TickMeter :value="37" label="Design quota" value-text="37 percent used" />
			<figcaption>Design</figcaption>
		</figure>
		<figure class="grid w-24 gap-2 text-center">
			<TickMeter
				:value="132"
				label="Operations quota"
				value-text="132 percent, over quota"
				tone="danger"
			/>
			<figcaption>Operations</figcaption>
		</figure>
	</section>
</template>
