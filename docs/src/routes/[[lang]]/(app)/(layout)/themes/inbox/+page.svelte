<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Metadata from "$lib/components/metadata.svelte";
	import Inbox from "$lib/registry/blocks/inbox-01/+page.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "Inbox 通知中心" : "Inbox");
	const description = $derived(
		zh
			? "筛选通知、切换已读状态、编辑关联问题并参与评论。数据保存在当前预览。"
			: "Filter notifications, change their read state, and edit or comment on the linked issue in this preview."
	);
	let empty = $state(false);
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
		<Button variant="outline" size="sm" aria-pressed={empty} onclick={() => (empty = !empty)}>
			{zh ? "空收件箱" : "Empty inbox"}
		</Button>
		{#key empty}<Inbox chinese={zh} {empty} />{/key}
	</div>
</div>
