<script setup lang="ts">
import IconPlaceholder from "@/registry/bases/reka/components/icon-placeholder/IconPlaceholder.vue";
import { SelectItem as SdkItem, SelectItemText as SdkItemText } from "@ui-sdk/vue/select";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		value: string;
		label?: string;
		textValue?: string;
		disabled?: boolean;
		index?: number;
		class?: HTMLAttributes["class"];
	}>(),
	{ disabled: false }
);
</script>

<template>
	<SdkItem
		:value="props.value"
		:label="props.label ?? props.textValue"
		:disabled="props.disabled"
		:index="props.index"
		data-slot="select-item"
		:class="
			cn(
				'cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
				props.class
			)
		"
	>
		<template #render="{ props: part, state }">
			<div
				v-bind="part"
				:aria-disabled="props.disabled || state.disabled ? 'true' : undefined"
				:data-disabled="props.disabled || state.disabled ? '' : undefined"
			>
				<span class="cn-select-item-indicator" aria-hidden="true">
					<IconPlaceholder
						v-if="state.selected"
						lucide="CheckIcon"
						tabler="IconCheck"
						hugeicons="Tick02Icon"
						phosphor="CheckIcon"
						remixicon="RiCheckLine"
						class="cn-select-item-indicator-icon pointer-events-none"
					/>
				</span>
				<SdkItemText class="cn-select-item-text">
					<slot />
				</SdkItemText>
			</div>
		</template>
	</SdkItem>
</template>
