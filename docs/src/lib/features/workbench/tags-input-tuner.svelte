<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { TagsInput } from "$lib/registry/ui/tags-input/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TAGS_INPUT_SPEC } from "./tags-input-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const examples = [
		{
			key: "keywords",
			label: "中文与长标签",
			initial: ["中文输入法", "这是一个用于观察窄画布自然换行的长标签关键词"],
			help: "中文输入法组合输入后确认；用英文或全角逗号分隔，也可粘贴多个标签。空输入时按退格选中，再按退格删除。",
		},
		{
			key: "limited",
			label: "验证、重复与上限",
			initial: ["设计"],
			help: "每项至少两个字，最多三项，不能重复。试试添加“新”、再次添加“设计”，或添加至第四项；错误由组件自身显示。",
		},
		{
			key: "required",
			label: "必填标签",
			initial: [],
			help: "至少确认一个标签后才能提交；只输入但未添加不计为标签。",
		},
		{
			key: "readonly",
			label: "只读标签",
			initial: ["已审核", "不可修改"],
			help: "只读值保留提交，不能添加或删除。",
		},
		{
			key: "disabled",
			label: "禁用标签",
			initial: ["暂停编辑"],
			help: "禁用字段不能编辑，也不参与表单提交。",
		},
	];
	let values = $state({
		current: examples.map((example) => [...example.initial]),
		before: examples.map((example) => [...example.initial]),
	});
	let feedback = $state({ current: "尚未提交。", before: "尚未提交。" });
	function validateTag(tag: string) {
		return tag.length >= 2 || "请至少输入两个字。";
	}
	function submit(
		event: SubmitEvent & { currentTarget: HTMLFormElement },
		pane: "current" | "before"
	) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		feedback[pane] = `提交结果：${JSON.stringify(
			Object.fromEntries(examples.map((example) => [example.label, data.getAll(example.key)]))
		)}（禁用字段不提交）`;
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-3 md:p-6">
		<p class="text-xs text-muted-foreground">
			仅调整外层几何，不改变最小高度、标签内部样式或换行。输入法、回车、粘贴与键盘删除沿用真实组件；两侧画布独立编辑和提交。
		</p>
		<form
			class="grid min-w-0 gap-5"
			onsubmit={(event) => submit(event, pane)}
			onreset={() => (feedback[pane] = "尚未提交。")}
		>
			{#each examples as example, index (example.key)}
				{@const fieldId = `${id}-${pane}-${example.key}`}
				<Field.Field class="min-w-0" data-disabled={example.key === "disabled" || undefined}>
					<Field.Label for={fieldId}>{example.label}</Field.Label>
					<TagsInput
						id={fieldId}
						name={example.key}
						bind:value={values[pane][index]}
						delimiter={/[,，]/}
						max={example.key === "limited" ? 3 : 0}
						validate={example.key === "limited" ? validateTag : undefined}
						required={example.key === "required"}
						readonly={example.key === "readonly"}
						disabled={example.key === "disabled"}
						placeholder="输入后按回车或逗号添加"
						aria-describedby={`${fieldId}-help`}
					/>
					<Field.Description id={`${fieldId}-help`}>{example.help}</Field.Description>
				</Field.Field>
			{/each}
			<div class="flex min-w-0 flex-wrap gap-2">
				<Button type="submit">提交本画布表单</Button>
				<Button type="reset" variant="outline">重置演示标签</Button>
			</div>
			<output aria-live="polite" class="min-w-0 text-sm break-all text-muted-foreground"
				>{feedback[pane]}</output
			>
		</form>
	</div>
{/snippet}

<ComponentTuner spec={TAGS_INPUT_SPEC} {canvas}>{@render children()}</ComponentTuner>
