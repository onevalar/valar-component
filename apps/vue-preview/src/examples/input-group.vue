<script setup lang="ts">
import { Field, FieldLabel } from "@valar/vue-ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
} from "@valar/vue-ui/input-group";
import { computed, ref, useId, useTemplateRef } from "vue";

const id = useId();
const searchInput = useTemplateRef<{ $el: HTMLInputElement }>("searchInput");
const query = ref("");
const settings = ["Profile", "Preferences", "Notifications"];
const matches = computed(() =>
	settings.filter((setting) => setting.toLowerCase().includes(query.value.trim().toLowerCase()))
);

function clearSearch() {
	query.value = "";
	searchInput.value?.$el.focus();
}

function clearOnEscape(event: KeyboardEvent) {
	if (!query.value || event.isComposing) return;
	event.preventDefault();
	event.stopPropagation();
	clearSearch();
}
</script>

<template>
	<section
		aria-label="Input Group examples"
		class="grid w-full max-w-sm justify-items-start gap-3 p-6 text-sm"
	>
		<InputGroup appearance="settings-search" class="w-full max-w-[168px]">
			<InputGroupInput
				ref="searchInput"
				v-model="query"
				type="search"
				aria-label="Search settings"
				:aria-controls="`${id}-results`"
				placeholder="Search…"
				class="[&::-webkit-search-cancel-button]:appearance-none"
				@keydown.esc="clearOnEscape"
			/>
			<InputGroupAddon aria-hidden="true">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
			</InputGroupAddon>
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					v-if="query"
					size="icon-xs"
					aria-label="Clear search"
					@click="clearSearch"
				>
					<svg
						aria-hidden="true"
						class="size-3"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="m18 6-12 12M6 6l12 12" />
					</svg>
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
		<div :id="`${id}-results`" class="text-xs text-muted-foreground" aria-live="polite">
			<ul v-if="matches.length" class="grid gap-1">
				<li v-for="setting in matches" :key="setting">{{ setting }}</li>
			</ul>
			<p v-else>No matching settings</p>
		</div>
		<Field>
			<FieldLabel :for="`${id}-slug`">Workspace URL</FieldLabel>
			<InputGroup>
				<InputGroupAddon aria-hidden="true">
					<InputGroupText>valar.dev/</InputGroupText>
				</InputGroupAddon>
				<InputGroupInput :id="`${id}-slug`" default-value="design" />
			</InputGroup>
		</Field>
	</section>
</template>
