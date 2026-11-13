<script lang="ts">
	import { buttonVariants } from "$lib/registry/ui/button/index.js";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as Kbd from "$lib/registry/ui/kbd/index.js";

	let showShortcuts = $state(false);

	function toggleShortcuts() {
		showShortcuts = !showShortcuts;
	}
</script>

<div class="flex w-full max-w-xs flex-col items-start gap-4">
	<dl class="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 text-sm">
		<dt>Move to the next control</dt>
		<dd class="justify-self-end"><Kbd.Root>Tab</Kbd.Root></dd>
		<dt>Move to the previous control</dt>
		<dd class="justify-self-end">
			<Kbd.Group aria-label="Shift and Tab">
				<Kbd.Root>⇧</Kbd.Root>
				<Kbd.Root>Tab</Kbd.Root>
			</Kbd.Group>
		</dd>
	</dl>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}
			aria-keyshortcuts="Shift+S"
			onkeydown={(event) => {
				if (event.shiftKey && event.code === "KeyS" && !event.repeat) {
					event.preventDefault();
					toggleShortcuts();
				}
			}}
		>Help</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start">
			<DropdownMenu.Item onclick={toggleShortcuts}>
				{showShortcuts ? "Hide shortcuts" : "Show shortcuts"}
				<Kbd.Group class="ml-auto" aria-label="Shift and S">
					<Kbd.Root appearance="inline">⇧</Kbd.Root>
					<Kbd.Root appearance="inline">S</Kbd.Root>
				</Kbd.Group>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{showShortcuts ? "Shortcuts are shown" : "Shortcuts are hidden"}
	</p>
</div>
