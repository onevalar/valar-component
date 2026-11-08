<script lang="ts">
	// Resolve the package's public export, including the generated runtime neighbors.
	import * as Sidebar from "@valar/svelte-ui/sidebar";

	let {
		keyboardShortcut = $bindable(),
		onOpenChange,
	}: {
		keyboardShortcut?: boolean;
		onOpenChange: (open: boolean) => void;
	} = $props();
	let open = $state(true);
	let announcement = $state("");
	// Empty is valid HTML, but not part of Svelte's contenteditable attribute type.
	const emptyEditable = (node: HTMLDivElement) => node.setAttribute("contenteditable", "");
</script>

<button
	type="button"
	data-testid="configure"
	onclick={() => (keyboardShortcut = keyboardShortcut === false)}
>
	Configure shortcut
</button>
<Sidebar.Provider
	bind:open
	{keyboardShortcut}
	onOpenChange={(next) => {
		announcement = next ? "Sidebar expanded" : "Sidebar collapsed";
		onOpenChange(next);
	}}
>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Content>Navigation</Sidebar.Content>
		<Sidebar.Rail />
	</Sidebar.Root>
	<Sidebar.Trigger />
	<button type="button" data-testid="ordinary">Ordinary button</button>
	<input aria-label="Input" data-testid="input" />
	<textarea aria-label="Textarea" data-testid="textarea"></textarea>
	<div contenteditable="true" data-testid="editor">
		<span data-testid="editor-child"
			><strong data-testid="editor-grandchild">Edit here</strong></span
		>
		<svg aria-hidden="true"><text data-testid="editor-svg">SVG text</text></svg>
	</div>
	<div use:emptyEditable data-testid="editor-empty">Empty attribute</div>
	<div contenteditable="plaintext-only" data-testid="editor-plaintext">Plain text</div>
	<button type="button" contenteditable="false" data-testid="not-editor">Not editable</button>
	<span data-testid="bound-open">{String(open)}</span>
	<div role="status">{announcement}</div>
</Sidebar.Provider>
