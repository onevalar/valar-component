<script setup lang="ts">
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@valar/vue-ui/accordion";
import { Badge } from "@valar/vue-ui/badge";
</script>

<template>
	<section aria-label="Accordion examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<Accordion type="single" default-value="access" collapsible :loop="false">
			<AccordionItem value="access">
				<AccordionTrigger :level="2">Workspace access</AccordionTrigger>
				<AccordionContent>
					<div class="flex flex-wrap items-center gap-2">
						<p>Only invited members can join.</p>
						<Badge variant="outline">Private</Badge>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="notifications">
				<AccordionTrigger :level="2">Notifications</AccordionTrigger>
				<AccordionContent>Receive a weekly digest of project activity.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="billing" disabled>
				<AccordionTrigger :level="2">Billing</AccordionTrigger>
				<AccordionContent>Only workspace owners can manage billing.</AccordionContent>
			</AccordionItem>
		</Accordion>
	</section>
</template>
