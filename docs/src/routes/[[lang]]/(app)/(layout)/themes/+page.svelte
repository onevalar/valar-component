<script lang="ts">
	import { page } from "$app/state";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import CardsDemo from "$lib/components/cards/cards-demo.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import TokenEditor from "$lib/features/workbench/token-editor.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { buttonVariants } from "$lib/registry/ui/button/index.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
</script>

<Metadata title="设计 token" description="Valar 的全局颜色、圆角与字号 token。" />

<div class="container-wrapper">
	<div class="container px-6 pt-8 md:px-8">
		<h1 class="text-2xl font-semibold tracking-tight">设计 token</h1>
		<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
			颜色、圆角和字号是所有组件共用的全局
			token，只在这个页面统一调整。下方（宽屏时在右侧）的组件会实时预览草稿；
			写回后，用对应基础主题初始化的项目都会使用新值。组件页只能查看这些 token。
		</p>
		<div class="mt-4 flex flex-wrap gap-2">
			<a
				href={localizeHref("/themes/palette", locale)}
				class={buttonVariants({ variant: "outline", size: "sm" })}
			>
				{locale === "zh" ? "查看配色方案" : "View color palette"}
				<ArrowRight />
			</a>
			<a
				href={localizeHref("/themes/settings", locale)}
				class={buttonVariants({ variant: "outline", size: "sm" })}
			>
				{locale === "zh" ? "查看设置页示例" : "View settings example"}
				<ArrowRight />
			</a>
			<a
				href={localizeHref("/themes/my-issues", locale)}
				class={buttonVariants({ variant: "outline", size: "sm" })}
			>
				{locale === "zh" ? "查看问题列表示例" : "View My issues example"}
				<ArrowRight />
			</a>
			<a
				href={localizeHref("/themes/new-issue", locale)}
				class={buttonVariants({ variant: "outline", size: "sm" })}
			>
				{locale === "zh" ? "查看新建问题示例" : "View new issue example"}
				<ArrowRight />
			</a>
			<a
				href={localizeHref("/themes/projects", locale)}
				class={buttonVariants({ variant: "outline", size: "sm" })}
			>
				{locale === "zh" ? "查看 Projects 示例" : "View Projects example"}
				<ArrowRight />
			</a>
			<a
				href={localizeHref("/themes/inbox", locale)}
				class={buttonVariants({ variant: "outline", size: "sm" })}
			>
				{locale === "zh" ? "查看 Inbox 示例" : "View Inbox example"}
				<ArrowRight />
			</a>
			<a
				href={localizeHref("/themes/agent", locale)}
				class={buttonVariants({ variant: "outline", size: "sm" })}
			>
				{locale === "zh" ? "查看 Agent 示例" : "View Agent example"}
				<ArrowRight />
			</a>
		</div>
	</div>
</div>

<div id="themes" class="container-wrapper flex flex-1 scroll-mt-20 flex-col pb-6">
	<div class="container px-6 py-6 md:px-8">
		<TokenEditor>
			<CardsDemo />
		</TokenEditor>
	</div>
</div>
