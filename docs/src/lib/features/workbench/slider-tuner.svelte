<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SLIDER_SPEC } from "./slider-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let states = $state({
		current: {
			horizontalSingle: 37,
			horizontalRange: [23, 71],
			verticalSingle: 63,
			verticalRange: [18, 76],
			disabledRange: [27, 83],
			disabledVertical: 41,
		},
		before: {
			horizontalSingle: 37,
			horizontalRange: [23, 71],
			verticalSingle: 63,
			verticalRange: [18, 76],
			disabledRange: [27, 83],
			disabledVertical: 41,
		},
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<Field.Set class="min-w-0">
			<Field.Legend>横向滑块</Field.Legend>
			<Field.Description>
				拖动把手，或聚焦后按方向键、Home／End，体验真实单值与区间交互。
			</Field.Description>
			<Field.Group class="min-w-0 gap-5">
				<Field.Field class="min-w-0">
					<Field.Label id={`${id}-${pane}-horizontal-single`}>音量 · 单值</Field.Label>
					<div class="min-w-0 px-5 py-5">
						<Slider
							type="single"
							min={0}
							max={100}
							step={1}
							bind:value={states[pane].horizontalSingle}
							aria-labelledby={`${id}-${pane}-horizontal-single`}
							thumbLabels={["音量"]}
						/>
					</div>
					<Field.Description>当前音量：{states[pane].horizontalSingle}</Field.Description>
				</Field.Field>
				<Field.Field class="min-w-0">
					<Field.Label>亮度区间 · 双把手</Field.Label>
					<div class="min-w-0 px-5 py-5">
						<Slider
							type="multiple"
							min={0}
							max={100}
							step={1}
							bind:value={states[pane].horizontalRange}
							thumbLabels={["亮度下限", "亮度上限"]}
						/>
					</div>
					<Field.Description>当前区间：{states[pane].horizontalRange.join(" – ")}</Field.Description
					>
				</Field.Field>
			</Field.Group>
		</Field.Set>

		<Field.Set class="min-w-0">
			<Field.Legend>纵向滑块</Field.Legend>
			<Field.Description>方向仅为预览；纵向使用明确高度，独立于横向示例。</Field.Description>
			<div class="grid min-w-0 grid-cols-2 gap-4">
				<Field.Field class="min-w-0">
					<Field.Label id={`${id}-${pane}-vertical-single`}>增益 · 单值</Field.Label>
					<div class="flex h-60 min-w-0 justify-center px-5 py-6">
						<Slider
							type="single"
							orientation="vertical"
							min={0}
							max={100}
							step={1}
							bind:value={states[pane].verticalSingle}
							aria-labelledby={`${id}-${pane}-vertical-single`}
							thumbLabels={["增益"]}
						/>
					</div>
					<Field.Description>当前增益：{states[pane].verticalSingle}</Field.Description>
				</Field.Field>
				<Field.Field class="min-w-0">
					<Field.Label>频率区间 · 双把手</Field.Label>
					<div class="flex h-60 min-w-0 justify-center px-5 py-6">
						<Slider
							type="multiple"
							orientation="vertical"
							min={0}
							max={100}
							step={1}
							bind:value={states[pane].verticalRange}
							thumbLabels={["频率下限", "频率上限"]}
						/>
					</div>
					<Field.Description>当前区间：{states[pane].verticalRange.join(" – ")}</Field.Description>
				</Field.Field>
			</div>
		</Field.Set>

		<Field.Set class="min-w-0">
			<Field.Legend>禁用状态</Field.Legend>
			<Field.Description>禁用后保持原有取值，不响应拖动与键盘。</Field.Description>
			<Field.Group class="min-w-0">
				<Field.Field class="min-w-0" data-disabled>
					<Field.Label>禁用横向区间</Field.Label>
					<div class="min-w-0 px-5 py-5">
						<Slider
							type="multiple"
							min={0}
							max={100}
							step={1}
							bind:value={states[pane].disabledRange}
							thumbLabels={["禁用区间下限", "禁用区间上限"]}
							disabled
						/>
					</div>
					<Field.Description>{states[pane].disabledRange.join(" – ")}</Field.Description>
				</Field.Field>
				<Field.Field class="min-w-0" data-disabled>
					<Field.Label id={`${id}-${pane}-disabled-vertical`}>禁用纵向单值</Field.Label>
					<div class="flex h-60 min-w-0 justify-center px-5 py-6">
						<Slider
							type="single"
							orientation="vertical"
							min={0}
							max={100}
							step={1}
							bind:value={states[pane].disabledVertical}
							aria-labelledby={`${id}-${pane}-disabled-vertical`}
							thumbLabels={["禁用纵向数值"]}
							disabled
						/>
					</div>
					<Field.Description>{states[pane].disabledVertical}</Field.Description>
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</div>
{/snippet}

<ComponentTuner spec={SLIDER_SPEC} {canvas}>{@render children()}</ComponentTuner>
