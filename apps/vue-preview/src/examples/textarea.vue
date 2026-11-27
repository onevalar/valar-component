<script setup lang="ts">
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@valar/vue-ui/field";
import { Textarea } from "@valar/vue-ui/textarea";
import { ref, useId } from "vue";

const id = useId();
const description = ref("");
const limit = 255;
</script>

<template>
	<section aria-label="Textarea examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<FieldGroup>
			<Field>
				<FieldLabel :for="`${id}-description`">Description</FieldLabel>
				<Textarea
					:id="`${id}-description`"
					v-model="description"
					name="description"
					appearance="settings"
					placeholder="Describe your team"
					:maxlength="limit"
					:aria-describedby="`${id}-count`"
				/>
				<FieldDescription :id="`${id}-count`" class="text-right tabular-nums">
					{{ description.length }} / {{ limit }} characters
				</FieldDescription>
			</Field>
			<Field>
				<FieldLabel :for="`${id}-notes`">Notes</FieldLabel>
				<Textarea :id="`${id}-notes`" name="notes" placeholder="Add a note" />
			</Field>
			<Field>
				<FieldLabel :for="`${id}-template`">Default template</FieldLabel>
				<Textarea :id="`${id}-template`" default-value="Summary and next steps" readonly />
			</Field>
		</FieldGroup>
	</section>
</template>
