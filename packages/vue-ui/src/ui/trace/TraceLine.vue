<script setup lang="ts">
import { cn } from "cn";
import type { TraceLineStatus } from ".";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"]; status?: TraceLineStatus }>();
</script>

<template>
	<span
		data-slot="trace-line"
		:data-status="status"
		:class="
			cn(
				'cn-trace-line flex w-fit max-w-full min-w-0 items-center text-muted-foreground transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=pending]:opacity-60 motion-safe:data-[status=running]:*:data-[slot=trace-title]:shimmer motion-reduce:transition-none',
				props.class
			)
		"
	>
		<slot />
	</span>
</template>
