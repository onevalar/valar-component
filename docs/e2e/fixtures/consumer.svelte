<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Questionnaire from "$lib/components/ui/questionnaire/index.js";
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
	<Button variant="outline" onclick={() => (avatarSrc = "data:image/png;base64,broken")}>
		Break avatar
	</Button>
	<Button variant="outline" onclick={() => (avatarSrc = "/avatar-02.png")}>Restore avatar</Button>
	<Button variant="outline" onclick={() => (avatarSrc = "")}>Clear avatar</Button>
</section>

<form
	onsubmit={(event) => {
		event.preventDefault();
		result = JSON.stringify([...new FormData(event.currentTarget)]);
	}}
>
	<NumberField {...settings} name="amount" defaultValue={0.3} aria-label="Amount" />
	<TagsInput name="tags" defaultValue={["Svelte"]} aria-label="Tags" />
	<Button type="submit">Submit</Button>
	<Button variant="outline" type="reset">Reset</Button>
	<output class="border transition duration-fast ease-standard">{result}</output>
</form>
<Slider type="single" value={35} aria-label="Volume" />
<Stepper {steps} aria-label="Checkout">
	{#snippet children({ step, next })}<p>{step.title}</p>
		<Button onclick={next}>Next</Button>{/snippet}
</Stepper>
<Questionnaire.Root items={[{ name: "framework", choices: [{ value: "svelte" }] }]}>
	<Questionnaire.Item name="framework">
		<Questionnaire.Title>Choose a framework</Questionnaire.Title>
		<Questionnaire.Choices>
			<Questionnaire.Choice value="svelte">Svelte</Questionnaire.Choice>
		</Questionnaire.Choices>
	</Questionnaire.Item>
</Questionnaire.Root>
