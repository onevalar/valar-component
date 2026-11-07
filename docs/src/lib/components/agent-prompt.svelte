<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import SquareIcon from "@lucide/svelte/icons/square";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import { EFFORTS, type Effort } from "$lib/agent/settings.js";
	import { agentSettings } from "$lib/agent/settings.svelte.js";

	/**
	 * The assistant's message box, built the way the library's prompt input is: one input group
	 * with a multi-line field, the model and effort pickers in the bottom row, and a send button
	 * that becomes a stop button while an answer is coming.
	 */
	let {
		busy,
		onSend,
		onStop,
		onSettings,
		placeholder = "问组件怎么选，或让我拼一个界面…",
		autofocus = false,
		large = false,
	}: {
		busy: boolean;
		onSend: (text: string) => void;
		onStop: () => void;
		onSettings: () => void;
		placeholder?: string;
		autofocus?: boolean;
		large?: boolean;
	} = $props();

	let text = $state("");
	let form = $state<HTMLFormElement | null>(null);
	let field = $state<HTMLTextAreaElement | null>(null);

	const canSend = $derived(text.trim().length > 0 && !busy);
	const effort = $derived(
		EFFORTS.find((item) => item.value === agentSettings.effort) ?? EFFORTS[0]
	);

	$effect(() => {
		if (autofocus) field?.focus();
	});

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!canSend) return;
		onSend(text);
		text = "";
	}
</script>

<form bind:this={form} {onsubmit}>
	<InputGroup.Root>
		<InputGroup.Textarea
			bind:ref={field}
			bind:value={text}
			{placeholder}
			aria-label="向助手提问"
			onkeydown={(event) => {
				if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
					event.preventDefault();
					form?.requestSubmit();
				}
			}}
			class={large ? "min-h-24 p-4 text-base" : "p-3"}
		/>
		<InputGroup.Addon align="block-end">
			<InputGroup.Button
				size="sm"
				variant="outline"
				aria-label={`模型：${agentSettings.model || "未选择"}，点击设置`}
				onclick={onSettings}
			>
				{agentSettings.model || "选择模型"}
			</InputGroup.Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<InputGroup.Button
							{...props}
							size="sm"
							variant="outline"
							aria-label={`思考强度：${effort.label}`}
						>
							<span class="text-muted-foreground">思考</span>
							{effort.label}
							<ChevronDownIcon />
						</InputGroup.Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start" class="w-36">
					<DropdownMenu.Group>
						<DropdownMenu.Label>思考强度</DropdownMenu.Label>
						<DropdownMenu.RadioGroup
							bind:value={
								() => agentSettings.effort, (value) => (agentSettings.effort = value as Effort)
							}
						>
							{#each EFFORTS as item (item.value)}
								<DropdownMenu.RadioItem value={item.value} closeOnSelect
									>{item.label}</DropdownMenu.RadioItem
								>
							{/each}
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			{#if busy}
				<InputGroup.Button
					type="button"
					size="icon-sm"
					variant="default"
					class="ml-auto"
					aria-label="停止"
					onclick={onStop}
				>
					<SquareIcon />
				</InputGroup.Button>
			{:else}
				<InputGroup.Button
					type="submit"
					size="icon-sm"
					variant="default"
					class="ml-auto"
					disabled={!canSend}
					aria-label="发送"
				>
					<ArrowUpIcon />
				</InputGroup.Button>
			{/if}
		</InputGroup.Addon>
	</InputGroup.Root>
</form>
