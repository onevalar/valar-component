<script setup lang="ts">
import { Badge } from "@valar/vue-ui/badge";
import { ResizableHandle, ResizablePane, ResizablePaneGroup } from "@valar/vue-ui/resizable";
import { useId } from "vue";

const instructionsId = useId();
const projectsId = useId();
const detailsId = useId();
</script>

<template>
	<section aria-label="Resizable examples" class="grid w-full max-w-lg gap-2 p-6 text-sm">
		<p :id="instructionsId" class="text-muted-foreground">
			Drag the divider or focus it and use the arrow keys to resize the panels.
		</p>
		<ResizablePaneGroup direction="horizontal" class="h-40 rounded-lg border-[0.5px] border-border">
			<ResizablePane as="section" :aria-labelledby="projectsId" :default-size="45" :min-size="25">
				<div class="h-full overflow-auto bg-muted/50 p-3">
					<h2 :id="projectsId" class="mb-2 font-medium">Projects</h2>
					<ul class="grid gap-1 text-muted-foreground">
						<li>Design systems</li>
						<li>Workspace search</li>
					</ul>
				</div>
			</ResizablePane>
			<ResizableHandle
				appearance="workspace"
				with-handle
				aria-label="Project panel size"
				:aria-describedby="instructionsId"
			/>
			<ResizablePane as="section" :aria-labelledby="detailsId" :default-size="55" :min-size="25">
				<div class="grid h-full content-start gap-2 overflow-auto p-3">
					<h2 :id="detailsId" class="font-medium">Details</h2>
					<p class="text-muted-foreground">Design systems</p>
					<Badge variant="secondary">Active</Badge>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	</section>
</template>
