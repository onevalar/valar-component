<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Kbd } from "@valar/vue-ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@valar/vue-ui/tooltip";
import { ref, useId } from "vue";

const optionsId = useId();
const showOptions = ref(false);

function toggleOptions() {
	showOptions.value = !showOptions.value;
}
</script>

<template>
	<section
		aria-label="Tooltip examples"
		class="grid min-h-28 w-full max-w-sm content-start justify-items-start gap-3 p-6 text-sm"
	>
		<TooltipProvider :delay-duration="500">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Display options"
						aria-keyshortcuts="Shift+V"
						:aria-expanded="showOptions"
						:aria-controls="optionsId"
						@click="toggleOptions"
						@keydown.shift.v.exact.prevent="
							!$event.repeat && !$event.isComposing && toggleOptions()
						"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						>
							<path d="M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6m-4 4v6" />
						</svg>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom" align="start" aria-label="Show display options">
					<span class="inline-flex items-center gap-2">
						Show display options
						<span aria-hidden="true" class="inline-flex items-center gap-[3px]">
							<Kbd appearance="compact">Shift</Kbd>
							<Kbd appearance="compact">V</Kbd>
						</span>
					</span>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<p v-show="showOptions" :id="optionsId" class="text-muted-foreground">
			Issues are grouped by status.
		</p>
	</section>
</template>
