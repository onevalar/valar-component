<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { ColorPicker } from "$lib/registry/ui/color-picker/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let color = $state("#eb5757");
	const presets = [
		["灰色", "Grey", "#a2a6ac"],
		["深灰色", "Dark Grey", "#95a2b3"],
		["紫色", "Purple", "#5e6ad2"],
		["青色", "Teal", "#26b5ce"],
		["绿色", "Green", "#4cb782"],
		["黄色", "Yellow", "#f0bf00"],
		["橙色", "Orange", "#e78f41"],
		["粉色", "Pink", "#c79b94"],
		["红色", "Red", "#eb5757"]
	] as const;
	const localPresets = $derived(presets.map(([zh, en, color]) => ({ label: text(zh, en), color })));
	const labels = $derived({
		custom: text("设置自定义颜色", "Set custom color"),
		palette: text("选择预设颜色", "Select default color"),
		area: text("饱和度和亮度", "Saturation and brightness"),
		hue: text("色相", "Hue"),
		invalidHex: text("请输入有效的十六进制颜色。", "Enter a valid hex color.")
	});
</script>

<section aria-label={text("问题标签", "Issue label")} class="grid w-full max-w-sm gap-2">
	<div class="flex min-w-0 items-center gap-1.5 rounded-[8px] border border-border px-2 py-1.5">
		<ColorPicker
			appearance="label"
			label={text("标签颜色", "Label color")}
			name="label-color"
			bind:value={color}
			presets={localPresets}
			{labels}
		/>
		<span class="min-w-0 truncate text-[13px]">{text("界面细节", "Interface details")}</span>
	</div>
	<div
		class="flex min-w-0 items-center gap-1.5 rounded-[8px] border border-border px-2 py-1.5 text-muted-foreground"
	>
		<ColorPicker
			appearance="label"
			label={text("锁定的标签颜色", "Locked label color")}
			value="#95a2b3"
			disabled
			presets={localPresets}
			{labels}
		/>
		<span class="min-w-0 truncate text-[13px]">{text("继承标签", "Inherited label")}</span>
	</div>
</section>
