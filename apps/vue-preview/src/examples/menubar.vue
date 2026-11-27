<script setup lang="ts">
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@valar/vue-ui/menubar";
import { ref } from "vue";

const showOutline = ref(false);
const note = ref("Launch notes");
</script>

<template>
	<section aria-label="Menubar examples" class="grid w-full max-w-sm gap-3 p-6 text-sm">
		<Menubar aria-label="Notebook menu" class="w-fit">
			<MenubarMenu value="file">
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem @select="note = 'Untitled note'">New note</MenubarItem>
					<MenubarItem @select="note = 'Launch notes'">Open launch notes</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu value="view">
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarCheckboxItem v-model="showOutline">Show outline</MenubarCheckboxItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
		<div class="grid gap-2 rounded-lg border-[0.5px] border-border bg-card p-3">
			<h2 aria-live="polite" class="font-medium">{{ note }}</h2>
			<p v-if="showOutline" class="text-muted-foreground">
				Outline: {{ note === "Launch notes" ? "Checklist, owners, and dates" : "No headings yet" }}
			</p>
		</div>
	</section>
</template>
