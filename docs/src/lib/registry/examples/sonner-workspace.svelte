<script lang="ts">
	import { onDestroy } from "svelte";
	import { toast } from "svelte-sonner";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Toaster } from "$lib/registry/ui/sonner/index.js";

	const exampleIssueId = "VLR-42";
	const toasterId = $props.id();
	const notificationId = `${toasterId}-copy`;
	let active = true;

	async function copyIssueId() {
		try {
			await navigator.clipboard.writeText(exampleIssueId);
			if (active) {
				toast.info(`"${exampleIssueId}" copied to clipboard`, { id: notificationId, toasterId });
			}
		} catch {
			if (active) toast.error("Unable to copy issue ID", { id: notificationId, toasterId });
		}
	}

	onDestroy(() => {
		active = false;
		if (typeof window !== "undefined") toast.dismiss(notificationId);
	});
</script>

<Button variant="outline" size="sm" onclick={copyIssueId}>
	<CopyIcon />
	Copy issue ID
</Button>

<Toaster
	id={toasterId}
	appearance="workspace"
	containerAriaLabel="Copy feedback"
	closeButtonAriaLabel="Dismiss"
	hotkey={["altKey", "KeyY"]}
/>
