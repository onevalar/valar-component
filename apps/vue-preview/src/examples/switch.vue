<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@valar/vue-ui/field";
import { Switch } from "@valar/vue-ui/switch";
import { ref, useId } from "vue";

const id = useId();
const defaultEmailUpdates = true;
const emailUpdates = ref(defaultEmailUpdates);
const saved = ref("");

function save(event: SubmitEvent) {
	const data = new FormData(event.currentTarget as HTMLFormElement);
	saved.value = `Settings saved. Email updates ${data.has("emailUpdates") ? "on" : "off"}.`;
}

function reset() {
	emailUpdates.value = defaultEmailUpdates;
	saved.value = "Settings reset.";
}
</script>

<template>
	<section aria-label="Switch examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<form class="grid gap-4" @submit.prevent="save" @reset="reset">
			<FieldGroup class="gap-2">
				<Field
					appearance="settings"
					orientation="horizontal"
					class="rounded-[10px] border-[0.5px] border-border bg-card"
				>
					<FieldContent>
						<FieldLabel :for="`${id}-email`">Email updates</FieldLabel>
						<FieldDescription :id="`${id}-description`"
							>Get workspace updates by email.</FieldDescription
						>
					</FieldContent>
					<Switch
						:id="`${id}-email`"
						v-model="emailUpdates"
						appearance="settings"
						name="emailUpdates"
						:aria-describedby="`${id}-description`"
						@update:model-value="saved = ''"
					/>
				</Field>
				<Field orientation="horizontal" data-disabled="true">
					<FieldLabel :for="`${id}-locked`">Locked updates</FieldLabel>
					<Switch :id="`${id}-locked`" name="lockedUpdates" size="sm" disabled />
				</Field>
			</FieldGroup>
			<div class="flex flex-wrap gap-2">
				<Button type="submit">Save settings</Button>
				<Button type="reset" variant="outline">Reset settings</Button>
			</div>
			<output class="min-h-5 text-muted-foreground">{{ saved }}</output>
		</form>
	</section>
</template>
