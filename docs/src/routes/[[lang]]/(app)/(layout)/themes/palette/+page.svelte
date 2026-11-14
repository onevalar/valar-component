<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import { toast } from "svelte-sonner";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import Metadata from "$lib/components/metadata.svelte";
	import { COLOR_TOKENS } from "$lib/features/workbench/token-overrides.js";
	import { copyText } from "$lib/hooks/use-clipboard.svelte.js";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { DEFAULT_CONFIG, buildRegistryTheme } from "$lib/registry/config.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { palette, paletteGroups, type PaletteColor } from "./palette.js";

	const defaultColors = buildRegistryTheme(DEFAULT_CONFIG).cssVars;
	const modes = ["light", "dark"] as const;
	let mode = $state<(typeof modes)[number]>("light");

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const title = $derived(zh ? "配色方案" : "Color palette");
	const description = $derived(
		zh
			? "查看 Valar Svelte 的浅色与深色中性色设计稿，以及当前默认主题的颜色。"
			: "Explore the light and dark neutral palette and the colors in the current default theme."
	);

	function color(key: PaletteColor) {
		return palette[key][mode === "light" ? 2 : 3];
	}

	async function copy(value: string) {
		if ((await copyText(value)) === "success") {
			toast.success(zh ? `已复制 ${value}` : `Copied ${value}`);
		} else {
			toast.error(zh ? "复制失败，请选中并手动复制色值" : "Could not copy the color value");
		}
	}
</script>

<Metadata {title} {description} />

{#snippet swatch(label: string, value: string | null)}
	{#if value}
		<button
			type="button"
			aria-label={zh ? `复制${label} ${value}` : `Copy ${label} ${value}`}
			onclick={() => copy(value)}
			class="group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-left hover:border-ring focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
		>
			<span aria-hidden="true" class="h-14 w-full border-b sm:h-16" style:background-color={value}
			></span>
			<span class="flex min-w-0 flex-col gap-1 px-3 py-2.5">
				<span class="text-sm font-medium break-words">{label}</span>
				<span class="flex items-start justify-between gap-1 text-xs text-muted-foreground">
					<code class="min-w-0 break-all">{value}</code>
					<Copy
						class="size-3.5 shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
					/>
				</span>
			</span>
		</button>
	{:else}
		<div class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-dashed">
			<span aria-hidden="true" class="h-14 border-b border-dashed bg-muted/40 sm:h-16"></span>
			<span class="flex flex-col gap-1 px-3 py-2.5">
				<span class="text-sm font-medium break-words">{label}</span>
				<span class="text-xs text-muted-foreground">{zh ? "待取样" : "Awaiting sample"}</span>
			</span>
		</div>
	{/if}
{/snippet}

<div class="container-wrapper">
	<div class="container max-w-6xl space-y-7 px-5 py-8 sm:px-8 sm:py-10">
		<header>
			<a
				href={localizeHref("/themes", locale)}
				class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="size-4" />
				{zh ? "设计 token" : "Design tokens"}
			</a>
			<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
		</header>

		<Tabs.Root value="reference" class="gap-5">
			<div class="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
				<Tabs.List aria-label={zh ? "配色来源" : "Palette source"}>
					<Tabs.Trigger value="reference">{zh ? "中性色设计稿" : "Neutral reference"}</Tabs.Trigger>
					<Tabs.Trigger value="default">{zh ? "当前默认主题" : "Current default"}</Tabs.Trigger>
				</Tabs.List>
				<div
					role="group"
					aria-label={zh ? "预览模式" : "Preview mode"}
					class="flex gap-1 rounded-lg border p-1"
				>
					{#each modes as value (value)}
						<Button
							variant={mode === value ? "secondary" : "ghost"}
							size="xs"
							aria-pressed={mode === value}
							onclick={() => (mode = value)}
						>
							{value === "light" ? (zh ? "浅色" : "Light") : zh ? "深色" : "Dark"}
						</Button>
					{/each}
				</div>
			</div>

			<Tabs.Content value="reference" class="space-y-6">
				<p class="text-sm text-muted-foreground">
					{zh
						? "色值来自截图取样，供后续设计使用。预览只在此页生效。点击色卡可复制 HEX。"
						: "Colors sampled from the design references. This preview is local to the page. Select a swatch to copy its HEX value."}
				</p>
				<section
					aria-label={zh ? "中性色组件预览" : "Neutral component preview"}
					class="grid overflow-hidden rounded-2xl border sm:grid-cols-[minmax(10rem,1fr)_3fr]"
					style:background-color={color("shell")}
					style:border-color={color("panelBorder")}
					style:color={color("text")}
				>
					<div class="flex flex-col gap-3 p-4 sm:p-5" style:color={color("sidebarText")}>
						<span class="px-2 text-sm font-medium">{zh ? "工作区" : "Workspace"}</span>
						<div class="flex gap-2 text-sm sm:flex-col">
							<span class="rounded-lg px-2.5 py-1.5">{zh ? "概览" : "Overview"}</span>
							<span
								class="rounded-lg px-2.5 py-1.5"
								style:background-color={color("sidebarActive")}
								style:color={color("sidebarActiveText")}
							>
								{zh ? "设置" : "Settings"}
							</span>
						</div>
					</div>
					<div
						class="min-w-0 border-t p-4 sm:border-t-0 sm:border-l sm:p-6"
						style:border-color={color("panelBorder")}
						style:background-image={`linear-gradient(${color("panel")}, ${color("shell")})`}
					>
						<h2 class="text-lg font-semibold tracking-tight">
							{zh ? "工作区设置" : "Workspace settings"}
						</h2>
						<p class="mt-1 text-sm" style:color={color("secondaryText")}>
							{zh ? "管理团队的基本信息。" : "Manage your team’s details."}
						</p>
						<div class="mt-4 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
							<div
								class="rounded-xl border p-3.5"
								style:background-color={color("card")}
								style:border-color={color("cardBorder")}
							>
								<p class="text-sm font-medium">{zh ? "团队名称" : "Team name"}</p>
								<p
									class="mt-2 rounded-lg border px-2.5 py-1.5 text-sm"
									style:border-color={color("inputBorder")}
									style:color={color("placeholder")}
								>
									{zh ? "输入名称" : "Enter a name"}
								</p>
							</div>
							<div
								class="space-y-1 rounded-xl border p-2 text-sm"
								style:background-color={color("overlay")}
								style:border-color={color("overlayBorder")}
								style:color={color("menuText")}
							>
								<p
									class="rounded-lg px-2.5 py-1.5"
									style:background-color={color("menuActive")}
									style:color={color("text")}
								>
									{zh ? "管理成员" : "Manage members"}
								</p>
								<p class="px-2.5 py-1.5">{zh ? "复制链接" : "Copy link"}</p>
							</div>
						</div>
						<div class="mt-3 flex flex-wrap gap-2 text-sm">
							<span
								class="rounded-full border px-3 py-1"
								style:background-color={color("pillSelected")}
								style:border-color={color("pillBorder")}>{zh ? "已选中" : "Selected"}</span
							>
							<span
								class="rounded-full border px-3 py-1"
								style:background-color={color("pillHighlighted")}
								style:border-color={color("pillHighlightedBorder")}
								style:color={color("pillHighlightedText")}>{zh ? "高亮" : "Highlighted"}</span
							>
						</div>
					</div>
				</section>

				{#each paletteGroups as group (group.en)}
					<section class="space-y-3">
						<h2 class="text-lg font-semibold tracking-tight">{group[locale]}</h2>
						<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
							{#each group.colors as key (key)}
								{@render swatch(palette[key][zh ? 0 : 1], color(key))}
							{/each}
						</div>
					</section>
				{/each}
			</Tabs.Content>

			<Tabs.Content value="default" class="space-y-4">
				<p class="text-sm text-muted-foreground">
					{zh
						? "组件库默认安装的颜色，直接读取主题配置。点击色卡可复制原始 CSS 值。"
						: "Colors installed by default, read from the theme configuration. Select a swatch to copy its CSS value."}
				</p>
				<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
					{#each COLOR_TOKENS as token (token)}
						{@render swatch(`--${token}`, defaultColors[mode][token] ?? null)}
					{/each}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
