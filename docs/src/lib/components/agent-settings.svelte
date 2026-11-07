<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import KeyRoundIcon from "@lucide/svelte/icons/key-round";
	import ListIcon from "@lucide/svelte/icons/list";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
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

<Field.Group>
	<Field.Field>
		<Field.Label for="agent-base-url">Base URL</Field.Label>
		<Input
			id="agent-base-url"
			bind:value={agentSettings.baseURL}
			placeholder="https://api.openai.com/v1"
		/>
		<Field.Description>
			兼容 OpenAI 接口的服务地址。需使用 https；本机模型可填 http://localhost。
		</Field.Description>
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
		<Field.Description>
			自动：OpenAI 官方地址用 Responses，其他用 Chat
			Completions。如果用中转地址并出现「工具与思考不能同用」之类的报错，选 Responses。
		</Field.Description>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			aria-label="接口类型"
			bind:value={
				() => agentSettings.apiMode,
				(value) => (agentSettings.apiMode = (value || "auto") as ApiMode)
			}
		>
			{#each API_MODES as mode (mode.value)}
				<ToggleGroup.Item value={mode.value}>{mode.label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</Field.Set>

	<Field.Set>
		<Field.Legend variant="label">思考强度</Field.Legend>
		<Field.Description
			>仅对支持推理的模型生效；选「默认」则不向服务传这个参数，「关闭」会明确要求不思考。</Field.Description
		>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			aria-label="思考强度"
			bind:value={
				() => agentSettings.effort,
				(value) => (agentSettings.effort = (value || "default") as Effort)
			}
		>
			{#each EFFORTS as effort (effort.value)}
				<ToggleGroup.Item value={effort.value}>{effort.label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</Field.Set>

	<Alert.Root role="status">
		<Alert.Title>Key 只保存在这个浏览器里</Alert.Title>
		<Alert.Description>
			每次提问时由本站服务转发给上面的地址，服务器不会保存。在公共电脑上用完请点「清除设置」。
		</Alert.Description>
	</Alert.Root>

	<Field.Field orientation="horizontal">
		<Button variant="outline" onclick={clearAgentSettings}>清除设置</Button>
		<Button onclick={onDone}><CheckIcon /> 完成</Button>
	</Field.Field>
</Field.Group>
