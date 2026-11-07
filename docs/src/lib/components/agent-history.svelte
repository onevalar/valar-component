<script lang="ts">
	import HistoryIcon from "@lucide/svelte/icons/history";
	import SquarePenIcon from "@lucide/svelte/icons/square-pen";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import {
		agentChat,
		agentHistory,
		clearHistory,
		deleteConversation,
		newConversation,
		openConversation,
		recentConversations,
	} from "$lib/agent/chat.svelte.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	/** The assistant's own controls: start a new conversation, or go back to an earlier one. */
	let open = $state(false);
	let confirmClear = $state(false);

	const conversations = $derived(recentConversations());
	const time = (stamp: number) =>
		new Date(stamp).toLocaleString("zh-CN", {
			month: "numeric",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
</script>

<div class="flex items-center gap-1">
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="icon-sm"
					aria-label="新对话"
					disabled={!agentChat.messages.length}
					onclick={newConversation}
				>
					<SquarePenIcon />
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>新对话</Tooltip.Content>
	</Tooltip.Root>

	<Popover.Root
		bind:open
		onOpenChange={() => {
			confirmClear = false;
		}}
	>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="icon-sm" aria-label="历史对话">
					<HistoryIcon />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content align="end" class="w-80 gap-1 p-2">
			<Popover.Title class="px-2 py-1 text-sm font-medium">历史对话</Popover.Title>
			{#if !conversations.length}
				<p class="px-2 py-6 text-center text-sm text-muted-foreground">
					还没有历史。对话会自动保存在这个浏览器里。
				</p>
			{:else}
				<ul class="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
					{#each conversations as item (item.id)}
						<li class="flex items-center gap-1">
							<Button
								variant={item.id === agentHistory.currentId ? "secondary" : "ghost"}
								class="h-auto min-w-0 flex-1 flex-col items-start gap-0 py-1.5 text-left"
								aria-current={item.id === agentHistory.currentId}
								onclick={() => {
									openConversation(item.id);
									open = false;
								}}
							>
								<span class="w-full truncate">{item.title}</span>
								<span class="text-xs font-normal text-muted-foreground">{time(item.updatedAt)}</span
								>
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`删除对话：${item.title}`}
								onclick={() => deleteConversation(item.id)}
							>
								<Trash2Icon />
							</Button>
						</li>
					{/each}
				</ul>
				<Button
					variant={confirmClear ? "destructive" : "ghost"}
					size="sm"
					class="mt-1 self-end"
					onclick={() => {
						if (!confirmClear) confirmClear = true;
						else {
							clearHistory();
							confirmClear = false;
							open = false;
						}
					}}
				>
					{confirmClear ? "再点一次确认清空" : "清空全部历史"}
				</Button>
			{/if}
		</Popover.Content>
	</Popover.Root>
</div>
