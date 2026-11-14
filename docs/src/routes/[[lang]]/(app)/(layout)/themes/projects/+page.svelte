<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Metadata from "$lib/components/metadata.svelte";
	import Projects from "$lib/registry/blocks/projects-01/+page.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "Projects 项目示例" : "Projects example");
	const description = $derived(
		zh
			? "在显示选项切换列表、看板和时间线。拖动看板卡片改变状态，或在时间线上查看日期和里程碑。"
			: "Use display options to switch between list, board, and timeline. Drag cards to change status, or explore dates and milestones on the timeline."
	);
	const cases = ["sample", "empty", "single"] as const;
	const labels = {
		sample: ["示例数据", "Sample projects"],
		empty: ["空工作区", "Empty workspace"],
		single: ["单团队", "Single team"],
	};
	let scenario = $state<(typeof cases)[number]>("sample");
</script>

<Metadata {title} {description} />

<div class="container-wrapper">
	<div class="container max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
		<header>
			<a
				href={localizeHref("/themes", locale)}
				class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="size-4" />
				{zh ? "设计 token" : "Design tokens"}
			</a>
			<h1 class="text-3xl font-semibold tracking-tight">{title}</h1>
			<p class="mt-2 text-sm text-muted-foreground">{description}</p>
		</header>
		<div role="group" aria-label={zh ? "预览数据" : "Preview data"} class="flex flex-wrap gap-2">
			{#each cases as item (item)}
				<Button
					variant={scenario === item ? "secondary" : "outline"}
					size="sm"
					aria-pressed={scenario === item}
					onclick={() => (scenario = item)}>{labels[item][zh ? 0 : 1]}</Button
				>
			{/each}
		</div>
		{#key scenario}
			<Projects chinese={zh} empty={scenario === "empty"} singleTeam={scenario === "single"} />
		{/key}
	</div>
</div>
