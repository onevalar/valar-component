<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { ColorPicker } from "$lib/registry/ui/color-picker/index.js";
	import type { ColorPickerProps } from "$lib/registry/ui/color-picker/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { COLOR_PICKER_SPEC } from "./color-picker-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	type Pane = "current" | "before";
	const id = $props.id();
	const presets = ["#000000", "#ffffff", "#1e40af", "#abcdef", "#aabbcc"];
	// Real ColorPicker/Popover, inline only in the editor, matching the Popover tuner pattern.
	const contentProps: ColorPickerProps["contentProps"] = {
		portalProps: { disabled: true },
		avoidCollisions: false,
		trapFocus: false,
		interactOutsideBehavior: "ignore",
		onOpenAutoFocus: (event) => event.preventDefault(),
	};
	let states = $state({
		current: { value: "#1e40af", events: 0, feedback: "尚未提交" },
		before: { value: "#1e40af", events: 0, feedback: "尚未提交" },
	});
	function submit(event: SubmitEvent, pane: Pane) {
		event.preventDefault();
		states[pane].feedback = JSON.stringify(
			Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement))
		);
	}
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-5 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			打开真实取色器，试输入 #abc 后回车、完整六位、未完成的 #1e 或无效字符。
			只调整自有布局；原生颜色窗口由浏览器管理，不预览它的外观，也不改主题 token。
		</p>
		<form class="grid min-w-0 gap-4" onsubmit={(event) => submit(event, pane)}>
			<div class="color-picker-stage min-h-[420px] min-w-0">
				<ColorPicker
					id={`${id}-${pane}-color`}
					label="演示颜色"
					name="color"
					bind:value={states[pane].value}
					onValueChange={() => states[pane].events++}
					{presets}
					{contentProps}
				/>
			</div>
			<ColorPicker
				id={`${id}-${pane}-disabled`}
				label="禁用颜色（不提交）"
				name="disabled-color"
				value="#aabbcc"
				disabled
				{contentProps}
			/>
			<div class="flex flex-wrap gap-2">
				<Button type="submit">查看颜色提交值</Button>
				<Button type="button" variant="outline" onclick={() => (states[pane].value = "#abcdef")}
					>外部更新为 #abcdef</Button
				>
			</div>
			<p role="status" class="text-sm text-muted-foreground">
				当前值：{states[pane].value}；变更事件：{states[pane].events}（重复选同色不会增加）
			</p>
			<output aria-live="polite" class="min-w-0 text-sm break-words text-muted-foreground"
				>{states[pane].feedback}</output
			>
		</form>
	</div>
{/snippet}

<ComponentTuner spec={COLOR_PICKER_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	/* Keep both live panels in their own pane, even when comparison stacks vertically. */
	.color-picker-stage :global([data-bits-floating-content-wrapper]) {
		position: relative !important;
		transform: none !important;
		max-width: 100%;
	}
	.color-picker-stage :global([data-slot="color-picker-content"]) {
		max-width: 100%;
	}
</style>
