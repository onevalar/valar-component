<script lang="ts">
	import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
	import InfoIcon from "@lucide/svelte/icons/info";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { ALERT_SPEC } from "./alert-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let undone = $state({ current: false, before: false });
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			静态样式示例使用有名称的
			region，避免调参时重复警报。图标横向间距、操作区右侧预留和定位沿用组件库。
		</p>
		<Alert.Root role="region" aria-labelledby={`${id}-${pane}-plain`}>
			<Alert.Title id={`${id}-${pane}-plain`}>预览环境已准备好</Alert.Title>
			<Alert.Description>
				这是一条没有图标的普通说明。修改留白不会改变文字、边框和背景所使用的语义颜色。
			</Alert.Description>
		</Alert.Root>
		<Alert.Root role="region" aria-labelledby={`${id}-${pane}-action`} data-alert-action-sample>
			<InfoIcon aria-hidden="true" />
			<Alert.Title id={`${id}-${pane}-action`}>
				{undone[pane] ? "已撤销示例操作" : "示例项目已归档"}
			</Alert.Title>
			<Alert.Description>
				操作按钮只切换本画布的演示状态，不提交请求；并排比较中的另一侧保持独立。
			</Alert.Description>
			<Alert.Action>
				<Button size="xs" variant="outline" onclick={() => (undone[pane] = !undone[pane])}>
					{undone[pane] ? "重置" : "撤销"}
				</Button>
			</Alert.Action>
		</Alert.Root>
		<Alert.Root variant="destructive" role="region" aria-labelledby={`${id}-${pane}-error`}>
			<CircleAlertIcon aria-hidden="true" />
			<Alert.Title id={`${id}-${pane}-error`}>无法保存这份较长的项目说明</Alert.Title>
			<Alert.Description>
				<p>请检查必填内容后重试。此示例保留多段说明，让窄画布和大留白下的自然换行也能被检查。</p>
				<p><a href={`#${id}-${pane}-details`}>查看处理说明</a>，不会执行真实保存或删除操作。</p>
			</Alert.Description>
		</Alert.Root>
		<Alert.Root variant="destructive" role="region" aria-labelledby={`${id}-${pane}-title-only`}>
			<Alert.Title id={`${id}-${pane}-title-only`}>仅标题的危险提示，没有图标或说明</Alert.Title>
		</Alert.Root>
		<p
			id={`${id}-${pane}-details`}
			tabindex="-1"
			class="text-xs text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
		>
			处理说明：真实页面应按信息紧急程度选择播报语义；本画布不改变 Alert 默认的 role。
		</p>
	</div>
{/snippet}

<ComponentTuner spec={ALERT_SPEC} {canvas}>{@render children()}</ComponentTuner>
