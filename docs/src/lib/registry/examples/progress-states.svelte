<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { Progress } from "$lib/registry/ui/progress/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const samples = $derived([
		{ label: text("等待上传", "Waiting to upload"), value: 0, readout: "0%" },
		{ label: text("正在准备文件", "Preparing files"), value: null },
		{ label: text("正在上传", "Uploading files"), value: 30, readout: "50%" },
		{ label: text("上传完成", "Upload complete"), value: 50, readout: "100%" },
		{ label: text("等待有效范围", "Waiting for a valid range"), value: 30, max: 10 },
	]);
</script>

<div class="grid w-full min-w-0 max-w-sm gap-4">
	{#each samples as sample (sample.label)}
		<div class="grid gap-2">
			<div class="flex flex-wrap justify-between gap-x-2 gap-y-1 text-[13px]">
				<span class="font-medium">{sample.label}</span>
				<span class="text-muted-foreground tabular-nums">
					{sample.readout ?? text("等待总量", "Waiting for total")}
				</span>
			</div>
			<Progress aria-label={sample.label} value={sample.value} min={10} max={sample.max ?? 50} />
		</div>
	{/each}
</div>
