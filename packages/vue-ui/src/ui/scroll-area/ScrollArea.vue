<script setup lang="ts">
import {
	ScrollArea as SdkScrollArea,
	ScrollAreaContent,
	ScrollAreaCorner,
	ScrollAreaViewport,
} from "@ui-sdk/vue/scroll-area";
import { cn } from "cn";
import {
	ScrollAreaRoot as LegacyRoot,
	ScrollAreaViewport as LegacyViewport,
	ScrollAreaScrollbar as LegacyBar,
	ScrollAreaThumb as LegacyThumb,
	ScrollAreaCorner as LegacyCorner,
	useForwardExpose,
} from "reka-ui";
import { computed, useTemplateRef, type HTMLAttributes } from "vue";
import ScrollAreaScrollbar from "./ScrollAreaScrollbar.vue";
import type { ScrollAreaRootProps, ScrollAreaViewportProps } from "reka-ui";

const props = withDefaults(
	defineProps<
		Omit<ScrollAreaRootProps, "asChild"> & {
			class?: HTMLAttributes["class"];
			appearance?: "default" | "settings";
			orientation?: "vertical" | "horizontal" | "both";
			viewportLabel?: string;
			overscroll?: "auto" | "contain";
			scrollbarXClasses?: HTMLAttributes["class"];
			scrollbarYClasses?: HTMLAttributes["class"];
			nonce?: ScrollAreaViewportProps["nonce"];
		}
	>(),
	{ appearance: "default", orientation: "vertical", overscroll: "auto" }
);

const viewport = useTemplateRef<InstanceType<typeof ScrollAreaViewport>>("viewportRef");
const legacyViewport = useTemplateRef<InstanceType<typeof LegacyViewport>>("legacyViewportRef");
defineExpose({
	viewport: computed<HTMLDivElement | null>(
		() => legacyViewport.value?.viewportElement ?? viewport.value?.$el ?? null
	),
});
const { forwardRef } = useForwardExpose();
const scrollType = computed(() =>
	props.type === "glimpse"
		? "scroll"
		: (props.type ?? (props.appearance === "settings" ? "auto" : "hover"))
);
const axes = computed(() =>
	props.orientation === "both" ? (["vertical", "horizontal"] as const) : [props.orientation]
);
const viewportClasses =
	"size-full max-h-[inherit] rounded-[inherit] outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";
</script>

<template>
	<!-- Reka's transient hover glimpse and CSP nonce have no SDK equivalents. -->
	<LegacyRoot
		v-if="type === 'glimpse' || nonce"
		:ref="forwardRef"
		:as="as"
		:dir="dir"
		:type="type ?? scrollType"
		:scroll-hide-delay="scrollHideDelay"
		data-slot="scroll-area"
		:data-appearance="appearance"
		:class="cn('relative min-h-0 min-w-0', props.class)"
	>
		<LegacyViewport
			ref="legacyViewportRef"
			:nonce="nonce"
			data-slot="scroll-area-viewport"
			:role="viewportLabel ? 'region' : undefined"
			:aria-label="viewportLabel"
			:style="{
				overflowX: orientation === 'vertical' ? 'hidden' : 'scroll',
				overflowY: orientation === 'horizontal' ? 'hidden' : 'scroll',
			}"
			:class="cn(viewportClasses, overscroll === 'contain' && 'overscroll-contain')"
			as-child
		>
			<div :class="orientation !== 'vertical' ? 'min-w-fit' : undefined"><slot /></div>
		</LegacyViewport>
		<LegacyBar
			v-for="axis in axes"
			:key="axis"
			:orientation="axis"
			data-slot="scroll-area-scrollbar"
			:data-orientation="axis"
			:class="
				cn(
					'cn-scroll-area-scrollbar flex touch-none p-px transition-colors select-none motion-reduce:transition-none',
					appearance === 'settings' && 'cn-scroll-area-scrollbar-settings',
					axis === 'vertical' ? scrollbarYClasses : scrollbarXClasses
				)
			"
		>
			<LegacyThumb
				data-slot="scroll-area-thumb"
				class="cn-scroll-area-thumb relative flex-1 bg-border"
			/>
		</LegacyBar>
		<LegacyCorner data-slot="scroll-area-corner" />
	</LegacyRoot>
	<SdkScrollArea
		v-else
		:ref="forwardRef"
		:dir="dir"
		:type="scrollType"
		:scroll-hide-delay="scrollHideDelay"
		data-slot="scroll-area"
		:data-appearance="appearance"
		:class="cn('relative min-h-0 min-w-0', props.class)"
	>
		<template v-if="as && as !== 'div'" #render="{ props: partProps, children }">
			<component :is="as" v-bind="partProps"><component :is="children" /></component>
		</template>
		<ScrollAreaViewport
			ref="viewportRef"
			data-slot="scroll-area-viewport"
			:role="viewportLabel ? 'region' : undefined"
			:aria-label="viewportLabel"
			:tabindex="viewportLabel ? 0 : undefined"
			:class="
				cn(
					viewportClasses,
					orientation === 'vertical' && 'overflow-x-hidden!',
					orientation === 'horizontal' && 'overflow-y-hidden!',
					overscroll === 'contain' && 'overscroll-contain'
				)
			"
		>
			<ScrollAreaContent>
				<slot />
			</ScrollAreaContent>
		</ScrollAreaViewport>
		<ScrollAreaScrollbar
			v-for="axis in axes"
			:key="axis"
			:orientation="axis"
			:class="
				cn(
					appearance === 'settings' && 'cn-scroll-area-scrollbar-settings',
					axis === 'vertical' ? scrollbarYClasses : scrollbarXClasses
				)
			"
		/>
		<ScrollAreaCorner data-slot="scroll-area-corner" />
	</SdkScrollArea>
</template>
