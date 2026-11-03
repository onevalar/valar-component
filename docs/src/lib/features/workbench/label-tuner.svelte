<script lang="ts">
	import MailIcon from "@lucide/svelte/icons/mail";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { LABEL_SPEC } from "./label-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	let states = $state({
		current: { email: "", checked: false },
		before: { email: "", checked: false },
	});
</script>

{#snippet canvas(pane: Pane)}
	<section
		class="grid min-w-0 gap-6 p-4 md:p-6"
		aria-label={`${pane === "current" ? "草稿" : "对照"}标签示例`}
	>
		<p class="text-xs text-muted-foreground">
			点击标签可聚焦或切换控件；只调整图文间距，不改全局字号或控件尺寸。两侧输入状态独立。Field.Label
			自带的间距优先。
		</p>
		<div class="grid min-w-0 gap-3">
			<Label for={`${id}-${pane}-email`}
				><MailIcon class="size-4 shrink-0" aria-hidden="true" /><span>电子邮箱（必填）</span></Label
			>
			<Input id={`${id}-${pane}-email`} type="email" required bind:value={states[pane].email} />
		</div>
		<div class="grid min-w-0 gap-3">
			<Checkbox id={`${id}-${pane}-updates`} bind:checked={states[pane].checked} />
			<Label for={`${id}-${pane}-updates`}
				><MailIcon class="size-4 shrink-0" aria-hidden="true" /><span class="leading-normal"
					>接收产品更新，以及包含多行长标签的版本变更、设计规范和无障碍改进通知</span
				></Label
			>
		</div>
		<div class="group grid min-w-0 gap-3" data-disabled="true">
			<Checkbox id={`${id}-${pane}-disabled`} disabled checked />
			<Label for={`${id}-${pane}-disabled`}
				><MailIcon class="size-4 shrink-0" aria-hidden="true" /><span>组织通知（已禁用）</span
				></Label
			>
		</div>
		<div class="grid min-w-0 gap-3">
			<Label for={`${id}-${pane}-error`}
				><MailIcon class="size-4 shrink-0" aria-hidden="true" /><span>备用邮箱（错误状态示例）</span
				></Label
			>
			<Input
				id={`${id}-${pane}-error`}
				value="invalid-email"
				aria-invalid="true"
				aria-describedby={`${id}-${pane}-error-description`}
			/>
			<p id={`${id}-${pane}-error-description`} class="text-sm text-destructive">
				邮箱格式有误；此处仅展示关联的错误提示。
			</p>
		</div>
	</section>
{/snippet}

<ComponentTuner spec={LABEL_SPEC} {canvas}>{@render children()}</ComponentTuner>
