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
} from "@valar/react-ui/sidebar";
import { useState } from "react";

const destinations = [
	{ id: "issues", label: "My issues", path: "M4 4h16v16H4z M8 9h8m-8 5h8" },
	{ id: "inbox", label: "Inbox", path: "M4 4h16l2 10v5H2v-5zm-2 10h6l2 2h4l2-2h6" },
] as const;

export default function SidebarExample() {
	const [active, setActive] = useState<string>("issues");
	const [shortcuts, setShortcuts] = useState(true);
	const [refreshes, setRefreshes] = useState(0);
	return (
		<section aria-label="Sidebar examples">
			<SidebarProvider appearance="workspace" keyboardShortcut={shortcuts}>
				<Sidebar
					id="workspace-nav"
					variant="inset"
					collapsible="icon"
					mobileTitle="Workspace navigation"
					mobileDescription="Jump between your issues and inbox."
				>
					<SidebarHeader>
						<span className="px-2 text-sm font-semibold group-data-[collapsible=icon]:sr-only">
							Workspace
						</span>
						<span
							aria-hidden="true"
							className="hidden h-5 w-8 text-center text-sm font-semibold group-data-[collapsible=icon]:block"
						>
							W
						</span>
					</SidebarHeader>
					<SidebarContent>
						<nav aria-label="Workspace">
							<SidebarGroup>
								<SidebarGroupLabel>Personal</SidebarGroupLabel>
								<SidebarMenu>
									{destinations.map(({ id, label, path }) => (
										<SidebarMenuItem key={id}>
											<SidebarMenuButton asChild isActive={active === id} tooltipContent={label}>
												<a
													href={`#${id}`}
													aria-current={active === id ? "page" : undefined}
													onClick={() => setActive(id)}
												>
													<svg
														aria-hidden="true"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.75"
														strokeLinejoin="round"
													>
														<path d={path} />
													</svg>
													<span>{label}</span>
												</a>
											</SidebarMenuButton>
											{id === "inbox" && (
												<SidebarMenuBadge aria-label="3 unread">3</SidebarMenuBadge>
											)}
											{id === "issues" && (
												<SidebarMenuAction
													aria-label="Refresh issues"
													onClick={() => setRefreshes(refreshes + 1)}
													showOnHover
												>
													↻
												</SidebarMenuAction>
											)}
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroup>
						</nav>
					</SidebarContent>
					<SidebarRail aria-label="Toggle from sidebar edge" />
				</Sidebar>
				<SidebarInset>
					<header className="flex items-center gap-2 border-b px-3 py-2">
						<SidebarTrigger label="Toggle workspace navigation" aria-controls="workspace-nav" />
						<h1 className="text-sm font-semibold">{active === "issues" ? "My issues" : "Inbox"}</h1>
					</header>
					<div className="grid w-full max-w-md gap-4 p-4 pt-12 text-sm">
						<label className="grid gap-1">
							Issue title{" "}
							<input
								className="min-w-0 rounded-md border px-2 py-1 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								defaultValue="Workspace filters"
							/>
						</label>
						<div
							role="textbox"
							aria-label="Issue notes"
							contentEditable
							suppressContentEditableWarning
							className="min-h-16 rounded-md border p-2 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
						>
							<span>Update the filters before review.</span>
						</div>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={shortcuts}
								onChange={(event) => setShortcuts(event.target.checked)}
							/>{" "}
							Enable sidebar keyboard shortcut
						</label>
						<p role="status">{refreshes > 0 && `Issues refreshed (${refreshes})`}</p>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</section>
	);
}
