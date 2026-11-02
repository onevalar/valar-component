<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { RADIO_GROUP_SPEC } from "./radio-group-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const groups = [
		{ key: "vertical", label: "通知频率 · 纵向", orientation: "vertical" },
		{ key: "horizontal", label: "通知频率 · 横向", orientation: "horizontal" },
		{ key: "disabled", label: "通知频率 · 整组禁用", orientation: "vertical" },
		{ key: "invalid", label: "通知频率 · 校验错误", orientation: "vertical" },
	] as const;
	const options = [
		{ value: "daily", label: "每天汇总" },
		{ value: "instant", label: "即时通知" },
		{ value: "weekly", label: "每周汇总" },
	];
	let values = $state({
		current: { vertical: "daily", horizontal: "daily", disabled: "daily", invalid: "daily" },
		before: { vertical: "daily", horizontal: "daily", disabled: "daily", invalid: "daily" },
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="@container grid min-w-0 gap-8 p-4 md:p-6">
		<p class="text-sm text-muted-foreground">
			点击文字选择；Tab 进入单选组后，用方向键切换，正常组中的禁用项会被跳过。
		</p>
		<div class="grid min-w-0 gap-8 @[44rem]:grid-cols-2">
			{#each groups as group (group.key)}
				<Field.Set class="min-w-0" disabled={group.key === "disabled"}>
					<Field.Legend id={`${id}-${pane}-${group.key}-legend`}>{group.label}</Field.Legend>
					<Field.Description id={`${id}-${pane}-${group.key}-description`}>
						{#if group.key === "horizontal"}
							用左右方向键切换；窄画布内可横向滚动。
						{:else if group.key === "disabled"}
							当前通知设置已停用，保留已有选择但不可更改。
						{:else if group.key === "invalid"}
							固定展示校验错误，选择仅用于检查交互与样式。
						{:else}
							用上下方向键切换；即时通知暂不可用。
						{/if}
					</Field.Description>
					<div class="max-w-full min-w-0 overflow-x-auto p-3">
						<RadioGroup.Root
							bind:value={values[pane][group.key]}
							orientation={group.orientation}
							disabled={group.key === "disabled"}
							aria-labelledby={`${id}-${pane}-${group.key}-legend`}
							aria-describedby={`${id}-${pane}-${group.key}-description${group.key === "invalid" ? ` ${id}-${pane}-${group.key}-error` : ""}`}
							aria-invalid={group.key === "invalid" ? true : undefined}
							class={group.orientation === "horizontal"
								? "w-max min-w-full auto-cols-max grid-flow-col"
								: undefined}
						>
							{#each options as option (option.value)}
								{@const disabled =
									group.key === "disabled" ||
									(group.key !== "invalid" && option.value === "instant")}
								<Field.Field
									orientation="horizontal"
									data-disabled={disabled || undefined}
									data-invalid={group.key === "invalid" || undefined}
									class={group.orientation === "horizontal" ? "w-auto" : undefined}
								>
									<RadioGroup.Item
										id={`${id}-${pane}-${group.key}-${option.value}`}
										value={option.value}
										{disabled}
										aria-invalid={group.key === "invalid" ? true : undefined}
										aria-describedby={group.key === "invalid"
											? `${id}-${pane}-${group.key}-error`
											: undefined}
									/>
									<Field.Label
										for={`${id}-${pane}-${group.key}-${option.value}`}
										class={group.orientation === "horizontal" ? "whitespace-nowrap" : undefined}
									>
										{option.label}{disabled && group.key !== "disabled" ? "（暂不可用）" : ""}
									</Field.Label>
								</Field.Field>
							{/each}
						</RadioGroup.Root>
					</div>
					{#if group.key === "invalid"}
						<Field.Error id={`${id}-${pane}-${group.key}-error`}>
							当前通知方案暂不可用，请重新确认通知设置。
						</Field.Error>
					{/if}
				</Field.Set>
			{/each}
		</div>
	</div>
{/snippet}

<ComponentTuner spec={RADIO_GROUP_SPEC} {canvas}>{@render children()}</ComponentTuner>
