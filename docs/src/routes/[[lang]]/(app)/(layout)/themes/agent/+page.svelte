<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Metadata from "$lib/components/metadata.svelte";
	import Agent from "$lib/registry/blocks/agent-01/+page.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "Agent 对话示例" : "Agent chat example");
	const description = $derived(
		zh
			? "试用示例对话、附件和流式回复。消息、文件和工具反馈在本地预览。"
			: "Try example chats, attachments, and streaming replies with local preview data."
	);
</script>

<Metadata {title} {description} />

<div class="container-wrapper">
	<div class="container max-w-6xl space-y-5 px-4 py-8 sm:px-8 sm:py-10">
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
		<Agent chinese={zh} />
	</div>
</div>
