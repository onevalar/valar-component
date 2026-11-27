<script setup lang="ts">
import { AspectRatio } from "@valar/vue-ui/aspect-ratio";
</script>

<template>
	<section aria-label="Aspect Ratio examples" class="grid w-full max-w-lg gap-4 p-6 text-sm">
		<div class="grid grid-cols-[minmax(0,16fr)_minmax(0,9fr)] items-start gap-3">
			<figure class="grid gap-2">
				<AspectRatio :ratio="16 / 9" class="grid place-items-center bg-muted">
					<svg aria-hidden="true" viewBox="0 0 32 18" class="size-full text-primary/30">
						<path fill="currentColor" d="M0 16 8 7l5 5 6-8 13 12v2H0Z" />
						<circle cx="7" cy="4" r="2" fill="currentColor" />
					</svg>
				</AspectRatio>
				<figcaption class="text-muted-foreground">Cover image · 16:9</figcaption>
			</figure>
			<figure class="grid gap-2">
				<AspectRatio :ratio="1" class="grid place-items-center bg-muted">
					<svg aria-hidden="true" viewBox="0 0 24 24" class="size-8 text-primary">
						<path fill="none" stroke="currentColor" stroke-width="1.5" d="m12 3 9 9-9 9-9-9Z" />
					</svg>
				</AspectRatio>
				<figcaption class="text-muted-foreground">Project icon · 1:1</figcaption>
			</figure>
		</div>
	</section>
</template>
