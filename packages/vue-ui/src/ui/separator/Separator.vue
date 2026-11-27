<script setup lang="ts">
import { Separator as SdkSeparator } from "@ui-sdk/vue/separator";
import { cn } from "cn";
import PartElement from "../../lib/ToggleTrigger";
import type { SeparatorOrientation } from "@ui-sdk/vue/separator";
import type { Component, HTMLAttributes } from "vue";

const props = defineProps<{
	class?: HTMLAttributes["class"];
	orientation?: SeparatorOrientation;
	decorative?: boolean;
	as?: string | Component;
	asChild?: boolean;
}>();
</script>

<template>
	<SdkSeparator
		:orientation="orientation"
		:decorative="decorative"
		:class="
			cn(
				'shrink-0 bg-[color:var(--valar-separator,var(--valar-separator-base,lch(0%_0_0_/_8.8%)))] data-[orientation=horizontal]:h-[0.5px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[0.5px] data-[orientation=vertical]:self-stretch dark:[--valar-separator-base:lch(100%_0_0_/_8.3%)]',
				props.class
			)
		"
	>
		<template #render="{ props: part }">
			<PartElement
				:part="{ ...part, 'data-slot': $attrs['data-slot'] ?? 'separator' }"
				:as="as ?? 'div'"
				:as-child="asChild"
			>
				<slot />
			</PartElement>
		</template>
	</SdkSeparator>
</template>
