<script lang="ts">
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import { useHighlightedCode } from "$lib/registry/hooks/use-highlighted-code.svelte.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";

	// Keep sample imports as text for Vite’s dependency scanner.
	const chat = `"use client"

im${""}port * as React from "react"
im${""}port { useChat } from "@ai-sdk/react"

im${""}port { Button } from "@/components/ui/button"
im${""}port { Input } from "@/components/ui/input"

export function Chat() {
  const [input, setInput] = React.useState("")
  const { messages, sendMessage, status } = useChat()

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, index) =>
            part.type === "text" ? <p key={index}>{part.text}</p> : null
          )}
        </div>
      ))}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sendMessage({ text: input })
          setInput("")
        }}
      >
        <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask anything" />
        <Button disabled={status !== "ready"}>Send</Button>
      </form>
    </div>
  )
}`;

	const lines = useHighlightedCode(
		() => chat,
		() => "tsx"
	);
</script>

<Example title="Wrap and Line Numbers">
	<CodeBlock.Root>
		<CodeBlock.Header>
			<CodeBlock.Title>components/chat.tsx</CodeBlock.Title>
		</CodeBlock.Header>
		<CodeBlock.Content wrap lineNumbers>
			{#each lines.current as line, index (index)}
				<CodeBlock.Line code={line} />
			{/each}
		</CodeBlock.Content>
	</CodeBlock.Root>
</Example>
