<script lang="ts" module>
	import { z } from "zod";
	const schema = z.object({
		username: z
			.string()
			.min(2, "请填写至少两个字符的联系人姓名。")
			.max(50, "姓名不能超过 50 个字符。"),
		note: z.string().max(100, "备注不能超过 100 个字符。").optional(),
	});
</script>

<script lang="ts">
	import { defaults, superForm } from "sveltekit-superforms";
	import { zod4 } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/registry/ui/form/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { FORM_SPEC } from "./form-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	const initial = () => ({ count: 0, message: "尚未提交。", data: "" });
	let results = $state({ current: initial(), before: initial() });
	function createForm(pane: Pane) {
		return superForm(defaults({ username: "", note: "" }, zod4(schema)), {
			id: `${id}-${pane}`,
			validators: zod4(schema),
			SPA: true,
			resetForm: false,
			onUpdate: ({ form }) => {
				results[pane].message = form.valid
					? "本地校验通过，未发送网络请求。"
					: "请修正字段错误后重试。";
				if (form.valid) {
					results[pane].count++;
					results[pane].data = JSON.stringify(form.data, null, 2);
				}
			},
		});
	}
	// Each pane owns a real, independent Superforms store and enhance action.
	const forms = { current: createForm("current"), before: createForm("before") };
	const currentData = forms.current.form;
	const beforeData = forms.before.form;
	const currentSubmitting = forms.current.submitting;
	const beforeSubmitting = forms.before.submitting;
	function reset(pane: Pane) {
		forms[pane].reset();
		results[pane] = initial();
	}
</script>

{#snippet canvas(pane: Pane)}
	{@const form = forms[pane]}
	{@const enhance = form.enhance}
	<section
		class="grid min-w-0 gap-6 p-4 md:p-6"
		aria-label={`${pane === "current" ? "草稿" : "对照"}本地表单`}
	>
		<p class="text-xs text-muted-foreground">
			真实 Formsnap + Superforms 客户端表单：姓名必填，提交后显示 schema
			错误；重置清除值与错误。两侧 store 独立，SPA 模式不发送请求。字号与标签间距保持只读。
		</p>
		<form
			method="POST"
			novalidate
			class="grid min-w-0 gap-6"
			use:enhance
			onreset={(event) => {
				event.preventDefault();
				reset(pane);
			}}
		>
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>联系人姓名（必填）</Form.Label>
						<Input
							{...props}
							bind:value={
								() => (pane === "current" ? $currentData.username : $beforeData.username),
								(value) => {
									if (pane === "current") $currentData.username = value;
									else $beforeData.username = value;
								}
							}
							autocomplete="name"
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>至少两个字符；标签、说明与错误均由 Formsnap 自动关联。</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="note">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>补充备注：包含较长标签时，仍保持说明与控件的独立垂直节奏（可选）</Form.Label
						>
						<Input
							{...props}
							bind:value={
								() => (pane === "current" ? $currentData.note : $beforeData.note),
								(value) => {
									if (pane === "current") $currentData.note = value;
									else $beforeData.note = value;
								}
							}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>备注可以留空；此处只预览表单项内部间距，不改变校验规则。</Form.Description
				>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-wrap gap-2">
				<Form.Button disabled={pane === "current" ? $currentSubmitting : $beforeSubmitting}
					>本地校验并提交</Form.Button
				>
				<Button type="reset" variant="outline">重置表单</Button>
			</div>
		</form>
		<p role="status" class="text-sm text-muted-foreground">
			{results[pane].message} 成功提交 {results[pane].count} 次。
		</p>
		{#if results[pane].data}
			<pre class="min-w-0 rounded-md border p-3 text-xs break-words whitespace-pre-wrap">{results[
					pane
				].data}</pre>
		{/if}
	</section>
{/snippet}

<ComponentTuner spec={FORM_SPEC} {canvas}>{@render children()}</ComponentTuner>
