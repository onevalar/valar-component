<script lang="ts">
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { IssueActivityUser, IssueCollaborationOptions } from "./activity-model.js";

	let {
		viewer,
		collaboration,
		chinese,
		portal,
	}: {
		viewer: IssueActivityUser;
		collaboration: IssueCollaborationOptions;
		chinese: boolean;
		portal: { to: string };
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const subscribers = $derived(new Set(collaboration.subscribers.map(({ id }) => id)));
	const people = $derived([
		...new Map(
			[...collaboration.subscribers, ...collaboration.people, viewer].map((person) => [
				person.id,
				person,
			])
		).values(),
	]);
	const subscribed = $derived(subscribers.has(viewer.id));
	let open = $state(false);
	let input = $state<HTMLInputElement | null>(null);
	let region: HTMLDivElement;

	function setSubscription(user: IssueActivityUser, active: boolean) {
		collaboration.onAction({ type: "subscribe", user, subscribed: active });
	}

	function shortcuts(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.repeat ||
			event.altKey ||
			!event.shiftKey ||
			event.key.toLowerCase() !== "s" ||
			!(event.target instanceof HTMLElement) ||
			!region?.closest("[data-slot='issue-activity']")?.contains(event.target) ||
			event.target.closest("input, textarea, [contenteditable]")
		)
			return;
		event.preventDefault();
		if (event.metaKey || event.ctrlKey) open = true;
		else setSubscription(viewer, !subscribed);
	}
</script>

<svelte:window onkeydown={shortcuts} />

{#snippet avatar(user: IssueActivityUser)}
	<Avatar.Root aria-hidden="true" class="size-[18px] shrink-0">
		<Avatar.Fallback class="bg-(--activity-avatar) text-[8px] text-(--activity-avatar-foreground)">
			{user.initials ?? user.name.slice(0, 2)}
		</Avatar.Fallback>
	</Avatar.Root>
{/snippet}

<div bind:this={region} class="flex shrink-0 items-center gap-1.5">
	<Button
		type="button"
		variant="ghost"
		size="xs"
		aria-pressed={subscribed}
		aria-keyshortcuts="Shift+S"
		class="h-7 rounded-full px-2 text-xs text-muted-foreground hover:text-foreground"
		onclick={() => setSubscription(viewer, !subscribed)}
	>
		{subscribed ? text("取消订阅", "Unsubscribe") : text("订阅", "Subscribe")}
	</Button>
	<Popover.Root bind:open>
		<Popover.Trigger
			type="button"
			aria-label={text("管理订阅者", "Change subscribers")}
			aria-keyshortcuts="Meta+Shift+S Control+Shift+S"
			title={collaboration.subscribers.map((user) => user.name).join(chinese ? "、" : ", ") ||
				text("无订阅者", "No subscribers")}
			class="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent"
		>
			{#if collaboration.subscribers.length}
				<span class="flex -space-x-1.5">
					{#each collaboration.subscribers.slice(0, 3) as user (user.id)}
						{@render avatar(user)}
					{/each}
				</span>
				{#if collaboration.subscribers.length > 3}<span class="ps-1 text-[10px]"
						>+{collaboration.subscribers.length - 3}</span
					>{/if}
			{:else}
				<IconPlaceholder
					lucide="UsersIcon"
					tabler="IconUsers"
					hugeicons="UserGroupIcon"
					phosphor="UsersIcon"
					remixicon="RiGroupLine"
					class="size-3.5"
					aria-hidden="true"
				/>
			{/if}
		</Popover.Trigger>
		<Popover.Content
			appearance="surface"
			portalProps={portal}
			role="dialog"
			aria-label={text("管理订阅者", "Change subscribers")}
			align="end"
			sideOffset={4}
			class="w-56 max-w-[calc(100vw-24px)] gap-0 p-1.5"
			onOpenAutoFocus={(event) => {
				event.preventDefault();
				input?.focus();
			}}
		>
			<Command.Root class="bg-transparent">
				<Command.Input
					bind:ref={input}
					aria-label={text("搜索订阅者", "Search subscribers")}
					placeholder={text("搜索订阅者…", "Search subscribers…")}
				/>
				<Command.List class="max-h-56">
					<Command.Empty>{text("没有匹配的成员", "No matching people")}</Command.Empty>
					{#each people as user (user.id)}
						<Command.Item
							value={user.id}
							keywords={[user.name]}
							aria-current={subscribers.has(user.id) ? "true" : undefined}
							data-checked={subscribers.has(user.id)}
							class="min-h-8"
							onSelect={() => setSubscription(user, !subscribers.has(user.id))}
						>
							{@render avatar(user)}<span class="truncate">{user.name}</span>
						</Command.Item>
					{/each}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
