<script setup lang="ts">
import { Badge } from "@valar/vue-ui/badge";
import { Button } from "@valar/vue-ui/button";
import {
	PageLayout,
	PageLayoutActions,
	PageLayoutHeader,
	PageLayoutPropertyList,
	PageLayoutPropertyRow,
	PageLayoutSection,
	PageLayoutSectionTitle,
	PageLayoutTitle,
	PageLayoutToolbar,
} from "@valar/vue-ui/page-layout";
import { Switch } from "@valar/vue-ui/switch";
import { ref } from "vue";

const narrow = ref(true);
</script>

<template>
	<section aria-label="Page Layout examples" class="w-full max-w-5xl p-6 text-sm">
		<PageLayout :width="narrow ? 'narrow' : 'full'">
			<PageLayoutHeader>
				<PageLayoutTitle>Workspace settings</PageLayoutTitle>
				<PageLayoutActions>
					<Button size="sm" variant="outline" :aria-pressed="narrow" @click="narrow = !narrow">
						Narrow layout
					</Button>
				</PageLayoutActions>
			</PageLayoutHeader>
			<PageLayoutSection>
				<PageLayoutToolbar>
					<PageLayoutSectionTitle>Preferences</PageLayoutSectionTitle>
					<Badge variant="outline">Workspace</Badge>
				</PageLayoutToolbar>
				<PageLayoutSection surface="card">
					<PageLayoutPropertyList>
						<PageLayoutPropertyRow
							label="Weekly digest"
							description="Send a summary of project activity."
						>
							<Switch appearance="settings" aria-label="Weekly digest" :default-value="true" />
						</PageLayoutPropertyRow>
						<PageLayoutPropertyRow label="Default time zone" description="Used for new projects.">
							<span>UTC</span>
						</PageLayoutPropertyRow>
					</PageLayoutPropertyList>
				</PageLayoutSection>
			</PageLayoutSection>
			<PageLayoutSection>
				<PageLayoutSectionTitle>Details</PageLayoutSectionTitle>
				<PageLayoutPropertyList layout="detail">
					<PageLayoutPropertyRow layout="detail" label="Workspace ID"
						>VLR-001</PageLayoutPropertyRow
					>
				</PageLayoutPropertyList>
			</PageLayoutSection>
		</PageLayout>
	</section>
</template>
