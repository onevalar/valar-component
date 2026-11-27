<script setup lang="ts">
import { AlertDialogBackdrop as SdkBackdrop } from "@ui-sdk/vue/alert-dialog";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<SdkBackdrop
		v-bind="$attrs"
		data-slot="alert-dialog-overlay"
		:class="cn('cn-alert-dialog-overlay fixed inset-0 z-50', props.class)"
	>
		<template #render="{ props: part, state }">
			<div v-bind="part" data-slot="alert-dialog-overlay" :data-state="state.open ? 'open' : 'closed'">
				<slot />
			</div>
		</template>
	</SdkBackdrop>
</template>
