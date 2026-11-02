<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SWITCH_SPEC } from "./switch-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let values = $state({ current: [false, true, false, true], before: [false, true, false, true] });
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="@container grid min-w-0 gap-8 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			点击标签或用空格键切换；尺寸变化同步轨道与滑块，不改变各样式的端点留白。
		</p>
		<div class="grid min-w-0 gap-8 @[40rem]:grid-cols-2">
			{#each ["default", "sm"] as size, index (size)}
				<Field.Set class="min-w-0">
					<Field.Legend>{size === "default" ? "默认尺寸" : "小尺寸"}</Field.Legend>
					<Field.Group>
						{#each ["邮件通知", "自动同步"] as label, item (label)}
							<Field.Field orientation="horizontal">
								<Field.Label for={`${id}-${pane}-${size}-${item}`}>{label}</Field.Label>
								<Switch
									id={`${id}-${pane}-${size}-${item}`}
									size={size as "default" | "sm"}
									bind:checked={values[pane][index * 2 + item]}
								/>
							</Field.Field>
						{/each}
						<Field.Field orientation="horizontal" data-disabled>
							<Field.Label for={`${id}-${pane}-${size}-disabled-off`}
								>工作区通知（禁用）</Field.Label
							>
							<Switch
								id={`${id}-${pane}-${size}-disabled-off`}
								size={size as "default" | "sm"}
								disabled
							/>
						</Field.Field>
						<Field.Field orientation="horizontal" data-disabled>
							<Field.Label for={`${id}-${pane}-${size}-disabled-on`}>安全提醒（禁用）</Field.Label>
							<Switch
								id={`${id}-${pane}-${size}-disabled-on`}
								size={size as "default" | "sm"}
								checked
								disabled
							/>
						</Field.Field>
					</Field.Group>
				</Field.Set>
			{/each}
		</div>
		<Field.Set class="min-w-0">
			<Field.Legend>错误状态</Field.Legend>
			<Field.Field orientation="horizontal" data-invalid>
				<Field.Label for={`${id}-${pane}-invalid`}>外部集成</Field.Label>
				<Switch
					id={`${id}-${pane}-invalid`}
					aria-invalid="true"
					aria-describedby={`${id}-${pane}-error`}
				/>
			</Field.Field>
			<Field.Error id={`${id}-${pane}-error`}>当前工作区没有启用此功能的权限。</Field.Error>
		</Field.Set>
	</div>
{/snippet}

<ComponentTuner spec={SWITCH_SPEC} {canvas}>{@render children()}</ComponentTuner>
