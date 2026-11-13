<script lang="ts">
	import { Combobox } from "$lib/registry/ui/combobox/index.js";

	const options = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"].map((label) => ({
		id: label,
		label,
	}));
</script>

<Combobox
	label="Select a framework"
	placeholder="Search frameworks…"
	empty="No matching frameworks."
	{options}
/>
