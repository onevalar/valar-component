<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Questionnaire from "$lib/components/ui/questionnaire/index.js";
	import * as Radio from "$lib/components/ui/radio-group/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Checkbox, CheckboxGroup } from "$lib/components/ui/checkbox/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { NumberField, type NumberFieldProps } from "$lib/components/ui/number-field/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Stepper, type StepperStep } from "$lib/components/ui/stepper/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { TagsInput } from "$lib/components/ui/tags-input/index.js";
	import { Toggle } from "$lib/components/ui/toggle/index.js";
	const settings: Partial<NumberFieldProps> = { min: -2, max: 2, step: 0.1 };
	const steps: StepperStep[] = [
		{ id: "first", title: "First" },
		{ id: "last", title: "Last" },
	];
	let result = $state("");
	let avatarSrc = $state("/avatar-01.png");
	let plan = $state("individual");
</script>

<form aria-label="Plan preferences">
	<Label for="plan-name" required>Plan name</Label>
	<input id="plan-name" value="Custom" />
	<Separator />
	<div class="flex min-h-5 gap-2">
		<span>Monthly</span>
		<Separator decorative orientation="vertical" />
		<span>Annual</span>
	</div>
	<Radio.Root name="plan" bind:value={plan} aria-label="Plan tier">
		<Radio.Item value="individual" id="individual-plan" />
		<Label for="individual-plan">Individual</Label>
		<Radio.Item value="disabled" id="disabled-plan" disabled />
		<Label for="disabled-plan">Unavailable</Label>
		<Radio.Item value="team" id="team-plan" />
		<Label for="team-plan">Team</Label>
	</Radio.Root>
</form>

<Collapsible.Root>
	<Collapsible.Trigger>Plan details</Collapsible.Trigger>
	<Collapsible.Content>Includes reporting</Collapsible.Content>
</Collapsible.Root>

<Accordion.Root type="single" value="shipping">
	<Accordion.Item value="shipping">
		<Accordion.Trigger>Shipping time</Accordion.Trigger>
		<Accordion.Content>Five business days</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="returns">
		<Accordion.Trigger>Returns window</Accordion.Trigger>
		<Accordion.Content>Thirty days</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>

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

<Tabs.Root value="general" activationMode="manual">
	<Tabs.List aria-label="Preferences tabs" variant="capsule">
		<Tabs.Trigger value="general">General</Tabs.Trigger>
		<Tabs.Trigger value="locked" disabled>Locked</Tabs.Trigger>
		<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="general">General preferences</Tabs.Content>
	<Tabs.Content value="notifications"><Toggle>Mute notifications</Toggle></Tabs.Content>
</Tabs.Root>

<form aria-label="Delivery options">
	<CheckboxGroup name="channels" defaultValue={["email"]} required aria-label="Channels">
		<Checkbox value="email" aria-label="Email" />
		<Checkbox value="push" aria-label="Push" />
	</CheckboxGroup>
	<Switch name="alerts" value="yes" aria-label="Alerts" />
	<Button type="reset">Reset delivery options</Button>
</form>

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
