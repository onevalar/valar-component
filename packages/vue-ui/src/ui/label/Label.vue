<script setup lang="ts">
import { Label as SdkLabel } from "@ui-sdk/vue/label";
import { cn } from "cn";
import PartElement from "../../lib/ToggleTrigger";
import type { Component, HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		for?: string;
		as?: string | Component;
		asChild?: boolean;
		class?: HTMLAttributes["class"];
		appearance?: "default" | "settings";
		required?: boolean;
	}>(),
	{ appearance: "default" }
);
</script>

<template>
	<SdkLabel
		:data-appearance="appearance"
		:for="props.for"
		:class="
			cn(
				'cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed',
				appearance === 'settings' && 'cn-label-appearance-settings',
				props.class
			)
		"
	>
		<template #render="{ props: part }">
			<PartElement
				:part="{ ...part, 'data-slot': $attrs['data-slot'] ?? 'label' }"
				:as="as ?? 'label'"
				:as-child="asChild"
			>
				<slot />
				<span
					v-if="required && !asChild && as !== 'template'"
					data-slot="label-required"
					aria-hidden="true"
					class="text-destructive"
					>*</span
				>
			</PartElement>
		</template>
	</SdkLabel>
</template>
