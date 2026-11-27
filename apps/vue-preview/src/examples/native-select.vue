<script setup lang="ts">
import { Field, FieldGroup, FieldLabel } from "@valar/vue-ui/field";
import { NativeSelect, NativeSelectOption } from "@valar/vue-ui/native-select";
import { ref, useId } from "vue";

const id = useId();
const zone = ref("utc");
</script>

<template>
	<section aria-label="Native Select examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<FieldGroup>
			<Field>
				<FieldLabel :for="`${id}-zone`">Time zone</FieldLabel>
				<NativeSelect :id="`${id}-zone`" v-model="zone" name="timeZone">
					<NativeSelectOption value="utc">UTC</NativeSelectOption>
					<NativeSelectOption value="local">Local time</NativeSelectOption>
				</NativeSelect>
			</Field>
			<Field data-disabled="true">
				<FieldLabel :for="`${id}-format`">Workspace time format</FieldLabel>
				<NativeSelect :id="`${id}-format`" size="sm" disabled>
					<NativeSelectOption value="24-hour">24-hour clock</NativeSelectOption>
				</NativeSelect>
			</Field>
		</FieldGroup>
	</section>
</template>
