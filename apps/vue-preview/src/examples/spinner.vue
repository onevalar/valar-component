<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Spinner } from "@valar/vue-ui/spinner";
</script>

<template>
	<section
		aria-label="Spinner examples"
		class="grid w-full max-w-sm justify-items-start gap-4 p-6 text-sm"
	>
		<div
			class="inline-flex items-center gap-2 rounded-lg border-[0.5px] border-border px-3 py-2"
			role="status"
		>
			<Spinner aria-hidden="true" />
			<span>Loading recent activity</span>
		</div>
		<Button size="sm" aria-busy="true" disabled>
			<Spinner aria-hidden="true" class="size-3" />
			Saving changes…
		</Button>
	</section>
</template>
