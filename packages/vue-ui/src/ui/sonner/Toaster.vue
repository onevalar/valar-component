<script setup lang="ts">
import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from "@lucide/vue";
import { useMutationObserver } from "@vueuse/core";
import { cn } from "cn";
import { h, onMounted, ref, shallowRef } from "vue";
import { Toaster } from "vue-sonner";
import type { ToasterProps } from "vue-sonner";
import "vue-sonner/style.css";

const props = withDefaults(defineProps<ToasterProps & { appearance?: "default" | "workspace" }>(), {
	closeButton: undefined,
});
const root = shallowRef<HTMLElement>();
const mode = ref<"light" | "dark">("light");
const syncMode = () => (mode.value = root.value?.classList.contains("dark") ? "dark" : "light");
onMounted(() => {
	root.value = document.documentElement;
	syncMode();
});
useMutationObserver(root, syncMode, { attributes: true, attributeFilter: ["class"] });

const icons = {
	loading: h(LoaderCircle, { "aria-hidden": true, class: "size-4 motion-safe:animate-spin" }),
	success: h(CircleCheck, { "aria-hidden": true, class: "size-4" }),
	error: h(OctagonX, { "aria-hidden": true, class: "size-4" }),
	info: h(Info, { "aria-hidden": true, class: "size-4" }),
	warning: h(TriangleAlert, { "aria-hidden": true, class: "size-4" }),
};
</script>

<template>
	<Toaster
		v-bind="props"
		:theme="theme ?? mode"
		:class="
			cn('valar-toaster', appearance === 'workspace' && 'valar-workspace-toaster', props.class)
		"
		:offset="
			offset ?? (appearance === 'workspace' ? { right: 24, left: 24, bottom: 52 } : undefined)
		"
		:mobile-offset="
			mobileOffset ?? (appearance === 'workspace' ? { right: 16, left: 16, bottom: 24 } : undefined)
		"
		:close-button="closeButton ?? appearance === 'workspace'"
		:style="{
			'--normal-bg': 'var(--color-popover)',
			'--normal-text': 'var(--color-popover-foreground)',
			'--normal-border': 'var(--color-border)',
			...style,
		}"
		:toast-options="{
			...toastOptions,
			classes: {
				...toastOptions?.classes,
				toast: cn('valar-toast', toastOptions?.classes?.toast),
			},
		}"
		:icons="{ ...icons, ...props.icons }"
	/>
</template>
