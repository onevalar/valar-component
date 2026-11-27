<script setup lang="ts">
import { Separator } from "@valar/vue-ui/separator";
</script>

<template>
	<section aria-label="Separator examples" class="grid max-w-sm gap-4 p-6 text-sm">
		<p>Project settings</p>
		<Separator />
		<div class="flex items-center gap-3">
			<span>General</span>
			<Separator orientation="vertical" />
			<span>Members</span>
			<Separator orientation="vertical" decorative />
			<span>Access</span>
		</div>
		<div class="[--valar-separator:var(--primary)]">
			<Separator decorative />
		</div>
	</section>
</template>
