<script setup lang="ts">
import { TooltipProvider, useForwardProps } from "reka-ui";
import type { TooltipProviderProps } from "reka-ui";

const props = withDefaults(defineProps<TooltipProviderProps>(), { delayDuration: 500 });
const forwarded = useForwardProps(props);
</script>

<template>
	<TooltipProvider v-bind="forwarded"><slot /></TooltipProvider>
</template>
