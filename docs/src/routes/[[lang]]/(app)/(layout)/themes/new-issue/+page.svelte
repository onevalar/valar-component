<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Metadata from "$lib/components/metadata.svelte";
	import NewIssue from "$lib/registry/blocks/new-issue-01/+page.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "新建问题弹窗示例" : "New issue example");
	const description = $derived(
		zh
			? "试用紧凑和展开编辑区、状态与优先级选择及连续创建。示例问题保存在当前预览中。"
			: "Try the compact and expanded editor, status and priority pickers, and continuous creation. Issues stay in this preview."
	);
</script>

<Metadata {title} {description} />

<div class="container-wrapper">
	<div class="container max-w-6xl space-y-6 px-5 py-8 sm:px-8 sm:py-10">
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
		<NewIssue chinese={zh} />
	</div>
</div>
