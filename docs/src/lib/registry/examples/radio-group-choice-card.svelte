<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
</script>

<RadioGroup.Root defaultValue="plus" aria-label="Plan" class="max-w-sm">
	<Field.Label for="plus-plan">
		<Field.Field orientation="horizontal">
			<Field.Content>
				<Field.Title id="plus-plan-title">Plus</Field.Title>
				<Field.Description id="plus-plan-description"
					>For individuals and small teams.</Field.Description
				>
			</Field.Content>
			<RadioGroup.Item
				value="plus"
				id="plus-plan"
				aria-labelledby="plus-plan-title"
				aria-describedby="plus-plan-description"
			/>
		</Field.Field>
	</Field.Label>
	<Field.Label for="pro-plan">
		<Field.Field orientation="horizontal">
			<Field.Content>
				<Field.Title id="pro-plan-title">Pro</Field.Title>
				<Field.Description id="pro-plan-description">For growing businesses.</Field.Description>
			</Field.Content>
			<RadioGroup.Item
				value="pro"
				id="pro-plan"
				aria-labelledby="pro-plan-title"
				aria-describedby="pro-plan-description"
			/>
		</Field.Field>
	</Field.Label>
	<Field.Label for="enterprise-plan">
		<Field.Field orientation="horizontal">
			<Field.Content>
				<Field.Title id="enterprise-plan-title">Enterprise</Field.Title>
				<Field.Description id="enterprise-plan-description"
					>For large teams and enterprises.</Field.Description
				>
			</Field.Content>
			<RadioGroup.Item
				value="enterprise"
				id="enterprise-plan"
				aria-labelledby="enterprise-plan-title"
				aria-describedby="enterprise-plan-description"
			/>
		</Field.Field>
	</Field.Label>
</RadioGroup.Root>
