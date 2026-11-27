<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import { reactExample } from "$lib/frameworks/react-examples.js";
	import { vueExample } from "$lib/frameworks/vue-examples.js";
	import { t } from "$lib/i18n/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import FrameworkCode from "./framework-code.svelte";
	import reactPackage from "../../../../packages/react-ui/package.json" with { type: "json" };
	import vuePackage from "../../../../packages/vue-ui/package.json" with { type: "json" };
	import type { Snippet } from "svelte";

	let {
		slug,
		children,
		svelteAction,
		nativePreview,
		template,
	}: {
		slug: string;
		children: Snippet;
		svelteAction?: Snippet;
		nativePreview?: Snippet<["react" | "vue"]>;
		template?: {
			react: () => Promise<string>;
			vue: () => Promise<string>;
			dependencies?: { react?: string; vue?: string };
		};
	} = $props();
	const frameworks = [
		{ value: "svelte", label: "Svelte" },
		{ value: "react", label: "React" },
		{ value: "vue", label: "Vue" },
	] as const;
	const requested = $derived(browser ? page.url.searchParams.get("framework") : null);
	const framework = $derived(requested === "react" || requested === "vue" ? requested : "svelte");
	const name = $derived(framework === "react" ? "React" : framework === "vue" ? "Vue" : "Svelte");
	const example = $derived(
		framework === "svelte"
			? undefined
			: template
				? template[framework]()
				: framework === "react"
					? reactExample(slug)
					: vueExample(slug)
	);
	const composition = $derived(
		slug === "data-table" ? "usage.dataTable" : slug === "forms" ? "usage.forms" : undefined
	);
	const typography = $derived(slug === "typography");
	const exampleHeading = $derived(typography ? t("usage.markupExample") : t("usage.example"));
	const version = $derived(framework === "react" ? reactPackage.version : vuePackage.version);
	const dependencies = $derived(
		template && framework !== "svelte"
			? (template.dependencies?.[framework] ?? "")
			: slug === "data-table"
				? ` @tanstack/${framework}-table@9.0.0`
				: framework === "react" && slug === "chart"
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

<Tabs.Root
	value={framework}
	onValueChange={select}
	class="min-w-0 gap-6"
	data-framework-usage={framework}
>
	<div class="flex flex-col gap-3">
		<h2 class="text-lg font-semibold">{t("usage.framework")}</h2>
		<Tabs.List aria-label={t("usage.framework")}>
			{#each frameworks as option (option.value)}
				<Tabs.Trigger value={option.value}>{option.label}</Tabs.Trigger>
			{/each}
		</Tabs.List>
		{#if nativePreview}
			<p class="text-sm text-muted-foreground">{t("usage.compositionPreview")}</p>
		{:else if slug !== "forms"}
			<p class="text-sm text-muted-foreground">{t("usage.preview")}</p>
		{/if}
	</div>

	{#each frameworks as option (option.value)}
		<Tabs.Content value={option.value} class="min-w-0">
			{#if framework === option.value}
				{@render usage()}
			{/if}
		</Tabs.Content>
	{/each}
</Tabs.Root>

{#snippet usage()}
	<div class="flex min-w-0 flex-col gap-6">
		{#if framework === "svelte"}
			<section class="min-w-0" aria-label={t("usage.svelteSource")}>
				<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
					<p class="text-sm text-muted-foreground">{t("usage.svelteOnly")}</p>
					{#if svelteAction}
						{@render svelteAction()}
					{/if}
				</div>
				{@render children()}
			</section>
		{:else if !example}
			<div class="flex flex-col gap-3 rounded-xl border-[0.5px] border-border p-5" role="status">
				<Badge variant="secondary">{name} · {t("usage.pending")}</Badge>
				<p class="text-sm">{t("usage.unavailable", { framework: name })}</p>
			</div>
		{:else}
			{@render nativePreview?.(framework)}
			{#if typography}
				<p class="text-sm text-muted-foreground">{t("usage.typography")}</p>
			{:else}
				<div class="flex flex-col gap-3">
					<Badge variant="secondary">{name} · {t("usage.available")}</Badge>
					<p class="text-sm">
						{composition ? t(composition) : t("usage.native", { framework: name })}
					</p>
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
			{/if}
			<section class="flex min-w-0 flex-col gap-3" aria-label={exampleHeading} data-usage-example>
				<h3 class="font-semibold">{exampleHeading}</h3>
				{#await example}
					<p role="status">{t("usage.loadingExample")}</p>
				{:then code}
					<FrameworkCode
						{code}
						language={framework === "react" ? "tsx" : "vue"}
						title={framework === "react" ? "Example.tsx" : "Example.vue"}
					/>
				{:catch}
					<p role="alert">{t("usage.loadError")}</p>
				{/await}
			</section>
		{/if}
	</div>
{/snippet}
