<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Label } from "@valar/vue-ui/label";
import { NumberField } from "@valar/vue-ui/number-field";
import { ref, useId } from "vue";

const id = useId();
const value = ref<number | undefined>(1.25);
const saved = ref("");
function save(event: SubmitEvent) {
	if (event.currentTarget instanceof HTMLFormElement) {
		saved.value = String(new FormData(event.currentTarget).get("hours"));
	}
}
</script>

<template>
	<form
		aria-label="Allocation"
		class="grid max-w-xs gap-3 p-6 text-sm"
		@reset="saved = ''"
		@submit.prevent="save"
	>
		<Label :for="id">Estimated hours</Label>
		<NumberField
			:id="id"
			v-model="value"
			name="hours"
			locale="de-DE"
			:min="-0.75"
			:max="7.25"
			:step="0.5"
			required
			decrement-label="Decrease hours"
			increment-label="Increase hours"
			invalid-message="Enter a number in range."
		/>
		<div class="flex gap-2">
			<Button type="submit">Save estimate</Button>
			<Button type="reset" variant="outline">Reset</Button>
		</div>
		<p role="status">{{ saved ? `Submitted: ${saved}` : "" }}</p>
	</form>
</template>
