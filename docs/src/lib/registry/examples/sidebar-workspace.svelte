<script lang="ts">
	import BellIcon from "@lucide/svelte/icons/bell";
	import BookOpenIcon from "@lucide/svelte/icons/book-open";
	import BoxIcon from "@lucide/svelte/icons/box";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import InboxIcon from "@lucide/svelte/icons/inbox";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import ListTodoIcon from "@lucide/svelte/icons/list-todo";
	import MousePointer2Icon from "@lucide/svelte/icons/mouse-pointer-2";
	import ScanIcon from "@lucide/svelte/icons/scan";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
	import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

	const primary = [
		{ label: "Inbox", icon: InboxIcon },
		{ label: "My issues", icon: ScanIcon },
		{ label: "Agent", icon: MousePointer2Icon },
	] as const;
	const workspace = [
		{ label: "Projects", icon: BoxIcon },
		{ label: "Views", icon: LayersIcon },
		{ label: "Documents", icon: BookOpenIcon },
		{ label: "Notifications", icon: BellIcon },
		{ label: "Triage", icon: ListTodoIcon },
		{ label: "Settings", icon: SettingsIcon },
	] as const;
	const panelId = $props.id();
	let current = $state<string>("My issues");
</script>

<Sidebar.Provider
	appearance="workspace"
	persistState={false}
	keyboardShortcut={false}
	class="relative h-80 min-h-0 overflow-hidden rounded-xl border [&_[data-slot=sidebar-container]]:absolute [&_[data-slot=sidebar-container]]:h-full"
>
	<Sidebar.Root
		collapsible="icon"
		id={panelId}
		mobileCloseButton={false}
		mobileTitle="Workspace navigation"
		mobileDescription="Choose a workspace view."
	>
		<Sidebar.Header class="relative py-3">
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<div
						class="flex h-7 items-center gap-2 ps-1.5 text-[13px] font-semibold text-sidebar-accent-foreground"
					>
						<span
							class="grid size-5 shrink-0 place-items-center rounded-lg bg-indigo-600 text-[11px] text-white"
							aria-hidden="true">V</span
						>
						<span class="truncate group-data-[collapsible=icon]:sr-only">Valar</span>
					</div>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
			<Sidebar.Trigger
				label="Close sidebar"
				class="absolute end-3 hidden in-data-[mobile=true]:inline-flex"
			/>
		</Sidebar.Header>
		<Sidebar.Content>
			<nav aria-label="Workspace navigation">
				<Sidebar.Group>
					<Sidebar.Menu>
						{#each primary as item (item.label)}
							{@render navigationRow(item)}
						{/each}
					</Sidebar.Menu>
				</Sidebar.Group>
				<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
					<Collapsible.Root open class="group/collapsible">
						<Sidebar.GroupLabel class="gap-1">
							{#snippet child({ props })}
								<Collapsible.Trigger {...props}>
									Workspace
									<ChevronDownIcon
										aria-hidden="true"
										class="transition-transform duration-150 group-data-[state=closed]/collapsible:-rotate-90 motion-reduce:transition-none"
									/>
								</Collapsible.Trigger>
							{/snippet}
						</Sidebar.GroupLabel>
						<Collapsible.Content>
							<Sidebar.Menu>
								{#each workspace as item (item.label)}
									{@render navigationRow(item)}
								{/each}
							</Sidebar.Menu>
						</Collapsible.Content>
					</Collapsible.Root>
				</Sidebar.Group>
			</nav>
		</Sidebar.Content>
	</Sidebar.Root>

	<section class="z-0 m-1 flex min-w-0 flex-1 flex-col rounded-lg border bg-background">
		<header class="flex items-center gap-2 border-b p-2">
			<Sidebar.Trigger label="Toggle sidebar" aria-controls={panelId} />
			<h3 class="truncate text-[13px] font-medium" aria-live="polite">{current}</h3>
		</header>
	</section>
</Sidebar.Provider>

{#snippet navigationRow(item: (typeof primary)[number] | (typeof workspace)[number])}
	<Sidebar.MenuItem>
		<Sidebar.MenuButton
			type="button"
			size={item.label === "Projects" ? "sm" : "default"}
			aria-label={item.label}
			aria-current={current === item.label ? "page" : undefined}
			isActive={current === item.label}
			tooltipContent={item.label}
			onclick={() => (current = item.label)}
		>
			<item.icon aria-hidden="true" />
			<span class="group-data-[collapsible=icon]:sr-only">{item.label}</span>
		</Sidebar.MenuButton>
		{#if item.label === "Notifications"}
			<Sidebar.MenuBadge>4</Sidebar.MenuBadge>
		{/if}
	</Sidebar.MenuItem>
{/snippet}
