<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Metadata from "$lib/components/metadata.svelte";
	import Settings from "$lib/registry/blocks/settings-01/+page.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "设置页示例" : "Settings example");
	const description = $derived(
		zh
			? "试用设置导航、主题选择和开关。主题选择仅应用于下方示例。"
			: "Try the settings navigation, theme picker, and switches. The theme picker applies to this example."
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
		<Settings chinese={zh} />
	</div>
</div>
