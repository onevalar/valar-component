<script lang="ts">
	import AgentChat from "$lib/components/agent-chat.svelte";
	import Metadata from "$lib/components/metadata.svelte";
</script>

<Metadata
	title="Valar Svelte"
	description="问组件怎么选，或让助手用库里的组件拼一个界面。查到的、拼出来的都来自这个站。"
/>

<!-- The home page is the assistant: ask a question, or ask it to draw an interface from the library. -->
<div class="container-wrapper flex h-[calc(100svh-var(--header-height))] min-h-[32rem] flex-col">
	<AgentChat />
</div>
