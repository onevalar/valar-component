<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLFieldsetAttributes } from "svelte/elements";

	export type QuestionnaireAgentQuestionProps = Omit<
		WithElementRef<HTMLFieldsetAttributes, HTMLFieldSetElement>,
		"children"
	> & {
		question: string;
		choices: readonly { value: string; label: string; disabled?: boolean }[];
		answer?: string;
		required?: boolean;
		requiredLabel?: string;
		onAnswer?: (value: string) => void;
	};
</script>

<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let {
		question,
		choices,
		answer = $bindable(),
		required = false,
		requiredLabel = "必选",
		onAnswer,
		disabled = false,
		ref = $bindable(null),
		class: className,
		...restProps
	}: QuestionnaireAgentQuestionProps = $props();
	const selectedChoice = $derived(choices.find((choice) => choice.value === answer));
	const visibleChoices = $derived(selectedChoice ? [selectedChoice] : choices);

	function select(value: string) {
		if (disabled || selectedChoice) return;
		answer = value;
		onAnswer?.(value);
	}
</script>

<fieldset
	bind:this={ref}
	data-slot="questionnaire-agent-question"
	data-answered={selectedChoice ? "" : undefined}
	class={cn("min-w-0 border-0 py-0.5", className)}
	{disabled}
	{...restProps}
>
	<legend
		class="max-w-full px-2.5 text-[15px]/[22px] font-[450] wrap-anywhere text-[color:lch(20%_1_282)] dark:text-[color:lch(90.826%_1.425_272)]"
	>
		{question}{#if required}
			{" "}<span class="text-muted-foreground">({requiredLabel})</span>
		{/if}
	</legend>

	<div data-slot="questionnaire-agent-choices" class="flex min-w-0 flex-wrap gap-1.5 px-2.5 py-0.5">
		{#each visibleChoices as choice (choice.value)}
			{@const selected = selectedChoice === choice}
			<Button
				variant="ghost"
				size="sm"
				shape="pill"
				data-slot="questionnaire-agent-choice"
				data-answered={selected ? "" : undefined}
				aria-pressed={selected}
				disabled={selected || choice.disabled}
				class={cn(
					"h-auto min-h-8 max-w-full gap-1.5 rounded-full border-[0.5px] border-transparent px-2.5 py-1 text-[13px]/[18px] font-medium whitespace-normal focus-visible:ring-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring",
					"bg-white text-[color:lch(20%_1_282)] shadow-[0_0_0_0.5px_rgb(0_0_0/.08)] enabled:hover:bg-[lch(95.883%_0.157_282)] dark:bg-[lch(13.861%_1.139_272)] dark:text-[color:lch(90.826%_1.425_272)] dark:shadow-[0_0_0_0.5px_rgb(255_255_255/.08)] dark:enabled:hover:bg-[lch(18.49%_1.525_272)]",
					"data-answered:bg-[lch(94.85%_0.5_282)] data-answered:opacity-100! dark:data-answered:bg-[lch(18.49%_1.525_272)] dark:data-answered:text-white"
				)}
				onclick={() => select(choice.value)}
			>
				{#if selected}
					<IconPlaceholder
						lucide="CheckIcon"
						tabler="IconCheck"
						hugeicons="Tick02Icon"
						phosphor="CheckIcon"
						remixicon="RiCheckLine"
						aria-hidden="true"
						class="size-3.5 shrink-0"
					/>
				{/if}
				<span class="min-w-0 wrap-anywhere">{choice.label}</span>
			</Button>
		{/each}
	</div>
</fieldset>
