<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@valar/vue-ui/card";
import { Separator } from "@valar/vue-ui/separator";
import { Switch } from "@valar/vue-ui/switch";
import { ref } from "vue";

const subscribed = ref(false);
</script>

<template>
	<section aria-label="Card examples" class="grid w-full max-w-lg gap-4 p-6 text-sm">
		<Card>
			<CardHeader>
				<CardTitle><h2>Design systems</h2></CardTitle>
				<CardDescription>Shared components and release notes for the workspace.</CardDescription>
				<CardAction>
					<Button
						size="sm"
						variant="outline"
						:aria-pressed="subscribed"
						@click="subscribed = !subscribed"
					>
						Watch project
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>The next release updates the issue list and workspace settings.</CardContent>
			<CardFooter class="text-muted-foreground">4 open issues</CardFooter>
		</Card>
		<Card size="settings">
			<div class="flex items-center justify-between gap-3 px-4 py-3">
				<span>Weekly digest</span>
				<Switch aria-label="Weekly digest" appearance="settings" :default-value="true" />
			</div>
			<Separator decorative />
			<div class="flex items-center justify-between gap-3 px-4 py-3">
				<span>Project reminders</span>
				<Switch aria-label="Project reminders" appearance="settings" />
			</div>
		</Card>
	</section>
</template>
