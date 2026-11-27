<script setup lang="ts">
import { ref } from "vue";
import { IssueDetail, type IssueDetailValue } from "@valar/vue-ui/issue-detail";

const issue = ref<IssueDetailValue>({
	id: "DOC-24",
	title: "Review the release notes",
	description: "Add the keyboard checks and example screenshots before handing off the draft.",
	status: "todo",
	priority: "medium",
});
</script>

<template>
	<IssueDetail :issue="issue" @update="issue = { ...issue, ...$event }" />
</template>
