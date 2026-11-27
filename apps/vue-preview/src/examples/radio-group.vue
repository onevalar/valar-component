<script setup lang="ts">
import { Field, FieldLabel, FieldLegend, FieldSet } from "@valar/vue-ui/field";
import { RadioGroup, RadioGroupItem } from "@valar/vue-ui/radio-group";
import { useId } from "vue";

const id = useId();
const options = [
	{ label: "Email", value: "email" },
	{ label: "Digest", value: "digest" },
	{ label: "Disabled", value: "disabled", disabled: true },
];
</script>

<template>
	<section aria-label="Radio Group examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<FieldSet>
			<FieldLegend :id="`${id}-delivery`">Delivery method</FieldLegend>
			<RadioGroup
				:aria-labelledby="`${id}-delivery`"
				default-value="email"
				name="delivery"
				orientation="vertical"
			>
				<Field
					v-for="option in options"
					:key="option.value"
					orientation="horizontal"
					:data-disabled="option.disabled"
				>
					<RadioGroupItem
						:id="`${id}-${option.value}`"
						:value="option.value"
						:disabled="option.disabled"
					/>
					<FieldLabel :for="`${id}-${option.value}`">{{ option.label }}</FieldLabel>
				</Field>
			</RadioGroup>
		</FieldSet>
	</section>
</template>
