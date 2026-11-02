<script lang="ts">
	import { REGEXP_ONLY_DIGITS } from "bits-ui";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BUTTON_SIZES } from "./button-tuning.js";
	import { INPUT_OTP_SPEC } from "./input-otp-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const samples = [
		{ key: "continuous", label: "连续六位", grouped: false, disabled: false, invalid: false },
		{ key: "grouped", label: "三位 + 三位分组", grouped: true, disabled: false, invalid: false },
		{ key: "disabled", label: "禁用验证码", grouped: true, disabled: true, invalid: false },
		{ key: "invalid", label: "错误验证码", grouped: true, disabled: false, invalid: true },
	] as const;
	const initial = () => ({ continuous: "", grouped: "123", disabled: "123456", invalid: "654321" });
	let states = $state({ current: initial(), before: initial() });
</script>

{#snippet probe()}
	{#each BUTTON_SIZES as size (size.id)}
		<Button variant="outline" size={size.id} data-probe-button={size.id}>{size.label}</Button>
	{/each}
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			输入或整串粘贴六位数字，使用方向键与退格键体验真实输入。各示例与对比面板独立；错误示例固定显示错误，不进行业务校验。
			长分组仅在本示例内横向滚动，不换行拆开验证码。
		</p>
		{#each samples as sample (sample.key)}
			{@const inputId = `${id}-${pane}-${sample.key}`}
			<Field.Field
				class="min-w-0"
				data-disabled={sample.disabled || undefined}
				data-invalid={sample.invalid || undefined}
			>
				<Field.Label for={inputId}>{sample.label}</Field.Label>
				<div class="min-w-0 overflow-x-auto p-1 pb-3">
					<InputOTP.Root
						{inputId}
						maxlength={6}
						pattern={REGEXP_ONLY_DIGITS}
						autocomplete="one-time-code"
						bind:value={states[pane][sample.key]}
						disabled={sample.disabled}
						aria-invalid={sample.invalid || undefined}
						aria-describedby={`${inputId}-description${sample.invalid ? ` ${inputId}-error` : ""}`}
						class="w-max flex-nowrap [&_[data-slot=input-otp-slot]]:shrink-0 [&>[data-slot=input-otp-group]]:shrink-0 [&>[data-slot=input-otp-group]]:flex-nowrap"
					>
						{#snippet children({ cells })}
							{#if sample.grouped}
								<InputOTP.Group>
									{#each cells.slice(0, 3) as cell, index (index)}
										<InputOTP.Slot {cell} aria-invalid={sample.invalid || undefined} />
									{/each}
								</InputOTP.Group>
								<InputOTP.Separator />
								<InputOTP.Group>
									{#each cells.slice(3, 6) as cell, index (index)}
										<InputOTP.Slot {cell} aria-invalid={sample.invalid || undefined} />
									{/each}
								</InputOTP.Group>
							{:else}
								<InputOTP.Group>
									{#each cells as cell, index (index)}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
							{/if}
						{/snippet}
					</InputOTP.Root>
				</div>
				<Field.Description id={`${inputId}-description`}>
					验证码已发送至你的手机，请输入六位数字。当前值：{states[pane][sample.key] || "未输入"}。
				</Field.Description>
				{#if sample.invalid}
					<Field.Error id={`${inputId}-error`}>验证码已过期，请获取新的验证码。</Field.Error>
				{/if}
			</Field.Field>
		{/each}
	</div>
{/snippet}

<ComponentTuner spec={INPUT_OTP_SPEC} {canvas} {probe}>{@render children()}</ComponentTuner>
