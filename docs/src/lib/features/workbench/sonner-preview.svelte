<script lang="ts">
	import { onDestroy, tick, untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import { SvelteSet } from "svelte/reactivity";
	import Toaster from "$lib/registry/ui/sonner/sonner.svelte";
	import type { SonnerPreviewUpdate } from "./sonner-tuning.js";

	let {
		state: previewState,
		onApplied,
	}: {
		state: SonnerPreviewUpdate;
		onApplied: (revision: number) => void;
	} = $props();
	let result = $state("尚未执行通知操作");
	let sequence = 0;
	let active = true;
	const timers = new SvelteSet<ReturnType<typeof setTimeout>>();
	const nextId = () => `sonner-preview-${++sequence}`;
	function later(callback: () => void, delay: number) {
		const timer = setTimeout(() => {
			timers.delete(timer);
			if (active) callback();
		}, delay);
		timers.add(timer);
	}
	function clear() {
		for (const timer of timers) clearTimeout(timer);
		timers.clear();
		// This component is mounted only in a dedicated iframe JS realm, never the docs shell.
		toast.dismiss();
	}
	function example() {
		toast.success("报告已保存", {
			id: nextId(),
			description: "已保存到本地草稿，可在通知中撤销。",
			duration: 30000,
			action: { label: "撤销", onClick: () => (result = "已撤销本地演示操作") },
		});
	}
	function replay(revision: number) {
		clear();
		result = "修改参数会重新播放通知示例";
		// Let real Sonner finish dismiss/height removal before creating a different id.
		later(() => {
			example();
			void tick().then(() => {
				if (active && previewState.revision === revision) onApplied(revision);
			});
		}, 380);
	}
	function promiseExample() {
		const operation = new Promise<string>((resolve) => later(() => resolve("本地导出"), 900));
		toast.promise(operation, {
			id: nextId(),
			loading: "正在准备本地导出…",
			success: (name) => `${name}已完成`,
			error: "本地导出未完成",
			duration: 30000,
		});
	}
	function updateExample() {
		const id = nextId();
		toast.loading("正在检查本地草稿…", { id });
		later(() => toast.success("草稿检查完成", { id, duration: 30000 }), 900);
	}
	function semanticExamples() {
		toast.info("链接已复制", { id: nextId(), duration: 30000 });
		toast.warning("离线草稿尚未同步", { id: nextId(), duration: 30000 });
		toast.error("本地导出未完成", { id: nextId(), duration: 30000 });
	}
	function unstyledExample() {
		toast("无样式通知保留自身布局", { unstyled: true, id: nextId(), duration: 30000 });
	}
	$effect(() => {
		const revision = previewState.revision;
		untrack(() => void replay(revision));
	});
	onDestroy(() => {
		active = false;
		clear();
	});
</script>

<section class="grid gap-3 p-4 text-sm" aria-label="真实通知演示">
	<h1 class="font-medium">本地通知预览</h1>
	<p class="text-xs text-muted-foreground">
		修改参数会重新播放通知示例。每侧使用独立通知环境，不影响站点通知；示例停留 30 秒。 Alt+T
		聚焦并展开通知；悬停或展开时暂停计时，普通 Tab 聚焦不暂停。
	</p>
	<div class="flex flex-wrap gap-2">
		<button class="rounded-md border px-3 py-2" onclick={() => void replay(previewState.revision)}>
			重播示例
		</button>
		<button class="rounded-md border px-3 py-2" onclick={semanticExamples}>语义通知</button>
		<button class="rounded-md border px-3 py-2" onclick={promiseExample}>本地 Promise</button>
		<button class="rounded-md border px-3 py-2" onclick={updateExample}>同 ID 更新</button>
		<button class="rounded-md border px-3 py-2" onclick={unstyledExample}>无样式通知</button>
		<button class="rounded-md border px-3 py-2" onclick={clear}>清空通知</button>
	</div>
	<p role="status" data-sonner-preview-result class="text-xs text-muted-foreground">{result}</p>
</section>

<Toaster
	theme={previewState.dark ? "dark" : "light"}
	position="bottom-center"
	richColors
	closeButton
/>
