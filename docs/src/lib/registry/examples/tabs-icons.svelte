<script lang="ts">
	import AppWindowIcon from "@lucide/svelte/icons/app-window";
	import CodeIcon from "@lucide/svelte/icons/code";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
</script>

<Tabs.Root value="preview" class="w-full max-w-xs">
	<Tabs.List aria-label="Preview format">
		<Tabs.Trigger value="preview">
			<AppWindowIcon data-icon="inline-start" aria-hidden="true" />
			Preview
		</Tabs.Trigger>
		<Tabs.Trigger value="code">
			<CodeIcon data-icon="inline-start" aria-hidden="true" />
			Code
		</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="preview">Inspect the rendered project.</Tabs.Content>
	<Tabs.Content value="code">Inspect the project source.</Tabs.Content>
</Tabs.Root>
