<script lang="ts">
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import { mode } from "mode-watcher";
	import { localeFromPathname } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";

	let {
		framework,
		example,
		title,
		scenario,
		tall = false,
	}: {
		framework: "react" | "vue";
		example: string;
		title: string;
		scenario?: string;
		tall?: boolean;
	} = $props();
	let frame = $state<HTMLIFrameElement>();
	const dark = $derived(mode.current === "dark");
	const src = $derived.by(() => {
		const query = new URLSearchParams({ example, lang: localeFromPathname(page.url.pathname) });
		if (scenario) query.set("scenario", scenario);
		return `${base}/framework-previews/${framework}/index.html?${query}`;
	});
	const standalone = $derived(`${src}&theme=${dark ? "dark" : "light"}`);

	function applyTheme() {
		frame?.contentDocument?.documentElement.classList.toggle("dark", dark);
	}
	$effect(applyTheme);
</script>

<section class="min-w-0 space-y-3" aria-label={t("usage.nativePreview")}>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h3 class="font-semibold">{t("usage.nativePreview")}</h3>
		<a
			href={standalone}
			target="_blank"
			rel="noopener"
			class="text-sm text-muted-foreground underline underline-offset-4 focus-visible:text-foreground"
		>
			{t("usage.openPreview")}
		</a>
	</div>
	<iframe
		bind:this={frame}
		{src}
		title={t("usage.previewTitle", { framework: framework === "react" ? "React" : "Vue", title })}
		onload={applyTheme}
		class={[
			"block w-full rounded-xl border border-border bg-background",
			tall ? "h-[min(72vh,48rem)] min-h-[30rem]" : "h-[min(65vh,34rem)] min-h-[20rem]",
		]}
	></iframe>
</section>
