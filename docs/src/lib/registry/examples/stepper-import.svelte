<script lang="ts">
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
	import { getLocale } from "$lib/i18n/index.js";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	import { Stepper } from "$lib/registry/ui/stepper/index.js";

	const id = $props.id();
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const steps = $derived([
		{ id: "configure", title: text("配置", "Configure") },
		{ id: "export", title: text("导出", "Export") },
		{ id: "issues", title: text("选择问题", "Select issues") },
		{ id: "map", title: text("映射用户", "Map users") },
		{ id: "confirm", title: text("确认", "Confirm") }
	]);
	let source = $state("");
	const rejected = $derived(source.trim() !== "demo");
	function verify(from: string) {
		if (from === "configure") return Boolean(source.trim());
		return from !== "export" || !rejected;
	}
</script>

<Stepper
	{steps}
	appearance="import"
	aria-label={text("导入向导", "Import wizard")}
	beforeChange={verify}
	messages={{
		incomplete: text("请先完成此步骤再继续。", "Complete this step before continuing."),
		failed: text("无法继续，请重试。", "Unable to continue. Try again."),
		validating: text("正在验证此步骤", "Validating this step"),
		progress: (current, total) =>
			text(`第 ${current} 步，共 ${total} 步`, `Step ${current} of ${total}`)
	}}
	class="max-w-[640px] gap-0 rounded-[10px] border-[0.5px] border-[lch(91.9%_0_282)] bg-white dark:border-[lch(16.793%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]"
>
	{#snippet children({ step, index, next, previous, pending })}
		<div
			class="grid min-h-[192px] min-w-0 content-start gap-3 border-t-[0.5px] border-border p-5 sm:min-h-[350px]"
		>
			<h3 class="text-[15px]/[23px] font-semibold">
				{step.id === "export" ? text("导入数据", "Import data") : step.title}
			</h3>
			{#if step.id === "configure"}
				<div class="grid max-w-xs gap-2">
					<Label for={`${id}-source`}>{text("来源工作区", "Source workspace")}</Label>
					<Input id={`${id}-source`} bind:value={source} aria-describedby={`${id}-source-help`} />
					<p id={`${id}-source-help`} class="text-xs text-muted-foreground">
						{text("输入 demo 可继续此演示。", "Enter demo to continue through the sample.")}
					</p>
				</div>
			{:else if step.id === "export" && rejected}
				<Alert.Root appearance="workflow-error" variant="destructive">
					<TriangleAlert
						aria-hidden="true"
						class="fill-current [&>path:not(:first-child)]:stroke-white"
					/>
					<Alert.Title>{text("导入来源验证失败", "Could not verify the import source")}</Alert.Title
					>
					<Alert.Description>
						<div data-slot="alert-recovery-details">
							{text(
								"返回上一步，检查并更正来源设置。",
								"Go back to review and correct the source settings."
							)}
						</div>
					</Alert.Description>
				</Alert.Root>
			{:else}
				<p class="text-[13px]/5 text-muted-foreground">
					{#if step.id === "export"}
						{text("来源工作区通过验证。", "The source workspace was verified.")}
					{:else if step.id === "issues"}
						{text("此示例包含两条演示问题。", "This sample includes two example issues.")}
					{:else if step.id === "map"}
						{text("演示用户已匹配。", "The sample users were matched.")}
					{:else}
						{text(
							"审核完成。此示例使用本地数据。",
							"Review complete. This sample uses local data."
						)}
					{/if}
				</p>
			{/if}
		</div>
		<div
			data-slot="stepper-preview-actions"
			class="flex flex-wrap items-center justify-between gap-2 border-t-[0.5px] border-border px-5 py-3"
		>
			<Button variant="outline" size="sm" shape="pill" disabled={index === 0} onclick={previous}>
				{text("返回", "Back")}
			</Button>
			<Button
				size="sm"
				shape="pill"
				loading={pending}
				disabled={index === steps.length - 1 ||
					(step.id === "configure" && !source.trim()) ||
					(step.id === "export" && rejected)}
				onclick={next}
			>
				{text("下一步", "Next")}
			</Button>
		</div>
	{/snippet}
</Stepper>
