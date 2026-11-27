<script setup lang="ts">
import { Label } from "@valar/vue-ui/label";
import { TagsInput } from "@valar/vue-ui/tags-input";
import { useId } from "vue";

const id = useId();
</script>

<template>
	<section aria-label="Issue labels" class="grid w-full max-w-md gap-3 p-6 text-sm">
		<Label :for="id">Labels</Label>
		<TagsInput
			:id="id"
			name="label"
			:default-value="['Design']"
			:max="3"
			tags-label="Applied labels"
			:remove-label="(tag: string) => `Remove ${tag}`"
			:messages="{
				duplicate: 'This label already exists.',
				max: (max: number) => `Add up to ${max} labels.`,
			}"
			placeholder="Add a label…"
			:aria-describedby="`${id}-hint`"
		/>
		<p :id="`${id}-hint`" class="text-muted-foreground">
			Separate labels with commas, or press Enter.
		</p>
	</section>
</template>
