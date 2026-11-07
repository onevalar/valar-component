<script lang="ts">
	import * as Sheet from "$lib/registry/ui/sheet/index.js";
	import { agentPanel } from "$lib/agent/panel.svelte.js";
	import AgentChat from "./agent-chat.svelte";

	function onKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
			event.preventDefault();
			agentPanel.open = !agentPanel.open;
		}
	}
</script>

<svelte:document onkeydown={onKeydown} />

<!-- The side drawer shows the same conversation as the home page. -->
<Sheet.Root bind:open={agentPanel.open}>
	<Sheet.Content side="right" closeLabel="关闭助手" class="gap-0 p-0">
		<Sheet.Header class="sr-only">
			<Sheet.Title>组件助手</Sheet.Title>
			<Sheet.Description
				>向助手描述需求，它会查询组件库，推荐组件并用它们拼出界面。</Sheet.Description
			>
		</Sheet.Header>
		<AgentChat variant="panel" />
	</Sheet.Content>
</Sheet.Root>
