<script setup lang="ts">
import { Badge } from "@valar/vue-ui/badge";
</script>

<template>
	<section aria-label="Badge examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<div class="flex flex-wrap items-center gap-2">
			<Badge>In progress</Badge>
			<Badge variant="secondary">Internal</Badge>
			<Badge variant="outline">Q4</Badge>
			<Badge variant="destructive">Blocked</Badge>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-muted-foreground">Issue labels</span>
			<Badge variant="label" label-color="#eb5757">Bug</Badge>
			<Badge variant="label" label-color="#6d70dc">Design</Badge>
		</div>
	</section>
</template>
