<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";

	const providers = [
		{
			name: "OpenAI",
			models: [
				{ id: "gpt-5", name: "GPT-5" },
				{ id: "gpt-5-mini", name: "GPT-5 mini" },
			],
		},
		{
			name: "Anthropic",
			models: [
				{ id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
				{ id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
			],
		},
	];

	const models = providers.flatMap((provider) => provider.models);

	const efforts = [
		{ id: "low", name: "Low" },
		{ id: "medium", name: "Medium" },
		{ id: "high", name: "High" },
	];

	let text = $state("");
	let model = $state(models[0].id);
	let effort = $state(efforts[1].id);
	let form = $state<HTMLFormElement | null>(null);
	const currentModel = $derived(models.find((item) => item.id === model) ?? models[0]);
	const currentEffort = $derived(efforts.find((item) => item.id === effort) ?? efforts[1]);
	const canSend = $derived(text.trim().length > 0);

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!canSend) {
			return;
		}

		text = "";
	}
</script>

<div class="mx-auto w-full max-w-lg py-6">
	<form bind:this={form} {onsubmit}>
		<InputGroup.Root appearance="composer">
			<InputGroup.Textarea
				bind:value={text}
				placeholder="Ask the agent to change your code..."
				rows={2}
				onkeydown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						form?.requestSubmit();
					}
				}}
			/>
			<InputGroup.Addon align="block-end">
				<div class="flex min-w-0 flex-wrap items-center gap-1">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<InputGroup.Button
									{...props}
									size="xs"
									shape="pill"
									variant="ghost"
									aria-label="Model: {currentModel.name}"
									class="h-6 rounded-full px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
								>
									{currentModel.name}
									<ChevronDownIcon class="size-3 opacity-60" />
								</InputGroup.Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="start" class="w-48">
							<DropdownMenu.RadioGroup bind:value={model}>
								{#each providers as provider, index (provider.name)}
									{#if index > 0}
										<DropdownMenu.Separator />
									{/if}
									<DropdownMenu.Group>
										<DropdownMenu.Label>{provider.name}</DropdownMenu.Label>
										{#each provider.models as item (item.id)}
											<DropdownMenu.RadioItem value={item.id} closeOnSelect>
												{item.name}
											</DropdownMenu.RadioItem>
										{/each}
									</DropdownMenu.Group>
								{/each}
							</DropdownMenu.RadioGroup>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<InputGroup.Button
									{...props}
									size="xs"
									shape="pill"
									variant="ghost"
									aria-label="Effort: {currentEffort.name}"
									class="h-6 rounded-full px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
								>
									<span>Effort</span>
									{currentEffort.name}
									<ChevronDownIcon class="size-3 opacity-60" />
								</InputGroup.Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="start" class="w-36">
							<DropdownMenu.Group>
								<DropdownMenu.Label>Effort</DropdownMenu.Label>
								<DropdownMenu.RadioGroup bind:value={effort}>
									{#each efforts as item (item.id)}
										<DropdownMenu.RadioItem value={item.id} closeOnSelect>
											{item.name}
										</DropdownMenu.RadioItem>
									{/each}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<div class="ml-auto flex items-center gap-2">
					<InputGroup.Button
						type="button"
						size="icon-xs"
						shape="pill"
						variant="ghost"
						class="size-6 rounded-full p-0 text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:size-3.5"
						aria-label="Attach"
					>
						<PlusIcon />
					</InputGroup.Button>
					<InputGroup.Button
						type="submit"
						size="icon-xs"
						shape="pill"
						variant="default"
						class="size-6 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 [&_svg]:size-3.5"
						disabled={!canSend}
						aria-label="Send"
					>
						<ArrowUpIcon />
					</InputGroup.Button>
				</div>
			</InputGroup.Addon>
		</InputGroup.Root>
	</form>
</div>
