<script lang="ts">
	import { tick } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Questionnaire from "$lib/registry/ui/questionnaire/index.js";

	const choices = [
		{ value: "summary", label: "Summary" },
		{ value: "checklist", label: "Checklist" },
		{ value: "timeline", label: "Timeline" },
		{ value: "none", label: "Do nothing" },
	] as const;
	const items = [{ name: "details" }] as const;
	let question = $state<HTMLFieldSetElement | null>(null);
	let composer = $state<HTMLInputElement | null>(null);
	let result = $state<HTMLOutputElement | null>(null);
	let answer = $state<string>();
	let preview = $state<string>();

	async function openComposer() {
		await tick();
		composer?.focus();
	}

	async function finish(event: SubmitEvent) {
		event.preventDefault();
		const details = new FormData(event.currentTarget as HTMLFormElement).get("details");
		const format = choices.find((choice) => choice.value === answer)?.label;
		preview = details ? `${format} · ${details}` : format;
		await tick();
		result?.focus();
	}

	async function reset() {
		answer = undefined;
		preview = undefined;
		await tick();
		question?.querySelector("button")?.focus();
	}
</script>

<Questionnaire.Root
	appearance="agent"
	aria-label="Agent questionnaire preview"
	class="max-w-md"
	{items}
	onSubmit={finish}
	onReset={reset}
>
	<Questionnaire.AgentQuestion
		bind:ref={question}
		bind:answer
		question="Which report format would you like?"
		required
		requiredLabel="Required"
		{choices}
		onAnswer={openComposer}
	/>
	<div hidden={!answer || preview !== undefined}>
		<Questionnaire.Item name="details">
			<Questionnaire.Title class="mb-0! px-2.5 text-[15px] font-[450]">
				Anything else to add?
			</Questionnaire.Title>
			<div class="px-2.5">
				<Questionnaire.Input
					bind:ref={composer}
					aria-label="Additional instructions"
					placeholder="Add optional instructions…"
				/>
			</div>
			<Questionnaire.Actions class="px-2.5">
				<Questionnaire.Skip size="sm">Skip</Questionnaire.Skip>
				<Questionnaire.Submit size="sm">Send answer</Questionnaire.Submit>
			</Questionnaire.Actions>
		</Questionnaire.Item>
	</div>
	{#if preview !== undefined}
		<div class="flex flex-wrap items-center justify-between gap-2 px-2.5">
			<output bind:this={result} tabindex="-1" class="text-sm outline-none">{preview}</output>
			<Button size="sm" variant="outline" type="reset">Restart preview</Button>
		</div>
	{/if}
</Questionnaire.Root>
