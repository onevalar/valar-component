<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { NumberField, type NumberFieldProps } from "$lib/components/ui/number-field/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Stepper, type StepperStep } from "$lib/components/ui/stepper/index.js";
	import { TagsInput } from "$lib/components/ui/tags-input/index.js";
	const settings: Partial<NumberFieldProps> = { min: -2, max: 2, step: 0.1 };
	const steps: StepperStep[] = [
		{ id: "first", title: "First" },
		{ id: "last", title: "Last" },
	];
	let result = $state("");
	let avatarSrc = $state("/avatar-01.png");
</script>

<section role="group" aria-label="Avatar source changes">
	<Avatar.Root>
		<Avatar.Image src={avatarSrc} alt="Lin" />
		<Avatar.Fallback>LN</Avatar.Fallback>
	</Avatar.Root>
	<button onclick={() => (avatarSrc = "data:image/png;base64,broken")}>Break avatar</button>
	<button onclick={() => (avatarSrc = "/avatar-02.png")}>Restore avatar</button>
	<button onclick={() => (avatarSrc = "")}>Clear avatar</button>
</section>

<form
	onsubmit={(event) => {
		event.preventDefault();
		result = JSON.stringify([...new FormData(event.currentTarget)]);
	}}
>
	<NumberField {...settings} name="amount" defaultValue={0.3} aria-label="Amount" />
	<TagsInput name="tags" defaultValue={["Svelte"]} aria-label="Tags" />
	<button type="submit">Submit</button><button type="reset">Reset</button>
	<output>{result}</output>
</form>
<Slider type="single" value={35} aria-label="Volume" />
<Stepper {steps} aria-label="Checkout">
	{#snippet children({ step, next })}<p>{step.title}</p>
		<button onclick={next}>Next</button>{/snippet}
</Stepper>
<Button>Tuned button</Button>
<Dialog.Root>
	<Dialog.Trigger>Open tuned dialog</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Tuned dialog</Dialog.Title>
		<Dialog.Description>Installed from the designer workbench.</Dialog.Description>
		<Dialog.Close>Close tuned dialog</Dialog.Close>
	</Dialog.Content>
</Dialog.Root>
<Accordion.Root>
	<Accordion.Item value="first"
		><Accordion.Trigger>First tuned section</Accordion.Trigger><Accordion.Content
			>First content</Accordion.Content
		></Accordion.Item
	>
	<Accordion.Item value="second"
		><Accordion.Trigger>Second tuned section</Accordion.Trigger><Accordion.Content
			>Second content</Accordion.Content
		></Accordion.Item
	>
</Accordion.Root>
<Tooltip.Provider
	><Tooltip.Root
		><Tooltip.Trigger>Tuned tooltip</Tooltip.Trigger><Tooltip.Content
			>Installed tooltip</Tooltip.Content
		></Tooltip.Root
	></Tooltip.Provider
>
