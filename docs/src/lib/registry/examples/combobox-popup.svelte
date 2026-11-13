<script lang="ts">
	import { Combobox } from "$lib/registry/ui/combobox/index.js";

	const countries = [
		{ code: "", value: "", continent: "", label: "Select country" },
		{ code: "ar", value: "argentina", label: "Argentina", continent: "South America" },
		{ code: "au", value: "australia", label: "Australia", continent: "Oceania" },
		{ code: "br", value: "brazil", label: "Brazil", continent: "South America" },
		{ code: "ca", value: "canada", label: "Canada", continent: "North America" },
		{ code: "cn", value: "china", label: "China", continent: "Asia" },
		{ code: "co", value: "colombia", label: "Colombia", continent: "South America" },
		{ code: "eg", value: "egypt", label: "Egypt", continent: "Africa" },
		{ code: "fr", value: "france", label: "France", continent: "Europe" },
		{ code: "de", value: "germany", label: "Germany", continent: "Europe" },
		{ code: "it", value: "italy", label: "Italy", continent: "Europe" },
		{ code: "jp", value: "japan", label: "Japan", continent: "Asia" },
		{ code: "ke", value: "kenya", label: "Kenya", continent: "Africa" },
		{ code: "mx", value: "mexico", label: "Mexico", continent: "North America" },
		{ code: "nz", value: "new-zealand", label: "New Zealand", continent: "Oceania" },
		{ code: "ng", value: "nigeria", label: "Nigeria", continent: "Africa" },
		{ code: "za", value: "south-africa", label: "South Africa", continent: "Africa" },
		{ code: "kr", value: "south-korea", label: "South Korea", continent: "Asia" },
		{ code: "gb", value: "united-kingdom", label: "United Kingdom", continent: "Europe" },
		{ code: "us", value: "united-states", label: "United States", continent: "North America" },
	];

	const options = countries
		.filter((country) => country.code !== "")
		.map((country) => ({ id: country.value, label: country.label, keywords: [country.code] }));
	let value = $state<readonly string[]>([]);
	const country = $derived(countries.find((country) => country.value === value[0]));
</script>

<Combobox
	label="Choose a country"
	placeholder="Find a country…"
	empty="No matching countries."
	{options}
	bind:value
	side="right"
	contentClass="w-64"
>
	{#snippet children()}
		<span>{country?.label ?? "+ Set country"}</span>
	{/snippet}
</Combobox>
