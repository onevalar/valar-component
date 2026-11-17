<script lang="ts">
	import Download from "@lucide/svelte/icons/download";
	import Expand from "@lucide/svelte/icons/expand";
	import FileText from "@lucide/svelte/icons/file-text";
	import X from "@lucide/svelte/icons/x";
	import { tick } from "svelte";
	import * as Attachment from "$lib/registry/ui/attachment/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	const chinese = $derived(getLocale() === "zh");
	let showImage = $state(true);
	let restoreButton = $state<HTMLButtonElement | null>(null);
	let removeButton = $state<HTMLButtonElement | null>(null);

	async function removeImage() {
		showImage = false;
		await tick();
		restoreButton?.focus();
	}

	async function restoreImage() {
		showImage = true;
		await tick();
		removeButton?.focus();
	}
</script>

<div class="flex w-full max-w-lg min-w-0 flex-col gap-3 [contain:inline-size]">
	<Attachment.Root appearance="agent-file" state="done" class="max-w-lg">
		<Attachment.Media><FileText aria-hidden="true" /></Attachment.Media>
		<Attachment.Content>
			<Attachment.Title title="component-review-notes.txt"
				>component-review-notes.txt</Attachment.Title
			>
			<Attachment.Description>24 B</Attachment.Description>
		</Attachment.Content>
		<Attachment.Actions>
			<Attachment.Action
				href="data:text/plain;charset=utf-8,Component%20review%20sample."
				download="component-review-notes.txt"
				aria-label={chinese ? "下载示例文件" : "Download example file"}
			>
				<Download aria-hidden="true" />
			</Attachment.Action>
		</Attachment.Actions>
	</Attachment.Root>

	{#if showImage}
		<Dialog.Root>
			<Attachment.Root
				appearance="agent-image"
				role="group"
				aria-label={chinese ? "草稿图片" : "Draft image"}
			>
				<Attachment.Media variant="image">
					<img
						src="/og.png"
						width="120"
						height="63"
						style="width:120px;height:auto"
						alt={chinese ? "组件目录预览" : "Component catalog preview"}
					/>
				</Attachment.Media>
				<Attachment.Actions role="group" aria-label={chinese ? "图片操作" : "Image actions"}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Attachment.Action
								{...props}
								aria-label={chinese ? "放大草稿图片" : "Open draft image"}
							>
								<Expand aria-hidden="true" />
							</Attachment.Action>
						{/snippet}
					</Dialog.Trigger>
					<Attachment.Action
						type="button"
						bind:ref={removeButton}
						aria-label={chinese ? "移除草稿图片" : "Remove draft image"}
						onclick={removeImage}
					>
						<X aria-hidden="true" />
					</Attachment.Action>
				</Attachment.Actions>
			</Attachment.Root>
			<Dialog.Content closeLabel={chinese ? "关闭图片" : "Close image"}>
				<Dialog.Header>
					<Dialog.Title>{chinese ? "草稿图片预览" : "Draft image preview"}</Dialog.Title>
					<Dialog.Description class="sr-only">
						{chinese ? "查看草稿中未裁切的图片。" : "View the uncropped image in the draft."}
					</Dialog.Description>
				</Dialog.Header>
				<img
					src="/og.png"
					alt={chinese ? "组件目录预览" : "Component catalog preview"}
					class="h-auto max-w-full rounded-[6px]"
				/>
			</Dialog.Content>
		</Dialog.Root>
	{:else}
		<Button
			bind:ref={restoreButton}
			type="button"
			variant="outline"
			size="xs"
			onclick={restoreImage}
			class="self-start"
		>
			{chinese ? "恢复草稿图片" : "Restore draft image"}
		</Button>
	{/if}
	<Attachment.Root appearance="agent-file" state="uploading">
		<Attachment.Media><Spinner aria-hidden="true" /></Attachment.Media>
		<Attachment.Content>
			<Attachment.Title>{chinese ? "正在上传…" : "Uploading…"}</Attachment.Title>
		</Attachment.Content>
	</Attachment.Root>
</div>
