<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Metadata from "$lib/components/metadata.svelte";
	import MyIssues from "$lib/registry/blocks/my-issues-01/+page.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "问题列表示例" : "My issues example");
	const description = $derived(
		zh
			? "试用筛选和分组，打开问题编辑标题、描述和属性，查看活动并参与评论。改动保存在当前预览。"
			: "Filter or group issues, then open one to edit its details, view activity, and join the conversation. Changes stay in this preview."
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
		<MyIssues chinese={zh} />
	</div>
</div>
