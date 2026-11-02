<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { NumberField } from "$lib/registry/ui/number-field/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_SIZES } from "./button-tuning.js";
	import { NUMBER_FIELD_SPEC } from "./number-field-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const examples: {
		id: string;
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
		locale?: string;
		formatOptions?: Intl.NumberFormatOptions;
		readonly?: boolean;
		disabled?: boolean;
		invalid?: boolean;
	}[] = [
		{ id: "quantity", label: "数量", value: 3, min: 0, max: 7, step: 1 },
		{ id: "decimal", label: "小数调整", value: -1.2, min: -2, max: 2, step: 0.1 },
		{
			id: "price",
			label: "欧元金额",
			value: 1234.56,
			min: 0,
			max: 2000,
			step: 0.01,
			locale: "de-DE",
			formatOptions: { style: "currency", currency: "EUR" },
		},
		{
			id: "rate",
			label: "比例",
			value: 0.37,
			min: 0,
			max: 1,
			step: 0.01,
			formatOptions: { style: "percent" },
		},
		{ id: "readonly", label: "只读数量", value: 4, min: 0, max: 7, step: 1, readonly: true },
		{ id: "disabled", label: "禁用数量", value: 2, min: 0, max: 7, step: 1, disabled: true },
		{ id: "invalid", label: "待确认数量", value: 5, min: 0, max: 7, step: 1, invalid: true },
	];
	let values = $state({
		current: examples.map((example) => example.value as number | undefined),
		before: examples.map((example) => example.value as number | undefined),
	});
	let feedback = $state({ current: "尚未提交", before: "尚未提交" });
	function submit(event: SubmitEvent, pane: "current" | "before") {
		event.preventDefault();
		feedback[pane] = JSON.stringify(
			Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement))
		);
	}
</script>

{#snippet probe()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-button={size.id}>{size.label}</Button>
	{/each}
	<NumberField value={3} aria-label="Number Field 几何探针" />
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="@container grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			高度调整会同步外框、输入框与加减按钮；原样式的40px内部控件加边框形成42px外框，不匹配 Button
			档位时保留“样式自带”。数值、范围、步长与本地化仅为真实交互示例，不作为样式写回。
		</p>
		<form
			class="grid min-w-0 gap-5"
			onsubmit={(event) => submit(event, pane)}
			onreset={() => (feedback[pane] = "尚未提交")}
		>
			<div class="grid min-w-0 gap-5 @[36rem]:grid-cols-2">
				{#each examples as example, index (example.id)}
					{@const fieldId = `${id}-${pane}-${example.id}`}
					<Field.Field
						class="min-w-0"
						data-invalid={example.invalid || undefined}
						data-disabled={example.disabled || undefined}
					>
						<Field.Label for={fieldId}>{example.label}</Field.Label>
						<NumberField
							id={fieldId}
							name={example.id}
							bind:value={values[pane][index]}
							min={example.min}
							max={example.max}
							step={example.step}
							locale={example.locale}
							formatOptions={example.formatOptions}
							readonly={example.readonly}
							disabled={example.disabled}
							decrementLabel={`减小${example.label}`}
							incrementLabel={`增大${example.label}`}
							aria-invalid={example.invalid || undefined}
							aria-describedby={`${fieldId}-help`}
						/>
						{#if example.invalid}
							<Field.Error id={`${fieldId}-help`}
								>这项数量需人工确认（外部校验状态演示）。</Field.Error
							>
						{:else}
							<Field.Description id={`${fieldId}-help`}
								>范围 {example.min} 至 {example.max}，步长 {example.step}。{example.id === "price"
									? "德语金额格式，提交仍为纯数字。"
									: example.id === "rate"
										? "显示百分比，提交0至1之间的数字。"
										: "方向键调整，Home／End到达边界。"}</Field.Description
							>
						{/if}
					</Field.Field>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2">
				<Button type="submit">查看数字提交值</Button>
				<Button type="reset" variant="outline">重置演示数值</Button>
			</div>
			<output aria-live="polite" class="min-w-0 text-sm break-words text-muted-foreground"
				>{feedback[pane]}</output
			>
		</form>
	</div>
{/snippet}

<ComponentTuner spec={NUMBER_FIELD_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>
