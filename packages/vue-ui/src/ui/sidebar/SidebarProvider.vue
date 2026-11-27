<script setup lang="ts">
import { useEventListener, useMediaQuery } from "@vueuse/core";
import { cn } from "cn";
import { computed, provide, ref, shallowRef, watch } from "vue";
import { SIDEBAR_COOKIE_NAME, sidebarKey } from "./context.js";
import { TooltipProvider } from "../tooltip/index.js";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		open?: boolean;
		defaultOpen?: boolean;
		keyboardShortcut?: boolean;
		persistState?: boolean;
		appearance?: "default" | "workspace";
		class?: HTMLAttributes["class"];
	}>(),
	{
		open: undefined,
		defaultOpen: true,
		keyboardShortcut: true,
		persistState: true,
		appearance: "default",
	}
);
const emit = defineEmits<{ "update:open": [open: boolean] }>();
const local = ref(props.defaultOpen);
const open = computed(() => props.open ?? local.value);
const openMobile = ref(false);
const mobileOpener = shallowRef<HTMLElement | null>(null);
const isMobile = useMediaQuery("(width < 48rem)");
const appearance = computed(() => props.appearance);
const state = computed(() => (open.value ? "expanded" : "collapsed"));
const widths = computed(() => ({
	"--sidebar-width": `var(--sidebar-width-default, ${appearance.value === "workspace" ? "192px" : "16rem"})`,
	"--sidebar-width-icon": "3rem",
}));

function setOpen(next: boolean) {
	if (next === open.value) return;
	if (props.open === undefined) local.value = next;
	emit("update:open", next);
	if (props.persistState)
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=604800; SameSite=Lax`;
}

function toggle(opener?: HTMLElement) {
	if (isMobile.value) {
		if (!openMobile.value) mobileOpener.value = opener ?? null;
		openMobile.value = !openMobile.value;
	} else setOpen(!open.value);
}

const editor = 'input, textarea, [contenteditable]:not([contenteditable="false" i])';
useEventListener("keydown", (event) => {
	if (
		!props.keyboardShortcut ||
		event.defaultPrevented ||
		event.repeat ||
		event.isComposing ||
		event.altKey ||
		event.key !== "b" ||
		!(event.metaKey || event.ctrlKey)
	)
		return;
	if (event.composedPath().some((target) => target instanceof Element && target.matches(editor)))
		return;
	event.preventDefault();
	toggle(document.activeElement instanceof HTMLElement ? document.activeElement : undefined);
});
watch(isMobile, (mobile) => {
	if (!mobile) openMobile.value = false;
});
provide(sidebarKey, {
	open,
	state,
	setOpen,
	openMobile,
	setOpenMobile: (value) => {
		openMobile.value = value;
	},
	isMobile,
	appearance,
	toggle,
	mobileOpener,
});
</script>

<template>
	<TooltipProvider :delay-duration="0">
		<div
			data-slot="sidebar-wrapper"
			:data-appearance="appearance"
			:style="widths"
			:class="
				cn(
					'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
					appearance === 'workspace' && 'cn-sidebar-workspace bg-sidebar',
					props.class
				)
			"
		>
			<slot />
		</div>
	</TooltipProvider>
</template>
