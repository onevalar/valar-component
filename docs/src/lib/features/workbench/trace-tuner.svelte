<script lang="ts">
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import TerminalIcon from "@lucide/svelte/icons/terminal";
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Trace from "$lib/registry/ui/trace/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TRACE_SPEC } from "./trace-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	type Status = "running" | "error" | "pending" | undefined;
	let states = $state({
		current: { open: true, nested: true, dialog: false, status: "running" as Status },
		before: { open: true, nested: true, dialog: false, status: "running" as Status },
	});
	const output = "$ pnpm inspect\n\n已读取本地示例，没有发送网络请求。";
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			状态按钮不会覆盖手动展开／收起状态。使用 Tab、Enter 或 Space
			操作真实折叠触发器；嵌套轨迹和小尺寸代码块保留各自层次。
		</p>
		<div class="flex flex-wrap gap-2">
			{#each [{ value: "running", title: "运行中" }, { value: "error", title: "失败" }, { value: "pending", title: "等待" }, { value: undefined, title: "完成" }] as status (status.title)}
				<Button
					size="sm"
					variant="outline"
					aria-pressed={states[pane].status === status.value}
					onclick={() => (states[pane].status = status.value as Status)}>{status.title}</Button
				>
			{/each}
			<Button size="sm" variant="outline" onclick={() => (states[pane].open = !states[pane].open)}
				>手动{states[pane].open ? "收起" : "展开"}详情</Button
			>
		</div>
		<Trace.Root>
			<Trace.Collapsible bind:open={states[pane].open}>
				<Trace.CollapsibleTrigger>
					<Trace.Line status={states[pane].status}>
						<Trace.Icon><TerminalIcon /></Trace.Icon>
						<Trace.Title
							>{states[pane].status === "running"
								? "正在检查本地演示任务"
								: states[pane].status === "error"
									? "检查本地演示任务失败"
									: states[pane].status === "pending"
										? "等待检查本地演示任务"
										: "已完成本地演示任务"}</Trace.Title
						>
					</Trace.Line>
				</Trace.CollapsibleTrigger>
				<Trace.CollapsibleContent>
					<Trace.Root>
						<Trace.Line
							><Trace.Icon><FileTextIcon /></Trace.Icon><Trace.Title>已读取本地配置文件</Trace.Title
							></Trace.Line
						>
						<Trace.Collapsible bind:open={states[pane].nested}>
							<Trace.CollapsibleTrigger>
								<Trace.Line
									><Trace.Icon><TerminalIcon /></Trace.Icon><Trace.Title
										>已运行本地输出示例</Trace.Title
									></Trace.Line
								>
							</Trace.CollapsibleTrigger>
							<Trace.CollapsibleContent>
								<CodeBlock.Root size="sm" class="text-foreground">
									<CodeBlock.Header
										><CodeBlock.Title>本地输出</CodeBlock.Title><CodeBlock.Actions
											><CodeBlock.CopyButton value={output} /></CodeBlock.Actions
										></CodeBlock.Header
									>
									<CodeBlock.Content code={output} wrap lineNumbers />
								</CodeBlock.Root>
							</Trace.CollapsibleContent>
						</Trace.Collapsible>
						<Trace.Line status="pending"
							><Trace.Icon><FileTextIcon /></Trace.Icon><Trace.Title>等待人工复核输出</Trace.Title
							></Trace.Line
						>
					</Trace.Root>
				</Trace.CollapsibleContent>
			</Trace.Collapsible>
			<Trace.Line status="error"
				><Trace.Icon><TerminalIcon /></Trace.Icon><Trace.Title
					>模拟校验失败，请检查示例配置</Trace.Title
				></Trace.Line
			>
			<a href={`#${id}-${pane}-result`}>
				<Trace.Line
					><Trace.Icon><FileTextIcon /></Trace.Icon><Trace.Title
						>查看同一画布内的复核说明</Trace.Title
					></Trace.Line
				>
			</a>
			<Dialog.Root bind:open={states[pane].dialog}>
				<Dialog.Trigger>
					<Trace.Line
						><Trace.Icon><FileTextIcon /></Trace.Icon><Trace.Title
							>打开本地任务详情对话框</Trace.Title
						></Trace.Line
					>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header
						><Dialog.Title>本地任务详情</Dialog.Title><Dialog.Description
							>这是可关闭的真实对话框。Esc 关闭后焦点返回轨迹触发器；不改变折叠状态。</Dialog.Description
						></Dialog.Header
					>
					<p class="text-sm">无网络请求或持久数据修改。</p>
				</Dialog.Content>
			</Dialog.Root>
		</Trace.Root>
		<section
			id={`${id}-${pane}-result`}
			class="text-sm text-muted-foreground"
			aria-label="复核说明"
		>
			复核说明：列表间距不改变树线与图标偏移；状态仍以文字说明，不只依赖颜色或动效。
		</section>
	</div>
{/snippet}

<ComponentTuner spec={TRACE_SPEC} {canvas}>{@render children()}</ComponentTuner>
