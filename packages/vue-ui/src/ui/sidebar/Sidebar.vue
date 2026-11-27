<script setup lang="ts">
import { cn } from "cn";
import { useSidebar } from "./context.js";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../sheet/index.js";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		id?: string;
		class?: HTMLAttributes["class"];
		side?: "left" | "right";
		variant?: "sidebar" | "floating" | "inset";
		collapsible?: "offcanvas" | "icon" | "none";
		mobileTitle?: string;
		mobileDescription?: string;
		mobileCloseButton?: boolean;
	}>(),
	{
		side: "left",
		variant: "sidebar",
		collapsible: "offcanvas",
		mobileTitle: "侧边栏",
		mobileDescription: "显示移动端侧边栏。",
		mobileCloseButton: true,
	}
);
const { open, state, isMobile, openMobile, setOpenMobile, appearance, mobileOpener } = useSidebar();

function restoreFocus(event: Event) {
	const opener = mobileOpener.value;
	mobileOpener.value = null;
	if (opener?.isConnected) {
		event.preventDefault();
		opener.focus();
	}
}
</script>

<template>
	<div
		v-if="collapsible === 'none'"
		:id="id"
		v-bind="$attrs"
		data-slot="sidebar"
		data-sidebar="sidebar"
		:class="
			cn(
				'flex h-full w-(--sidebar-width) max-w-full flex-col bg-sidebar text-sidebar-foreground',
				props.class
			)
		"
	>
		<slot />
	</div>
	<Sheet v-else-if="isMobile" :open="openMobile" @update:open="setOpenMobile">
		<SheetContent
			:id="id"
			v-bind="$attrs"
			data-slot="sidebar"
			data-sidebar="sidebar"
			data-mobile="true"
			:side="side"
			:show-close-button="mobileCloseButton"
			style="--sidebar-width: 18rem"
			:class="
				cn(
					'w-(--sidebar-width)! max-w-full! gap-0 bg-sidebar! p-0 text-sidebar-foreground!',
					appearance === 'workspace' && 'cn-sidebar-workspace',
					props.class
				)
			"
			@close-auto-focus="restoreFocus"
		>
			<SheetHeader class="sr-only"
				><SheetTitle>{{ mobileTitle }}</SheetTitle
				><SheetDescription>{{ mobileDescription }}</SheetDescription></SheetHeader
			>
			<div class="flex h-full min-h-0 w-full flex-col"><slot /></div>
		</SheetContent>
	</Sheet>
	<div
		v-else
		:id="id"
		data-slot="sidebar"
		:data-side="side"
		:data-variant="variant"
		:data-state="state"
		:data-collapsible="open ? '' : collapsible"
		class="group peer hidden shrink-0 text-sidebar-foreground md:block"
	>
		<div
			data-slot="sidebar-gap"
			:class="
				cn(
					'cn-sidebar-gap relative w-(--sidebar-width) group-data-[collapsible=offcanvas]:w-0 motion-reduce:transition-none',
					variant === 'sidebar'
						? 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
						: 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]'
				)
			"
		/>
		<div
			v-bind="$attrs"
			data-slot="sidebar-container"
			:data-side="side"
			:inert="collapsible === 'offcanvas' && !open"
			:class="
				cn(
					'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:start-0 data-[side=left]:group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)] data-[side=right]:end-0 data-[side=right]:group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)] motion-reduce:transition-none md:flex',
					variant === 'sidebar'
						? 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
						: 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]',
					variant === 'sidebar' &&
						appearance === 'default' &&
						'group-data-[side=left]:border-e group-data-[side=right]:border-s',
					props.class
				)
			"
		>
			<div
				data-slot="sidebar-inner"
				data-sidebar="sidebar"
				class="cn-sidebar-inner flex size-full flex-col"
			>
				<slot />
			</div>
		</div>
	</div>
</template>
