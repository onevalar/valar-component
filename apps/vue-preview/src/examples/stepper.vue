<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Input } from "@valar/vue-ui/input";
import { Stepper, type StepperStep } from "@valar/vue-ui/stepper";
import { ref } from "vue";

const steps: StepperStep[] = [
	{ id: "details", title: "Details", description: "Name the workspace" },
	{ id: "review", title: "Review", description: "Check your settings" },
	{ id: "done", title: "Done", description: "Finish setup" },
];
const name = ref("");
function beforeChange(from: string) {
	return (
		from !== "details" ||
		name.value.trim().length > 1 ||
		"Enter at least two characters to continue."
	);
}
</script>

<template>
	<div class="w-full max-w-2xl p-6">
		<Stepper
			:steps="steps"
			:before-change="beforeChange"
			aria-label="Workspace setup"
			:messages="{ progress: (current: number, total: number) => `Step ${current} of ${total}` }"
		>
			<template #default="{ step, next, previous, pending }">
				<div class="grid gap-3 text-sm">
					<label v-if="step.id === 'details'" class="grid gap-1"
						>Workspace name
						<Input :model-value="name" @update:model-value="name = String($event)" />
					</label>
					<p v-else>
						{{ step.id === "review" ? `Workspace: ${name.trim()}` : "Workspace setup complete." }}
					</p>
					<div class="flex gap-2">
						<Button v-if="step.id !== 'details'" variant="outline" @click="previous()">Back</Button>
						<Button v-if="step.id !== 'done'" :disabled="pending" @click="next()">Continue</Button>
					</div>
				</div>
			</template>
		</Stepper>
	</div>
</template>
