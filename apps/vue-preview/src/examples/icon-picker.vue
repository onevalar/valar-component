<script setup lang="ts">
import { createParts } from "@ui-sdk/vue/primitive";
import { iconPicker } from "../../../framework-comparison/src/icon-picker.js";
import "../../../framework-comparison/src/icon-picker.css";

const { Root, Trigger, Content, Search, Results, Item, Selection } = createParts(iconPicker, {
	trigger: "button",
	content: "div",
	search: "input",
	results: "div",
	item: "button",
	selection: "p",
});
</script>

<template>
	<main class="icon-picker-preview">
		<h1>Project settings</h1>
		<Root>
			<div class="icon-picker-setting">
				<div>
					<span>Project icon</span>
					<Selection v-slot="{ state }" class="icon-picker-selection"
						>Selected icon: {{ state.name }}</Selection
					>
				</div>
				<Trigger v-slot="{ state }" aria-label="Choose project icon" class="icon-picker-trigger">
					<svg
						aria-hidden="true"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path :d="state.selected.path" />
					</svg>
				</Trigger>
			</div>
			<Content
				align="end"
				:side-offset="8"
				:collision-padding="8"
				initial-focus="input[type=search]"
				class="icon-picker-panel"
			>
				<Search />
				<Results v-slot="{ state }" class="icon-picker-results">
					<Item
						v-for="{ name, path } in state.results"
						:key="name"
						:value="name"
						:aria-label="name"
						:title="name"
						class="icon-picker-item"
					>
						<svg
							aria-hidden="true"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path :d="path" />
						</svg>
					</Item>
					<p v-if="!state.results.length" class="icon-picker-empty">No icons found</p>
				</Results>
			</Content>
		</Root>
	</main>
</template>
