<script lang="ts">
	import * as Table from "$lib/registry/ui/table/index.js";
	import { Typography } from "$lib/registry/ui/typography/index.js";

	const results = [
		{ check: "Reconnect", scenario: "Resume pending changes", status: "Verified" },
		{ check: "Keyboard", scenario: "Open the review link", status: "Verified" },
		{ check: "Narrow screen", scenario: "Read a long command", status: "Verified" },
	];
</script>

<Typography class="w-full max-w-xl [contain:inline-size]">
	<Table.Root class="min-w-96" scroll="overlay" scrollLabel="Scroll release checks">
		<Table.Caption>Release checks</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head scope="col">Check</Table.Head>
				<Table.Head scope="col">Scenario</Table.Head>
				<Table.Head scope="col">Status</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each results as result (result.check)}
				<Table.Row>
					<Table.Cell>{result.check}</Table.Cell>
					<Table.Cell>{result.scenario}</Table.Cell>
					<Table.Cell>{result.status}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</Typography>
