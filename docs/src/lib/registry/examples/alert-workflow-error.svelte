<script lang="ts">
	import MessageSquare from "@lucide/svelte/icons/message-square";
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
	import { tick } from "svelte";
	import { getLocale } from "$lib/i18n/index.js";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const sourceId = $props.id();
	let step = $state<"error" | "setup" | "verified">("error");
	let source = $state("");
	let back = $state<HTMLButtonElement | null>(null);
	let result = $state<HTMLParagraphElement>();

	async function verify(event: SubmitEvent) {
		event.preventDefault();
		if (step !== "setup" || !source.trim()) return;
		step = source.trim() === "demo" ? "verified" : "error";
		await tick();
		if (step === "error") back?.focus();
		else result?.focus();
	}
</script>

<form
	class="w-full max-w-[639px] min-w-0 rounded-[10px] border border-border bg-card"
	onsubmit={verify}
>
	<div class="grid min-w-0 gap-2 p-4 sm:p-5">
		<h3 class="text-base font-semibold">{text("导入数据", "Import data")}</h3>
		{#if step === "error"}
			<Alert.Root appearance="workflow-error" variant="destructive">
				<TriangleAlert
					aria-hidden="true"
					class="fill-current [&>path:not(:first-child)]:stroke-white"
				/>
				<Alert.Title>{text("导入来源验证失败", "Could not verify the import source")}</Alert.Title>
				<Alert.Description>
					<div data-slot="alert-recovery-details">
						<div>
							{text(
								"你可以按以下步骤解决此问题",
								"The following steps can help you troubleshoot the issue"
							)}
						</div>
						<ol class="list-inside list-decimal text-foreground">
							<li>
								{text(
									"返回上一步，检查并更正来源设置。",
									"Go back to review and correct the source settings."
								)}
							</li>
						</ol>
					</div>
					<Alert.Action>
						<MessageSquare aria-hidden="true" class="mt-0.5 size-4 shrink-0" />
						<span>
							{text("还需要帮助？", "If you still need help,")}
							<a
								href={text("/zh/docs/components/field", "/docs/components/field")}
								class="rounded-[8px] px-1 text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								>{text("查看表单字段说明", "review the form field guide")}</a
							>
						</span>
					</Alert.Action>
				</Alert.Description>
			</Alert.Root>
		{:else if step === "setup"}
			<Label for={sourceId}>{text("来源设置", "Source settings")}</Label>
			<Input id={sourceId} bind:value={source} aria-describedby={`${sourceId}-help`} />
			<small id={`${sourceId}-help`} class="text-muted-foreground">
				{text("输入 demo 模拟验证成功。", "Enter demo to simulate a verified source.")}
			</small>
		{:else}
			<p
				bind:this={result}
				tabindex="-1"
				role="status"
				class="rounded-sm text-sm focus:outline-1 focus:-outline-offset-1 focus:outline-ring"
			>
				{text("已验证来源。", "Source verified.")}
			</p>
		{/if}
	</div>
	<div class="flex flex-wrap items-center justify-between gap-2 border-t border-border p-4 sm:px-5">
		<Button
			bind:ref={back}
			type="button"
			variant="outline"
			size="xs"
			class="h-7"
			disabled={step === "setup"}
			onclick={async () => {
				step = "setup";
				await tick();
				document.getElementById(sourceId)?.focus();
			}}>{text("返回", "Back")}</Button
		>
		<Button type="submit" size="xs" class="h-7" disabled={step !== "setup" || !source.trim()}>
			{text("下一步", "Next")}
		</Button>
	</div>
</form>
