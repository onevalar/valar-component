<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
</script>

<div id="button-link-example" class="flex flex-wrap items-center gap-2">
	<Button href="#button-link-example" variant="secondary" shape="pill" size="sm"
		>Open example</Button
	>
	<Button href="#button-link-example" variant="secondary" shape="pill" size="sm" disabled>
		Unavailable link
	</Button>
</div>
