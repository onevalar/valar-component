<script lang="ts">
	import LinkIcon from "@lucide/svelte/icons/link";
	import SearchIcon from "@lucide/svelte/icons/search";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_SIZES } from "./button-tuning.js";
	import { INPUT_GROUP_SPEC } from "./input-group-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let values = $state({
		current: { search: "组件", text: "" },
		before: { search: "组件", text: "" },
	});
</script>

{#snippet probe()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-button={size.id}>{size.label}</Button>
	{/each}
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6" data-input-group-canvas>
		<Field.Field class="max-w-lg min-w-0">
			<Field.Label for={`${id}-${pane}-search`}>搜索组件 · 行内两侧</Field.Label>
			<div class="flex min-w-0 items-center gap-2" data-input-group-row>
				<InputGroup.Root>
					<InputGroup.Input
						id={`${id}-${pane}-search`}
						bind:value={values[pane].search}
						placeholder="组件名称"
					/>
					<InputGroup.Addon><SearchIcon /><InputGroup.Text>查找</InputGroup.Text></InputGroup.Addon>
					<InputGroup.Addon align="inline-end">
						<InputGroup.Button
							onclick={() => {
								values[pane].search = "";
							}}>清空</InputGroup.Button
						>
					</InputGroup.Addon>
				</InputGroup.Root>
				<Button>搜索</Button>
			</div>
			<Field.Description
				>高度仅调整单行外壳；内部输入随外壳填满，按钮仍使用自己的尺寸。</Field.Description
			>
		</Field.Field>
		<Field.Field class="max-w-lg min-w-0">
			<Field.Label for={`${id}-${pane}-url`}>链接 · 行内前缀</Field.Label>
			<InputGroup.Root>
				<InputGroup.Input id={`${id}-${pane}-url`} placeholder="example.com" />
				<InputGroup.Addon><LinkIcon /><InputGroup.Text>https://</InputGroup.Text></InputGroup.Addon>
			</InputGroup.Root>
		</Field.Field>
		{#each ["start", "end"] as side (side)}
			<Field.Field class="max-w-lg min-w-0">
				<Field.Label for={`${id}-${pane}-${side}`}
					>单行输入 · {side === "start" ? "顶部" : "底部"}附加内容</Field.Label
				>
				<InputGroup.Root data-input-group-block={side}>
					<InputGroup.Input id={`${id}-${pane}-${side}`} placeholder="输入标题" />
					<InputGroup.Addon align={side === "start" ? "block-start" : "block-end"}>
						<SearchIcon /><InputGroup.Text>保留样式自带的纵向留白</InputGroup.Text>
					</InputGroup.Addon>
				</InputGroup.Root>
			</Field.Field>
		{/each}
		<Field.Field class="max-w-lg min-w-0">
			<Field.Label for={`${id}-${pane}-message`}>多行消息 · 顶部与底部</Field.Label>
			<InputGroup.Root data-input-group-multiline>
				<InputGroup.Textarea
					id={`${id}-${pane}-message`}
					bind:value={values[pane].text}
					placeholder="输入多行内容，自动增长高度"
				/>
				<InputGroup.Addon align="block-start" class="border-b"
					><InputGroup.Text>消息草稿</InputGroup.Text></InputGroup.Addon
				>
				<InputGroup.Addon align="block-end" class="justify-between border-t">
					<InputGroup.Text>{values[pane].text.length} 字</InputGroup.Text>
					<InputGroup.Button
						onclick={() => {
							values[pane].text = "";
						}}>重置草稿</InputGroup.Button
					>
				</InputGroup.Addon>
			</InputGroup.Root>
		</Field.Field>
		<Field.Field class="max-w-lg min-w-0" data-disabled>
			<Field.Label for={`${id}-${pane}-disabled`}>禁用输入</Field.Label>
			<InputGroup.Root>
				<InputGroup.Input id={`${id}-${pane}-disabled`} value="不可编辑" disabled />
				<InputGroup.Addon align="inline-end"
					><InputGroup.Button disabled>检查</InputGroup.Button></InputGroup.Addon
				>
			</InputGroup.Root>
		</Field.Field>
		<Field.Field class="max-w-lg min-w-0" data-invalid>
			<Field.Label for={`${id}-${pane}-invalid`}>错误状态</Field.Label>
			<InputGroup.Root>
				<InputGroup.Input
					id={`${id}-${pane}-invalid`}
					value="不完整的链接"
					aria-invalid="true"
					aria-describedby={`${id}-${pane}-error`}
				/>
				<InputGroup.Addon><LinkIcon /></InputGroup.Addon>
			</InputGroup.Root>
			<Field.Error id={`${id}-${pane}-error`}>请输入完整链接。这是固定错误状态示例。</Field.Error>
		</Field.Field>
	</div>
{/snippet}

<ComponentTuner spec={INPUT_GROUP_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>
