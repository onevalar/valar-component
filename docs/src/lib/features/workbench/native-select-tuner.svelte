<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_SIZES } from "./button-tuning.js";
	import { NATIVE_SELECT_SIZES, NATIVE_SELECT_SPEC } from "./native-select-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const examples = [
		{ id: "empty", label: "未选择" },
		{ id: "selected", label: "已选择" },
		{ id: "disabled", label: "禁用" },
		{ id: "invalid", label: "错误" },
	] as const;
	let values = $state({
		current: ["", "banana", "apple", "", "", "banana", "apple", ""],
		before: ["", "banana", "apple", "", "", "banana", "apple", ""],
	});
</script>

{#snippet probe()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-button={size.id}>{size.label}</Button>
	{/each}
{/snippet}

{#snippet options()}
	<NativeSelect.Option value="">请选择水果</NativeSelect.Option>
	<NativeSelect.OptGroup label="常见水果">
		<NativeSelect.Option value="apple">苹果</NativeSelect.Option>
		<NativeSelect.Option value="banana">香蕉</NativeSelect.Option>
	</NativeSelect.OptGroup>
	<NativeSelect.OptGroup label="时令水果">
		<NativeSelect.Option value="grapes">葡萄</NativeSelect.Option>
		<NativeSelect.Option value="peach" disabled>桃子（暂不可选）</NativeSelect.Option>
	</NativeSelect.OptGroup>
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="@container grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			点击标签聚焦，使用系统原生键盘选择。只调整闭合控件，不模拟或修改系统选项面板。
		</p>
		{#each NATIVE_SELECT_SIZES as size, sizeIndex (size.id)}
			<Field.Set class="min-w-0">
				<Field.Legend>{size.label}尺寸</Field.Legend>
				<div class="flex flex-wrap items-center gap-2">
					<Button variant="outline" size={size.id}>同档 Button · {size.label}</Button>
					<span class="text-xs text-muted-foreground">与 Button 同名尺寸的基线对照</span>
				</div>
				<div class="grid min-w-0 gap-5 @[28rem]:grid-cols-2">
					{#each examples as example, exampleIndex (example.id)}
						{@const fieldId = `${id}-${pane}-${size.id}-${example.id}`}
						<Field.Field
							class="min-w-0"
							data-disabled={example.id === "disabled" ? "" : undefined}
							data-invalid={example.id === "invalid" ? "" : undefined}
						>
							<Field.Label for={fieldId}>{size.label}尺寸 · {example.label}</Field.Label>
							<NativeSelect.Root
								id={fieldId}
								size={size.id}
								class="w-full min-w-0"
								bind:value={values[pane][sizeIndex * examples.length + exampleIndex]}
								disabled={example.id === "disabled"}
								aria-invalid={example.id === "invalid" ? "true" : undefined}
								aria-describedby={example.id === "invalid" ? `${fieldId}-error` : undefined}
							>
								{@render options()}
							</NativeSelect.Root>
							{#if example.id === "invalid"}
								<Field.Error id={`${fieldId}-error`}>请选择一种可用水果。</Field.Error>
							{/if}
						</Field.Field>
					{/each}
				</div>
			</Field.Set>
		{/each}
	</div>
{/snippet}

<ComponentTuner spec={NATIVE_SELECT_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>
