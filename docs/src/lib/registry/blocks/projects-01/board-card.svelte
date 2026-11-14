<script lang="ts">
	import { useDraggable } from "@dnd-kit-svelte/svelte";
	import * as Menu from "$lib/registry/ui/dropdown-menu/index.js";
	import { dateLabel } from "$lib/registry/ui/date-picker/index.js";
	import { statuses, type Project, type Status } from "./data.js";
	import type { Snippet } from "svelte";

	let {
		project,
		chinese,
		portal,
		onOpen,
		onMove,
		projectIcon,
		statusIcon,
		leadDisplay,
	}: {
		project: Project;
		chinese: boolean;
		portal: { to: string };
		onOpen: (id: string) => void;
		onMove: (id: string, status: Status, focus: "open" | "move") => void;
		projectIcon: Snippet;
		statusIcon: Snippet<[Status]>;
		leadDisplay: Snippet<[Project]>;
	} = $props();
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const { ref, handleRef, isDragSource } = useDraggable({ id: () => project.id });
</script>

<div
	{@attach ref}
	data-project-card={project.id}
	data-dragging={isDragSource.current ? "" : undefined}
	class="relative rounded-[10px] border border-border bg-(--project-control) shadow-xs focus-within:border-(--project-accent)/65 hover:bg-accent data-dragging:z-20"
>
	<button
		{@attach handleRef}
		type="button"
		data-project-card-open
		class="block w-full rounded-[inherit] px-3 py-2.5 text-left text-[13px] focus-visible:outline-ring [@media(pointer:fine)]:cursor-grab"
		onclick={() => onOpen(project.id)}
	>
		<span class="flex items-center gap-2 pe-7">
			<span class="touch-none">{@render projectIcon()}</span><span
				class="min-w-0 flex-1 truncate font-medium">{project.name}</span
			>
			{@render statusIcon(project.status)}{@render leadDisplay(project)}
		</span>
		{#if project.target}
			<span class="mt-2 block text-xs text-muted-foreground"
				>{dateLabel(project.target, chinese ? "zh-CN" : "en")}</span
			>
		{/if}
		<span class="mt-2 block text-xs text-muted-foreground">
			{chinese ? project.issues + " 个问题" : project.issues + " issues"}
		</span>
	</button>
	<Menu.Root>
		<Menu.Trigger
			data-project-card-move
			aria-label={text("移动项目：", "Move project: ") + project.name}
			class="absolute end-2 top-2 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-(--project-panel) hover:text-foreground focus-visible:outline-ring"
		>
			<span aria-hidden="true">⠿</span>
		</Menu.Trigger>
		<Menu.Content appearance="surface" portalProps={portal} align="end" class="w-40">
			<Menu.Group>
				<Menu.Label>{text("移至状态", "Move to status")}</Menu.Label>
				{#each statuses as status (status.id)}
					<Menu.Item
						disabled={status.id === project.status}
						onSelect={() => onMove(project.id, status.id, "move")}
					>
						{@render statusIcon(status.id)}{chinese ? status.zh : status.en}
					</Menu.Item>
				{/each}
			</Menu.Group>
		</Menu.Content>
	</Menu.Root>
</div>
