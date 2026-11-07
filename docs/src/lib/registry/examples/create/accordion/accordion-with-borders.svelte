<script lang="ts">
	import * as Accordion from "$lib/registry/ui/accordion/index.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";

	const items = [
		{
			value: "billing",
			trigger: "How does billing work?",
			content:
				"We offer monthly and annual subscription plans. Billing is charged at the beginning of each cycle, and you can cancel anytime. All plans include automatic backups, 24/7 support, and unlimited team members. There are no hidden fees or setup costs.",
		},
		{
			value: "security",
			trigger: "Is my data secure?",
			content:
				"Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits. All data is encrypted at rest and in transit using industry-standard protocols. We also offer optional two-factor authentication and single sign-on for enterprise customers.",
		},
		{
			value: "integration",
			trigger: "What integrations do you support?",
			content: [
				"We integrate with 500+ popular tools including Slack, Zapier, Salesforce, HubSpot, and more. You can also build custom integrations using our REST API and webhooks. ",
				"Our API documentation includes code examples in 10+ programming languages.",
			],
		},
	];
</script>

<Example title="With Borders">
	<Accordion.Root
		type="single"
		class="mx-auto flex max-w-lg flex-col style-valar:gap-2"
	>
		{#each items as item (item.value)}
			<Accordion.Item
				value={item.value}
				class="style-valar:rounded-lg style-valar:border"
			>
				<Accordion.Trigger
					class="font-medium style-valar:px-2.5 style-valar:text-sm"
				>
					{item.trigger}
				</Accordion.Trigger>
				<Accordion.Content
					class="text-muted-foreground style-valar:px-2.5 style-valar:text-sm"
				>
					{#if Array.isArray(item.content)}
						{#each item.content as paragraph, i (i)}
							<p>{paragraph}</p>
						{/each}
					{:else}
						{item.content}
					{/if}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</Example>
