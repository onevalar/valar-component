<script setup lang="ts">
import { XIcon } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { useTemplateRef } from "vue";
import Command from "./Command.vue";
import { Button } from "../button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
} from "../dialog";
import type { DialogPortalProps } from "../dialog/DialogContent.vue";
import type { CommandProps } from "./context";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
	defineProps<
		CommandProps & {
			open?: boolean;
			defaultOpen?: boolean;
			title?: string;
			description?: string;
			showCloseButton?: boolean;
			closeLabel?: string;
			portalProps?: DialogPortalProps;
		}
	>(),
	{
		open: undefined,
		title: "命令面板",
		description: "搜索要执行的命令",
		closeLabel: "关闭",
		shouldFilter: true,
		vimBindings: true,
	}
);
const emit = defineEmits<{
	closeAutoFocus: [event: Event];
	openAutoFocus: [event: Event];
	escapeKeyDown: [event: KeyboardEvent];
	"update:open": [value: boolean];
	"update:modelValue": [value: string];
}>();

const commandProps = reactiveOmit(
	props,
	"open",
	"defaultOpen",
	"title",
	"description",
	"showCloseButton",
	"closeLabel",
	"portalProps",
	"class"
);
const command = useTemplateRef("command");

function onOpenAutoFocus(event: Event) {
	emit("openAutoFocus", event);
	if (!event.defaultPrevented && command.value?.focus({ preventScroll: true }))
		event.preventDefault();
}
</script>

<template>
	<Dialog :open="open" :default-open="defaultOpen" @update:open="emit('update:open', $event)">
		<DialogTrigger v-if="$slots.trigger" as-child><slot name="trigger" /></DialogTrigger>
		<DialogPortal v-bind="portalProps">
			<DialogOverlay class="bg-transparent! backdrop-blur-none!" />
			<DialogContent
				v-bind="$attrs"
				:portal-props="portalProps"
				:show-overlay="false"
				:show-close-button="false"
				data-slot="dialog-content"
				data-command-dialog=""
				:data-command-close="showCloseButton ? '' : undefined"
				aria-modal="true"
				:class="
					cn(
						'cn-command-dialog top-auto left-1/2 z-50 flex w-full -translate-x-1/2 translate-y-0 flex-col overflow-hidden p-0 outline-none',
						props.class
					)
				"
				@open-auto-focus="onOpenAutoFocus"
				@close-auto-focus="emit('closeAutoFocus', $event)"
				@escape-key-down="emit('escapeKeyDown', $event)"
			>
				<div class="sr-only">
					<DialogTitle>{{ title }}</DialogTitle>
					<DialogDescription>{{ description }}</DialogDescription>
				</div>
				<Command
					ref="command"
					v-bind="commandProps"
					:label="label ?? title"
					@update:model-value="emit('update:modelValue', $event)"
				>
					<slot />
				</Command>
				<DialogClose v-if="showCloseButton" as-child>
					<Button variant="ghost" size="icon-sm" class="cn-dialog-close">
						<XIcon aria-hidden="true" />
						<span class="sr-only">{{ closeLabel }}</span>
					</Button>
				</DialogClose>
			</DialogContent>
		</DialogPortal>
	</Dialog>
</template>
