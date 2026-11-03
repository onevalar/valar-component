<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import { type Snippet } from "svelte";
	import * as Marker from "$lib/registry/ui/marker/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { MARKER_SPEC } from "./marker-tuning.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let panes = $state({ current: { running: true }, before: { running: true } });
	const variants = ["default", "separator", "border"] as const;
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			三种真实变体均保留文字、图标与分隔线。状态以文字说明；字体和语义颜色是只读全局 token。
		</p>
		<Button
			size="sm"
			variant="outline"
			aria-pressed={panes[pane].running}
			onclick={() => (panes[pane].running = !panes[pane].running)}>切换运行／完成状态</Button
		>
		{#each variants as variant (variant)}
			<section class="grid min-w-0 gap-4" aria-label={`${variant} 标记示例`}>
				<h3 class="text-xs text-muted-foreground">{variant}</h3>
				<Marker.Root {variant} role="status">
					<Marker.Icon
						>{#if panes[pane].running}<Spinner />{:else}<CheckIcon />{/if}</Marker.Icon
					>
					<Marker.Content
						>{panes[pane].running ? "正在检查本地会话" : "本地会话检查已完成"}</Marker.Content
					>
				</Marker.Root>
				<Marker.Root {variant}>
					<Marker.Content>2026 年 11 月 3 日 · 对话记录</Marker.Content>
				</Marker.Root>
				<Marker.Root {variant}>
					<Marker.Icon><CheckIcon /></Marker.Icon>
					<Marker.Content class={variant === "separator" ? "max-w-[70%]" : undefined}>
						这是一段较长的系统说明，用于检查窄画布和换行。消息未离开当前浏览器；分隔标记依然具有可朗读文字，不添加
						separator 角色。
					</Marker.Content>
				</Marker.Root>
			</section>
		{/each}
		<Marker.Root>
			{#snippet child({ props })}
				<a {...props} href={`#${id}-${pane}-note`}
					><Marker.Content>查看画布内说明</Marker.Content></a
				>
			{/snippet}
		</Marker.Root>
		<p id={`${id}-${pane}-note`} class="text-xs text-muted-foreground">
			child 链接仍为真实链接；以上日期分隔不使用 role="separator"，状态标记使用 role="status"。
		</p>
	</div>
{/snippet}

<ComponentTuner spec={MARKER_SPEC} {canvas}>{@render children()}</ComponentTuner>
