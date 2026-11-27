<script setup lang="ts">
import { Card, CardContent } from "@valar/vue-ui/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@valar/vue-ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/vue-ui/select";
import { Separator } from "@valar/vue-ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@valar/vue-ui/sidebar";
import { Switch } from "@valar/vue-ui/switch";
import { computed, ref, useId } from "vue";

const sections = [
	{
		key: "general",
		label: ["常规", "General"],
		icon: "M20 7h-9M7 7H4m16 10h-3m-4 0H4M7 4v6m10 4v6",
		rows: [
			{
				key: "emoji",
				label: ["将表情符号转换为 Emoji", "Convert emoticons to emoji"],
				description: ["输入时自动转换常见表情。", "Replace common emoticons as you type."],
			},
		],
	},
	{
		key: "appearance",
		label: ["界面与主题", "Appearance"],
		icon: "M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
		rows: [
			{
				key: "theme",
				label: ["界面主题", "Interface theme"],
				description: ["选择偏好选项。", "Choose your preferred appearance."],
			},
			{ key: "pointer", label: ["使用指针光标", "Use pointer cursors"], description: null },
		],
	},
	{
		key: "access",
		label: ["访问权限", "Access"],
		icon: "M12 22s7-3 7-10V5c-3 0-5-1-7-3-2 2-4 3-7 3v7c0 7 7 10 7 10Z",
		rows: [
			{
				key: "locked",
				label: ["限制工作区访问", "Restrict workspace access"],
				description: ["需要管理员权限", "Administrator access required"],
			},
		],
	},
] as const;

const themes = [
	{ value: "system", label: ["跟随系统", "System preference"] },
	{ value: "light", label: ["浅色", "Light"] },
	{ value: "dark", label: ["深色", "Dark"] },
] as const;

const settingsTokens = {
	"--sidebar-width-default": "204px",
	"--sidebar": "light-dark(lch(93.83% .5 282), lch(2.5% .4 272))",
	"--sidebar-foreground": "light-dark(lch(37.776% 1.25 282), lch(61.803% 1.2 272))",
	"--sidebar-accent": "light-dark(lch(89.54% .5 282), lch(13.845% 1.3 272))",
	"--sidebar-accent-foreground": "light-dark(lch(9.444% 0 282), white)",
	"--card-foreground": "light-dark(lch(9.794% 0 282), white)",
	"--muted-foreground": "light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272))",
	"--border": "light-dark(lch(92.5% 0 282), lch(18.5% .85 272))",
	"--settings-panel": "light-dark(lch(97.94% .5 282), lch(5.52% .4 272))",
	"--settings-control": "light-dark(white, lch(13.861% 1.139 272))",
	"--settings-control-hover": "light-dark(lch(95% .5 282), lch(18.49% 1.525 272))",
	"--settings-control-text": "light-dark(lch(20% 1 282), lch(90.826% 1.425 272))",
	"--settings-control-shadow": "0 0 0 .5px light-dark(#00000024, #ffffff26) inset",
	"--settings-focus": "light-dark(lch(46% 70 267), lch(48% 72 267))",
	"--settings-switch-off": "light-dark(lch(82.484% .054 281.837), lch(47.551% .913 271.998))",
};

// The native Select's body portal does not inherit the scene's color scheme.
const menuTokens = {
	"--valar-overlay-foreground": settingsTokens["--settings-control-text"],
	"--valar-overlay-background": "light-dark(white, lch(16.433% 1.3 272))",
	"--settings-menu-highlight": "light-dark(lch(94% .5 282), lch(25.69% 1.975 272))",
	borderColor: "light-dark(lch(86.5% 0 282), lch(38.032% 2.38 272))",
	"--valar-overlay-shadow":
		"0 3px 8px light-dark(rgb(0 0 0 / .04), rgb(0 0 0 / .125)), 0 1px 1px light-dark(rgb(0 0 0 / .04), rgb(0 0 0 / .125))",
};

const { chinese = false } = defineProps<{ chinese?: boolean }>();
const id = useId();
const locale = computed(() => (chinese ? 0 : 1));
const section = ref<(typeof sections)[number]["key"]>("general");
const theme = ref("system");
const switches = ref({ emoji: true, pointer: false });
const colorScheme = computed(() => (theme.value === "system" ? undefined : theme.value));
</script>

<template>
	<div
		class="@container/settings min-w-0 [color-scheme:light] dark:[color-scheme:dark]"
		:style="{ ...settingsTokens, colorScheme }"
	>
		<SidebarProvider
			:keyboard-shortcut="false"
			:persist-state="false"
			class="min-h-0 flex-col rounded-xl border border-border bg-sidebar @3xl/settings:h-[680px] @3xl/settings:flex-row"
		>
			<Sidebar
				collapsible="none"
				class="h-auto w-full shrink-0 rounded-t-xl @3xl/settings:w-(--sidebar-width) @3xl/settings:rounded-s-xl @3xl/settings:rounded-se-none"
			>
				<SidebarHeader class="gap-1 px-3 pt-4 pb-2">
					<span class="px-2.5 text-[13px] font-semibold text-sidebar-accent-foreground">{{
						chinese ? "个人设置" : "Personal settings"
					}}</span>
				</SidebarHeader>
				<SidebarContent class="px-3 pb-3">
					<nav :aria-label="chinese ? '设置导航' : 'Settings navigation'">
						<SidebarMenu class="flex-row flex-wrap gap-1 @3xl/settings:flex-col">
							<SidebarMenuItem v-for="item in sections" :key="item.key" class="shrink-0">
								<SidebarMenuButton
									as-child
									size="sm"
									:is-active="section === item.key"
									class="gap-1.5 rounded-lg px-2.5 py-0 text-[13px] [&_svg]:size-3.5"
								>
									<a
										:href="`#${id}-${item.key}`"
										:aria-current="section === item.key ? 'location' : undefined"
										@click="section = item.key"
									>
										<svg
											viewBox="0 0 24 24"
											aria-hidden="true"
											fill="none"
											stroke="currentColor"
											stroke-width="1.75"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path :d="item.icon" />
										</svg>
										<span>{{ item.label[locale] }}</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</nav>
				</SidebarContent>
			</Sidebar>

			<div
				class="min-w-0 flex-1 rounded-b-xl border-t border-border bg-(--settings-panel) text-card-foreground @3xl/settings:overflow-y-auto @3xl/settings:rounded-s-none @3xl/settings:rounded-e-xl @3xl/settings:border-s @3xl/settings:border-t-0"
			>
				<div class="mx-auto max-w-[688px] space-y-8 px-4 py-6 @xl/settings:px-6 @xl/settings:py-9">
					<h2 class="text-2xl font-semibold tracking-tight">
						{{ chinese ? "偏好设置" : "Preferences" }}
					</h2>
					<section
						v-for="item in sections"
						:id="`${id}-${item.key}`"
						:key="item.key"
						class="scroll-mt-20 space-y-3"
					>
						<h3 class="px-4 text-[15px] font-semibold">{{ item.label[locale] }}</h3>
						<Card size="settings">
							<CardContent>
								<FieldGroup class="gap-0">
									<template v-for="(row, index) in item.rows" :key="row.key">
										<div v-if="index > 0" class="px-4"><Separator decorative /></div>
										<Field
											appearance="settings"
											orientation="responsive"
											:data-disabled="row.key === 'locked' || undefined"
											class="min-h-16 items-start @md/field-group:items-center"
										>
											<FieldContent>
												<FieldLabel
													:id="`${id}-${row.key}-label`"
													:for="`${id}-${row.key}`"
													class="text-card-foreground!"
													>{{ row.label[locale] }}</FieldLabel
												>
												<FieldDescription
													v-if="row.description"
													:id="`${id}-${row.key}-description`"
													class="text-muted-foreground!"
													>{{ row.description[locale] }}</FieldDescription
												>
											</FieldContent>
											<Select v-if="row.key === 'theme'" v-model="theme">
												<SelectTrigger
													:id="`${id}-${row.key}`"
													:aria-labelledby="`${id}-${row.key}-label`"
													:aria-describedby="`${id}-${row.key}-description`"
													class="w-full shrink-0 @md/field-group:w-auto"
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent
													align="end"
													:collision-padding="8"
													:aria-label="row.label[locale]"
													class="min-w-[202px] [color-scheme:light] dark:[color-scheme:dark]"
													:style="{ ...menuTokens, colorScheme }"
												>
													<SelectItem
														v-for="option in themes"
														:key="option.value"
														:value="option.value"
														>{{ option.label[locale] }}</SelectItem
													>
												</SelectContent>
											</Select>
											<div v-else class="flex shrink-0 items-center">
												<Switch
													:id="`${id}-${row.key}`"
													appearance="settings"
													:aria-describedby="
														row.description ? `${id}-${row.key}-description` : undefined
													"
													:disabled="row.key === 'locked'"
													:model-value="row.key === 'locked' ? false : switches[row.key]"
													@update:model-value="
														(checked) => {
															if (row.key !== 'locked') switches[row.key] = checked === true;
														}
													"
												/>
											</div>
										</Field>
									</template>
								</FieldGroup>
							</CardContent>
						</Card>
					</section>
				</div>
			</div>
		</SidebarProvider>
	</div>
</template>
