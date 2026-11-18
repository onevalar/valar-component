<script lang="ts">
	import { page } from "$app/state";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import CardsDemo from "$lib/components/cards/cards-demo.svelte";
	import DesignSpecOverview from "$lib/components/design-spec-overview.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import TokenEditor from "$lib/features/workbench/token-editor.svelte";
	import { localeFromPathname } from "$lib/i18n/config.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "设计规范与全局 Token" : "Design System & Global Tokens");
	const description = $derived(
		zh
			? "查看 Valar 的色彩、排版、圆角、焦点与动效全局规范，并统一调节全站共用的设计 Token。"
			: "Review Valar global design guidelines and customize shared colors, radius, type scale, and motion tokens."
	);
</script>

<Metadata {title} {description} />

<div class="container-wrapper">
	<div class="container px-6 pt-8 md:px-8">
		<h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
		<p class="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
	</div>
</div>

<div id="themes" class="container-wrapper flex flex-1 scroll-mt-20 flex-col pb-8">
	<div class="container px-6 py-6 md:px-8">
		<Tabs.Root value="spec" class="gap-6">
			<Tabs.List>
				<Tabs.Trigger value="spec">{zh ? "设计规范总览" : "Design Guidelines"}</Tabs.Trigger>
				<Tabs.Trigger value="tokens">{zh ? "全局 Token 调节器" : "Global Token Editor"}</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="spec">
				<DesignSpecOverview />
			</Tabs.Content>
			<Tabs.Content value="tokens">
				<TokenEditor>
					<CardsDemo />
				</TokenEditor>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
