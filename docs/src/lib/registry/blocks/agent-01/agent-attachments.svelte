<script lang="ts">
	import * as Attachment from "$lib/registry/ui/attachment/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import type { ChatFile } from "./data.js";

	let {
		files,
		chinese,
		onRemove,
	}: {
		files: ChatFile[];
		chinese: boolean;
		onRemove?: (id: number) => void;
	} = $props();
	const text = (zh: string, en: string) => (chinese ? zh : en);

	function sizeLabel(size: number) {
		if (size < 1024) return size + " B";
		return size < 1048576 ? Math.round(size / 1024) + " KB" : (size / 1048576).toFixed(1) + " MB";
	}
</script>

{#if files.length}
	<Attachment.Group
		role="group"
		aria-label={text("附件", "Attachments")}
		tabindex={onRemove ? undefined : 0}
		class="w-full flex-col items-stretch gap-1.5 overflow-x-hidden"
	>
		{#each files as item (item.id)}
			<Attachment.Root
				size="sm"
				state={item.state}
				class="w-full flex-nowrap gap-2 rounded-md border-border bg-(--agent-file) text-foreground"
			>
				{#if item.url && item.file.type.startsWith("image/")}
					<Attachment.Media variant="image"
						><img src={item.url} alt={item.file.name} /></Attachment.Media
					>
				{:else}
					<Attachment.Media class="text-muted-foreground">
						<IconPlaceholder
							lucide="FileIcon"
							tabler="IconFile"
							hugeicons="File01Icon"
							phosphor="FileIcon"
							remixicon="RiFileLine"
							aria-hidden="true"
						/>
					</Attachment.Media>
				{/if}
				<Attachment.Content class="flex-1">
					<Attachment.Title title={item.file.name}>{item.file.name}</Attachment.Title>
					<Attachment.Description>
						{#if item.state === "uploading"}
							<span role="status">{text("正在准备附件…", "Preparing attachment…")}</span>
						{:else if item.state === "error"}
							<span role="alert">{text("文件超过 10 MB", "File exceeds 10 MB")}</span>
						{:else}
							{sizeLabel(item.file.size)}
						{/if}
					</Attachment.Description>
				</Attachment.Content>
				{#if onRemove}
					<Attachment.Actions class="relative inset-auto shrink-0">
						<Attachment.Action
							aria-label={text("移除 ", "Remove ") + item.file.name}
							title={text("移除附件", "Remove attachment")}
							onclick={() => onRemove?.(item.id)}
						>
							<IconPlaceholder
								lucide="XIcon"
								tabler="IconX"
								hugeicons="Cancel01Icon"
								phosphor="XIcon"
								remixicon="RiCloseLine"
								aria-hidden="true"
							/>
						</Attachment.Action>
					</Attachment.Actions>
				{:else if item.url}
					<a
						class="shrink-0 rounded-md p-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
						href={item.url}
						download={item.file.name}
						aria-label={text("下载 ", "Download ") + item.file.name}
					>
						{#if chinese}下载{:else}Download{/if}
					</a>
				{/if}
			</Attachment.Root>
		{/each}
	</Attachment.Group>
{/if}
