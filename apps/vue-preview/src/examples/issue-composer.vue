<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@valar/vue-ui/button";
import { IssueComposer, type IssueDraft } from "@valar/vue-ui/issue-composer";

const open = ref(false);
const issues = ref<IssueDraft[]>([]);
</script>

<template>
	<div class="grid justify-items-start gap-3">
		<Button @click="open = true">New issue</Button>
		<IssueComposer v-model:open="open" @create="issues.push($event)" />
		<ul aria-label="Created issues" class="grid gap-1">
			<li v-for="(issue, index) in issues" :key="index">{{ issue.title }} · {{ issue.status }} · {{ issue.attachments.length }} files</li>
		</ul>
	</div>
</template>
