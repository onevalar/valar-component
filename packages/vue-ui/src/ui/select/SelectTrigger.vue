<script setup lang="ts">
import IconPlaceholder from "@/registry/bases/reka/components/icon-placeholder/IconPlaceholder.vue";
import { SelectTrigger as SdkTrigger, type SelectController } from "@ui-sdk/vue/select";
import { cn } from "cn";
import { useAttrs, type Component, type HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		disabled?: boolean;
		controller?: SelectController<string, boolean>;
		class?: HTMLAttributes["class"];
		size?: "sm" | "default" | "settings";
	}>(),
	{ size: "default" }
);

const attrs = useAttrs();

function resolvePart(part: Record<string, unknown>, open: boolean) {
	const explicitLabelledBy = attrs["aria-labelledby"] as string | undefined;
	const sdkLabelledBy = part["aria-labelledby"] as string | undefined;
	const resolvedLabelledBy =
		explicitLabelledBy ?? (sdkLabelledBy?.endsWith("-label") ? undefined : sdkLabelledBy);
	return {
		...part,
		"aria-labelledby": resolvedLabelledBy,
		"data-state": open ? "open" : "closed",
	};
}
</script>

<template>
	<SdkTrigger
		v-bind="$attrs"
		:disabled="props.disabled"
		:controller="props.controller"
		data-slot="select-trigger"
		:data-size="props.size"
		:class="
			cn(
				'cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
				props.class
			)
		"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as ?? 'button'"
				:as-child="props.asChild"
				:part="resolvePart(part, state.open)"
			>
				<slot />
				<IconPlaceholder
					lucide="ChevronDownIcon"
					tabler="IconSelector"
					hugeicons="UnfoldMoreIcon"
					phosphor="CaretDownIcon"
					remixicon="RiArrowDownSLine"
					class="cn-select-trigger-icon pointer-events-none"
				/>
			</DisclosureElement>
		</template>
	</SdkTrigger>
</template>
