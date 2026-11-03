<script lang="ts">
	import * as Attachment from "$lib/registry/ui/attachment/index.js";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUBBLE_SPEC } from "./bubble-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const variants = [
		"default",
		"secondary",
		"muted",
		"tinted",
		"outline",
		"destructive",
		"ghost",
	] as const;
	const createPane = () => ({
		align: "start" as "start" | "end",
		clickable: false,
		likes: 2,
		selected: false,
		feedback: "按钮、链接与表情回应均使用原生语义。",
	});
	let panes = $state({ current: createPane(), before: createPane() });
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
				aria-pressed={panes[pane].clickable}
				onclick={() => (panes[pane].clickable = !panes[pane].clickable)}
				>{panes[pane].clickable ? "改为只读回应" : "改为可点击回应"}</Button
			>
		</div>
		<Message.Group>
			{#each variants as variant, index (variant)}
				<Message.Root align={panes[pane].align}>
					{#if index === variants.length - 1}<Message.Avatar
							><Avatar.Root><Avatar.Fallback>林</Avatar.Fallback></Avatar.Root></Message.Avatar
						>{:else}<Message.Avatar />{/if}
					<Message.Content>
						{#if index === 0}<Message.Header>林然 · 连续发送</Message.Header>{/if}
						<Bubble.Root {variant} class={index === 0 ? "mb-5" : undefined}>
							{#if variant === "secondary"}
								<Bubble.Content>
									{#snippet child({ props })}<button
											type="button"
											{...props}
											onclick={() => {
												panes[pane].selected = !panes[pane].selected;
												panes[pane].feedback = panes[pane].selected
													? "已选择这条快捷回复。"
													: "已取消快捷回复。";
											}}
											aria-pressed={panes[pane].selected}>secondary · 点击选择快捷回复</button
										>{/snippet}
								</Bubble.Content>
							{:else if variant === "outline"}
								<Bubble.Content>
									{#snippet child({ props })}<a {...props} href={`#${id}-${pane}-details`}
											>outline · 跳到本画布的交接说明</a
										>{/snippet}
								</Bubble.Content>
							{:else if variant === "ghost"}
								<Bubble.Content>
									<p>
										ghost · 助手长回复不限制到普通气泡的 80%
										宽度，也不增加留白或圆角。请核对中文长段落的换行与链接：
									</p>
									<a class="underline" href={`#${id}-${pane}-details`}
										>https://example.invalid/设计交接/非常长的路径/不应撑宽画布?revision=20261103</a
									>
									<pre class="max-w-full overflow-x-auto"><code
											>const message = "这是一段保留长行、可横向滚动的代码，不改变气泡宽度与消息行布局。";</code
										></pre>
								</Bubble.Content>
							{:else}
								<Bubble.Content>
									{variant} · {variant === "destructive"
										? "发送失败：会话已断开，请重新连接后重试。"
										: "已经完成设计检查，中文长消息会在边界内换行。请保留每种变体的语义配色，不把状态颜色变成局部参数。"}
								</Bubble.Content>
							{/if}
							{#if index === 0}
								{#if panes[pane].clickable}<Bubble.Reactions
										><Button
											variant="secondary"
											size="xs"
											aria-label={`赞同此消息，当前 ${panes[pane].likes} 人`}
											onclick={() => (panes[pane].likes += 1)}>👍 {panes[pane].likes}</Button
										></Bubble.Reactions
									>{:else}<Bubble.Reactions
										role="img"
										aria-label={`${panes[pane].likes} 人赞同，1 人庆祝`}
										>👍 {panes[pane].likes} 🎉 1</Bubble.Reactions
									>{/if}
							{/if}
						</Bubble.Root>
						{#if variant === "ghost"}<Message.Footer>10:25 · 完整助手说明</Message.Footer>{/if}
					</Message.Content>
				</Message.Root>
			{/each}
		</Message.Group>
		<Message.Root align={panes[pane].align === "start" ? "end" : "start"}>
			<Message.Content>
				<Message.Header>你 · 连续气泡与文件</Message.Header>
				<Bubble.Group
					><Bubble.Root variant="tinted"
						><Bubble.Content>收到，先看文字。</Bubble.Content></Bubble.Root
					><Bubble.Root variant="tinted"
						><Bubble.Content>再核对附件，组内间距只影响连续气泡。</Bubble.Content></Bubble.Root
					></Bubble.Group
				>
				<Attachment.Root
					><Attachment.Content
						><Attachment.Title>交接说明.pdf</Attachment.Title><Attachment.Description
							>已上传 · 820 KB</Attachment.Description
						></Attachment.Content
					></Attachment.Root
				>
				<Message.Footer>10:26 · 已送达</Message.Footer>
			</Message.Content>
		</Message.Root>
		<p id={`${id}-${pane}-details`} class="text-xs text-muted-foreground">
			交接说明：所有预览状态在本画布内独立保存，不会发送消息。
		</p>
		<p role="status" class="text-xs text-muted-foreground">{panes[pane].feedback}</p>
	</div>
{/snippet}

<ComponentTuner spec={BUBBLE_SPEC} {canvas}>{@render children()}</ComponentTuner>
