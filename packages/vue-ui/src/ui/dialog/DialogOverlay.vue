<script setup lang="ts">
import { DialogBackdrop as SdkBackdrop } from "@ui-sdk/vue/dialog";
import { cn } from "cn";
import { computed, useAttrs, type HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
	class?: HTMLAttributes["class"];
	forceMount?: boolean;
}>();

const attrs = useAttrs();
const resolvedDataSlot = computed(
	() => (attrs["data-slot"] as string | undefined) ?? "dialog-overlay"
);
</script>

<template>
	<SdkBackdrop
		v-bind="$attrs"
		:data-slot="resolvedDataSlot"
		:class="cn('cn-dialog-overlay fixed inset-0 isolate z-50', props.class)"
	>
		<template #render="{ props: part, state }">
			<div
				v-bind="part"
				:data-slot="resolvedDataSlot"
				:data-state="state.open ? 'open' : 'closed'"
			>
				<slot />
			</div>
		</template>
	</SdkBackdrop>
</template>
