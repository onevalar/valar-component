<script setup lang="ts">
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@valar/vue-ui/field";
import { Input } from "@valar/vue-ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/vue-ui/select";
import { Separator } from "@valar/vue-ui/separator";
import { computed, ref, useId } from "vue";

const id = useId();
const identifier = ref("!");
const invalid = computed(() => !/^[a-z0-9]{2,7}$/i.test(identifier.value));
</script>

<template>
	<section aria-label="Field examples" class="grid w-full max-w-[688px] gap-4 p-6 text-sm">
		<FieldGroup class="gap-0 rounded-[10px] border-[0.5px] border-border bg-card">
			<Field appearance="settings" orientation="responsive">
				<FieldContent>
					<FieldLabel :for="`${id}-theme`">Interface theme</FieldLabel>
					<FieldDescription :id="`${id}-theme-help`">Choose a workspace theme.</FieldDescription>
				</FieldContent>
				<Select default-value="system" name="theme">
					<SelectTrigger :id="`${id}-theme`" :aria-describedby="`${id}-theme-help`">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="system">System preference</SelectItem>
						<SelectItem value="light">Light</SelectItem>
						<SelectItem value="dark">Dark</SelectItem>
					</SelectContent>
				</Select>
			</Field>
			<div class="px-4"><Separator decorative /></div>
			<Field appearance="settings" orientation="responsive" :data-invalid="invalid || undefined">
				<FieldContent>
					<FieldLabel :for="`${id}-team`">Team identifier</FieldLabel>
					<FieldError v-if="invalid" :id="`${id}-team-error`">Enter a valid identifier.</FieldError>
				</FieldContent>
				<Input
					:id="`${id}-team`"
					v-model="identifier"
					name="identifier"
					placeholder="e.g. ENG"
					maxlength="7"
					required
					:aria-invalid="invalid"
					:aria-describedby="invalid ? `${id}-team-error` : undefined"
					class="@md/field-group:w-43"
				/>
			</Field>
		</FieldGroup>
	</section>
</template>
