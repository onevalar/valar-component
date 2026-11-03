<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_GROUP_SPEC } from "./button-group-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const initial = () => ({ text: "设计稿", format: "pdf", saved: 0, message: "尚未执行操作" });
	let states = $state({ current: initial(), before: initial() });
	function save(pane: "current" | "before") {
		states[pane].saved++;
		states[pane].message = `已保存「${states[pane].text || "未命名"}」第 ${states[pane].saved} 次`;
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			按钮仍使用 Button 的尺寸；只调 Text 留白和拼接端点。组内不添加 gap，嵌套组保留原有分组间距。
		</p>
		<section class="grid min-w-0 gap-3" aria-label="横向按钮组">
			<h3 class="text-sm font-medium">横向 · Text 与分隔</h3>
			<div class="min-w-0 overflow-x-auto p-1 pb-3">
				<ButtonGroup.Root aria-label="文稿操作">
					<ButtonGroup.Text><CheckIcon aria-hidden="true" />文稿</ButtonGroup.Text>
					<Button variant="outline" onclick={() => save(pane)}>保存</Button>
					<ButtonGroup.Separator />
					<Button
						variant="outline"
						onclick={() => (states[pane].message = `预览：${states[pane].text || "未命名"}`)}
						>预览</Button
					>
					<Button variant="outline" disabled>禁用</Button>
				</ButtonGroup.Root>
			</div>
		</section>
		<section class="grid min-w-0 gap-3" aria-label="纵向按钮组">
			<h3 class="text-sm font-medium">纵向 · 首尾拼接</h3>
			<ButtonGroup.Root orientation="vertical" aria-label="纵向文稿操作">
				<ButtonGroup.Text><CheckIcon aria-hidden="true" />文稿</ButtonGroup.Text>
				<Button variant="outline" onclick={() => save(pane)}>保存</Button>
				<ButtonGroup.Separator orientation="horizontal" />
				<Button variant="outline" onclick={() => (states[pane].message = "已归档当前文稿")}
					>归档</Button
				>
			</ButtonGroup.Root>
		</section>
		<section class="grid min-w-0 gap-3" aria-label="输入和选择控件组合">
			<label for={`${id}-${pane}-name`} class="text-sm font-medium">文稿名称</label>
			<ButtonGroup.Root aria-label="命名文稿" class="w-full max-w-full min-w-0">
				<ButtonGroup.Text>名称</ButtonGroup.Text>
				<Input id={`${id}-${pane}-name`} bind:value={states[pane].text} class="min-w-0" />
				<Button variant="outline" onclick={() => save(pane)}>保存</Button>
			</ButtonGroup.Root>
			<div class="min-w-0 overflow-x-auto p-1 pb-3">
				<ButtonGroup.Root aria-label="确认格式与操作">
					<Button
						variant="outline"
						onclick={() =>
							(states[pane].message =
								`已确认 ${states[pane].text || "未命名"} 使用 ${states[pane].format.toUpperCase()} 格式`)}
						>确认</Button
					>
					<Select.Root type="single" name={`${id}-${pane}-format`} bind:value={states[pane].format}>
						<Select.Trigger aria-label="导出格式"
							>{states[pane].format.toUpperCase()}</Select.Trigger
						>
						<Select.Content>
							<Select.Item value="pdf">PDF</Select.Item>
							<Select.Item value="svg">SVG</Select.Item>
							<Select.Item value="png">PNG</Select.Item>
						</Select.Content>
					</Select.Root>
				</ButtonGroup.Root>
			</div>
		</section>
		<section class="grid min-w-0 gap-3" aria-label="嵌套按钮组">
			<h3 class="text-sm font-medium">嵌套 · 原有组间距</h3>
			<div class="min-w-0 overflow-x-auto p-1 pb-3">
				<ButtonGroup.Root aria-label="分组操作">
					<ButtonGroup.Root aria-label="保存分组"
						><Button variant="outline" onclick={() => save(pane)}>保存</Button></ButtonGroup.Root
					>
					<ButtonGroup.Root aria-label="重置分组"
						><Button
							variant="outline"
							onclick={() => {
								states[pane].text = "设计稿";
								states[pane].message = "名称已重置";
							}}>重置名称</Button
						></ButtonGroup.Root
					>
				</ButtonGroup.Root>
			</div>
		</section>
		<p role="status" class="text-sm text-muted-foreground">
			{states[pane].message} · 当前格式：{states[pane].format.toUpperCase()}
		</p>
	</div>
{/snippet}

<ComponentTuner spec={BUTTON_GROUP_SPEC} {canvas}>{@render children()}</ComponentTuner>
