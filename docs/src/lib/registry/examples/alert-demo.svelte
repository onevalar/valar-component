<script lang="ts">
	import InfoIcon from "@lucide/svelte/icons/info";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let showDetails = $state(false);
	const detailsId = $props.id();
</script>

<div class="grid w-full max-w-[640px] items-start gap-4">
	<Alert.Root role="group" aria-label="Triage guidance">
		<Alert.Title>Review incoming requests</Alert.Title>
		<Alert.Description>
			Review issues from outside your team before they enter its workflow.
		</Alert.Description>
		<Alert.Action>
			<Button size="sm" variant="outline" aria-expanded={showDetails} aria-controls={detailsId} onclick={() => (showDetails = !showDetails)}>
				{showDetails ? "Hide details" : "View details"}
			</Button>
		</Alert.Action>
	</Alert.Root>
	<p id={detailsId} hidden={!showDetails} class="text-muted-foreground text-xs">
		Incoming issues stay in Triage until someone reviews them.
	</p>
	<Alert.Root role="group" aria-label="Issue visibility">
		<InfoIcon aria-hidden="true" />
		<Alert.Title>Issue visibility</Alert.Title>
		<Alert.Description>
			Only members of this team can view its private issues.
		</Alert.Description>
	</Alert.Root>
</div>
