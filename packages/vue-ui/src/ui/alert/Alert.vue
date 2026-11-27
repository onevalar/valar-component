<script setup lang="ts">
import { cn } from "cn";
import { alertVariants, type AlertVariant } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		variant?: AlertVariant;
		appearance?: "connection";
	}>(),
	{ variant: "default" }
);
</script>

<template>
	<div
		role="alert"
		data-slot="alert"
		:data-appearance="appearance"
		:class="
			cn(
				appearance === 'connection'
					? 'cn-alert-connection group/alert'
					: alertVariants({ variant }),
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
