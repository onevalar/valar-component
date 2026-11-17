<script lang="ts">
	import Copy from "@lucide/svelte/icons/copy";
	import Crop from "@lucide/svelte/icons/crop";
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import Expand from "@lucide/svelte/icons/expand";
	import * as Attachment from "$lib/registry/ui/attachment/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Menu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import IssueMediaCrop from "./issue-media-crop.svelte";
	import IssueVideoPlayer, { type VideoPlayback } from "./issue-video-player.svelte";
	import { cropIssueImage, readImageCrop, type IssueImageCrop } from "./media-crop.js";
	import { type IssueInlineMedia, safeIssueMediaSrc } from "./rich-text.js";

	let {
		name,
		mime,
		src,
		crop,
		media,
		chinese = false,
		portal,
		overlayPortal,
		onRemove,
		onCropChange
	}: {
		name: string;
		mime: string;
		src?: string | null;
		crop?: unknown;
		media?: IssueInlineMedia;
		chinese?: boolean;
		portal?: { to: string };
		overlayPortal?: { to: string };
		onRemove?: () => void;
		onCropChange?: (crop: IssueImageCrop) => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const video = $derived(mime.startsWith("video/"));
	const label = $derived(
		video ? text("视频操作", "Video actions") : text("图片操作", "Image actions")
	);
	const action =
		"size-[26px] rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1";
	const desktopAction = action + " hidden sm:inline-flex";
	let objectUrl = $state<string>();
	const remoteUrl = $derived(safeIssueMediaSrc(src));
	const originalSource = $derived(objectUrl ?? remoteUrl);
	const cropBounds = $derived(readImageCrop(crop));
	let croppedUrl = $state<string>();
	const source = $derived(croppedUrl ?? originalSource);
	let failed = $state(false);
	let ready = $state(false);
	let fullScreen = $state(false);
	let cropOpen = $state(false);
	let fullScreenButton = $state<HTMLButtonElement | null>(null);
	let cropButton = $state<HTMLButtonElement | null>(null);
	let menuButton = $state<HTMLButtonElement | null>(null);
	let mediaFocus: HTMLElement | null = null;
	let feedback = $state("");
	let image = $state<HTMLImageElement>();
	let inlinePlayer = $state<ReturnType<typeof IssueVideoPlayer>>();
	let previewPlayer = $state<ReturnType<typeof IssueVideoPlayer>>();
	let videoPlayback: VideoPlayback | undefined;

	$effect(() => {
		const file = media?.file;
		objectUrl = undefined;
		if (!file) return;
		const url = URL.createObjectURL(file);
		objectUrl = url;
		return () => URL.revokeObjectURL(url);
	});
	$effect(() => {
		const original = originalSource;
		const bounds = cropBounds;
		croppedUrl = undefined;
		if (!original || !bounds || video) return;
		let current = true;
		let url: string | undefined;
		void cropIssueImage(original, bounds).then(
			(blob) => {
				if (!current) return;
				url = URL.createObjectURL(blob);
				croppedUrl = url;
			},
			() => {
				if (current) feedback = text("无法裁剪图片。", "Unable to crop the image.");
			}
		);
		return () => {
			current = false;
			if (url) URL.revokeObjectURL(url);
		};
	});
	$effect(() => {
		if (source) {
			failed = false;
			ready = false;
		}
	});

	async function copyImage() {
		const picture = image;
		if (!picture?.naturalWidth) return;
		try {
			const canvas = document.createElement("canvas");
			canvas.width = picture.naturalWidth;
			canvas.height = picture.naturalHeight;
			const context = canvas.getContext("2d");
			if (!context) throw new Error("Canvas is unavailable");
			context.drawImage(picture, 0, 0);
			const blob = new Promise<Blob>((resolve, reject) =>
				canvas.toBlob((value) => {
					if (value) resolve(value);
					else reject(new Error("Image encoding failed"));
				})
			);
			await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
			feedback = text("已复制图片。", "Image copied.");
		} catch {
			feedback = text("无法复制图片。", "Unable to copy the image.");
		}
	}

	async function copyLink() {
		if (!remoteUrl) return;
		try {
			await navigator.clipboard.writeText(remoteUrl);
			feedback = text("已复制链接。", "Link copied.");
		} catch {
			feedback = text("无法复制链接。", "Unable to copy the link.");
		}
	}

	function downloadMedia() {
		if (!source || !objectUrl) return;
		const link = document.createElement("a");
		link.href = source;
		link.download = croppedUrl ? name.replace(/\.[^.]+$/, "") + ".png" : name;
		link.click();
	}

	function openPreview(trigger: HTMLElement | null) {
		mediaFocus = trigger;
		videoPlayback = inlinePlayer?.suspendPlayback();
		fullScreen = true;
	}

	function closePreview(open: boolean) {
		if (open || !video) return;
		const playback = previewPlayer?.suspendPlayback() ?? videoPlayback;
		videoPlayback = undefined;
		if (playback) inlinePlayer?.restorePlayback(playback);
	}

	function openCrop(trigger: HTMLElement | null) {
		mediaFocus = trigger;
		cropOpen = true;
	}

	function returnFocus() {
		const target = mediaFocus?.isConnected ? mediaFocus : menuButton;
		mediaFocus = null;
		target?.focus({ preventScroll: true });
	}
</script>

{#snippet picture(preview: boolean)}
	{#if source && !failed}
		{#if video && preview}
			<IssueVideoPlayer
				bind:this={previewPlayer}
				src={source}
				{name}
				{chinese}
				onReady={() => {
					if (videoPlayback) previewPlayer?.restorePlayback(videoPlayback);
				}}
			/>
		{:else if video}
			<IssueVideoPlayer
				bind:this={inlinePlayer}
				src={source}
				{name}
				{chinese}
				onReady={() => (ready = true)}
				onError={() => (failed = true)}
				onFullScreen={() =>
					openPreview(
						document.activeElement instanceof HTMLElement ? document.activeElement : menuButton
					)}
			/>
		{:else if preview}
			<img src={source} alt={name} class="block h-auto max-w-full rounded-[6px]" />
		{:else}
			<img
				bind:this={image}
				src={source}
				alt={name}
				class="block h-auto max-w-full rounded-[6px]"
				onload={() => (ready = true)}
				onerror={() => (failed = true)}
			/>
		{/if}
	{:else}
		<p
			role="status"
			class="max-w-full rounded-[6px] border border-border px-3 py-2 text-[13px] wrap-anywhere text-muted-foreground"
		>
			{text("媒体无法显示", "Media unavailable")} · {name}
		</p>
	{/if}
{/snippet}

<Attachment.Root
	appearance="agent-image"
	data-slot="issue-media-block"
	state={source && !ready && !failed ? "processing" : failed || !source ? "error" : "done"}
	class={video ? "my-2 w-full" : "my-2 w-fit max-w-full"}
>
	{@render picture(false)}
	{#if source && !ready && !failed}
		<span role="status" class="text-xs text-muted-foreground"
			>{text("正在读取媒体…", "Loading media…")}</span
		>
	{/if}
	<Attachment.Actions
		role="group"
		aria-label={label}
		class="static mt-1 h-[31px] w-fit max-w-full rounded-full border border-border bg-popover p-0.5 opacity-100"
	>
		{#if !video && source && !failed}
			<Attachment.Action
				class={desktopAction}
				aria-label={text("复制图片", "Copy image")}
				title={text("复制图片", "Copy image")}
				disabled={!ready}
				onclick={copyImage}
			>
				<Copy aria-hidden="true" size={14} />
			</Attachment.Action>
		{/if}
		{#if onCropChange && !video && objectUrl}
			<Attachment.Action
				bind:ref={cropButton}
				class={desktopAction}
				aria-label={text("裁剪图片", "Crop image")}
				title={text("裁剪图片", "Crop image")}
				disabled={!ready || failed}
				onclick={() => openCrop(cropButton)}
			>
				<Crop aria-hidden="true" size={14} />
			</Attachment.Action>
		{/if}
		{#if !video}
			<Attachment.Action
				bind:ref={fullScreenButton}
				class={desktopAction}
				aria-label={text("全屏", "Full screen")}
				title={text("全屏", "Full screen")}
				disabled={!ready || failed}
				onclick={() => openPreview(fullScreenButton)}
			>
				<Expand aria-hidden="true" size={14} />
			</Attachment.Action>
		{/if}
		<Menu.Root>
			<Menu.Trigger
				bind:ref={menuButton}
				class={action + " inline-grid place-items-center hover:bg-accent"}
				aria-label={text("打开菜单", "Open menu")}
			>
				<Ellipsis aria-hidden="true" size={14} />
			</Menu.Trigger>
			<Menu.Content
				portalProps={portal}
				align="start"
				onCloseAutoFocus={(event) => {
					if (cropOpen || fullScreen) event.preventDefault();
				}}
			>
				<Menu.Item disabled={!ready || failed} onSelect={() => openPreview(menuButton)}
					>{text("全屏", "Full screen")}</Menu.Item
				>
				<Menu.Separator />
				{#if !video}
					<Menu.Item disabled={!ready || failed} onSelect={copyImage}
						>{text("复制图片", "Copy image")}</Menu.Item
					>
				{/if}
				<Menu.Item disabled={!remoteUrl} onSelect={copyLink}
					>{text("复制链接", "Copy link")}</Menu.Item
				>
				<Menu.Item disabled={!objectUrl} onSelect={downloadMedia}
					>{text("下载", "Download")}</Menu.Item
				>
				{#if (onCropChange && !video && objectUrl) || onRemove}<Menu.Separator />{/if}
				{#if onCropChange && !video && objectUrl}
					<Menu.Item disabled={!ready || failed} onSelect={() => openCrop(menuButton)}
						>{text("裁剪图片", "Crop image")}</Menu.Item
					>
					{#if onRemove}<Menu.Separator />{/if}
				{/if}
				{#if onRemove}<Menu.Item variant="destructive" onSelect={onRemove}
						>{text("删除", "Delete")}</Menu.Item
					>{/if}
			</Menu.Content>
		</Menu.Root>
	</Attachment.Actions>
	<span class="sr-only" role="status">{feedback}</span>
</Attachment.Root>

<Dialog.Root bind:open={fullScreen} onOpenChange={closePreview}>
	<Dialog.Content
		portalProps={overlayPortal ?? portal}
		closeLabel={text("关闭全屏", "Close full screen")}
		class="flex h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-3 p-4 sm:max-w-none"
		onCloseAutoFocus={(event) => {
			event.preventDefault();
			returnFocus();
		}}
	>
		<Dialog.Title>{name}</Dialog.Title>
		<Dialog.Description class="sr-only"
			>{text("全屏查看媒体", "View media in full screen")}</Dialog.Description
		>
		<ScrollArea.Root orientation="both" type="hover" class="min-h-0 flex-1" viewportLabel={name}>
			{@render picture(true)}
		</ScrollArea.Root>
	</Dialog.Content>
</Dialog.Root>

{#if onCropChange && originalSource && !video}
	<IssueMediaCrop
		bind:open={cropOpen}
		{name}
		source={originalSource}
		initial={cropBounds}
		{chinese}
		portal={overlayPortal ?? portal}
		onSave={onCropChange}
		{returnFocus}
	/>
{/if}
