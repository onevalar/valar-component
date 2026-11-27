<script lang="ts">
	import { page } from "$app/state";
	import FrameworkCode from "$lib/components/framework-code.svelte";
	import FrameworkUsage from "$lib/components/framework-usage.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import NativeFrameworkPreview from "$lib/components/native-framework-preview.svelte";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { PageProps } from "./$types.js";

	let { data }: PageProps = $props();
	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const react = import.meta.glob<string>(
		"../../../../../../../../apps/react-preview/src/blocks/*.tsx",
		{ query: "?raw", import: "default" }
	);
	const vue = import.meta.glob<string>(
		"../../../../../../../../apps/vue-preview/src/blocks/*.vue",
		{ query: "?raw", import: "default" }
	);
	const source = $derived({
		react: react[`../../../../../../../../apps/react-preview/src/blocks/${data.template}.tsx`],
		vue: vue[`../../../../../../../../apps/vue-preview/src/blocks/${data.template}.vue`],
		dependencies:
			data.template === "calendar"
				? {
						react: " chrono-node@2.9.0 react-day-picker@9.14.0 recharts@3.8.0",
						vue: " @internationalized/date@3.12.0 @unovis/ts@1.8.0 @unovis/vue@1.8.0 chrono-node@2.9.0 reka-ui@2.10.5",
					}
				: undefined,
	});
	const description = $derived(
		zh
			? "交互预览、可复制代码和安装指引。"
			: "Interactive preview, copyable source, and installation instructions."
	);
	const usageProps = $derived(
		`${data.template === data.block ? "" : ` block="${data.block}"`}${zh ? " chinese" : ""}`
	);
	const reactUsage = $derived(
		`import Template from "./Example";\n\nexport default function Page() {\n  return <Template${usageProps} />;\n}`
	);
	const vueUsage = $derived(
		`<script setup lang="ts">\nimport Template from "./Example.vue";\n<${"/script"}>\n\n<template>\n  <Template${usageProps} />\n</template>`
	);
</script>

<Metadata title={data.block} {description} />

<div class="container-wrapper">
	<div class="container max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
		<header class="space-y-3">
			<Button
				href={localizeHref("/docs/installation/registry-blocks", locale)}
				variant="outline"
				size="sm">{zh ? "返回区块清单" : "Back to registry blocks"}</Button
			>
			<h1 class="text-3xl font-semibold tracking-tight">{data.block}</h1>
			<p class="text-sm text-muted-foreground">{description}</p>
		</header>

		<FrameworkUsage slug={data.block} template={source}>
			{#snippet nativePreview(framework)}
				<NativeFrameworkPreview
					{framework}
					example={data.block}
					title={data.block}
					tall={data.template !== "calendar"}
				/>
				{#if data.template === "auth"}
					<p class="text-sm text-muted-foreground">
						{zh
							? "演示不发送数据。实际提交、第三方登录、找回密码和重发验证码由宿主实现。"
							: "The demo sends no data. Connect submission, provider sign-in, password recovery, and code resend in your app."}
					</p>
				{:else if data.template === "calendar" && framework === "vue"}
					<p class="text-sm text-muted-foreground">
						{zh ? "使用 Vite 服务端渲染时，请将" : "For Vite SSR, add"}
						<code>/^@unovis\//</code>
						{zh ? "加入" : "to"} <code>ssr.noExternal</code>。
					</p>
				{/if}
				<p class="text-sm text-muted-foreground">
					{zh
						? "把下方源码复制到与导入语句相符的文件，使用区块 ID 选择变体。"
						: "Copy the source below into the file shown in the import. Pass the block ID to choose the variant."}
				</p>
				<FrameworkCode
					code={framework === "react" ? reactUsage : vueUsage}
					language={framework === "react" ? "tsx" : "vue"}
					title={framework === "react" ? "Page.tsx" : "Page.vue"}
				/>
			{/snippet}
			<div class="space-y-3">
				<Button
					href={localizeHref(`/view/${data.block}`, locale)}
					target="_blank"
					rel="noopener"
					variant="outline">{zh ? "打开 Svelte 预览" : "Open Svelte preview"}</Button
				>
				<FrameworkCode
					code={`pnpm --filter @valar/svelte-cli start add ${data.block} --cwd /absolute/path/to/your-app`}
					language="bash"
					title="Terminal"
				/>
			</div>
		</FrameworkUsage>
	</div>
</div>
