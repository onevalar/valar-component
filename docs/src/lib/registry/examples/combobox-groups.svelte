<script lang="ts">
	import { Combobox } from "$lib/registry/ui/combobox/index.js";

	const timezones = [
		{
			value: "Americas",
			items: [
				"(GMT-5) New York",
				"(GMT-8) Los Angeles",
				"(GMT-6) Chicago",
				"(GMT-5) Toronto",
				"(GMT-8) Vancouver",
				"(GMT-3) São Paulo",
			],
		},
		{
			value: "Europe",
			items: [
				"(GMT+0) London",
				"(GMT+1) Paris",
				"(GMT+1) Berlin",
				"(GMT+1) Rome",
				"(GMT+1) Madrid",
				"(GMT+1) Amsterdam",
			],
		},
		{
			value: "Asia/Pacific",
			items: [
				"(GMT+9) Tokyo",
				"(GMT+8) Shanghai",
				"(GMT+8) Singapore",
				"(GMT+4) Dubai",
				"(GMT+11) Sydney",
				"(GMT+9) Seoul",
			],
		},
	];

	const options = timezones.flatMap((group) =>
		group.items.map((label) => ({ id: label, label, group: group.value }))
	);
</script>

<Combobox
	label="Select a timezone"
	placeholder="Search timezones…"
	empty="No matching timezones."
	{options}
	contentClass="w-60"
/>
