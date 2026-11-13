<script lang="ts">
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import Command from "./command.svelte";
	import type { Command as CommandPrimitive, Dialog as DialogPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(false),
		ref = $bindable(null),
		value = $bindable(""),
		title = "命令面板",
		description = "搜索要执行的命令",
		showCloseButton = false,
		portalProps,
		trigger,
		children,
		class: className,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.RootProps> &
		WithoutChildrenOrChild<CommandPrimitive.RootProps> & {
			portalProps?: DialogPrimitive.PortalProps;
			trigger?: DialogPrimitive.TriggerProps["child"];
			children: Snippet;
			title?: string;
			description?: string;
			showCloseButton?: boolean;
			class?: string;
		} = $props();
</script>

<Dialog.Root bind:open {...restProps}>
	{#if trigger}
		<Dialog.Trigger child={trigger} />
	{/if}
	<Dialog.Content
		data-command-dialog=""
		overlayClass="bg-transparent! backdrop-blur-none!"
		class={cn("cn-command-dialog flex translate-y-0 flex-col overflow-hidden p-0", className)}
		{showCloseButton}
		{portalProps}
	>
		<Dialog.Header class="sr-only">
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>
		<Command {...restProps} bind:value bind:ref {children} />
	</Dialog.Content>
</Dialog.Root>
