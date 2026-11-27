<script setup lang="ts">
import type { TooltipContentProps, TooltipPortalProps } from "reka-ui";
import { Kbd, KbdGroup } from "../kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from ".";

withDefaults(defineProps<{
	label: string;
	keys?: readonly string[];
	side?: TooltipContentProps["side"];
	portal?: TooltipPortalProps;
	disabled?: boolean;
}>(), { side: "bottom", disabled: undefined });
</script>

<template>
	<Tooltip disable-hoverable-content :disabled="disabled">
		<TooltipTrigger as-child><slot name="trigger" /></TooltipTrigger>
		<TooltipContent appearance="surface" :side="side" :portal-props="portal" :aria-label="label">
			<span class="min-w-0">{{ label }}</span>
			<KbdGroup v-if="keys?.length" class="shrink-0">
				<Kbd v-for="(key, index) in keys" :key="index" appearance="compact">{{ key }}</Kbd>
			</KbdGroup>
		</TooltipContent>
	</Tooltip>
</template>
