"use client";

import { Card, CardContent } from "@valar/react-ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@valar/react-ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/react-ui/select";
import { Separator } from "@valar/react-ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@valar/react-ui/sidebar";
import { Switch } from "@valar/react-ui/switch";
import { Fragment, useId, useState, type CSSProperties } from "react";

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

export default function Settings({ chinese = false }: { chinese?: boolean }) {
	const id = useId();
	const locale = chinese ? 0 : 1;
	const [section, setSection] = useState<(typeof sections)[number]["key"]>("general");
	const [theme, setTheme] = useState("system");
	const [switches, setSwitches] = useState({ emoji: true, pointer: false });
	const colorScheme = theme === "system" ? undefined : theme;
	const schemeClass = "[color-scheme:light] dark:[color-scheme:dark]";

	return (
		<div
			className={`@container/settings min-w-0 ${schemeClass}`}
			style={{ ...settingsTokens, colorScheme } as CSSProperties}
		>
			<SidebarProvider
				keyboardShortcut={false}
				persistState={false}
				className="min-h-0 flex-col rounded-xl border border-border bg-sidebar @3xl/settings:h-[680px] @3xl/settings:flex-row"
			>
				<Sidebar
					collapsible="none"
					className="h-auto w-full shrink-0 rounded-t-xl @3xl/settings:w-(--sidebar-width) @3xl/settings:rounded-s-xl @3xl/settings:rounded-se-none"
				>
					<SidebarHeader className="gap-1 px-3 pt-4 pb-2">
						<span className="px-2.5 text-[13px] font-semibold text-sidebar-accent-foreground">
							{chinese ? "个人设置" : "Personal settings"}
						</span>
					</SidebarHeader>
					<SidebarContent className="px-3 pb-3">
						<nav aria-label={chinese ? "设置导航" : "Settings navigation"}>
							<SidebarMenu className="flex-row flex-wrap gap-1 @3xl/settings:flex-col">
								{sections.map(({ key, label, icon }) => (
									<SidebarMenuItem key={key} className="shrink-0">
										<SidebarMenuButton
											asChild
											size="sm"
											isActive={section === key}
											className="gap-1.5 rounded-lg px-2.5 py-0 text-[13px] [&_svg]:size-3.5"
										>
											<a
												href={`#${id}-${key}`}
												aria-current={section === key ? "location" : undefined}
												onClick={() => setSection(key)}
											>
												<svg
													viewBox="0 0 24 24"
													aria-hidden="true"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.75"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d={icon} />
												</svg>
												<span>{label[locale]}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</nav>
					</SidebarContent>
				</Sidebar>

				<div className="min-w-0 flex-1 rounded-b-xl border-t border-border bg-(--settings-panel) text-card-foreground @3xl/settings:overflow-y-auto @3xl/settings:rounded-s-none @3xl/settings:rounded-e-xl @3xl/settings:border-s @3xl/settings:border-t-0">
					<div className="mx-auto max-w-[688px] space-y-8 px-4 py-6 @xl/settings:px-6 @xl/settings:py-9">
						<h2 className="text-2xl font-semibold tracking-tight">
							{chinese ? "偏好设置" : "Preferences"}
						</h2>
						{sections.map(({ key, label, rows }) => (
							<section key={key} id={`${id}-${key}`} className="scroll-mt-20 space-y-3">
								<h3 className="px-4 text-[15px] font-semibold">{label[locale]}</h3>
								<Card size="settings">
									<CardContent>
										<FieldGroup className="gap-0">
											{rows.map((row, index) => {
												const controlId = `${id}-${row.key}`;
												const descriptionId = row.description
													? `${controlId}-description`
													: undefined;
												return (
													<Fragment key={row.key}>
														{index > 0 && (
															<div className="px-4">
																<Separator decorative />
															</div>
														)}
														<Field
															appearance="settings"
															orientation="responsive"
															data-disabled={row.key === "locked" || undefined}
															className="min-h-16 items-start @md/field-group:items-center"
														>
															<FieldContent>
																<FieldLabel
																	id={`${controlId}-label`}
																	htmlFor={controlId}
																	className="text-card-foreground!"
																>
																	{row.label[locale]}
																</FieldLabel>
																{row.description && (
																	<FieldDescription
																		id={descriptionId}
																		className="text-muted-foreground!"
																	>
																		{row.description[locale]}
																	</FieldDescription>
																)}
															</FieldContent>
															{row.key === "theme" ? (
																<Select value={theme} onValueChange={setTheme}>
																	<SelectTrigger
																		id={controlId}
																		aria-labelledby={`${controlId}-label`}
																		aria-describedby={descriptionId}
																		className="w-full shrink-0 @md/field-group:w-auto"
																	>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent
																		align="end"
																		collisionPadding={8}
																		aria-label={row.label[locale]}
																		className={`min-w-[202px] ${schemeClass}`}
																		style={{ ...menuTokens, colorScheme } as CSSProperties}
																	>
																		{themes.map((option) => (
																			<SelectItem key={option.value} value={option.value}>
																				{option.label[locale]}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															) : (
																<div className="flex shrink-0 items-center">
																	<Switch
																		id={controlId}
																		appearance="settings"
																		aria-describedby={descriptionId}
																		disabled={row.key === "locked"}
																		checked={row.key === "locked" ? false : switches[row.key]}
																		onCheckedChange={(checked) => {
																			if (row.key !== "locked")
																				setSwitches((previous) => ({
																					...previous,
																					[row.key]: checked,
																				}));
																		}}
																	/>
																</div>
															)}
														</Field>
													</Fragment>
												);
											})}
										</FieldGroup>
									</CardContent>
								</Card>
							</section>
						))}
					</div>
				</div>
			</SidebarProvider>
		</div>
	);
}
