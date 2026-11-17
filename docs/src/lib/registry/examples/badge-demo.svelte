<script lang="ts">
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	const linkTarget = $props.id();
</script>

<div class="flex w-full flex-wrap justify-center gap-2">
	<Badge><CircleCheck data-icon="inline-start" aria-hidden="true" />Completed</Badge>
	<Badge variant="secondary">In progress</Badge>
	<Badge variant="destructive">Failed</Badge>
	<Badge variant="outline">Draft</Badge>
	<Badge variant="label" labelColor="#EB5757">Bug</Badge>
	<div class="w-40">
		<Badge variant="label" labelColor="#5E6AD2" href="#{linkTarget}" truncate>
			Accessibility and keyboard navigation
		</Badge>
	</div>
	<span id={linkTarget} class="sr-only">Accessibility label</span>
</div>
