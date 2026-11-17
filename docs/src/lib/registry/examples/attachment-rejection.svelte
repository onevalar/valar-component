<script lang="ts">
	import FileText from "@lucide/svelte/icons/file-text";
	import X from "@lucide/svelte/icons/x";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import * as Attachment from "$lib/registry/ui/attachment/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const chinese = $derived(getLocale() === "zh");
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const maxBytes = 10 * 1024 * 1024;
	let input = $state<HTMLInputElement | null>(null);
	let picker = $state<HTMLButtonElement | null>(null);
	let file = $state<File | null>(null);
	let showLimit = $state(false);
	const limitId = $props.id();

	function choose(event: Event & { currentTarget: HTMLInputElement }) {
		const selected = event.currentTarget.files?.[0];
		event.currentTarget.value = "";
		if (!selected) return;
		file = selected;
		showLimit = selected.size > maxBytes;
	}

	function sizeLabel(length: number) {
		if (length < 1024) return `${length} B`;
		if (length < 1024 * 1024) return `${Math.round(length / 1024)} KB`;
		return `${Math.round((length / (1024 * 1024)) * 10) / 10} MB`;
	}

	function dismiss() {
		showLimit = false;
		picker?.focus();
	}

	function remove() {
		file = null;
		dismiss();
	}
</script>

<div class="grid w-full max-w-sm min-w-0 gap-3 [contain:inline-size]">
	<div class="flex flex-wrap items-center gap-2">
		<input type="file" hidden bind:this={input} onchange={choose} />
		<Button
			variant="outline"
			size="sm"
			type="button"
			bind:ref={picker}
			aria-describedby={limitId}
			onclick={() => input?.click()}
		>
			{text("选择文件", "Choose file")}
		</Button>
		<span id={limitId} class="text-xs text-muted-foreground">
			{text("单个文件最大 10 MB", "10 MB per file")}
		</span>
	</div>

	{#if file}
		<Attachment.Root appearance="agent-file" state="idle">
			<Attachment.Media><FileText aria-hidden="true" /></Attachment.Media>
			<Attachment.Content>
				<Attachment.Title title={file.name}>{file.name}</Attachment.Title>
				<Attachment.Description>{sizeLabel(file.size)}</Attachment.Description>
			</Attachment.Content>
			<Attachment.Actions>
				<Attachment.Action
					aria-label={text(`移除 ${file.name}`, `Remove ${file.name}`)}
					onclick={remove}
				>
					<X aria-hidden="true" />
				</Attachment.Action>
			</Attachment.Actions>
		</Attachment.Root>
		{#if showLimit}
			<Alert.Root appearance="notification" variant="destructive">
				<Alert.Title>{text("文件超出大小限制", "File exceeds size limit")}</Alert.Title>
				<Alert.Description>
					{text("请选择不超过 10 MB 的文件。", "Choose a file of 10 MB or less.")}
				</Alert.Description>
				<Button
					type="button"
					size="icon-xs"
					variant="ghost"
					data-slot="alert-dismiss"
					aria-label={text("关闭大小限制提示", "Dismiss size limit message")}
					onclick={dismiss}
				>
					<X aria-hidden="true" />
				</Button>
			</Alert.Root>
		{:else if file.size <= maxBytes}
			<p role="status" class="text-xs text-muted-foreground">
				{text("文件已就绪", "File ready")}
			</p>
		{/if}
	{/if}
</div>
