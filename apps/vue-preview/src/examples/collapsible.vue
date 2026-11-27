<script setup lang="ts">
import { Badge } from "@valar/vue-ui/badge";
import { Button } from "@valar/vue-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/vue-ui/collapsible";
</script>

<template>
	<section aria-label="Collapsible examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<Collapsible appearance="properties">
			<CollapsibleTrigger>
				<svg
					aria-hidden="true"
					data-slot="collapsible-indicator"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m6 4 4 4-4 4" />
				</svg>
				Properties
			</CollapsibleTrigger>
			<CollapsibleContent>
				<dl class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 px-2 pt-2">
					<dt class="text-muted-foreground">Status</dt>
					<dd><Badge variant="secondary">In progress</Badge></dd>
					<dt class="text-muted-foreground">Owner</dt>
					<dd>Jordan Davis</dd>
				</dl>
			</CollapsibleContent>
		</Collapsible>
		<Collapsible disabled>
			<CollapsibleTrigger as-child>
				<Button variant="outline" size="sm">Archived settings</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>Archived settings cannot be changed.</CollapsibleContent>
		</Collapsible>
	</section>
</template>
