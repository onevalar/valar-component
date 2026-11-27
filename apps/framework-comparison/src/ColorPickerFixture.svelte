<script lang="ts">
	import { ColorPicker } from "@valar/svelte-ui/color-picker";
	let color = $state("#2563eb");
</script>

<form aria-label="Appearance settings" class="grid w-full max-w-xs gap-3 p-6 text-sm">
	<ColorPicker
		bind:value={color}
		label="工作区强调色"
		name="accent"
		presets={["#2563eb", "#0f766e", "#b45309", "#be123c"]}
	/>
	<p role="status">{color}</p>
</form>
