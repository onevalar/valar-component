<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import { toast } from "svelte-sonner";
	import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import ComponentCodeViewer from "$lib/components/component-code-viewer/component-code-viewer.svelte";
	import ComponentGuide from "$lib/components/component-guide.svelte";
	import ComponentState from "$lib/components/component-state.svelte";
	import DocsCopyPage from "$lib/components/docs-copy-page.svelte";
	import DocsToc from "$lib/components/docs-toc.svelte";
	import FrameworkUsage from "$lib/components/framework-usage.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import {
		basicComponentAlignment,
		isAdvancedModuleSlug,
	} from "$lib/basic-component-visibility.js";
	import { categoryOf } from "$lib/component-categories.js";
	import { buildComponentAiSpec } from "$lib/component-ai-spec.js";
	import { copyText } from "$lib/hooks/use-clipboard.svelte.js";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { findNeighbors } from "$lib/navigation.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let { data } = $props();

	const Markdown = $derived(data.component);
	const doc = $derived(data.metadata);
	const apiLink = $derived(doc.links?.api);
	const docLink = $derived(doc.links?.doc);
	const neighbors = $derived(findNeighbors(page.url.pathname));
	const source = $derived(data.viewerData);
	// Three kinds of page: the two catalogs (card grids, full width), a single component (its
	// visual states first, notes and code second) and ordinary documentation.
	const locale = $derived(localeFromPathname(page.url.pathname));
	const path = $derived(page.url.pathname.replace(/\/$/, ""));
	const basicHref = $derived(localizeHref("/docs/components", locale));
	const advancedHref = $derived(localizeHref("/docs/ai-elements", locale));
	const isBasicPath = $derived(path.startsWith(`${basicHref}/`));
	const isAdvancedPath = $derived(path.startsWith(`${advancedHref}/`));
	const wide = $derived(path === basicHref || path === advancedHref);
	const slug = $derived(path.split("/").pop() ?? "");
	const isModule = $derived(isBasicPath && isAdvancedModuleSlug(slug));
	const isBasic = $derived(isBasicPath && !isModule);
	const isAdvanced = $derived(isAdvancedPath || isModule);
	const isComponent = $derived(isBasic || isAdvanced);
	const previews = $derived(doc.previews ?? []);
	const alignment = $derived(isBasic ? basicComponentAlignment(slug) : "aligned");
	const category = $derived(
		isComponent ? categoryOf(slug, isBasic ? "basic" : "advanced") : undefined
	);
	const showStates = $derived(isComponent && previews.length > 0);
	const requestedFramework = $derived(browser ? page.url.searchParams.get("framework") : null);
	const hasFramework = $derived(["svelte", "react", "vue"].includes(requestedFramework ?? ""));
	let tab = $state("states");
	let copyingAiSpec = $state(false);
	$effect(() => {
		path;
		tab = hasFramework ? "usage" : showStates ? "states" : "guide";
	});
	const showToc = $derived(!wide && !isComponent);
	const isChangelog = $derived(page.url.pathname.startsWith("/docs/changelog"));

	async function copyAiSpec() {
		if (copyingAiSpec) return;
		copyingAiSpec = true;
		try {
			const spec = await buildComponentAiSpec({
				slug,
				title: doc.title,
				description: doc.description,
				sourceDir: isBasicPath ? "components" : "ai-elements",
				locale,
			});
			const result = await copyText(spec);
			if (result === "success") {
				toast.success(locale === "zh" ? "已复制 AI 组件规范" : "Copied AI component spec");
			} else {
				toast.error(locale === "zh" ? "复制失败，请手动复制" : "Copy failed");
			}
		} finally {
			copyingAiSpec = false;
		}
	}
</script>

<Metadata
	title={doc.title}
	description={doc.description}
	ogImage={{
		url: `/og?title=${encodeURIComponent(doc.title)}&description=${encodeURIComponent(doc.description)}`,
	}}
	ogType="article"
/>

{#if isComponent}
	<!--
		A single component is its own level: workspace breadcrumb -> title row with a single
		restrained AI spec action -> dedicated tab row cleanly separating the three views.
	-->
	<div
		data-slot="docs"
		id="main-content"
		class="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 lg:py-8"
	>
		<Tabs.Root bind:value={tab} class="gap-6">
			<div class="flex flex-col gap-4">
				<div data-llm-ignore>
					<Breadcrumb.Root
						appearance="workspace"
						aria-label={locale === "zh" ? "当前位置" : "Breadcrumb"}
					>
						<Breadcrumb.List>
							<Breadcrumb.Item>
								<Breadcrumb.Link href={isBasic ? basicHref : advancedHref}>
									{isBasic ? t("components.basic") : t("components.complex")}
								</Breadcrumb.Link>
							</Breadcrumb.Item>
							{#if category}
								<Breadcrumb.Separator />
								<Breadcrumb.Item>
									<Breadcrumb.Link href="{isBasic ? basicHref : advancedHref}#{category.key}">
										{category[locale === "zh" ? "zh" : "en"]}
									</Breadcrumb.Link>
								</Breadcrumb.Item>
							{/if}
							<Breadcrumb.Separator />
							<Breadcrumb.Item>
								<Breadcrumb.Page>{doc.title}</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</div>

				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="flex min-w-0 flex-1 flex-col gap-1.5">
						<div class="flex flex-wrap items-center gap-2.5">
							<h1 class="text-3xl font-semibold tracking-tight">{doc.title}</h1>
							{#if alignment !== "aligned"}
								<Badge variant="outline" data-alignment-status={alignment}>
									{t(
										alignment === "partial"
											? "components.alignmentPartial"
											: "components.alignmentPending"
									)}
								</Badge>
							{/if}
						</div>
						{#if doc.description}
							<p class="text-sm text-muted-foreground sm:text-base">{doc.description}</p>
						{/if}
					</div>
					<Button
						variant="outline"
						size="sm"
						class="shrink-0"
						disabled={copyingAiSpec}
						onclick={copyAiSpec}
					>
						<CopyIcon />
						{locale === "zh" ? "复制 AI 组件规范" : "Copy AI Spec"}
					</Button>
				</div>

				<div class="border-b-[0.5px] border-border pb-3">
					<Tabs.List>
						{#if showStates}
							<Tabs.Trigger value="states">{t("components.states")}</Tabs.Trigger>
						{/if}
						<Tabs.Trigger value="guide">{t("components.docsAndCode")}</Tabs.Trigger>
						<Tabs.Trigger value="usage">{t("usage.tab")}</Tabs.Trigger>
					</Tabs.List>
				</div>
			</div>

			{#if showStates}
				<Tabs.Content value="states">
					<div class="flex flex-col gap-8">
						{#each previews as preview (preview.name)}
							<section class="flex flex-col gap-2">
								<h2 class="text-lg font-semibold">{preview.title || t("components.default")}</h2>
								{#if preview.text}
									<p class="text-sm text-muted-foreground">{preview.text}</p>
								{/if}
								<ComponentState name={preview.name} />
							</section>
						{/each}
					</div>
				</Tabs.Content>
			{/if}
			<Tabs.Content value="guide">
				{#if tab === "guide"}
					{#key path}
						<ComponentGuide {slug} sourceDir={isBasicPath ? "components" : "ai-elements"} {locale} />
					{/key}
				{/if}
			</Tabs.Content>
			<Tabs.Content value="usage">
				{#if tab === "usage"}
					<FrameworkUsage {slug}>
						{#snippet svelteAction()}
							{#if source}
								{#key page.url.pathname}
									<ComponentCodeViewer item={source} allowSidebar={true} />
								{/key}
							{/if}
						{/snippet}
						<Markdown viewerData={data.viewerData} />
					</FrameworkUsage>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</div>
{:else}
	<!--
NOTE: The TOC needs to come first in the DOM order to prevent CLS, so we flex-row-reverse
the docs container. The issue this resolves is prominent on slow connections (3G).
  -->
	<div
		data-slot="docs"
		class="flex scroll-mt-24 flex-row-reverse items-stretch text-[1.05rem] sm:text-[15px] xl:w-full"
		id="main-content"
	>
		{#if showToc}
			<div
				class="sticky top-0 z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex"
				data-llm-ignore
			>
				<div class="h-(--top-spacing) shrink-0"></div>
				{#if doc.toc.length}
					<div class="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">
						<DocsToc toc={{ items: doc.toc }} />
						<div class="h-12"></div>
					</div>
				{/if}
				<div class="flex flex-1 flex-col gap-12 px-6"></div>
				<div class="flex flex-col gap-12 px-6"></div>
			</div>
		{/if}
		<div class="flex min-w-0 flex-1 flex-col">
			<div class="h-(--top-spacing) shrink-0"></div>
			<div
				class={[
					"mx-auto flex w-full min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground",
					wide ? "max-w-6xl md:px-6" : "max-w-[40rem]",
				]}
			>
				{#if wide}
					<!-- The two catalogs have no title block: the header already says where you are. -->
					<h1 class="sr-only">{doc.title}</h1>
				{:else}
					<div class="flex flex-col gap-2">
						<div class="flex flex-col gap-2">
							<div class="flex flex-wrap items-center justify-between gap-2 md:items-start">
								<h1 class="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">
									{doc.title}
								</h1>
								<div class="docs-nav flex items-center gap-2" data-llm-ignore>
									<div class="hidden md:block">
										<DocsCopyPage />
									</div>
									<div class="ml-auto flex gap-2">
										{#if neighbors.previous}
											<Button
												variant="secondary"
												size="icon"
												class="extend-touch-target size-8 shadow-none md:size-7"
												href={neighbors.previous.href}
											>
												<ArrowLeftIcon />
												<span class="sr-only">{t("docs.previous")}</span>
											</Button>
										{/if}
										{#if neighbors.next}
											<Button
												variant="secondary"
												size="icon"
												class="extend-touch-target size-8 shadow-none md:size-7"
												href={neighbors.next.href}
											>
												<span class="sr-only">{t("docs.next")}</span>
												<ArrowRightIcon />
											</Button>
										{/if}
									</div>
								</div>
							</div>
							{#if data.metadata.description}
								<p
									class="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]"
								>
									{doc.description}
								</p>
							{/if}
						</div>
						{#if apiLink || docLink || source}
							<div class="flex flex-wrap items-center gap-2 pt-4">
								{#if docLink}
									<Badge href={docLink} variant="secondary" target="_blank" rel="noreferrer">
										{t("docs.docs")}
										<ArrowUpRight aria-hidden="true" />
									</Badge>
								{/if}
								{#if apiLink}
									<Badge href={apiLink} variant="secondary" target="_blank" rel="noreferrer">
										{t("docs.apiReference")}
										<ArrowUpRight aria-hidden="true" />
									</Badge>
								{/if}
								{#if source}
									{#key page.url.pathname}
										<ComponentCodeViewer item={source} allowSidebar={true} />
									{/key}
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<div class="w-full flex-1 pb-16 *:data-[slot=alert]:first:mt-0 sm:pb-0">
					<Markdown viewerData={data.viewerData} />
				</div>
				{#if !isChangelog && !wide}
					<div class="hidden h-16 w-full items-center gap-2 px-4 sm:flex sm:px-0" data-llm-ignore>
						{#if neighbors.previous}
							<Button
								size="sm"
								variant="secondary"
								class="shadow-none"
								href={neighbors.previous.href}
							>
								<ArrowLeftIcon />
								{neighbors.previous.title}
							</Button>
						{/if}
						{#if neighbors.next}
							<Button
								size="sm"
								variant="secondary"
								class="ml-auto shadow-none"
								href={neighbors.next.href}
							>
								{neighbors.next.title}
								<ArrowRightIcon />
							</Button>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
