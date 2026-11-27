<script setup lang="ts">
import { Input } from "@valar/vue-ui/input";
import { Label } from "@valar/vue-ui/label";
import { useId } from "vue";

const id = useId();
</script>

<template>
	<section aria-label="Label examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<div class="grid gap-2">
			<Label :for="`${id}-name`">Display name</Label>
			<Input :id="`${id}-name`" name="displayName" autocomplete="nickname" />
		</div>
		<div class="grid gap-2">
			<Label :for="`${id}-workspace`" appearance="settings" required>Workspace name</Label>
			<Input :id="`${id}-workspace`" name="workspaceName" required />
		</div>
		<div class="grid gap-2">
			<Label :for="`${id}-account`" data-disabled="true">Account ID</Label>
			<Input :id="`${id}-account`" default-value="VLR-001" disabled />
		</div>
	</section>
</template>
