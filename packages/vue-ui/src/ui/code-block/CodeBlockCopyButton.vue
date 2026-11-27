<script setup lang="ts">
import { Check, Copy } from "@lucide/vue";
import { onBeforeUnmount, ref, watch } from "vue";
import { Button, type ButtonVariants } from "../button";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
	value: string;
	copyLabel?: string;
	copiedLabel?: string;
	variant?: ButtonVariants["variant"];
	size?: ButtonVariants["size"];
}>(), { copyLabel: "复制", copiedLabel: "已复制", variant: "ghost", size: "icon-xs" });
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
let attempt = 0;

function reset() {
	attempt++;
	clearTimeout(timer);
	copied.value = false;
}
watch(() => props.value, reset);
onBeforeUnmount(reset);

async function copy(event: MouseEvent) {
	emit("click", event);
	if (event.defaultPrevented || !navigator.clipboard) return;
	const current = ++attempt;
	try {
		await navigator.clipboard.writeText(props.value);
	} catch {
		return;
	}
	if (current !== attempt) return;
	copied.value = true;
	clearTimeout(timer);
	timer = setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<template>
	<Button v-bind="$attrs" data-slot="code-block-copy-button" type="button" :variant="variant" :size="size" :data-copied="copied || undefined" :aria-label="copied ? copiedLabel : copyLabel" class="cn-code-block-copy-button" @click="copy">
		<Check v-if="copied" aria-hidden="true" />
		<Copy v-else aria-hidden="true" />
	</Button>
	<span aria-live="polite" class="sr-only">{{ copied ? copiedLabel : '' }}</span>
</template>
