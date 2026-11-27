<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@valar/vue-ui/field";
import { Input } from "@valar/vue-ui/input";
import { ref, useId } from "vue";

const id = useId();
const error = ref("");
const saved = ref("");

function save(event: SubmitEvent) {
	if (!(event.currentTarget instanceof HTMLFormElement)) return;
	const form = event.currentTarget;
	const username = String(new FormData(form).get("username") ?? "").trim();
	if (username.length < 2 || username.length > 50) {
		error.value = "Enter a display name of 2 to 50 characters.";
		saved.value = "";
		const input = form.elements.namedItem("username");
		if (input instanceof HTMLInputElement) input.focus();
		return;
	}
	error.value = "";
	saved.value = username;
}

function reset() {
	error.value = "";
	saved.value = "";
}
</script>

<template>
	<form
		aria-label="Profile settings"
		class="grid w-full max-w-sm gap-4 p-6"
		novalidate
		@submit.prevent="save"
		@reset="reset"
	>
		<Field :data-invalid="!!error">
			<FieldLabel :for="id">Display name</FieldLabel>
			<Input
				:id="id"
				name="username"
				autocomplete="nickname"
				required
				:aria-invalid="!!error"
				:aria-describedby="`${id}-hint${error ? ` ${id}-error` : ''}`"
			/>
			<FieldDescription :id="`${id}-hint`"
				>This name appears on your workspace profile.</FieldDescription
			>
			<FieldError v-if="error" :id="`${id}-error`">{{ error }}</FieldError>
		</Field>
		<div class="flex flex-wrap gap-2">
			<Button type="submit">Save profile</Button>
			<Button type="reset" variant="outline">Reset</Button>
		</div>
		<p role="status" class="text-sm">{{ saved ? `Saved: ${saved}` : "" }}</p>
	</form>
</template>
