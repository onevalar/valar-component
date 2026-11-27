<script lang="ts">
import type { HTMLAttributes } from "vue";

export type InputOTPSlotProps = {
	index: number;
	class?: HTMLAttributes["class"];
};
</script>

<script setup lang="ts">
import { cn } from "cn";
import { computed, inject, useAttrs } from "vue";
import { otpContext } from "./context";

defineOptions({ inheritAttrs: false });
const props = defineProps<InputOTPSlotProps>();
const attrs = useAttrs();
const state = inject(otpContext);
const char = computed(() => state?.value.value[props.index]);
const active = computed(() => {
	const context = state?.value;
	if (!context?.selection) return false;
	const [start, end] = context.selection;
	return start === end
		? props.index === Math.min(start, context.maxLength - 1)
		: props.index >= start && props.index < end;
});
</script>

<template>
	<div
		v-bind="attrs"
		data-slot="input-otp-slot"
		:data-index="index"
		:data-active="active"
		aria-hidden="true"
		:aria-invalid="
			(attrs['aria-invalid'] as HTMLAttributes['aria-invalid']) ?? (state?.invalid || undefined)
		"
		:class="
			cn(
				'cn-input-otp-slot relative flex shrink-0 items-center justify-center data-[active=true]:z-10',
				props.class
			)
		"
	>
		<slot>{{ char }}</slot>
		<div
			v-if="active && !char"
			class="pointer-events-none absolute inset-0 flex items-center justify-center"
		>
			<div class="cn-input-otp-caret-line motion-reduce:animate-none" />
		</div>
	</div>
</template>
