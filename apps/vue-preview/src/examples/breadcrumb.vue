<script setup lang="ts">
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@valar/vue-ui/breadcrumb";
import { Button } from "@valar/vue-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@valar/vue-ui/card";
import { nextTick, ref, useId, useTemplateRef } from "vue";

const headingId = useId();
const issueTitle = "VLR-103 Improve the saved workspace filters on narrow screens";
const showingIssue = ref(true);
const heading = useTemplateRef<HTMLHeadingElement>("heading");

async function openIssue() {
	showingIssue.value = true;
	await nextTick();
	heading.value?.focus();
}
</script>

<template>
	<section aria-label="Breadcrumb examples" class="grid w-full max-w-lg gap-4 p-6 text-sm">
		<Breadcrumb appearance="workspace" aria-label="Workspace path">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink v-if="showingIssue" :href="`#${headingId}`" @click="showingIssue = false">
						My issues
					</BreadcrumbLink>
					<BreadcrumbPage v-else>My issues</BreadcrumbPage>
				</BreadcrumbItem>
				<BreadcrumbSeparator v-if="showingIssue" />
				<BreadcrumbItem v-if="showingIssue" class="min-w-0">
					<BreadcrumbPage :title="issueTitle">{{ issueTitle }}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
		<Card size="sm">
			<CardHeader>
				<CardTitle>
					<h2
						:id="headingId"
						ref="heading"
						tabindex="-1"
						class="focus:outline-1 focus:-outline-offset-1 focus:outline-ring"
					>
						{{ showingIssue ? issueTitle : "My issues" }}
					</h2>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p v-if="showingIssue" class="text-muted-foreground">
					Keep saved filters visible when space is limited.
				</p>
				<Button
					v-else
					variant="link"
					class="h-auto px-0 text-start whitespace-normal"
					@click="openIssue"
				>
					{{ issueTitle }}
				</Button>
			</CardContent>
		</Card>
	</section>
</template>
