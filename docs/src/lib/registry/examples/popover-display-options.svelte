<script lang="ts">
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";

	const groups = [
		{ value: "none", label: "No grouping" },
		{ value: "lead", label: "Lead" },
		{ value: "status", label: "Status" },
		{ value: "team", label: "Team" },
	] as const;
	const id = $props.id();
	let grouping = $state("none");
	let showProjects = $state(true);
	let showWeekNumbers = $state(false);
	const groupingLabel = $derived(groups.find((group) => group.value === grouping)?.label);
	const changed = $derived(grouping !== "none" || !showProjects || showWeekNumbers);
	const row = "flex min-h-8 items-center justify-between gap-2";

	function reset() {
		grouping = "none";
		showProjects = true;
		showWeekNumbers = false;
	}
</script>

<div class="grid max-w-full justify-items-end gap-2">
	<Popover.Root>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="sm">Display options</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content appearance="options" align="end" role="dialog" aria-labelledby={id + "-title"}>
			<div class="grid shrink-0 px-4 py-2">
				<Popover.Title id={id + "-title"} class="mb-1">Display options</Popover.Title>
				<div class={row}>
					<span id={id + "-grouping"}>Grouping</span>
					<Select.Root type="single" bind:value={grouping}>
						<Select.Trigger size="sm" aria-labelledby={id + "-grouping"} class="h-6!">
							{groupingLabel}
						</Select.Trigger>
						<Select.Content align="end">
							{#each groups as { value, label } (value)}
								<Select.Item {value} {label}>{label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<Separator />
			<div class="grid shrink-0 px-4 py-2">
				<p class="mb-1 font-medium">Timeline options</p>
				<label class={row} for={id + "-projects"}>
					Show project list
					<Checkbox id={id + "-projects"} bind:checked={showProjects} />
				</label>
				<label class={row} for={id + "-weeks"}>
					Show week numbers
					<Checkbox id={id + "-weeks"} bind:checked={showWeekNumbers} />
				</label>
			</div>
			<Separator />
			<div class="flex shrink-0 flex-wrap justify-between gap-2 px-4 py-2">
				<Button variant="ghost" size="sm" disabled={!changed} onclick={reset}>Reset</Button>
				<Popover.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">Done</Button>
					{/snippet}
				</Popover.Close>
			</div>
		</Popover.Content>
	</Popover.Root>
	<output class="text-right text-xs text-muted-foreground">
		{groupingLabel} · {showProjects ? "Project list shown" : "Project list hidden"} ·
		{showWeekNumbers ? "Week numbers shown" : "Week numbers hidden"}
	</output>
</div>
