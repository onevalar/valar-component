<script lang="ts">
	import CircleIcon from "@lucide/svelte/icons/circle";
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import ClipboardIcon from "@lucide/svelte/icons/clipboard";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import TrashIcon from "@lucide/svelte/icons/trash";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const statuses = ["Todo", "In progress", "Done"];
	let status = $state("Todo");
	let feedback = $state("");
	let menuOpen = $state(false);
	let statusSearch = $state<HTMLInputElement | null>(null);
	let confirm = $state(false);
	let deleted = $state(false);
	let trigger = $state<HTMLElement | null>(null);
	let returnFocus = $state<HTMLElement | null>(null);
	let reset = $state<HTMLButtonElement | null>(null);

	function showDetail(value: "id" | "title") {
		feedback = value === "id" ? "Issue ID: VLR-12" : "Issue title: Review design tokens";
	}

	function requestDelete(origin: HTMLElement | null) {
		returnFocus = origin;
		confirm = true;
	}
</script>

<div class="grid w-full max-w-sm gap-3">
	{#if deleted}
		<p role="status" class="text-sm text-muted-foreground">Issue deleted</p>
		<Button
			bind:ref={reset}
			size="sm"
			variant="outline"
			class="w-fit"
			onclick={() => {
				deleted = false;
				status = "Todo";
				feedback = "";
			}}
		>
			Restore sample
		</Button>
	{:else}
		<ContextMenu.Root bind:open={menuOpen}>
			<ContextMenu.Trigger
				bind:ref={trigger}
				role="group"
				aria-label="Issue VLR-12"
				tabindex={0}
				class="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
			>
				<span class="flex min-w-0 items-center gap-2">
					<span class="shrink-0 text-xs text-muted-foreground">VLR-12</span>
					<span class="truncate">Review design tokens</span>
				</span>
				<span class="shrink-0 text-xs text-muted-foreground">{status}</span>
			</ContextMenu.Trigger>
			<ContextMenu.Content
				aria-label="Issue actions"
				onCloseAutoFocus={(event) => {
					if (confirm) event.preventDefault();
				}}
			>
				<ContextMenu.Sub>
					<ContextMenu.SubTrigger aria-haspopup="dialog"
						><CircleIcon />Status</ContextMenu.SubTrigger
					>
					<ContextMenu.SubContent
						elevated
						role="dialog"
						aria-label="Issue status"
						class="w-[175px] p-0"
						onOpenAutoFocus={(event) => {
							event.preventDefault();
							statusSearch?.focus({ preventScroll: true });
						}}
					>
						<Command.Root
							appearance="compact"
							class="bg-transparent p-0 [&_[data-slot=command-input-wrapper]_[data-slot=input-group]]:h-9!"
							onkeydown={(event) => {
								if (event.key !== "Escape" && event.key !== "Tab") event.stopPropagation();
							}}
						>
							<Command.Input
								bind:ref={statusSearch}
								placeholder="Filter…"
								aria-label="Filter statuses"
							/>
							<Command.List aria-label="Issue statuses">
								<Command.Empty>No matching statuses</Command.Empty>
								{#each statuses as option (option)}
									<Command.Item
										value={option}
										data-checked={status === option}
										aria-current={status === option ? "true" : undefined}
										onSelect={() => {
											status = option;
											menuOpen = false;
										}}
									>
										{#if option === "Done"}<CircleCheckIcon />{:else}<CircleIcon />{/if}
										{option}
									</Command.Item>
								{/each}
							</Command.List>
						</Command.Root>
					</ContextMenu.SubContent>
				</ContextMenu.Sub>
				<ContextMenu.Separator />
				<ContextMenu.Sub>
					<ContextMenu.SubTrigger><CopyIcon />Copy</ContextMenu.SubTrigger>
					<ContextMenu.SubContent aria-label="Copy issue details">
						<ContextMenu.Item onSelect={() => showDetail("id")}>
							<ClipboardIcon />Issue ID
						</ContextMenu.Item>
						<ContextMenu.Item onSelect={() => showDetail("title")}>Issue title</ContextMenu.Item>
					</ContextMenu.SubContent>
				</ContextMenu.Sub>
				<ContextMenu.Separator />
				<ContextMenu.Item onSelect={() => requestDelete(trigger)}
					><TrashIcon />Delete…</ContextMenu.Item
				>
			</ContextMenu.Content>
		</ContextMenu.Root>

		<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
			<label class="flex items-center gap-2">
				Status
				<select
					bind:value={status}
					class="rounded border bg-background px-1.5 py-1 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
				>
					{#each statuses as option (option)}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</label>
			<Button variant="link" size="sm" class="h-auto p-0" onclick={() => showDetail("id")}>
				Show issue ID
			</Button>
			<Button variant="link" size="sm" class="h-auto p-0" onclick={() => showDetail("title")}>
				Show issue title
			</Button>
			<button
				type="button"
				class="rounded underline underline-offset-2 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
				onclick={(event) => requestDelete(event.currentTarget)}>Delete issue</button
			>
		</div>
		<p role="status" class="min-h-5 text-xs text-muted-foreground">
			{feedback || "Right-click the row or press Shift+F10."}
		</p>
	{/if}
</div>

<AlertDialog.Root bind:open={confirm}>
	<AlertDialog.Content
		appearance="danger"
		focusCancel
		onCloseAutoFocus={(event) => {
			event.preventDefault();
			(deleted ? reset : returnFocus)?.focus({ preventScroll: true });
		}}
	>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete issue?</AlertDialog.Title>
			<AlertDialog.Description>Delete the sample issue VLR-12.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				variant="destructive"
				onclick={() => {
					deleted = true;
					confirm = false;
				}}>Delete issue</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
