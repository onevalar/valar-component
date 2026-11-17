<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { RulerSlider } from "$lib/registry/ui/ruler-slider/index.js";
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
</script>

<RulerSlider
	label={text("参考预算", "Reference budget")}
	defaultValue={50}
	class="w-full max-w-md"
/>
