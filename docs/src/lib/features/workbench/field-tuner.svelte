<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { FIELD_SPEC } from "./field-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	const initial = () => ({ name: "", email: "not-an-email", checked: false, invalid: true });
	let states = $state({ current: initial(), before: initial() });
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			字段只负责布局；下方错误开关是演示状态，不是校验规则。标签可点击，输入与勾选在两侧独立保存，不发送请求。
			间距跟随全局 --spacing 缩放；直接嵌套字段组保留样式自带的 16 基准 px 间距。
		</p>
		<form
			aria-label={`${pane === "current" ? "草稿" : "对照"}字段示例`}
			onsubmit={(event) => event.preventDefault()}
			onreset={() => (states[pane] = initial())}
		>
			<Field.Set>
				<Field.Legend>联系方式</Field.Legend>
				<Field.Group>
					<Field.Field>
						<Field.Label for={`${id}-${pane}-name`}>联系人姓名（必填）</Field.Label>
						<Input
							id={`${id}-${pane}-name`}
							name="name"
							required
							bind:value={states[pane].name}
							aria-describedby={`${id}-${pane}-name-description`}
						/>
						<Field.Description id={`${id}-${pane}-name-description`}
							>填写真实姓名，便于我们称呼你。</Field.Description
						>
					</Field.Field>
					<Field.Field data-invalid={states[pane].invalid}>
						<Field.Label for={`${id}-${pane}-email`}>电子邮箱</Field.Label>
						<Input
							id={`${id}-${pane}-email`}
							name="email"
							type="email"
							bind:value={states[pane].email}
							aria-invalid={states[pane].invalid}
							aria-describedby={`${id}-${pane}-email-description${states[pane].invalid ? ` ${id}-${pane}-email-error` : ""}`}
						/>
						<Field.Description id={`${id}-${pane}-email-description`}
							>仅用来展示说明与错误的组合布局。</Field.Description
						>
						{#if states[pane].invalid}
							<Field.Error id={`${id}-${pane}-email-error`}
								>邮箱格式有误，请填写完整的电子邮箱地址。</Field.Error
							>
						{/if}
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Checkbox
							id={`${id}-${pane}-updates`}
							name="updates"
							bind:checked={states[pane].checked}
							aria-describedby={`${id}-${pane}-updates-description`}
						/>
						<Field.Content>
							<Field.Label for={`${id}-${pane}-updates`}
								>接收产品更新，以及包含多行文字的版本变更和无障碍改进通知</Field.Label
							>
							<Field.Description id={`${id}-${pane}-updates-description`}
								>横向字段的内容区保留独立间距；不会修改复选框或标签本身。</Field.Description
							>
						</Field.Content>
					</Field.Field>
					<Field.Group>
						<Field.Field data-disabled="true">
							<Field.Label for={`${id}-${pane}-disabled`}>组织名称（暂不可修改）</Field.Label>
							<Input id={`${id}-${pane}-disabled`} value="Valar" disabled />
						</Field.Field>
						<Field.Field orientation="horizontal" data-disabled="true">
							<Checkbox id={`${id}-${pane}-disabled-check`} checked disabled />
							<Field.Label for={`${id}-${pane}-disabled-check`}>组织通知（已禁用）</Field.Label>
						</Field.Field>
					</Field.Group>
				</Field.Group>
			</Field.Set>
			<div class="mt-6 flex flex-wrap gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (states[pane].invalid = !states[pane].invalid)}>切换错误示例</Button
				>
				<Button type="reset" variant="outline">重置字段示例</Button>
			</div>
		</form>
	</div>
{/snippet}

<ComponentTuner spec={FIELD_SPEC} {canvas}>{@render children()}</ComponentTuner>
