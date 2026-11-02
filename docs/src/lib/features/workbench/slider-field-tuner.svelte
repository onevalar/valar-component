<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SLIDER_FIELD_SPEC } from "./slider-field-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const examples = [
		{ key: "width", label: "宽度", min: 0, max: 200, step: 2, unit: "px", initial: 80 },
		{ key: "offset", label: "偏移", min: -10, max: 10, step: 0.25, unit: "px", initial: -2.5 },
		{ key: "ratio", label: "比例（无单位）", min: 0, max: 1, step: 0.05, initial: 0.5 },
		{ key: "disabled", label: "禁用宽度", min: 0, max: 200, step: 2, unit: "px", initial: 64 },
	] as const;
	let values = $state({
		current: examples.map((example): number => example.initial),
		before: examples.map((example): number => example.initial),
	});
	let feedback = $state({ current: "尚未提交。", before: "尚未提交。" });
	function submit(
		event: SubmitEvent & { currentTarget: HTMLFormElement },
		pane: "current" | "before"
	) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		feedback[pane] = `FormData：${JSON.stringify(Object.fromEntries(data))}（禁用字段不提交）`;
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-3 md:p-6">
		<p class="text-xs text-muted-foreground">
			拖动滑块或直接输入数字，两者同步。仅调整组合布局，不调整子控件高度、圆角或轨道。输入无效或超出范围时保留上一个有效值，并由原生表单校验阻止提交；失焦与确认沿用
			Number Field 的提交规则。
		</p>
		<form class="grid min-w-0 gap-6" onsubmit={(event) => submit(event, pane)}>
			{#each examples as example, index (example.key)}
				<div class="grid min-w-0 gap-2">
					<SliderField
						id={`${id}-${pane}-${example.key}`}
						name={example.key}
						label={example.label}
						min={example.min}
						max={example.max}
						step={example.step}
						unit={"unit" in example ? example.unit : undefined}
						disabled={example.key === "disabled"}
						bind:value={values[pane][index]}
						class="min-w-0"
					/>
					<p class="text-xs text-muted-foreground" data-slider-field-value={example.key}>
						范围 {example.min} 至 {example.max}，步长 {example.step}；当前有效值：{values[pane][
							index
						]}
					</p>
				</div>
			{/each}
			<div class="flex flex-wrap gap-2">
				<Button type="submit">提交本画布表单</Button>
			</div>
			<p role="status" class="text-sm break-words text-muted-foreground">{feedback[pane]}</p>
		</form>
	</div>
{/snippet}

<ComponentTuner spec={SLIDER_FIELD_SPEC} {canvas}>{@render children()}</ComponentTuner>
