<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Stepper } from "$lib/registry/ui/stepper/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { STEPPER_SPEC } from "./stepper-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	const steps = [
		{ id: "prepare", title: "准备资料", description: "填写本地演示名称" },
		{ id: "verify", title: "校验配置", description: "首次失败，再次重试通过" },
		{ id: "done", title: "完成", description: "不发送请求" },
		{ id: "disabled", title: "未启用", disabled: true },
	];
	let states = $state({
		current: { value: "prepare", name: "", attempts: 0, vertical: false, rtl: false },
		before: { value: "prepare", name: "", attempts: 0, vertical: false, rtl: false },
	});
	function guard(pane: Pane) {
		return async (from: string, _to: string, signal: AbortSignal) => {
			if (from === "prepare") return states[pane].name.trim() ? true : "请填写演示名称再继续。";
			if (from !== "verify") return true;
			await new Promise<void>((resolve, reject) => {
				if (signal.aborted) {
					reject(new DOMException("已取消", "AbortError"));
					return;
				}
				const timer = setTimeout(() => {
					signal.removeEventListener("abort", abort);
					resolve();
				}, 1200);
				function abort() {
					clearTimeout(timer);
					reject(new DOMException("已取消", "AbortError"));
				}
				signal.addEventListener("abort", abort, { once: true });
			});
			states[pane].attempts++;
			return states[pane].attempts > 1 || "首次本地校验失败，请重试；等待时可返回上一步取消。";
		};
	}
	// Stable references: changing tuning CSS or pane controls must not replace the guard.
	const guards = { current: guard("current"), before: guard("before") };
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			本地流程：空名称会被门禁阻止，校验步骤首次失败、重试成功。等待时返回可取消，隐藏面板保持挂载、输入值保留。两侧完全独立，无网络请求。
		</p>
		<div class="flex flex-wrap gap-2">
			<Button
				size="sm"
				variant="outline"
				aria-pressed={states[pane].vertical}
				onclick={() => (states[pane].vertical = !states[pane].vertical)}>纵向步骤</Button
			>
			<Button
				size="sm"
				variant="outline"
				aria-pressed={states[pane].rtl}
				onclick={() => (states[pane].rtl = !states[pane].rtl)}>从右到左</Button
			>
		</div>
		<Stepper
			{steps}
			bind:value={states[pane].value}
			beforeChange={guards[pane]}
			orientation={states[pane].vertical ? "vertical" : "horizontal"}
			dir={states[pane].rtl ? "rtl" : "ltr"}
			aria-label={`${pane === "current" ? "草稿" : "对照"}本地配置流程`}
		>
			{#snippet children({ step, index, pending, next, previous })}
				<div class="grid min-w-0 gap-4 rounded-md border p-4">
					<h3 class="text-sm font-medium">{step.title}</h3>
					{#if step.id === "prepare"}
						<label for={`${id}-${pane}-name`} class="text-sm">演示名称</label>
						<Input
							id={`${id}-${pane}-name`}
							bind:value={states[pane].name}
							placeholder="例如：本地配置"
						/>
					{:else if step.id === "verify"}
						<p class="text-sm text-muted-foreground">
							名称：{states[pane].name}。下一步会等待1.2秒；返回可取消，不计入失败次数。
						</p>
					{:else if step.id === "done"}
						<p class="text-sm">{states[pane].name} 已在本地通过校验。</p>
					{/if}
					<p role="status" class="text-xs text-muted-foreground">
						{pending ? "正在本地校验，可返回取消…" : `已完成校验尝试：${states[pane].attempts}`}
					</p>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" disabled={index === 0} onclick={previous}
							>上一步／取消等待</Button
						>
						<Button disabled={pending || index >= 2} onclick={next}
							>{pending ? "校验中…" : "下一步／重试"}</Button
						>
					</div>
				</div>
			{/snippet}
		</Stepper>
	</div>
{/snippet}

<ComponentTuner spec={STEPPER_SPEC} {canvas}>{@render children()}</ComponentTuner>
