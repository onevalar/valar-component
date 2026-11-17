<script lang="ts">
	import { onDestroy } from "svelte";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let loading = $state(false);
	let completed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(timer));

	function refresh() {
		loading = true;
		completed = false;
		timer = setTimeout(() => {
			loading = false;
			completed = true;
		}, 1200);
	}
</script>

<section aria-label={text("按钮加载示例", "Button loading example")} class="flex w-full max-w-xs flex-wrap items-center gap-2">
	<Button {loading} size="sm" onclick={refresh}>
		{#if loading}
			<Spinner class="size-3.5" data-icon="inline-start" aria-hidden="true" />
		{:else}
			<RefreshCw class="size-3.5" data-icon="inline-start" aria-hidden="true" />
		{/if}
		{text("刷新列表", "Refresh list")}
	</Button>
	<span role="status" class="min-w-0 wrap-anywhere text-xs text-muted-foreground">
		{loading ? text("正在更新…", "Updating…") : completed ? text("列表已更新。", "List updated.") : ""}
	</span>
</section>
