<script lang="ts">
	import * as Select from "@valar/svelte-ui/select";
	import { Button } from "@valar/svelte-ui/button";
	import { Input } from "@valar/svelte-ui/input";
	import { onMount } from "svelte";
	import { SvelteURL } from "svelte/reactivity";

	const implementations = [
		{
			id: "svelte",
			label: "Svelte · 现有基准",
			port: "5212",
			path: "/svelte.html",
			dependency: "Bits UI / LayerChart",
		},
		{
			id: "react",
			label: "React · 原生复用",
			port: "5213",
			path: "/",
			dependency: "Radix / DayPicker / Recharts",
		},
		{ id: "vue", label: "Vue · 原生复用", port: "5214", path: "/", dependency: "Reka UI / Unovis" },
	];
	let theme = $state("light");
	let scenario = $state("default");
	let width = $state(390);
	let generation = $state(0);
	let statuses = $state<Record<string, string>>({});
	let frames: Record<string, HTMLIFrameElement> = {};
	function url(implementation: (typeof implementations)[number]) {
		const url = new SvelteURL(implementation.path, location.href);
		url.port = implementation.port;
		url.search = new URLSearchParams({
			theme,
			disabled: scenario === "disabled" ? "1" : "0",
			run: String(generation),
		}).toString();
		return url.href;
	}
	function reset() {
		statuses = {};
		generation++;
	}
	$effect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	});
	onMount(() => {
		function receive(event: MessageEvent) {
			const implementation = implementations.find(
				(entry) =>
					event.source === frames[entry.id]?.contentWindow &&
					event.origin === new URL(url(entry)).origin
			);
			if (
				!implementation ||
				!event.data ||
				event.data.protocol !== "valar-frameworks-v1" ||
				event.data.framework !== implementation.id ||
				event.data.status !== "ready"
			)
				return;
			statuses[implementation.id] = "ready";
		}
		window.addEventListener("message", receive);
		return () => window.removeEventListener("message", receive);
	});
</script>

<main class="comparison-shell">
	<header>
		<p class="eyebrow">VALAR · FIRST BATCH</p>
		<h1>同一套设计，三个原生框架</h1>
		<p>九类真实组件 · 独立运行 · 同一输入数据。直接操作任意一栏，不会影响另外两栏。</p>
	</header>
	<div class="toolbar">
		<div class="field">
			<span id="theme-label">外观</span><Select.Root
				type="single"
				bind:value={theme}
				items={[
					{ value: "light", label: "浅色" },
					{ value: "dark", label: "深色" },
				]}
				onValueChange={reset}
				><Select.Trigger aria-labelledby="theme-label"><Select.Value /></Select.Trigger
				><Select.Content
					><Select.Item value="light" label="浅色">浅色</Select.Item><Select.Item
						value="dark"
						label="深色">深色</Select.Item
					></Select.Content
				></Select.Root
			>
		</div>
		<div class="field">
			<span id="scenario-label">场景</span><Select.Root
				type="single"
				bind:value={scenario}
				items={[
					{ value: "default", label: "可交互" },
					{ value: "disabled", label: "禁用" },
				]}
				onValueChange={reset}
				><Select.Trigger aria-labelledby="scenario-label"><Select.Value /></Select.Trigger
				><Select.Content
					><Select.Item value="default" label="可交互">可交互</Select.Item><Select.Item
						value="disabled"
						label="禁用">禁用</Select.Item
					></Select.Content
				></Select.Root
			>
		</div>
		<label class="field"
			>每栏视口宽度<Input type="number" min={320} max={1280} step={10} bind:value={width} /></label
		>
		<Button variant="outline" onclick={reset}>重置三个版本</Button>
	</div>
	<p class="notice">
		实际构建版本与差异以验收记录为准；减少动态效果跟随浏览器系统偏好。宽屏横向并列，窄屏按基准、React、Vue
		顺序排列。
	</p>
	<div class="panes">
		{#each implementations as implementation (implementation.id)}
			<section
				class="pane"
				style:width="min(100%, {Math.max(320, Math.min(1280, width || 390)) + 2}px)"
			>
				<div class="pane-heading">
					<h2>{implementation.label}</h2>
					<span data-status={implementation.id}
						>{statuses[implementation.id] === "ready" ? "已挂载" : "等待组件挂载"}</span
					>
				</div>
				<p class="dependencies">{implementation.dependency}</p>
				{#key `${theme}-${scenario}-${generation}`}
					<iframe
						bind:this={frames[implementation.id]}
						title={implementation.label + " 实时组件"}
						src={url(implementation)}
					></iframe>
				{/key}
			</section>
		{/each}
	</div>
</main>

<style>
	.comparison-shell {
		padding: 32px;
		font: 14px/1.5 var(--font-sans);
	}
	header {
		margin-bottom: 24px;
	}
	.eyebrow {
		color: var(--muted-foreground);
		font-size: 12px;
		letter-spacing: 0.12em;
	}
	h1 {
		margin: 8px 0;
		font-size: 28px;
		line-height: 1.3;
		font-weight: 600;
	}
	header > p:last-child,
	.notice {
		color: var(--muted-foreground);
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 16px;
	}
	.field {
		display: grid;
		gap: 8px;
		min-width: 140px;
	}
	.notice {
		margin: 20px 0;
		max-width: 90ch;
	}
	.panes {
		display: flex;
		align-items: start;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 12px;
	}
	.pane {
		flex: 0 0 auto;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.pane-heading {
		padding: 16px 16px 4px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	h2 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
	}
	.pane-heading span {
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.dependencies {
		padding: 0 16px 12px;
		color: var(--muted-foreground);
		font-size: 11px;
		margin: 0;
		border-bottom: 1px solid var(--border);
	}
	iframe {
		display: block;
		width: 100%;
		height: 2300px;
		border: 0;
	}
	@media (max-width: 760px) {
		.comparison-shell {
			padding: 16px;
		}
		.panes {
			flex-direction: column;
			overflow-x: visible;
		}
	}
</style>
