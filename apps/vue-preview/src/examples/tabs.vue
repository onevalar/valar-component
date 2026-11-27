<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/vue-ui/tabs";
</script>

<template>
	<section aria-label="Tabs examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<Tabs default-value="overview" activation-mode="manual" class="w-full min-w-0">
			<TabsList variant="capsule" aria-label="Project views">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="activity">Activity</TabsTrigger>
				<TabsTrigger value="locked" disabled>Locked</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">Project milestones and open issues.</TabsContent>
			<TabsContent value="activity">Recent project updates and comments.</TabsContent>
			<TabsContent value="locked">This view is unavailable.</TabsContent>
		</Tabs>
	</section>
</template>
