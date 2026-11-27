<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { IssueComposer, issueLabels, type IssueDraft } from "@valar/vue-ui/issue-composer";
import { ref } from "vue";

const { chinese = false } = defineProps<{ chinese?: boolean }>();
const open = ref(false);
const issues = ref<IssueDraft[]>([]);
const opener = ref<HTMLButtonElement | null>(null);
const text = (zh: string, en: string) => (chinese ? zh : en);
const label = (value: keyof typeof issueLabels) => issueLabels[value][chinese ? 0 : 1];
const returnFocus = () => opener.value;
</script>

<template>
	<section
		:aria-label="text('新建问题预览', 'New issue preview')"
		class="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6"
	>
		<Button as-child shape="pill">
			<button ref="opener" type="button" @click="open = true">
				{{ text("新建问题", "New issue") }}
			</button>
		</Button>
		<p role="status" class="mt-4 text-sm text-muted-foreground">
			{{
				text(
					`本次预览已创建 ${issues.length} 个问题`,
					`${issues.length} ${issues.length === 1 ? "issue" : "issues"} created in this preview`
				)
			}}
		</p>
		<ol
			v-if="issues.length"
			:aria-label="text('已创建的问题', 'Created issues')"
			class="mt-3 divide-y divide-border"
		>
			<li
				v-for="(issue, index) in issues"
				:key="issues.length - index"
				class="space-y-1 py-3 text-sm"
			>
				<p class="font-semibold wrap-anywhere">{{ issue.title }}</p>
				<p class="text-xs text-muted-foreground">
					{{ label(issue.status) }} · {{ label(issue.priority) }}
				</p>
				<p v-if="issue.description" class="wrap-anywhere whitespace-pre-wrap">
					{{ issue.description }}
				</p>
				<p v-if="issue.attachments.length" class="text-xs wrap-anywhere text-muted-foreground">
					{{ issue.attachments.map((file) => file.name).join(" · ") }}
				</p>
			</li>
		</ol>

		<IssueComposer
			v-model:open="open"
			:chinese="chinese"
			:return-focus="returnFocus"
			@create="issues.unshift($event)"
		/>
	</section>
</template>
