<script setup lang="ts">
import { ref } from "vue";
import * as Q from "@valar/vue-ui/questionnaire";

const items = [
	{ name: "format", required: true, choices: [{ value: "summary" }, { value: "checklist" }] },
	{ name: "notes" },
];
const result = ref("");
function submit(event: SubmitEvent) {
	event.preventDefault();
	const answers = new FormData(event.currentTarget as HTMLFormElement);
	result.value = `${answers.get("format")}${answers.get("notes") ? ` · ${answers.get("notes")}` : ""}`;
}
</script>

<template>
	<div class="grid gap-3">
		<Q.Root :items="items" :messages="{ requiredError: 'Choose a format to continue.' }" @submit="submit">
			<Q.Progress />
			<Q.Item name="format">
				<Q.Title>Choose a release format</Q.Title>
				<Q.Choices><Q.Choice value="summary">Summary</Q.Choice><Q.Choice value="checklist">Checklist</Q.Choice></Q.Choices>
				<Q.Error />
			</Q.Item>
			<Q.Item name="notes">
				<Q.Title>What should we highlight?</Q.Title>
				<Q.Input aria-label="Release notes emphasis" />
			</Q.Item>
			<Q.Actions><Q.Previous>Back</Q.Previous><Q.Skip>Skip</Q.Skip><Q.Next>Continue</Q.Next><Q.Submit>Submit answers</Q.Submit></Q.Actions>
		</Q.Root>
		<output aria-label="Submitted answers">{{ result }}</output>
	</div>
</template>
