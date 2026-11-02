<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { CHECKBOX_SPEC } from "./checkbox-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let states = $state({
		current: { unchecked: false, checked: true, mixed: false, indeterminate: true, invalid: false },
		before: { unchecked: false, checked: true, mixed: false, indeterminate: true, invalid: false },
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<Field.Set class="min-w-0">
			<Field.Legend>保存后生效的偏好</Field.Legend>
			<Field.Description>点击标签或聚焦后按空格键，体验真实的复选框交互。</Field.Description>
			<Field.Group class="min-w-0">
				<Field.Field orientation="horizontal" class="min-w-0">
					<Checkbox id={`${id}-${pane}-unchecked`} bind:checked={states[pane].unchecked} />
					<Field.Label for={`${id}-${pane}-unchecked`} class="min-w-0 break-words">
						接收项目更新（初始未选中）
					</Field.Label>
				</Field.Field>
				<Field.Field orientation="horizontal" class="min-w-0">
					<Checkbox id={`${id}-${pane}-checked`} bind:checked={states[pane].checked} />
					<Field.Label for={`${id}-${pane}-checked`} class="min-w-0 break-words">
						保存编辑历史（初始已选中）
					</Field.Label>
				</Field.Field>
				<Field.Field orientation="horizontal" class="min-w-0">
					<Checkbox
						id={`${id}-${pane}-mixed`}
						bind:checked={states[pane].mixed}
						bind:indeterminate={states[pane].indeterminate}
						aria-describedby={`${id}-${pane}-mixed-description`}
					/>
					<Field.Content class="min-w-0">
						<Field.Label for={`${id}-${pane}-mixed`} class="min-w-0 break-words">
							部分选中示例
						</Field.Label>
						<Field.Description id={`${id}-${pane}-mixed-description`}>
							初始为真实半选状态，点击或按空格键可切换为选中。
						</Field.Description>
					</Field.Content>
				</Field.Field>
			</Field.Group>
		</Field.Set>

		<Field.Set class="min-w-0">
			<Field.Legend>禁用与校验状态</Field.Legend>
			<Field.Group class="min-w-0">
				<Field.Field orientation="horizontal" class="min-w-0">
					<Checkbox id={`${id}-${pane}-disabled-unchecked`} disabled checked={false} />
					<Field.Label for={`${id}-${pane}-disabled-unchecked`} class="min-w-0 break-words">
						禁用 · 未选中
					</Field.Label>
				</Field.Field>
				<Field.Field orientation="horizontal" class="min-w-0">
					<Checkbox id={`${id}-${pane}-disabled-checked`} disabled checked />
					<Field.Label for={`${id}-${pane}-disabled-checked`} class="min-w-0 break-words">
						禁用 · 已选中
					</Field.Label>
				</Field.Field>
				<Field.Field orientation="horizontal" class="min-w-0" data-invalid>
					<Checkbox
						id={`${id}-${pane}-invalid`}
						bind:checked={states[pane].invalid}
						aria-invalid="true"
						aria-describedby={`${id}-${pane}-error`}
					/>
					<Field.Content class="min-w-0">
						<Field.Label for={`${id}-${pane}-invalid`} class="min-w-0 break-words">
							同意项目使用规范
						</Field.Label>
						<Field.Error id={`${id}-${pane}-error`}>
							校验外观示例：保存前需要确认使用规范。
						</Field.Error>
					</Field.Content>
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</div>
{/snippet}

<ComponentTuner spec={CHECKBOX_SPEC} {canvas}>{@render children()}</ComponentTuner>
