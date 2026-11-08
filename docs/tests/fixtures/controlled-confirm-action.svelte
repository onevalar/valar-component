<script lang="ts">
	import {
		ConfirmAction,
		type ConfirmActionState,
	} from "../../src/lib/registry/ui/confirm-action/index.js";
	let { onConfirm }: { onConfirm: () => Promise<void> } = $props();
	let current = $state<ConfirmActionState>("idle");
</script>

<ConfirmAction
	label="Remove"
	confirmLabel="Yes"
	state={current}
	onStateChange={(next) => (current = next)}
	{onConfirm}
/>
<button type="button" onclick={() => (current = "idle")}>Reset</button>
