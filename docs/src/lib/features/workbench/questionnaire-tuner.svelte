<script lang="ts">
	import * as Questionnaire from "$lib/registry/ui/questionnaire/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { QUESTIONNAIRE_SPEC } from "./questionnaire-tuning.js";
	import type { QuestionnaireItemStatus } from "@valar/svelte-primitives/questionnaire";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	const label = (pane: Pane) => (pane === "current" ? "草稿" : "对照");
	const defaultNote = "保留现有公开接口。";
	const items = [
		{
			name: "direction",
			required: true,
			choices: [
				{ value: "tool-calls" },
				{ value: "approvals" },
				{ value: "handoffs", disabled: true },
			],
		},
		{
			name: "signals",
			required: true,
			choices: [{ value: "progress" }, { value: "decisions" }, { value: "risks" }],
		},
		{ name: "notes" },
	] as const;
	const initialResult = () => ({
		count: 0,
		entries: [] as { name: string; value: string }[],
		noteStatus: "answered" as QuestionnaireItemStatus,
	});
	let results = $state({ current: initialResult(), before: initialResult() });
	let forms = $state<Record<Pane, HTMLFormElement | null>>({ current: null, before: null });
	function resetResult(pane: Pane) {
		results[pane] = initialResult();
	}
	// Stable attachments clear host-only feedback on mount, not on tuning CSS changes.
	// The primitive owns both the current item and every answer; neither outlives its form.
	const mounts = {
		current: () => resetResult("current"),
		before: () => resetResult("before"),
	};
	function submit(pane: Pane, event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget as HTMLFormElement);
		results[pane].entries = Array.from(formData, ([name, value]) => ({
			name,
			value: String(value),
		}));
		results[pane].count++;
	}
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-6 p-4 md:p-6" {@attach mounts[pane]}>
		<p class="text-xs text-muted-foreground">
			本地三题：必答单选、必答多选和可跳过的备注。仅展示原生 FormData，不发送请求。
			两侧独立；退出比较再进入时，对照侧是新问卷。调整几何或明暗不会重建草稿问卷。 参数按 4px
			间距基准标注，实际留白跟随样式的 spacing。
		</p>
		<Questionnaire.Root
			id={`${id}-${pane}-form`}
			bind:ref={forms[pane]}
			aria-label={`${label(pane)}本地问卷`}
			{items}
			defaultItem="direction"
			shortcuts="letters"
			onReset={() => resetResult(pane)}
			onSubmit={(event) => submit(pane, event)}
		>
			<Questionnaire.Progress aria-label={`${label(pane)}问卷进度`} />
			<Questionnaire.Item name="direction" required>
				<Questionnaire.Title>下一步优先完善什么？</Questionnaire.Title>
				<Questionnaire.Description>
					请选择一个方向，也可填写其他方向；未回答时点击下一步会显示错误并聚焦答案。
				</Questionnaire.Description>
				<Questionnaire.Choices>
					<Questionnaire.Choice value="tool-calls">
						<span class="font-medium">工具调用时间线</span>
						<Questionnaire.ChoiceDescription>
							展示任务执行顺序、调用结果和较长说明，检查窄画布中的选项换行。
						</Questionnaire.ChoiceDescription>
					</Questionnaire.Choice>
					<Questionnaire.Choice value="approvals">敏感操作确认</Questionnaire.Choice>
					<Questionnaire.Choice value="handoffs" disabled
						>子任务交接（暂未启用）</Questionnaire.Choice
					>
					<Questionnaire.Input
						aria-label={`${label(pane)}问卷的其他完善方向`}
						placeholder="填写其他方向"
					/>
				</Questionnaire.Choices>
				<Questionnaire.Error />
			</Questionnaire.Item>
			<Questionnaire.Item name="signals" multiple required>
				<Questionnaire.Title>进度更新应包含哪些信息？</Questionnaire.Title>
				<Questionnaire.Description>
					至少选择或填写一项。可同时选择多项，提交结果会保留同名字段的所有值。
				</Questionnaire.Description>
				<Questionnaire.Choices>
					<Questionnaire.Choice value="progress">当前进度</Questionnaire.Choice>
					<Questionnaire.Choice value="decisions">已做决定</Questionnaire.Choice>
					<Questionnaire.Choice value="risks">风险与阻碍</Questionnaire.Choice>
					<Questionnaire.Input
						aria-label={`${label(pane)}问卷的其他进度信息`}
						placeholder="补充其他信息"
					/>
				</Questionnaire.Choices>
				<Questionnaire.Error />
			</Questionnaire.Item>
			<Questionnaire.Item
				name="notes"
				onStatusChange={(status) => (results[pane].noteStatus = status)}
			>
				<Questionnaire.Title>还有什么需要注意？</Questionnaire.Title>
				<Questionnaire.Description>
					这题可以明确跳过。清空后直接提交仍会校验；跳过会提交前两题，结果中不包含备注字段。
				</Questionnaire.Description>
				<Questionnaire.Input
					aria-label={`${label(pane)}问卷的补充备注`}
					defaultValue={defaultNote}
					placeholder="填写备注，或跳过此题"
				/>
				<Questionnaire.Error />
			</Questionnaire.Item>
			<Questionnaire.Actions>
				<Questionnaire.Previous aria-label={`${label(pane)}问卷：上一步`}>
					上一步
				</Questionnaire.Previous>
				<Questionnaire.Skip aria-label={`${label(pane)}问卷：跳过备注`}>跳过</Questionnaire.Skip>
				<Questionnaire.Next aria-label={`${label(pane)}问卷：下一步`}>下一步</Questionnaire.Next>
				<Questionnaire.Submit aria-label={`${label(pane)}问卷：提交答案`}>
					提交答案
				</Questionnaire.Submit>
			</Questionnaire.Actions>
		</Questionnaire.Root>
		<div class="flex flex-wrap gap-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				aria-label={`${label(pane)}问卷：恢复默认答案`}
				onclick={() => forms[pane]?.reset()}>恢复默认答案</Button
			>
		</div>
		<section class="grid min-w-0 gap-2" aria-label={`${label(pane)}本地提交结果`}>
			<p role="status" class="text-xs text-muted-foreground">
				本地提交 {results[pane].count} 次；备注状态：{results[pane].noteStatus === "skipped"
					? "已跳过"
					: results[pane].noteStatus === "answered"
						? "已回答"
						: "未回答"}。恢复默认答案会清除提交结果，并返回第一题、恢复预填备注。
			</p>
			{#if results[pane].count > 0}
				<pre
					class="min-w-0 rounded-md border p-3 text-xs break-words whitespace-pre-wrap">{JSON.stringify(
						results[pane].entries,
						null,
						2
					)}</pre>
			{/if}
		</section>
	</div>
{/snippet}

<ComponentTuner spec={QUESTIONNAIRE_SPEC} {canvas}>{@render children()}</ComponentTuner>
