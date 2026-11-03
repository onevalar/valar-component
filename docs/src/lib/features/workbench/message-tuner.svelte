<script lang="ts">
	import FileIcon from "@lucide/svelte/icons/file-text";
	import RetryIcon from "@lucide/svelte/icons/rotate-cw";
	import XIcon from "@lucide/svelte/icons/x";
	import { onDestroy, type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import * as Attachment from "$lib/registry/ui/attachment/index.js";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { MESSAGE_SPEC } from "./message-tuning.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const createPane = () => ({
		align: "start" as "start" | "end",
		continuous: true,
		clickable: false,
		likes: 2,
		attachment: "error" as Attachment.AttachmentState,
		removed: false,
		feedback: "本地对话，不会发送消息或上传文件。",
	});
	let panes = $state({ current: createPane(), before: createPane() });
	const timers = new SvelteMap<string, ReturnType<typeof setTimeout>>();
	function retry(pane: "current" | "before") {
		clearTimeout(timers.get(pane));
		panes[pane].attachment = "uploading";
		timers.set(
			pane,
			setTimeout(() => {
				panes[pane].attachment = "done";
				panes[pane].feedback = "重试成功，交接文件已就绪。";
				timers.delete(pane);
			}, 1200)
		);
	}
	function remove(pane: "current" | "before") {
		clearTimeout(timers.get(pane));
		timers.delete(pane);
		panes[pane].removed = true;
		panes[pane].feedback = "已移除附件，可重新添加失败示例。";
	}
	onDestroy(() => {
		for (const timer of timers.values()) clearTimeout(timer);
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-8 p-4 md:p-6">
		<div class="flex flex-wrap gap-2">
			<Button
				variant="outline"
				onclick={() => (panes[pane].align = panes[pane].align === "start" ? "end" : "start")}
				>切换消息左右</Button
			>
			<Button
				variant="outline"
				aria-pressed={panes[pane].continuous}
				onclick={() => (panes[pane].continuous = !panes[pane].continuous)}
				>连续发送／独立头像</Button
			>
			<Button
				variant="outline"
				aria-pressed={panes[pane].clickable}
				onclick={() => (panes[pane].clickable = !panes[pane].clickable)}>只读／可点击回应</Button
			>
		</div>
		<Message.Group>
			{#each [0, 1] as index (index)}
				<Message.Root align={panes[pane].align}>
					{#if index === 0 && panes[pane].continuous}<Message.Avatar />{:else}<Message.Avatar
							><Avatar.Root><Avatar.Fallback>林</Avatar.Fallback></Avatar.Root></Message.Avatar
						>{/if}
					<Message.Content>
						<Message.Header>林然 · {index === 0 ? "设计交接" : "补充说明"}</Message.Header>
						<Bubble.Root variant="muted"
							><Bubble.Content
								>{index === 0
									? "请检查连续消息中占位头像与真正头像的对齐。正文、页眉、页脚及附件间距都由消息布局负责，不能混改内部气泡或头像大小。"
									: "中文长段落会换行，链接和代码保留自己的语义。连续发送时只在最后一条显示头像，前一条保留占位。"}</Bubble.Content
							></Bubble.Root
						>
						{#if index === 1}
							{#if panes[pane].removed}<Button
									variant="outline"
									onclick={() => {
										panes[pane].removed = false;
										panes[pane].attachment = "error";
									}}>重新添加失败附件</Button
								>{:else}
								<Attachment.Root state={panes[pane].attachment}>
									<Attachment.Media
										>{#if panes[pane].attachment === "uploading"}<Spinner />{:else}<FileIcon
											/>{/if}</Attachment.Media
									>
									<Attachment.Content
										><Attachment.Title>完整交接说明.pdf</Attachment.Title><Attachment.Description
											>{panes[pane].attachment === "error"
												? "上传失败：连接中断，请重试"
												: panes[pane].attachment === "uploading"
													? "正在上传…"
													: "已上传 · 820 KB"}</Attachment.Description
										></Attachment.Content
									>
									<Attachment.Actions
										>{#if panes[pane].attachment === "error"}<Attachment.Action
												aria-label="重试完整交接说明.pdf"
												onclick={() => retry(pane)}><RetryIcon /></Attachment.Action
											>{/if}<Attachment.Action
											aria-label="移除完整交接说明.pdf"
											onclick={() => remove(pane)}><XIcon /></Attachment.Action
										></Attachment.Actions
									>
								</Attachment.Root>
							{/if}
						{/if}
						<Message.Footer>10:24 · {index === 0 ? "已送达" : "附件交接"}</Message.Footer>
					</Message.Content>
				</Message.Root>
			{/each}
		</Message.Group>
		<Message.Root align={panes[pane].align === "start" ? "end" : "start"}>
			<Message.Avatar
				><Avatar.Root><Avatar.Fallback>你</Avatar.Fallback></Avatar.Root></Message.Avatar
			>
			<Message.Content>
				<Message.Header>你</Message.Header>
				<Bubble.Root variant="tinted" class="mb-5"
					><Bubble.Content>收到，会先核对边界和长文本。</Bubble.Content
					>{#if panes[pane].clickable}<Bubble.Reactions
							><Button
								variant="secondary"
								size="xs"
								aria-label={`赞同回复，当前 ${panes[pane].likes} 人`}
								onclick={() => (panes[pane].likes += 1)}>👍 {panes[pane].likes}</Button
							></Bubble.Reactions
						>{:else}<Bubble.Reactions role="img" aria-label={`${panes[pane].likes} 人赞同`}
							>👍 {panes[pane].likes}</Bubble.Reactions
						>{/if}</Bubble.Root
				>
				<Message.Footer>10:25 · 已读</Message.Footer>
			</Message.Content>
		</Message.Root>
		<Message.Root>
			<Message.Content>
				<Message.Header>助手 · ghost 长回复</Message.Header>
				<Bubble.Root variant="ghost"
					><Bubble.Content>
						<p>
							消息布局只管理三个 gap。此处页眉和页脚仍是 ghost
							的零横向留白；即使增大普通消息间距，也不为助手内容额外加框或更改头像。
						</p>
						<a href={`#${id}-${pane}-summary`} class="underline"
							>https://example.invalid/中文交接/长路径与代码边界/20261103</a
						>
						<pre class="max-w-full overflow-x-auto"><code
								>{'const result = { message: "保留一条足够长的代码行，在窄屏内滚动，而不是撑宽整条消息。", ready: true };'}</code
							></pre>
					</Bubble.Content></Bubble.Root
				>
				<Message.Footer>10:26 · 助手说明</Message.Footer>
			</Message.Content>
		</Message.Root>
		<p id={`${id}-${pane}-summary`} role="status" class="text-xs text-muted-foreground">
			{panes[pane].feedback}
		</p>
	</div>
{/snippet}

<ComponentTuner spec={MESSAGE_SPEC} {canvas}>{@render children()}</ComponentTuner>
