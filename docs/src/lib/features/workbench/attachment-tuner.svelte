<script lang="ts">
	import FileIcon from "@lucide/svelte/icons/file-text";
	import RetryIcon from "@lucide/svelte/icons/rotate-cw";
	import XIcon from "@lucide/svelte/icons/x";
	import { onDestroy, type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import * as Attachment from "$lib/registry/ui/attachment/index.js";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { ATTACHMENT_SPEC } from "./attachment-tuning.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const sizes = ["default", "sm", "xs"] as const;
	const initial = ["idle", "uploading", "processing", "error", "done"] as const;
	const descriptions = {
		idle: "等待上传",
		uploading: "正在上传 · 64%",
		processing: "正在解析文件",
		error: "上传失败：连接中断，请重试",
		done: "已上传 · 820 KB",
	};
	const createPane = () => ({
		orientation: "horizontal" as "horizontal" | "vertical",
		align: "start" as "start" | "end",
		composition: "both",
		image: false,
		files: sizes.flatMap(() =>
			initial.map((state) => ({ state: state as Attachment.AttachmentState, removed: false }))
		),
		feedback: "本地附件演示，不会上传文件。",
	});
	let panes = $state({ current: createPane(), before: createPane() });
	const timers = new SvelteMap<string, ReturnType<typeof setTimeout>>();
	function retry(pane: "current" | "before", index: number) {
		const key = `${pane}-${index}`;
		clearTimeout(timers.get(key));
		panes[pane].files[index].state = "uploading";
		panes[pane].feedback = "正在本地模拟上传…";
		timers.set(
			key,
			setTimeout(() => {
				panes[pane].files[index].state = "processing";
				timers.set(
					key,
					setTimeout(() => {
						panes[pane].files[index].state = "done";
						panes[pane].feedback = "重试成功，附件已就绪。";
						timers.delete(key);
					}, 600)
				);
			}, 600)
		);
	}
	function remove(pane: "current" | "before", index: number) {
		clearTimeout(timers.get(`${pane}-${index}`));
		timers.delete(`${pane}-${index}`);
		panes[pane].files[index].removed = true;
		panes[pane].feedback = "已移除本地演示附件，可恢复。";
	}
	function reset(pane: "current" | "before") {
		for (const [key, timer] of timers)
			if (key.startsWith(`${pane}-`)) {
				clearTimeout(timer);
				timers.delete(key);
			}
		panes[pane].files = createPane().files;
		panes[pane].feedback = "已恢复全部附件。";
	}
	onDestroy(() => {
		for (const timer of timers.values()) clearTimeout(timer);
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<div class="flex flex-wrap items-center gap-3 text-sm">
			<label for={`${id}-${pane}-orientation`}>排列</label>
			<select
				id={`${id}-${pane}-orientation`}
				class="rounded-md border bg-background p-2"
				bind:value={panes[pane].orientation}
				><option value="horizontal">横向附件</option><option value="vertical">纵向附件</option
				></select
			>
			<label for={`${id}-${pane}-composition`}>组成</label>
			<select
				id={`${id}-${pane}-composition`}
				class="rounded-md border bg-background p-2"
				bind:value={panes[pane].composition}
				><option value="both">媒体与文字</option><option value="content">只有文字</option><option
					value="media">只有媒体</option
				><option value="empty">空壳（不应添加留白）</option></select
			>
			<Button
				variant="outline"
				onclick={() => (panes[pane].align = panes[pane].align === "start" ? "end" : "start")}
				>切换消息左右</Button
			>
			<Button
				variant="outline"
				aria-pressed={panes[pane].image}
				onclick={() => (panes[pane].image = !panes[pane].image)}>图片／文件媒体</Button
			>
			<Button variant="outline" onclick={() => reset(pane)}>恢复附件</Button>
		</div>
		<Message.Root align={panes[pane].align}>
			<Message.Content>
				<Message.Header>林然 · 附件交接</Message.Header>
				<Bubble.Root variant="muted"
					><Bubble.Content
						>这是三种尺寸的文件列表。请检查上传失败、重试和移除；横向滚动不会撑宽消息。</Bubble.Content
					></Bubble.Root
				>
				{#each sizes as size, sizeIndex (size)}
					<section class="grid min-w-0 gap-2" aria-label={`${size} 附件五状态`}>
						<h3 class="text-xs text-muted-foreground">
							{size} · idle / uploading / processing / error / done
						</h3>
						<Attachment.Group>
							{#each initial as original, index (original)}
								{@const fileIndex = sizeIndex * initial.length + index}
								{@const file = panes[pane].files[fileIndex]}
								{#if !file.removed}
									<Attachment.Root {size} orientation={panes[pane].orientation} state={file.state}>
										{#if panes[pane].composition === "both" || panes[pane].composition === "media"}
											<Attachment.Media variant={panes[pane].image ? "image" : "icon"}
												>{#if panes[pane].image}<img
														src="/favicon.svg"
														alt="Valar 标志预览"
													/>{:else if file.state === "uploading" || file.state === "processing"}<Spinner
													/>{:else}<FileIcon />{/if}</Attachment.Media
											>
										{/if}
										{#if panes[pane].composition === "both" || panes[pane].composition === "content"}
											<Attachment.Content
												><Attachment.Title>设计说明-{original}.pdf</Attachment.Title
												><Attachment.Description>{descriptions[file.state]}</Attachment.Description
												></Attachment.Content
											>
										{/if}
										<Attachment.Actions>
											{#if file.state === "error" || file.state === "idle"}<Attachment.Action
													aria-label={`重试 ${size} 设计说明-${original}.pdf`}
													onclick={() => retry(pane, fileIndex)}><RetryIcon /></Attachment.Action
												>{/if}
											<Attachment.Action
												aria-label={`移除 ${size} 设计说明-${original}.pdf`}
												onclick={() => remove(pane, fileIndex)}><XIcon /></Attachment.Action
											>
										</Attachment.Actions>
										<Attachment.Trigger
											aria-label={`预览 ${size} 设计说明-${original}.pdf`}
											onclick={() =>
												(panes[pane].feedback =
													`已预览 ${size} 设计说明-${original}.pdf（本地演示）。`)}
										/>
									</Attachment.Root>
								{/if}
							{/each}
						</Attachment.Group>
					</section>
				{/each}
				<Message.Footer>10:24 · 仅本地模拟</Message.Footer>
			</Message.Content>
		</Message.Root>
		<p role="status" class="text-xs text-muted-foreground">{panes[pane].feedback}</p>
	</div>
{/snippet}

<ComponentTuner spec={ATTACHMENT_SPEC} {canvas}>{@render children()}</ComponentTuner>
