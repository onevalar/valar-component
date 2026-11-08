<script setup lang="ts">
import { Primitive } from "reka-ui";
import { useAttrs } from "vue";
import type { PrimitiveProps } from "reka-ui";

defineOptions({ inheritAttrs: false });
const props = defineProps<{
	as?: PrimitiveProps["as"];
	asChild?: boolean;
	scalar: boolean;
	keyboard: (event: KeyboardEvent) => void;
	userKeydown?: ((event: KeyboardEvent) => void) | ((event: KeyboardEvent) => void)[];
}>();
const attrs = useAttrs();
function keydown(event: KeyboardEvent) {
	for (const listener of [props.userKeydown].flat()) listener?.(event);
	if (props.scalar) {
		props.keyboard(event);
		return;
	}
	// Native Reka SliderImpl does not guard modifiers/defaultPrevented. In scalar
	// mode only this one handler is replaced; pointer/drag handlers stay native.
	const native = attrs.onKeydown as
		| ((event: KeyboardEvent) => void)
		| ((event: KeyboardEvent) => void)[]
		| undefined;
	for (const listener of [native].flat()) listener?.(event);
}
</script>

<template>
	<Primitive :as="as ?? 'span'" :as-child="asChild" v-bind="{ ...attrs, onKeydown: keydown }">
		<slot />
	</Primitive>
</template>
