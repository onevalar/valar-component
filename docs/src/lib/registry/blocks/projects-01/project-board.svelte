<script lang="ts">
	import { DragDropProvider, PointerSensor } from "@dnd-kit-svelte/svelte";
	import { Accessibility, defaultPreset } from "@dnd-kit/dom";
	import { tick, type Snippet } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import BoardCard from "./board-card.svelte";
	import BoardColumn from "./board-column.svelte";
	import { statuses, type Project, type Status } from "./data.js";

	let {
		projects,
		chinese,
		portal,
		showEmpty,
		onCreate,
		onOpen,
		onStatusChange,
		projectIcon,
		statusIcon,
		leadDisplay,
	}: {
		projects: readonly Project[];
		chinese: boolean;
		portal: { to: string };
		showEmpty: boolean;
		onCreate: (event: MouseEvent, status: Status) => void;
		onOpen: (id: string) => void;
		onStatusChange: (id: string, status: Status) => void;
		projectIcon: Snippet;
		statusIcon: Snippet<[Status]>;
		leadDisplay: Snippet<[Project]>;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const plugins = defaultPreset.plugins.filter((plugin) => plugin !== Accessibility);
	const sensors = [
		PointerSensor.configure({
			activationConstraints: (event) =>
				event.pointerType === "touch"
					? { delay: { value: 170, tolerance: 8 } }
					: { distance: { value: 6 } },
		}),
	];

	let board: HTMLDivElement;
	let dragging = $state(false);
	let announcement = $state("");

	async function move(id: string, target: Status, focus: "open" | "move") {
		const project = projects.find((item) => item.id === id);
		const status = statuses.find((item) => item.id === target);
		if (!project || !status || project.status === target) return;
		onStatusChange(id, target);
		await tick();
		announcement = chinese
			? project.name + " 已移至「" + status.zh + "」"
			: project.name + " moved to " + status.en;
		if (!board?.isConnected) return;
		const column = board.querySelector('[data-project-column="' + target + '"]');
		const card = Array.from(
			column?.querySelectorAll<HTMLElement>("[data-project-card]:not([data-dnd-placeholder])") ?? []
		).find((item) => item.dataset.projectCard === id);
		(card?.querySelector<HTMLElement>("[data-project-card-" + focus + "]") ?? board).focus();
	}
</script>

<DragDropProvider
	{sensors}
	{plugins}
	onDragStart={() => (dragging = true)}
	onDragEnd={({ operation, canceled }) => {
		dragging = false;
		const { source, target } = operation;
		const status = statuses.find((item) => item.id === target?.id);
		if (!canceled && source && status) void move(String(source.id), status.id, "open");
	}}
>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (The board can scroll horizontally with the keyboard.) -->
	<div
		bind:this={board}
		aria-label={text("项目看板", "Projects board")}
		role="region"
		tabindex="0"
		class="flex min-h-[400px] gap-2 overflow-x-auto px-2 pb-3 focus-visible:outline-ring"
	>
		{#each statuses as status (status.id)}
			{@const group = projects.filter((project) => project.status === status.id)}
			{#if group.length || (showEmpty && (status.id !== "canceled" || dragging))}
				<BoardColumn status={status.id} label={chinese ? status.zh : status.en}>
					<header class="flex h-12 items-center gap-2 px-1 text-[13px]">
						{@render statusIcon(status.id)}
						<h3 class="font-medium">{chinese ? status.zh : status.en}</h3>
						<span class="text-muted-foreground">{group.length}</span>
						<Button
							variant="ghost"
							size="icon-xs"
							class="ml-auto"
							aria-label={text("在此状态新建项目：", "New project in ") +
								(chinese ? status.zh : status.en)}
							onclick={(event) => onCreate(event, status.id)}>+</Button
						>
					</header>
					<div class="space-y-2">
						{#each group as project (project.id)}
							<BoardCard
								{project}
								{chinese}
								{portal}
								{onOpen}
								onMove={move}
								{projectIcon}
								{statusIcon}
								{leadDisplay}
							/>
						{/each}
					</div>
				</BoardColumn>
			{/if}
		{/each}
	</div>
	<span role="status" class="sr-only">{announcement}</span>
</DragDropProvider>
