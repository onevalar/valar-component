<script lang="ts">
	import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
	import WifiOffIcon from "@lucide/svelte/icons/wifi-off";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let offline = $state(true);
	let retryFailed = $state(false);

	function toggleConnection() {
		offline = !offline;
		retryFailed = false;
	}
</script>

<div class="grid max-w-full justify-items-start gap-3">
	<div class="grid min-h-6">
		{#if offline}
			<Alert.Root appearance="connection" role="group" aria-label="Connection">
				<Alert.Title>
					<WifiOffIcon aria-hidden="true" />
					Offline
				</Alert.Title>
				<Alert.Action>
					<Button variant="ghost" size="xs" onclick={() => (retryFailed = true)}>
						<RefreshCwIcon aria-hidden="true" />
						Reconnect
					</Button>
				</Alert.Action>
			</Alert.Root>
		{/if}
		<p role="status" class="text-muted-foreground text-xs">
			{offline ? (retryFailed ? "Still offline." : "") : "Connection restored."}
		</p>
	</div>
	<Button variant="outline" size="xs" onclick={toggleConnection}>
		{offline ? "Simulate recovery" : "Simulate offline"}
	</Button>
</div>
