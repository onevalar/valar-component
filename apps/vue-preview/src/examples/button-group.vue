<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@valar/vue-ui/button-group";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverTitle,
	PopoverTrigger,
} from "@valar/vue-ui/popover";
import { ref } from "vue";

const tool = ref("Editor");
const message = ref("");

async function copyPrompt() {
	const target = tool.value;
	const prompt = `Investigate why the issue list loses its filters after refreshing. Use the ${target.toLowerCase()}.`;
	try {
		await navigator.clipboard.writeText(prompt);
		message.value = `Prompt copied for ${target}.`;
	} catch {
		message.value = `Clipboard unavailable. Copy this prompt manually: ${prompt}`;
	}
}

function chooseTool(nextTool: string) {
	tool.value = nextTool;
	message.value = `Coding tool: ${nextTool}.`;
}
</script>

<template>
	<section
		aria-label="Button Group examples"
		class="grid w-full max-w-sm justify-items-start gap-3 p-6 text-sm"
	>
		<ButtonGroup variant="pill" aria-label="Issue actions">
			<Button variant="ghost" size="icon-sm" aria-label="Copy as prompt" @click="copyPrompt">
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="8" y="8" width="12" height="12" rx="2" />
					<path d="M16 4H6a2 2 0 0 0-2 2v10" />
				</svg>
			</Button>
			<ButtonGroupSeparator />
			<Popover>
				<PopoverTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Choose coding tool">
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" aria-label="Coding tool" class="grid w-fit gap-2">
					<PopoverTitle>Coding tool</PopoverTitle>
					<div class="flex flex-wrap gap-2">
						<PopoverClose v-for="option in ['Editor', 'Terminal']" :key="option" as-child>
							<Button
								variant="outline"
								size="sm"
								:aria-pressed="tool === option"
								@click="chooseTool(option)"
							>
								{{ option }}
							</Button>
						</PopoverClose>
					</div>
				</PopoverContent>
			</Popover>
		</ButtonGroup>
		<output class="min-h-5 text-muted-foreground">{{ message }}</output>
	</section>
</template>
