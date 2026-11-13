<script lang="ts">
	import { onMount } from "svelte";
	import { Progress } from "$lib/registry/ui/progress/index.js";

	let value = $state(13);

	onMount(() => {
		const timer = setTimeout(() => (value = 66), 500);
		return () => clearTimeout(timer);
	});
</script>

<Progress {value} max={100} aria-label="Import progress" class="w-[60%]" />
