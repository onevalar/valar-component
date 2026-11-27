<script setup lang="ts">
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@valar/vue-ui/sidebar";
import { ref } from "vue";

const destinations = [
	{ id: "issues", label: "My issues", path: "M4 4h16v16H4z M8 9h8m-8 5h8" },
	{ id: "inbox", label: "Inbox", path: "M4 4h16l2 10v5H2v-5zm-2 10h6l2 2h4l2-2h6" },
] as const;
const active = ref<string>("issues");
const shortcuts = ref(true);
const refreshes = ref(0);
</script>

<template>
	<section aria-label="Sidebar examples">
		<SidebarProvider appearance="workspace" :keyboard-shortcut="shortcuts">
			<Sidebar
				id="workspace-nav"
				variant="inset"
				collapsible="icon"
				mobile-title="Workspace navigation"
				mobile-description="Jump between your issues and inbox."
			>
				<SidebarHeader>
					<span class="px-2 text-sm font-semibold group-data-[collapsible=icon]:sr-only"
						>Workspace</span
					>
					<span
						aria-hidden="true"
						class="hidden h-5 w-8 text-center text-sm font-semibold group-data-[collapsible=icon]:block"
						>W</span
					>
				</SidebarHeader>
				<SidebarContent>
					<nav aria-label="Workspace">
						<SidebarGroup>
							<SidebarGroupLabel>Personal</SidebarGroupLabel>
							<SidebarMenu>
								<SidebarMenuItem v-for="{ id, label, path } in destinations" :key="id">
									<SidebarMenuButton as-child :is-active="active === id" :tooltip-content="label">
										<a
											:href="`#${id}`"
											:aria-current="active === id ? 'page' : undefined"
											@click="active = id"
										>
											<svg
												aria-hidden="true"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="1.75"
												stroke-linejoin="round"
											>
												<path :d="path" />
											</svg>
											<span>{{ label }}</span>
										</a>
									</SidebarMenuButton>
									<SidebarMenuBadge v-if="id === 'inbox'" aria-label="3 unread">3</SidebarMenuBadge>
									<SidebarMenuAction
										v-if="id === 'issues'"
										aria-label="Refresh issues"
										@click="refreshes++"
										show-on-hover
										>↻</SidebarMenuAction
									>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroup>
					</nav>
				</SidebarContent>
				<SidebarRail aria-label="Toggle from sidebar edge" />
			</Sidebar>
			<SidebarInset>
				<header class="flex items-center gap-2 border-b px-3 py-2">
					<SidebarTrigger label="Toggle workspace navigation" aria-controls="workspace-nav" />
					<h1 class="text-sm font-semibold">{{ active === "issues" ? "My issues" : "Inbox" }}</h1>
				</header>
				<div class="grid w-full max-w-md gap-4 p-4 pt-12 text-sm">
					<label class="grid gap-1"
						>Issue title
						<input
							class="min-w-0 rounded-md border px-2 py-1 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
							value="Workspace filters"
					/></label>
					<div
						role="textbox"
						aria-label="Issue notes"
						contenteditable="true"
						class="min-h-16 rounded-md border p-2 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
					>
						<span>Update the filters before review.</span>
					</div>
					<label class="flex items-center gap-2"
						><input v-model="shortcuts" type="checkbox" /> Enable sidebar keyboard shortcut</label
					>
					<p role="status">{{ refreshes > 0 ? `Issues refreshed (${refreshes})` : "" }}</p>
				</div>
			</SidebarInset>
		</SidebarProvider>
	</section>
</template>
