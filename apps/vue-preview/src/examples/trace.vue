<script setup lang="ts">
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@valar/vue-ui/trace";
</script>

<template>
	<Trace>
		<TraceLine status="running"><TraceIcon aria-hidden="true">◌</TraceIcon><TraceTitle>Checking notes</TraceTitle><TraceDescription>Running</TraceDescription></TraceLine>
		<TraceCollapsible>
			<TraceCollapsibleTrigger><TraceLine status="error"><TraceTitle>Unable to load appendix</TraceTitle></TraceLine></TraceCollapsibleTrigger>
			<TraceCollapsibleContent><TraceLine><TraceTitle>The file was not included in the local draft.</TraceTitle></TraceLine></TraceCollapsibleContent>
		</TraceCollapsible>
	</Trace>
</template>
