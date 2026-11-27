<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Checkbox } from "@valar/vue-ui/checkbox";
import { Input } from "@valar/vue-ui/input";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@valar/vue-ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/vue-ui/select";
import { Separator } from "@valar/vue-ui/separator";
import { computed, ref, useId } from "vue";

const row = "flex min-h-8 items-center justify-between gap-2";
const id = useId();
const open = ref(false);
const name = ref("Valar");
const grouping = ref("none");
const showProjects = ref(true);
const showWeekNumbers = ref(false);
const changed = computed(
	() => grouping.value !== "none" || !showProjects.value || showWeekNumbers.value
);

function save(event: SubmitEvent) {
	name.value = String(new FormData(event.currentTarget as HTMLFormElement).get("name"));
	open.value = false;
}

function reset() {
	grouping.value = "none";
	showProjects.value = true;
	showWeekNumbers.value = false;
}
</script>

<template>
	<section aria-label="Popover examples" class="grid gap-3 p-6">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<Popover v-model:open="open">
				<PopoverTrigger as-child>
					<Button variant="outline">Edit profile</Button>
				</PopoverTrigger>
				<PopoverContent align="start" :aria-describedby="`${id}-description`">
					<PopoverHeader>
						<PopoverTitle>Edit profile</PopoverTitle>
						<PopoverDescription :id="`${id}-description`"
							>Set your display name.</PopoverDescription
						>
					</PopoverHeader>
					<form class="grid gap-2" @submit.prevent="save">
						<label :for="`${id}-name`">Display name</label>
						<Input :id="`${id}-name`" name="name" :default-value="name" required />
						<div class="flex justify-end gap-2">
							<PopoverClose as-child>
								<Button variant="ghost">Cancel</Button>
							</PopoverClose>
							<Button type="submit">Save profile</Button>
						</div>
					</form>
				</PopoverContent>
			</Popover>
			<Popover>
				<PopoverTrigger as-child>
					<Button variant="outline">Display options</Button>
				</PopoverTrigger>
				<PopoverContent appearance="options" align="end">
					<div class="grid shrink-0 px-4 py-2">
						<PopoverTitle class="mb-1">Display options</PopoverTitle>
						<div :class="row">
							<span :id="`${id}-grouping`">Grouping</span>
							<Select v-model="grouping">
								<SelectTrigger size="sm" class="h-6!" :aria-labelledby="`${id}-grouping`">
									<SelectValue />
								</SelectTrigger>
								<SelectContent align="end">
									<SelectItem value="none">No grouping</SelectItem>
									<SelectItem value="lead">Lead</SelectItem>
									<SelectItem value="status">Status</SelectItem>
									<SelectItem value="team">Team</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<Separator decorative />
					<div class="grid shrink-0 px-4 py-2">
						<p class="mb-1 font-medium">Timeline options</p>
						<label :class="row" :for="`${id}-projects`">
							Show project list
							<Checkbox :id="`${id}-projects`" v-model="showProjects" />
						</label>
						<label :class="row" :for="`${id}-weeks`">
							Show week numbers
							<Checkbox :id="`${id}-weeks`" v-model="showWeekNumbers" />
						</label>
					</div>
					<Separator decorative />
					<div class="flex shrink-0 flex-wrap justify-between gap-2 px-4 py-2">
						<Button size="sm" variant="ghost" :disabled="!changed" @click="reset">Reset</Button>
						<PopoverClose as-child>
							<Button size="sm" variant="outline">Done</Button>
						</PopoverClose>
					</div>
				</PopoverContent>
			</Popover>
		</div>
		<output aria-label="Saved display name" class="text-sm text-muted-foreground">
			{{ name }}
		</output>
	</section>
</template>
