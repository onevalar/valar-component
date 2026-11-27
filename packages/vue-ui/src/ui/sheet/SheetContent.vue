<script lang="ts">
export type SheetSide = "top" | "right" | "bottom" | "left";
</script>

<script setup lang="ts">
import { XIcon } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import {
	DialogContent,
	DialogPortal,
	injectDialogRootContext,
	useForwardExpose,
	useForwardPropsEmits,
} from "reka-ui";
import { SheetClose, SheetOverlay } from "./index.js";
import { Button } from "../button/index.js";
import type { DialogContentEmits, DialogContentProps, DialogPortalProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<
		DialogContentProps & {
			class?: HTMLAttributes["class"];
			side?: SheetSide;
			appearance?: "default" | "details";
			portalProps?: DialogPortalProps;
			showCloseButton?: boolean;
			closeLabel?: string;
		}
	>(),
	{
		side: "right",
		appearance: "default",
		showCloseButton: true,
		closeLabel: "关闭",
		disableOutsidePointerEvents: undefined,
	}
);
const emit = defineEmits<DialogContentEmits>();
const forwarded = useForwardPropsEmits(
	reactiveOmit(
		props,
		"class",
		"side",
		"appearance",
		"portalProps",
		"showCloseButton",
		"closeLabel"
	),
	emit
);
const { modal } = injectDialogRootContext();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<DialogPortal v-bind="portalProps">
		<SheetOverlay :class="appearance === 'details' ? 'cn-sheet-details-overlay' : undefined" />
		<DialogContent
			:ref="forwardRef"
			v-bind="{ ...$attrs, ...forwarded }"
			:aria-modal="modal || undefined"
			data-slot="sheet-content"
			:data-side="side"
			:data-appearance="appearance"
			:class="
				cn(
					'cn-sheet-content max-h-dvh outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-10 data-[side=left]:data-[state=closed]:slide-out-to-left-10 data-[side=right]:data-[state=closed]:slide-out-to-right-10 data-[side=top]:data-[state=closed]:slide-out-to-top-10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:data-[state=open]:slide-in-from-bottom-10 data-[side=left]:data-[state=open]:slide-in-from-left-10 data-[side=right]:data-[state=open]:slide-in-from-right-10 data-[side=top]:data-[state=open]:slide-in-from-top-10 motion-reduce:animate-none! motion-reduce:transition-none',
					appearance === 'details' && 'cn-sheet-details',
					props.class
				)
			"
		>
			<slot />
			<SheetClose v-if="showCloseButton && !asChild" as-child>
				<Button variant="ghost" size="icon-sm" class="cn-sheet-close" :aria-label="closeLabel">
					<XIcon aria-hidden="true" />
				</Button>
			</SheetClose>
		</DialogContent>
	</DialogPortal>
</template>
