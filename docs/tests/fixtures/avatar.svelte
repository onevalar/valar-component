<script lang="ts">
	import * as Avatar from "../../src/lib/registry/ui/avatar/index.js";
	let { delayMs = 0 }: { delayMs?: number } = $props();
	let src = $state("/avatars/01.png");
	let status = $state("loading");

	export function setSource(value: string) {
		src = value;
	}
</script>

<Avatar.Root {delayMs} onLoadingStatusChange={(value) => (status = value)}>
	<Avatar.Image {src} alt="Lin" />
	<Avatar.Fallback>LN</Avatar.Fallback>
</Avatar.Root>
<output aria-label="Image status">{status}</output>
