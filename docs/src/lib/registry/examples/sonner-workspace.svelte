<script lang="ts">
	import CopyIcon from "@lucide/svelte/icons/copy";
	import { onDestroy } from "svelte";
	import { toast } from "svelte-sonner";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Toaster } from "$lib/registry/ui/sonner/index.js";

	const exampleIssueId = "VLR-42";
	const toasterId = $props.id();
	const notificationId = `${toasterId}-copy`;
	const updateId = `${toasterId}-update`;
	const saveId = `${toasterId}-save`;
	const restoreId = `${toasterId}-restore`;
	let active = true;
	let saving = $state(false);
	let archived = $state(false);
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

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

	function save() {
		saving = true;
		toast.loading("Saving changes…", { id: saveId, toasterId });
		saveTimer = setTimeout(() => {
			saving = false;
			toast.success("Changes saved", { id: saveId, toasterId });
		}, 900);
	}

	function archive() {
		archived = true;
		toast.success("Issue archived", {
			id: updateId,
			toasterId,
			duration: 8000,
			action: {
				label: "Undo",
				onClick: () => {
					archived = false;
					toast.info("Issue restored", { id: restoreId, toasterId });
				},
			},
		});
	}

	onDestroy(() => {
		active = false;
		clearTimeout(saveTimer);
		if (typeof window !== "undefined")
			for (const id of [notificationId, saveId, updateId, restoreId]) toast.dismiss(id);
	});
</script>

<div class="flex flex-wrap justify-center gap-2" role="group" aria-label="Workspace notifications">
	<Button variant="outline" size="sm" onclick={copyIssueId}>
		<CopyIcon />
		Copy issue ID
	</Button>
	<Button variant="outline" size="sm" disabled={saving} onclick={save}>Save changes</Button>
	<Button
		variant="outline"
		size="sm"
		onclick={() => toast.error("Could not save changes", { id: saveId, toasterId })}
		disabled={saving}>Show save error</Button
	>
	<Button variant="outline" size="sm" disabled={archived} onclick={archive}>Archive issue</Button>
</div>

<Toaster
	id={toasterId}
	appearance="workspace"
	containerAriaLabel="Copy feedback"
	closeButtonAriaLabel="Dismiss"
	hotkey={["altKey", "KeyY"]}
/>
