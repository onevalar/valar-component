<script lang="ts">
	import CircleIcon from "@lucide/svelte/icons/circle";
	import { Button } from "$lib/registry/ui/button/index.js";

	let unreadOnly = $state(false);
</script>

<div class="flex flex-wrap items-center gap-2">
	<Button>Create team</Button>
	<Button variant="outline">Export CSV</Button>
	<Button variant="ghost">Customize sidebar</Button>
	<Button
		variant="ghost"
		size="icon-sm"
		aria-label="Show unread only"
		aria-pressed={unreadOnly}
		onclick={() => (unreadOnly = !unreadOnly)}
	>
		<CircleIcon aria-hidden="true" />
	</Button>
</div>
