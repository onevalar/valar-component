<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import KeyRoundIcon from "@lucide/svelte/icons/key-round";
	import ListIcon from "@lucide/svelte/icons/list";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import { API_MODES, EFFORTS, type ApiMode, type Effort } from "$lib/agent/settings.js";
	import {
		agentSettings,
		clearAgentSettings,
		saveAgentSettings,
	} from "$lib/agent/settings.svelte.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	let { onDone }: { onDone: () => void } = $props();

	let models = $state<string[]>([]);
	let loading = $state(false);
	let modelsError = $state("");

	// Every change is kept right away; there is no separate save step to forget.
	$effect(() => {
		agentSettings.baseURL;
		agentSettings.apiKey;
		agentSettings.model;
		agentSettings.effort;
		agentSettings.apiMode;
		saveAgentSettings();
	});

	async function loadModels() {
		loading = true;
		modelsError = "";
		try {
			const response = await fetch("/api/agent/models", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify($state.snapshot(agentSettings)),
			});
			const json = await response.json();
			if (!response.ok) throw new Error(json.error);
			models = json.models;
			if (!models.length) modelsError = "服务没有返回可选模型，请直接填写模型名。";
		} catch (error) {
			modelsError = (error as Error).message;
		} finally {
			loading = false;
		}
	}
</script>

<Field.Group class="gap-4">
	<Field.Field>
		<Field.Label for="agent-base-url">Base URL</Field.Label>
		<Input
			id="agent-base-url"
			bind:value={agentSettings.baseURL}
			placeholder="https://api.openai.com/v1"
		/>
	</Field.Field>

	<Field.Field>
		<Field.Label for="agent-api-key">API Key</Field.Label>
		<InputGroup.Root>
			<InputGroup.Addon><KeyRoundIcon /></InputGroup.Addon>
			<InputGroup.Input
				id="agent-api-key"
				type="password"
				autocomplete="off"
				bind:value={agentSettings.apiKey}
				placeholder="sk-…"
			/>
		</InputGroup.Root>
	</Field.Field>

	<Field.Field>
		<Field.Label for="agent-model">模型</Field.Label>
		<InputGroup.Root>
			<InputGroup.Input
				id="agent-model"
				bind:value={agentSettings.model}
				placeholder="如 gpt-5 或 deepseek-chat"
			/>
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button
					size="xs"
					onclick={loadModels}
					disabled={loading || !agentSettings.apiKey}
				>
					<ListIcon /> 获取列表
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
		{#if models.length}
			<Select.Root
				type="single"
				items={models.map((m) => ({ value: m, label: m }))}
				bind:value={agentSettings.model}
			>
				<Select.Trigger id="agent-model-list" aria-label="从列表选择模型">
					<Select.Value placeholder="从列表选择（共 {models.length} 个）" />
				</Select.Trigger>
				<Select.Content>
					{#each models as model (model)}
						<Select.Item value={model} label={model}>{model}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/if}
		{#if modelsError}
			<Field.Error>{modelsError}</Field.Error>
		{/if}
	</Field.Field>

	<Field.Set>
		<Field.Legend variant="label">接口类型</Field.Legend>
		<Tabs.Root
			bind:value={
				() => agentSettings.apiMode,
				(value) => (agentSettings.apiMode = (value || "auto") as ApiMode)
			}
		>
			<Tabs.List aria-label="接口类型" class="w-full sm:w-fit">
				{#each API_MODES as mode (mode.value)}
					<Tabs.Trigger value={mode.value} class="px-3">{mode.label}</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	</Field.Set>

	<Field.Set>
		<Field.Legend variant="label">思考强度</Field.Legend>
		<Tabs.Root
			bind:value={
				() => agentSettings.effort,
				(value) => (agentSettings.effort = (value || "default") as Effort)
			}
		>
			<Tabs.List aria-label="思考强度" class="w-full sm:w-fit">
				{#each EFFORTS as effort (effort.value)}
					<Tabs.Trigger value={effort.value} class="px-3">{effort.label}</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	</Field.Set>

	<div class="flex items-center justify-between gap-2 pt-1">
		<Button variant="outline" size="sm" onclick={clearAgentSettings}>清除设置</Button>
		<Button size="sm" onclick={onDone}><CheckIcon /> 完成</Button>
	</div>
</Field.Group>
