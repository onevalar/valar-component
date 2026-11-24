<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import LayoutTemplateIcon from "@lucide/svelte/icons/layout-template";
	import ListChecksIcon from "@lucide/svelte/icons/list-checks";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import { EFFORTS, type Effort } from "$lib/agent/settings.js";
	import { agentSettings } from "$lib/agent/settings.svelte.js";

	/**
	 * The assistant's message box styled after Linear Agent's composer:
	 * a 12px-radius elevated panel with 15px/24px text, whisper-light borderless capsule controls on
	 * the bottom left, and paired 24px circular `+` and send buttons on the bottom right.
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
		onSend: (text: string, onDispatched?: () => void) => void;
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
	const configuredModel = $derived(
		agentSettings.apiKey.trim() && agentSettings.model.trim() ? agentSettings.model.trim() : ""
	);
	const effort = $derived(
		EFFORTS.find((item) => item.value === agentSettings.effort) ?? EFFORTS[0]
	);

	const QUICK_ACTIONS = [
		{ label: "盘点组件库现状", prompt: "目前组件库整体情况怎么样？", kind: "overview" },
		{ label: "生成登录表单界面", prompt: "设计一个登录表单，让我看看效果", kind: "layout" },
		{ label: "生成新建任务表单", prompt: "帮我搭一个新建任务的表单", kind: "layout" },
		{ label: "生成设置面板界面", prompt: "给设置页拼一组开关和单选", kind: "list" },
	] as const;

	$effect(() => {
		if (autofocus) field?.focus();
	});

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!canSend) return;
		onSend(text, () => {
			text = "";
		});
	}
</script>

<form bind:this={form} {onsubmit}>
	<InputGroup.Root appearance="composer">
		<InputGroup.Textarea
			bind:ref={field}
			bind:value={text}
			{placeholder}
			aria-label="向助手提问"
			rows={large ? 2 : 1}
			onkeydown={(event) => {
				if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
					event.preventDefault();
					form?.requestSubmit();
				}
			}}
			class={large ? "min-h-[72px]" : "min-h-[52px]"}
		/>
		<InputGroup.Addon align="block-end">
			<div class="flex min-w-0 flex-wrap items-center gap-1">
				<InputGroup.Button
					size="xs"
					shape="pill"
					variant="ghost"
					class="h-6 rounded-full px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
					aria-label={configuredModel
						? `当前模型：${configuredModel}，点击修改模型配置`
						: "模型配置"}
					onclick={onSettings}
				>
					{configuredModel || "模型配置"}
					<ChevronDownIcon class="size-3 opacity-60" />
				</InputGroup.Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<InputGroup.Button
								{...props}
								size="xs"
								shape="pill"
								variant="ghost"
								class="h-6 rounded-full px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
								aria-label={`思考强度：${effort.label}`}
							>
								<span>思考 · {effort.label}</span>
								<ChevronDownIcon class="size-3 opacity-60" />
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
			</div>

			<div class="ml-auto flex items-center gap-2">
				<DropdownMenu.Root>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: tipProps })}
								<DropdownMenu.Trigger>
									{#snippet child({ props: menuProps })}
										<InputGroup.Button
											{...tipProps}
											{...menuProps}
											type="button"
											size="icon-xs"
											shape="pill"
											variant="ghost"
											class="size-6 rounded-full p-0 text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:size-3.5"
											aria-label="插入快捷指令"
										>
											<PlusIcon />
										</InputGroup.Button>
									{/snippet}
								</DropdownMenu.Trigger>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top">快捷指令与模型接入</Tooltip.Content>
					</Tooltip.Root>
					<DropdownMenu.Content align="end" side="top" class="w-52">
						<DropdownMenu.Label>快捷组件指令</DropdownMenu.Label>
						{#each QUICK_ACTIONS as action (action.prompt)}
							<DropdownMenu.Item onSelect={() => !busy && onSend(action.prompt)}>
								{#if action.kind === "overview"}
									<SparklesIcon />
								{:else if action.kind === "list"}
									<ListChecksIcon />
								{:else}
									<LayoutTemplateIcon />
								{/if}
								{action.label}
							</DropdownMenu.Item>
						{/each}
						<DropdownMenu.Separator />
						<DropdownMenu.Item onSelect={onSettings}>
							<SlidersHorizontalIcon />
							模型配置…
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				{#if busy}
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<InputGroup.Button
									{...props}
									type="button"
									size="icon-xs"
									shape="pill"
									variant="default"
									class="size-6 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90"
									aria-label="停止"
									onclick={onStop}
								>
									<span class="size-2 rounded-[1.5px] bg-current" aria-hidden="true"></span>
								</InputGroup.Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top">停止回复</Tooltip.Content>
					</Tooltip.Root>
				{:else}
					<InputGroup.Button
						type="submit"
						size="icon-xs"
						shape="pill"
						variant="default"
						class="size-6 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 [&_svg]:size-3.5"
						disabled={!canSend}
						aria-label="发送"
					>
						<ArrowUpIcon />
					</InputGroup.Button>
				{/if}
			</div>
		</InputGroup.Addon>
	</InputGroup.Root>
</form>
