<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
</script>

<InputGroup.Root class="max-w-xs">
	<InputGroup.Input aria-label="Search components" placeholder="Search..." />
	<InputGroup.Addon aria-hidden="true">
		<SearchIcon />
	</InputGroup.Addon>
	<InputGroup.Addon align="inline-end">12 results</InputGroup.Addon>
</InputGroup.Root>
