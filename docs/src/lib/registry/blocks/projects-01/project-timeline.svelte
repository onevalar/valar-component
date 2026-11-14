<script lang="ts">
	import { parseDate, today, type CalendarDate } from "@internationalized/date";
	import { onMount, tick, type Snippet } from "svelte";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { dateLabel, DatePicker } from "$lib/registry/ui/date-picker/index.js";
	import { type Milestone, type Project, type Status } from "./data.js";
	import { dependencyDates, type ProjectDependencies } from "./project-dependencies.js";
	import {
		buildTimeline,
		timelineProjectDates,
		timelineScales,
		type TimelineScale,
	} from "./timeline-model.js";

	let {
		projects,
		chinese,
		portal,
		scale = $bindable("month"),
		showList,
		showWeeks,
		showMilestones,
		showDependencies,
		dependencies,
		onMilestoneDateChange,
		onOpen,
		projectIcon,
		statusIcon,
		emptyState,
	}: {
		projects: readonly Project[];
		chinese: boolean;
		portal: { to: string };
		scale?: TimelineScale;
		showList: boolean;
		showWeeks: boolean;
		showMilestones: boolean;
		showDependencies: boolean;
		dependencies: ProjectDependencies;
		onMilestoneDateChange: (project: Project, milestone: Milestone, date: string) => void;
		onOpen: (id: string) => void;
		projectIcon: Snippet;
		statusIcon: Snippet<[Status]>;
		emptyState: Snippet;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const currentDate = today("UTC");
	let anchor = $state.raw(currentDate);
	let zoomOpen = $state(false);
	let region: HTMLElement;
	let scrollport: HTMLDivElement;
	let sidebar: HTMLDivElement | undefined;
	const axis = $derived(buildTimeline(anchor, scale, chinese));
	const selectedScale = $derived(timelineScales.find((item) => item.id === scale)!);
	const inRange = (date: CalendarDate) =>
		date.compare(axis.start) >= 0 && date.compare(axis.end) < 0;
	// The axis header is 44px high and each project row is 72px high. The date bar is centered at 41px in its row.
	const barCenter = (row: number) => 44 + row * 72 + 41;
	const dependencyLines = $derived.by(() => {
		if (!showDependencies) return [];
		const rows = new Map(projects.map((project, index) => [project.id, { project, index }]));
		return projects.flatMap((project, index) =>
			(dependencies[project.id] ?? []).flatMap((id) => {
				const blocker = rows.get(id);
				if (!blocker) return [];
				const dates = dependencyDates(blocker.project, project);
				if (!dates || !inRange(dates.end) || !inRange(dates.start)) return [];
				const from = Math.min(axis.width, axis.offset(dates.end) + axis.dayWidth);
				const to = axis.offset(dates.start);
				const elbow = (from + to) / 2;
				return [
					{
						id: id + ":" + project.id,
						from,
						to,
						elbow,
						fromY: barCenter(blocker.index),
						toY: barCenter(index),
						violated: dates.violated,
					},
				];
			})
		);
	});
	const shortDate = (date: CalendarDate) =>
		dateLabel({ date: date.toString(), grain: "day" }, chinese ? "zh-CN" : "en");
	const control = "h-6 rounded-full border-border bg-(--project-control) px-2.5 text-xs";

	function centerX() {
		return ((sidebar?.offsetWidth ?? 0) + scrollport.clientWidth) / 2;
	}

	function centeredDate() {
		return axis.start.add({
			days: Math.round(
				(scrollport.scrollLeft + centerX() - (sidebar?.offsetWidth ?? 0)) / axis.dayWidth
			),
		});
	}

	async function centerOn(date: CalendarDate) {
		// Keep space on both sides even when navigating beyond the previous range.
		anchor = date;
		await tick();
		if (scrollport)
			scrollport.scrollLeft = axis.offset(date) + (sidebar?.offsetWidth ?? 0) - centerX();
	}

	function zoom(next: TimelineScale) {
		if (next === scale) return;
		const date = centeredDate();
		scale = next;
		void centerOn(date);
	}

	function navigate(direction: -1 | 1) {
		const date = centeredDate();
		void centerOn(
			direction === 1 ? date.add(selectedScale.step) : date.subtract(selectedScale.step)
		);
	}

	function handleKeys(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.repeat ||
			event.metaKey ||
			event.altKey ||
			event.ctrlKey ||
			event.shiftKey ||
			!(event.target instanceof HTMLElement) ||
			!region?.contains(event.target) ||
			event.target.closest("input,textarea,[contenteditable],[role='dialog'],[role='menu']")
		)
			return;
		const key = event.key.toLowerCase();
		const next = timelineScales.find((item) => item.key === key);
		if (key !== "t" && !next) return;
		event.preventDefault();
		if (next) zoom(next.id);
		else void centerOn(currentDate);
	}

	function openFromList(project: Project) {
		const dates = timelineProjectDates(project, currentDate);
		if (project.start || project.target) void centerOn(project.start ? dates.start : dates.end);
		onOpen(project.id);
	}

	onMount(() => {
		void centerOn(currentDate);
	});
</script>

<svelte:window onkeydown={handleKeys} />

<section
	bind:this={region}
	aria-label={text("项目时间线", "Projects timeline")}
	data-scale={scale}
	class="relative isolate min-w-0 border-t border-border/60"
>
	<div
		class="absolute end-2 top-1.5 z-30 flex items-center gap-1 rounded-full bg-(--project-panel) p-0.5 sm:end-3"
	>
		<Button
			type="button"
			size="xs"
			variant="outline"
			class="size-6 rounded-full px-0"
			aria-label={text("上一时间段", "Previous period")}
			onclick={() => navigate(-1)}>‹</Button
		>
		<Button
			type="button"
			size="xs"
			variant="outline"
			class="size-6 rounded-full px-0"
			aria-label={text("下一时间段", "Next period")}
			onclick={() => navigate(1)}>›</Button
		>
		<Button
			type="button"
			size="xs"
			variant="outline"
			class={control}
			aria-keyshortcuts="T"
			onclick={() => centerOn(currentDate)}>{text("今天", "Today")}</Button
		>
		<Popover.Root bind:open={zoomOpen}>
			<Popover.Trigger
				class={control + " inline-flex items-center gap-1 border hover:bg-accent"}
				aria-label={text("时间线缩放", "Timeline zoom")}
			>
				{chinese ? selectedScale.zh : selectedScale.en}<span aria-hidden="true">⌄</span>
			</Popover.Trigger>
			<Popover.Content
				appearance="surface"
				portalProps={portal}
				align="end"
				role="dialog"
				aria-label={text("时间线缩放", "Timeline zoom")}
				class="w-32 gap-0 p-1"
			>
				{#each timelineScales as item (item.id)}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						aria-pressed={scale === item.id}
						aria-keyshortcuts={item.key.toUpperCase()}
						class="justify-between text-xs aria-pressed:bg-accent"
						onclick={() => {
							zoom(item.id);
							zoomOpen = false;
						}}
					>
						{chinese ? item.zh : item.en}<span aria-hidden="true" class="text-muted-foreground"
							>{item.key.toUpperCase()}</span
						>
					</Button>
				{/each}
			</Popover.Content>
		</Popover.Root>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex (The date axis is independently scrollable.) -->
	<div
		bind:this={scrollport}
		role="region"
		tabindex="0"
		aria-label={text("滚动查看项目日期", "Scroll project dates")}
		class="min-w-0 overflow-x-auto focus-visible:outline-ring"
	>
		<div
			style:--timeline-width={axis.width + "px"}
			class={[
				"relative grid min-h-[398px] w-max min-w-full auto-rows-min grid-cols-[var(--timeline-sidebar)_var(--timeline-width)] content-start",
				showList && projects.length
					? "[--timeline-sidebar:120px] sm:[--timeline-sidebar:224px]"
					: "[--timeline-sidebar:0px]",
			]}
		>
			<div
				class="pointer-events-none absolute inset-y-0 start-(--timeline-sidebar) w-(--timeline-width)"
				aria-hidden="true"
			>
				{#each axis.labels as month (month.key)}
					<div
						class="absolute inset-y-0 border-s border-dashed border-border/70"
						style:left={month.left + "px"}
					></div>
				{/each}
				{#if inRange(currentDate)}
					<div
						class="absolute inset-y-0 border-s border-(--project-accent)/65"
						style:left={axis.offset(currentDate) + "px"}
					></div>
				{/if}
			</div>
			{#if dependencyLines.length}
				<div
					class="pointer-events-none absolute inset-y-0 start-(--timeline-sidebar) z-10 w-(--timeline-width)"
					aria-hidden="true"
				>
					{#each dependencyLines as line (line.id)}
						<div
							data-project-dependency={line.id}
							data-violated={line.violated}
							class={line.violated ? "text-destructive" : "text-blue-600 dark:text-blue-400"}
						>
							<span
								class="absolute h-px bg-current"
								style:left={Math.min(line.from, line.elbow) + "px"}
								style:top={line.fromY + "px"}
								style:width={Math.max(1, Math.abs(line.from - line.elbow)) + "px"}
							></span>
							<span
								class="absolute w-px bg-current"
								style:left={line.elbow + "px"}
								style:top={Math.min(line.fromY, line.toY) + "px"}
								style:height={Math.abs(line.fromY - line.toY) + "px"}
							></span>
							<span
								class="absolute h-px bg-current"
								style:left={Math.min(line.to, line.elbow) + "px"}
								style:top={line.toY + "px"}
								style:width={Math.max(1, Math.abs(line.to - line.elbow)) + "px"}
							></span>
						</div>
					{/each}
				</div>
			{/if}
			<div
				bind:this={sidebar}
				class="sticky start-0 z-20 col-start-1 row-start-1 h-11 overflow-hidden bg-(--project-panel)"
			></div>
			<div
				class="relative col-start-2 row-start-1 h-11 border-b border-border/70 text-[11px] text-muted-foreground"
				aria-hidden="true"
			>
				{#each axis.labels as month (month.key)}
					<span
						class="absolute top-1.5 truncate px-1.5 font-medium uppercase"
						style:left={month.left + "px"}
						style:width={month.width + "px"}>{month.text}</span
					>
				{/each}
				{#each axis.ticks as tick (tick.key)}
					<span
						class="absolute bottom-1 truncate border-s border-border/75 px-1 text-[10px]"
						style:left={tick.left + "px"}
						>{showWeeks && (scale !== "week" || tick.monday) ? "W" + tick.week : tick.text}</span
					>
				{/each}
				{#if inRange(currentDate)}
					<span
						class="absolute bottom-1 -translate-x-1/2 rounded-full bg-(--project-accent) px-1.5 text-[10px] leading-4 font-medium whitespace-nowrap text-white"
						style:left={axis.offset(currentDate) + "px"}>{shortDate(currentDate)}</span
					>
				{/if}
			</div>
			{#each projects as project (project.id)}
				{@const dates = timelineProjectDates(project, currentDate)}
				{@const left = Math.max(axis.offset(dates.start), 0)}
				{@const right = Math.min(axis.offset(dates.end) + axis.dayWidth, axis.width)}
				{@const dated = !!project.start || !!project.target}
				<div
					class="sticky start-0 z-20 col-start-1 flex min-w-0 items-center overflow-hidden border-b border-border/55 bg-(--project-panel)"
				>
					{#if showList}
						<button
							type="button"
							class="flex h-full w-full items-center gap-1.5 px-2 text-start text-[13px] hover:bg-accent focus-visible:outline-ring sm:gap-2 sm:px-3"
							onclick={() => openFromList(project)}
						>
							{@render projectIcon()}<span class="min-w-0 flex-1 truncate" title={project.name}
								>{project.name}</span
							>
							<span class="hidden sm:inline-flex">{@render statusIcon(project.status)}</span>
						</button>
					{/if}
				</div>
				<div class="relative col-start-2 h-[72px] min-w-0 border-b border-border/55">
					{#if right > left}
						<span
							class="pointer-events-none absolute top-2 truncate text-[13px] whitespace-nowrap"
							style:left={left + "px"}
							style:max-width={Math.min(240, axis.width - left) + "px"}
							aria-hidden="true">{project.name}</span
						>
						<button
							type="button"
							data-project-bar={project.id}
							data-dated={dated}
							aria-label={project.name +
								" · " +
								(dated
									? (project.start
											? dateLabel(project.start, chinese ? "zh-CN" : "en")
											: text("开始未定", "No start date")) +
										" – " +
										(project.target
											? dateLabel(project.target, chinese ? "zh-CN" : "en")
											: text("目标未定", "No target date"))
									: text("未排期", "Unscheduled"))}
							style:left={left + "px"}
							style:width={Math.min(Math.max(20, right - left), axis.width - left) + "px"}
							class={[
								"absolute top-7 h-[26px] overflow-hidden rounded-md border border-border bg-(--project-control) text-start hover:border-(--project-accent)/65 focus-visible:z-10 focus-visible:outline-ring",
								!dated && "border-dashed",
							]}
							onclick={() => onOpen(project.id)}
						>
							{#if dates.openStart}<span
									aria-hidden="true"
									class="absolute inset-y-0 start-0 w-1/3 bg-linear-to-r from-(--project-panel) to-transparent"
								></span>{/if}
							{#if dates.openEnd}<span
									aria-hidden="true"
									class="absolute inset-y-0 end-0 w-1/3 bg-linear-to-l from-(--project-panel) to-transparent"
								></span>{/if}
							{#if project.progress}<span
									aria-hidden="true"
									class="absolute inset-y-0 start-0 bg-(--project-accent)/20"
									style:width={project.progress + "%"}
								></span>{/if}
						</button>
					{/if}
					{#if showMilestones}
						{#each project.milestones ?? [] as milestone (milestone.id)}
							{@const date = parseDate(milestone.date)}
							{#if inRange(date)}
								<div class="absolute top-7 -translate-x-1/2" style:left={axis.offset(date) + "px"}>
									<Popover.Root>
										<Popover.Trigger
											aria-label={text("里程碑：", "Milestone: ") + milestone.name}
											title={milestone.name + " · " + shortDate(date)}
											class="flex size-[26px] items-center justify-center rounded-sm focus-visible:outline-ring"
										>
											<span
												aria-hidden="true"
												class={[
													"size-2 rotate-45 rounded-[1px] border",
													milestone.progress >= 100
														? "border-emerald-600 bg-emerald-600/35 dark:border-emerald-400"
														: "border-amber-600 bg-amber-500/25 dark:border-amber-400",
												]}
											></span>
										</Popover.Trigger>
										<Popover.Content
											appearance="surface"
											portalProps={portal}
											role="dialog"
											aria-label={milestone.name}
											class="w-48 gap-1 p-2.5 text-xs"
										>
											<strong>{milestone.name}</strong>
											<span class="text-muted-foreground"
												>{shortDate(date)} · {milestone.progress}% {text("完成", "complete")}</span
											>
											<DatePicker
												label={text("编辑里程碑日期", "Edit milestone date")}
												value={{ date: milestone.date, grain: "day" }}
												precisions={["day"]}
												allowClear={false}
												locale={chinese ? "zh-CN" : "en"}
												portalProps={portal}
												onValueChange={(next) => {
													if (!next) return;
													onMilestoneDateChange(project, milestone, next.date);
													if (!inRange(parseDate(next.date))) void centerOn(parseDate(next.date));
												}}
											/>
										</Popover.Content>
									</Popover.Root>
									{#if scale === "week"}
										<span
											aria-hidden="true"
											class="pointer-events-none absolute top-[25px] left-1/2 max-w-24 -translate-x-1/2 truncate text-[10px] text-muted-foreground"
											>{milestone.name}</span
										>
									{/if}
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			{/each}
		</div>
	</div>
	{#if !projects.length}
		<div class="absolute inset-x-0 top-11 bottom-0 grid place-items-center bg-(--project-panel)">
			{@render emptyState()}
		</div>
	{/if}
</section>
