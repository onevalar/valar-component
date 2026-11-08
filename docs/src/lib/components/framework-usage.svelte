<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { reactExamples } from "$lib/frameworks/react-examples.js";
	import { vueExamples } from "$lib/frameworks/vue-examples.js";
	import { t } from "$lib/i18n/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { SegmentedControl } from "$lib/registry/ui/segmented-control/index.js";
	import FrameworkCode from "./framework-code.svelte";
	import reactPackage from "../../../../packages/react-ui/package.json" with { type: "json" };
	import vuePackage from "../../../../packages/vue-ui/package.json" with { type: "json" };
	import type { Snippet } from "svelte";

	let { slug, children }: { slug: string; children: Snippet } = $props();
	const requested = $derived(browser ? page.url.searchParams.get("framework") : null);
	const framework = $derived(requested === "react" || requested === "vue" ? requested : "svelte");
	const name = $derived(framework === "react" ? "React" : framework === "vue" ? "Vue" : "Svelte");
	const example = $derived(framework === "react" ? reactExamples[slug] : vueExamples[slug]);
	const version = $derived(framework === "react" ? reactPackage.version : vuePackage.version);
	const dependencies = $derived(
		framework === "react" && slug === "chart"
			? " recharts@3.8.0"
			: framework === "vue" && slug === "chart"
				? " @unovis/ts@1.8.0 @unovis/vue@1.8.0"
				: framework === "vue" && ["calendar", "range-calendar"].includes(slug)
					? " @internationalized/date@3.12.0"
					: ""
	);
	const pack = $derived(`pnpm --filter @valar/${framework}-ui build
mkdir -p dist/packages
pnpm --filter @valar/${framework}-ui pack --pack-destination ./dist/packages`);
	const install = $derived(
		`pnpm add /absolute/path/to/valar/dist/packages/valar-${framework}-ui-${version}.tgz${dependencies}`
	);
	const theme = $derived(`@import "tailwindcss";
@import "@valar/${framework}-ui/theme.css";`);

	function select(value: string) {
		const url = new URL(page.url);
		url.searchParams.set("framework", value);
		void goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}
</script>

<div class="flex min-w-0 flex-col gap-6" data-framework-usage={framework}>
	<div class="flex flex-col gap-3">
		<h2 class="text-lg font-semibold">{t("usage.framework")}</h2>
		<SegmentedControl
			label={t("usage.framework")}
			value={framework}
			options={[
				{ value: "svelte", label: "Svelte" },
				{ value: "react", label: "React" },
				{ value: "vue", label: "Vue" },
			]}
			onValueChange={select}
			class="w-fit"
		/>
		<p class="text-sm text-muted-foreground">{t("usage.preview")}</p>
	</div>

	{#if framework === "svelte"}
		<section class="min-w-0" aria-label={t("usage.svelteSource")}>
			<p class="mb-4 text-sm text-muted-foreground">{t("usage.svelteOnly")}</p>
			{@render children()}
		</section>
	{:else if !example}
		<div class="flex flex-col gap-3 rounded-xl border p-5" role="status">
			<Badge variant="secondary">{name} · {t("usage.pending")}</Badge>
			<p class="text-sm">{t("usage.unavailable", { framework: name })}</p>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			<Badge variant="secondary">{name} · {t("usage.available")}</Badge>
			<p class="text-sm">{t("usage.native", { framework: name })}</p>
			<p class="text-sm text-muted-foreground">{t("usage.local")}</p>
			<p class="text-sm text-muted-foreground">
				{t("usage.requirements", { framework: name === "React" ? "React 19" : "Vue 3.5" })}
			</p>
		</div>
		<section class="flex min-w-0 flex-col gap-3" aria-label={t("usage.pack")}>
			<h3 class="font-semibold">{t("usage.pack")}</h3>
			<FrameworkCode code={pack} language="bash" title="Terminal" />
		</section>
		<section class="flex min-w-0 flex-col gap-3" aria-label={t("usage.install")}>
			<h3 class="font-semibold">{t("usage.install")}</h3>
			<p class="text-sm text-muted-foreground">{t("usage.path")}</p>
			<FrameworkCode code={install} language="bash" title="Terminal" />
		</section>
		<section class="flex min-w-0 flex-col gap-3" aria-label={t("usage.theme")}>
			<h3 class="font-semibold">{t("usage.theme")}</h3>
			<FrameworkCode code={theme} language="css" title="app.css" />
		</section>
		<section class="flex min-w-0 flex-col gap-3" aria-label={t("usage.example")} data-usage-example>
			<h3 class="font-semibold">{t("usage.example")}</h3>
			<FrameworkCode
				code={example}
				language={framework === "react" ? "tsx" : "vue"}
				title={framework === "react" ? "Example.tsx" : "Example.vue"}
			/>
		</section>
	{/if}
</div>
