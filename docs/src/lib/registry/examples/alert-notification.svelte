<script lang="ts">
	import CircleAlert from "@lucide/svelte/icons/circle-alert";
	import X from "@lucide/svelte/icons/x";
	import { tick } from "svelte";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let visible = $state(true);
	let opener = $state<HTMLElement | null>(null);
	let selectionMessage = $state("");

	async function dismiss(chooseAnother = false) {
		selectionMessage = chooseAnother ? text("可以选择另一个文件。", "Choose another file.") : "";
		visible = false;
		await tick();
		opener?.focus();
	}
</script>

<div class="grid w-full max-w-96 min-w-0 gap-3">
	<Button
		bind:ref={opener}
		type="button"
		variant="outline"
		size="sm"
		class="justify-self-start"
		onclick={() => {
			selectionMessage = "";
			visible = true;
		}}
	>
		{text("模拟超限文件", "Simulate oversized file")}
	</Button>
	{#if visible}
		<Alert.Root appearance="notification" variant="destructive">
			<CircleAlert aria-hidden="true" />
			<Alert.Title>{text("文件超过大小限制", "File exceeds size limit")}</Alert.Title>
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				data-slot="alert-dismiss"
				aria-label={text("关闭通知", "Dismiss notification")}
				onclick={() => dismiss()}><X aria-hidden="true" /></Button
			>
			<Alert.Description>
				{text(
					"单个文件最大为 10 MB。请选择较小的文件再试。",
					"Choose a smaller file. The size limit is 10 MB per file."
				)}
			</Alert.Description>
			<Alert.Action>
				<Button type="button" class="h-8 px-3 text-[13px]" onclick={() => dismiss(true)}>
					{text("重新选择", "Choose another")}
				</Button>
			</Alert.Action>
		</Alert.Root>
	{/if}
	{#if selectionMessage}<p role="status" class="text-xs text-muted-foreground">
			{selectionMessage}
		</p>{/if}
</div>
