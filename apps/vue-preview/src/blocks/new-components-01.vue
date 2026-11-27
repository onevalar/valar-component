<script setup lang="ts">
import { Avatar, AvatarFallback } from "@valar/vue-ui/avatar";
import { Badge } from "@valar/vue-ui/badge";
import { Button } from "@valar/vue-ui/button";
import { ButtonGroup } from "@valar/vue-ui/button-group";
import { Checkbox } from "@valar/vue-ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/vue-ui/command";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@valar/vue-ui/empty";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from "@valar/vue-ui/field";
import { Input } from "@valar/vue-ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from "@valar/vue-ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@valar/vue-ui/item";
import { NumberField } from "@valar/vue-ui/number-field";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/vue-ui/popover";
import { RadioGroup, RadioGroupItem } from "@valar/vue-ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/vue-ui/select";
import { Slider } from "@valar/vue-ui/slider";
import { Spinner } from "@valar/vue-ui/spinner";
import { Switch } from "@valar/vue-ui/switch";
import { Textarea } from "@valar/vue-ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@valar/vue-ui/tooltip";
import { computed, ref, useId } from "vue";

// Adapted from Valar's new-components-01 Svelte registry block (see repository LICENSE.md).
// No payments, invitations, MFA, audio capture, file uploads, integrations or AI requests are made.
const props = defineProps<{ chinese?: boolean }>();
const t = (english: string, chinese: string) => (props.chinese ? chinese : english);
const id = useId();
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const years = ["2024", "2025", "2026", "2027", "2028", "2029"];
const mentionable = [
	["📝", "Meeting Notes", "会议记录"],
	["📊", "Project Dashboard", "项目仪表板"],
	["💡", "Ideas & Brainstorming", "灵感与头脑风暴"],
	["📅", "Calendar & Events", "日程与活动"],
	["📚", "Documentation", "文档"],
	["🎯", "Goals & Objectives", "目标"],
	["💰", "Budget Planning", "预算规划"],
	["👥", "Team Directory", "团队目录"],
	["🔧", "Technical Specs", "技术规范"],
	["📈", "Analytics Report", "分析报告"],
] as const;
const people = ["Valar", "maxleiter", "evilrabbit"];
const accents = ["bg-chart-2!", "bg-chart-3!", "bg-chart-4!", "bg-chart-5!"];
const paymentStatus = ref("");
const resetKey = ref(0);
const accent = ref("0");
const compute = ref("kubernetes");
const tint = ref(true);
const invited = ref(false);
const voice = ref(false);
const budget = ref([200, 800]);
const query = ref("");
const quickText = ref("");
const quickMode = ref("Auto");
const quickStatus = ref("");
const favorite = ref(false);
const verified = ref(false);
const mfa = ref(false);
const page = ref(1);
const label = ref("personal");
const mail = ref("");
const copilot = ref(false);
const task = ref("");
const taskStatus = ref("");
const processing = ref(true);
const modes = [
	["Auto", "自动"],
	["Agent", "代理"],
	["Manual", "手动"],
];
const mailActions = [
	["Mark as Read", "标为已读"],
	["Archive", "归档"],
	["Snooze", "暂缓"],
	["Add to Calendar", "添加到日历"],
	["Add to List", "添加到列表"],
];
const labelOptions = computed(() => [
	["personal", t("Personal", "个人")],
	["work", t("Work", "工作")],
	["other", t("Other", "其他")],
]);
const preview = computed(() => t("Local demo only.", "仅作本地演示。"));
const searchItems = computed(() => [
	...mentionable.map(([, key, translation]) => t(key, translation)),
	people[0],
	people[1],
]);
const results = computed(() =>
	searchItems.value.filter((item) =>
		item.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase())
	)
);

const fileInput = ref<HTMLInputElement>();
const text = ref("");
const mentions = ref<string[]>([]);
const files = ref<string[]>([]);
const contextOpen = ref(false);
const model = ref("auto");
const web = ref(true);
const apps = ref(true);
const scope = ref("all");
const promptStatus = ref("");
const promptModes = computed(() => [
	["auto", t("Auto", "自动")],
	["agent", t("Agent Mode", "代理模式")],
	["plan", t("Plan Mode", "计划模式")],
]);
const scopes = computed(() => [
	["all", t("All Sources I can access", "我可访问的全部来源")],
	["help", t("Help Center", "帮助中心")],
]);
const context = computed(() => [
	...mentionable.map(([icon, key, translation]) => ({
		icon,
		key,
		label: t(key, translation),
		page: true,
	})),
	...people.map((key) => ({ icon: "", key, label: key, page: false })),
]);
const mentionLabel = (key: string) => context.value.find((item) => item.key === key)?.label ?? key;

function submitPayment(event: SubmitEvent) {
	if (!(event.currentTarget instanceof HTMLFormElement)) return;
	event.currentTarget.reset();
	paymentStatus.value = t(
		"Demo form submitted. No payment was processed.",
		"演示表单已提交，未处理任何付款。"
	);
}
function resetPayment() {
	resetKey.value += 1;
	paymentStatus.value = t("Form cleared.", "表单已清空。");
}
function submitQuick() {
	if (!quickText.value.trim()) return;
	quickStatus.value = `${t("Message sent locally", "消息已在本地发送")} · ${quickMode.value}`;
	quickText.value = "";
}
function submitPrompt() {
	if (!text.value.trim()) return;
	promptStatus.value = t(
		"Prompt submitted locally. No AI request was sent.",
		"提示词已在本地提交，未发送 AI 请求。"
	);
	text.value = "";
	mentions.value = [];
	files.value = [];
}
function chooseFiles(event: Event) {
	const input = event.currentTarget;
	if (!(input instanceof HTMLInputElement)) return;
	files.value = Array.from(
		new Set([...files.value, ...Array.from(input.files ?? [], (file) => file.name)])
	);
	input.value = "";
}
function saveTask() {
	if (!task.value.trim()) return;
	taskStatus.value = t(
		"Task saved locally. No pull request was created.",
		"任务已在本地保存，未创建拉取请求。"
	);
	task.value = "";
	copilot.value = false;
}
</script>

<template>
	<TooltipProvider
		><section
			:aria-label="t('New Components', '新组件')"
			class="@container/gallery mx-auto w-full max-w-[2200px] min-w-0 p-4 sm:p-6"
		>
			<div
				class="grid gap-6 @min-[1360px]/gallery:grid-cols-4 @2xl/gallery:grid-cols-2 @5xl/gallery:grid-cols-3"
			>
				<form
					:aria-label="t('Payment Method', '付款方式')"
					class="min-w-0"
					autocomplete="off"
					@submit.prevent="submitPayment"
					@reset="resetPayment"
				>
					<FieldGroup>
						<FieldSet :key="`payment-${resetKey}`">
							<FieldLegend>{{ t("Payment Method", "付款方式") }}</FieldLegend>
							<FieldDescription>{{
								t(
									"Use sample values only. This form does not send or store card details.",
									"请仅使用示例值。此表单不会发送或保存卡片信息。"
								)
							}}</FieldDescription>
							<FieldGroup>
								<Field
									><FieldLabel :for="`${id}-name`">{{ t("Name on Card", "持卡人姓名") }}</FieldLabel
									><Input :id="`${id}-name`" placeholder="Evil Rabbit" required
								/></Field>
								<Field
									><FieldLabel :for="`${id}-number`">{{ t("Card Number", "卡号") }}</FieldLabel
									><Input
										:id="`${id}-number`"
										:aria-describedby="`${id}-number-hint`"
										placeholder="1234 5678 9012 3456"
										inputmode="numeric"
										pattern="[0-9]{4} ?[0-9]{4} ?[0-9]{4} ?[0-9]{4}"
										:maxlength="19"
										required
									/><FieldDescription :id="`${id}-number-hint`">{{
										t("Enter a 16-digit sample card number.", "请输入 16 位示例卡号。")
									}}</FieldDescription></Field
								>
								<div class="grid grid-cols-3 gap-2">
									<Field
										v-for="{ field, label: title, placeholder, options } in [
											{
												field: 'month',
												label: t('Month', '月份'),
												placeholder: 'MM',
												options: months,
											},
											{
												field: 'year',
												label: t('Year', '年份'),
												placeholder: 'YYYY',
												options: years,
											},
										]"
										:key="field"
										class="min-w-0"
									>
										<FieldLabel :for="`${id}-${field}`">{{ title }}</FieldLabel
										><Select required :name="field"
											><SelectTrigger :id="`${id}-${field}`" class="min-w-0"
												><SelectValue :placeholder="placeholder" /></SelectTrigger
											><SelectContent
												><SelectItem v-for="value in options" :key="value" :value="value">{{
													value
												}}</SelectItem></SelectContent
											></Select
										>
									</Field>
									<Field class="min-w-0"
										><FieldLabel :for="`${id}-cvv`">CVV</FieldLabel
										><Input
											:id="`${id}-cvv`"
											placeholder="123"
											inputmode="numeric"
											pattern="[0-9]{3}"
											:maxlength="3"
											required
											class="min-w-0"
									/></Field>
								</div>
							</FieldGroup>
						</FieldSet>
						<FieldSeparator />
						<FieldSet :key="`billing-${resetKey}`"
							><FieldLegend>{{ t("Billing Address", "账单地址") }}</FieldLegend
							><Field orientation="horizontal"
								><Checkbox :id="`${id}-same`" :default-value="true" /><FieldLabel
									:for="`${id}-same`"
									>{{ t("Same as shipping address", "与收货地址相同") }}</FieldLabel
								></Field
							></FieldSet
						>
						<FieldSeparator />
						<Field :key="`comments-${resetKey}`"
							><FieldLabel :for="`${id}-comments`">{{ t("Comments", "备注") }}</FieldLabel
							><Textarea
								:id="`${id}-comments`"
								:placeholder="t('Add any additional comments', '添加备注')"
						/></Field>
						<div class="flex flex-wrap gap-2">
							<Button type="submit">{{ t("Submit", "提交") }}</Button
							><Button type="reset" variant="outline">{{ t("Cancel", "取消") }}</Button>
						</div>
						<output role="status" class="text-xs text-muted-foreground">{{ paymentStatus }}</output>
					</FieldGroup>
				</form>
				<div class="grid min-w-0 content-start gap-6">
					<Empty class="border-[0.5px] border-border"
						><EmptyHeader
							><EmptyMedia
								><div class="flex -space-x-1" aria-hidden="true">
									<Avatar v-for="initials in ['V', 'LR', 'ER']" :key="initials"
										><AvatarFallback>{{ initials }}</AvatarFallback></Avatar
									>
								</div></EmptyMedia
							><EmptyTitle>{{ t("No Team Members", "暂无团队成员") }}</EmptyTitle
							><EmptyDescription>{{
								t("Invite your team to collaborate on this project.", "邀请团队协作完成此项目。")
							}}</EmptyDescription></EmptyHeader
						><EmptyContent>
							<Button size="sm" @click="invited = !invited">{{
								invited ? t("Undo invitation", "撤销邀请") : t("Invite Members", "邀请成员")
							}}</Button
							><output v-if="invited" role="status">{{
								t("Sample invitation created locally.", "已在本地创建示例邀请。")
							}}</output>
						</EmptyContent></Empty
					>
					<ButtonGroup class="w-full min-w-0" :aria-label="t('Message controls', '消息控件')">
						<Button
							variant="outline"
							size="icon"
							:aria-label="t('Add message context', '添加消息上下文')"
							@click="quickStatus = `${t('Message context', '消息上下文')} · ${preview}`"
							><span aria-hidden="true">＋</span></Button
						>
						<InputGroup class="min-w-0"
							><InputGroupInput
								:disabled="voice"
								:aria-label="t('Message', '消息')"
								:placeholder="
									voice
										? t('Record and send audio...', '录制并发送音频…')
										: t('Send a message...', '发送消息…')
								"
							/><InputGroupAddon align="inline-end">
								<Tooltip
									><TooltipTrigger as-child
										><InputGroupButton
											size="icon-xs"
											:aria-label="t('Voice Mode', '语音模式')"
											:aria-pressed="voice"
											@click="voice = !voice"
											><span aria-hidden="true">◉</span></InputGroupButton
										></TooltipTrigger
									><TooltipContent>{{ t("Voice Mode", "语音模式") }}</TooltipContent></Tooltip
								>
							</InputGroupAddon></InputGroup
						>
					</ButtonGroup>
					<p v-if="voice" class="-mt-4 text-xs text-muted-foreground">
						{{ t("Voice mode preview. No audio is recorded.", "语音模式预览，不会录音。") }}
					</p>
					<Field
						><FieldTitle>{{ t("Price Range", "价格范围") }}</FieldTitle
						><FieldDescription
							>{{ t("Set your budget range", "设置预算范围") }}
							<span class="tabular-nums"
								>(${{ budget[0] }}–${{ budget[1] }})</span
							></FieldDescription
						><Slider
							type="multiple"
							:model-value="budget"
							@update:model-value="
								(value) => {
									if (value) budget = value;
								}
							"
							:min="0"
							:max="1000"
							:step="10"
							:thumb-labels="[t('Minimum price', '最低价格'), t('Maximum price', '最高价格')]"
							class="mt-2"
					/></Field>
					<div class="grid gap-2">
						<InputGroup
							><InputGroupAddon aria-hidden="true">⌕</InputGroupAddon
							><InputGroupInput
								v-model="query"
								:aria-label="t('Search', '搜索')"
								:placeholder="t('Search...', '搜索…')"
							/><InputGroupAddon align="inline-end"
								><output>{{ results.length }} {{ t("results", "项结果") }}</output></InputGroupAddon
							></InputGroup
						>
						<ul
							v-if="query.trim()"
							class="grid gap-1 text-xs text-muted-foreground"
							:aria-label="t('Search results', '搜索结果')"
						>
							<li v-for="item in results" :key="item">{{ item }}</li>
							<li v-if="!results.length">{{ t("No results", "没有结果") }}</li>
						</ul>
						<InputGroup
							><InputGroupAddon aria-hidden="true"
								><InputGroupText>https://</InputGroupText></InputGroupAddon
							><InputGroupInput
								:aria-label="t('Example domain', '示例域名')"
								placeholder="example.com"
							/><InputGroupAddon align="inline-end"
								><Tooltip
									><TooltipTrigger as-child
										><InputGroupButton
											size="icon-xs"
											:aria-label="t('About this URL', '关于此网址')"
											><span aria-hidden="true">ⓘ</span></InputGroupButton
										></TooltipTrigger
									><TooltipContent>{{
										t("This is content in a tooltip.", "这是工具提示中的内容。")
									}}</TooltipContent></Tooltip
								></InputGroupAddon
							></InputGroup
						>
						<form @submit.prevent="submitQuick">
							<InputGroup
								><InputGroupTextarea
									v-model="quickText"
									:aria-label="t('Ask, Search or Chat', '提问、搜索或聊天')"
									:placeholder="t('Ask, Search or Chat...', '提问、搜索或聊天…')"
								/><InputGroupAddon align="block-end" class="flex-wrap">
									<InputGroupButton
										variant="outline"
										size="icon-xs"
										:aria-label="t('Add', '添加')"
										@click="quickStatus = `${t('Add context', '添加上下文')} · ${preview}`"
										><span aria-hidden="true">＋</span></InputGroupButton
									>
									<DropdownMenu
										><DropdownMenuTrigger as-child
											><InputGroupButton size="sm">{{
												modes.find(([key]) => key === quickMode)?.[chinese ? 1 : 0]
											}}</InputGroupButton></DropdownMenuTrigger
										><DropdownMenuContent side="top" appearance="surface"
											><DropdownMenuRadioGroup v-model="quickMode"
												><DropdownMenuRadioItem
													v-for="[key, translation] in modes"
													:key="key"
													:value="key"
													>{{ t(key, translation) }}</DropdownMenuRadioItem
												></DropdownMenuRadioGroup
											></DropdownMenuContent
										></DropdownMenu
									>
									<InputGroupText class="ms-auto"
										>{{ Math.min(100, Math.round(quickText.length / 5)) }}%
										{{ t("used", "已用") }}</InputGroupText
									><InputGroupButton
										type="submit"
										variant="default"
										size="icon-xs"
										:aria-label="t('Send message', '发送消息')"
										:disabled="!quickText.trim()"
										><span aria-hidden="true">↑</span></InputGroupButton
									>
								</InputGroupAddon></InputGroup
							>
						</form>
						<output class="text-xs text-muted-foreground" role="status">{{ quickStatus }}</output>
						<InputGroup
							><InputGroupInput
								:aria-label="t('Handle', '昵称')"
								placeholder="@valar"
							/><InputGroupAddon align="inline-end" aria-hidden="true"
								><span class="text-primary">✓</span></InputGroupAddon
							></InputGroup
						>
					</div>
				</div>
				<div class="grid min-w-0 content-start gap-4">
					<Item variant="outline"
						><ItemContent
							><ItemTitle>{{ t("Two-factor authentication", "双重身份验证") }}</ItemTitle
							><ItemDescription>{{
								mfa
									? t("Enabled in this preview only.", "仅在此预览中启用。")
									: t("Verify via email or phone number.", "通过电子邮件或电话号码验证。")
							}}</ItemDescription></ItemContent
						><ItemActions
							><Button size="sm" :aria-pressed="mfa" @click="mfa = !mfa">{{
								mfa ? t("Disable", "停用") : t("Enable", "启用")
							}}</Button></ItemActions
						></Item
					>
					<Item variant="outline" size="sm"
						><ItemContent
							><ItemTitle>{{
								t("Your profile has been verified.", "你的个人资料已验证。")
							}}</ItemTitle
							><ItemDescription v-if="verified">{{
								t(
									"This is sample verification, not a real account.",
									"这是示例验证，并非真实账户。"
								)
							}}</ItemDescription></ItemContent
						><ItemActions
							><Button
								size="icon-sm"
								variant="ghost"
								:aria-label="t('Verification details', '验证详情')"
								:aria-expanded="verified"
								@click="verified = !verified"
								><span aria-hidden="true">›</span></Button
							></ItemActions
						></Item
					>
					<FieldSet>
						<FieldLegend>{{ t("Appearance Settings", "外观设置") }}</FieldLegend
						><FieldDescription>{{
							t("These settings affect only this sample.", "这些设置仅影响此示例。")
						}}</FieldDescription>
						<FieldGroup>
							<FieldSet
								><FieldLegend :id="`${id}-compute`">{{
									t("Compute Environment", "计算环境")
								}}</FieldLegend
								><FieldDescription>{{
									t("Select the compute environment for your cluster.", "选择集群的计算环境。")
								}}</FieldDescription>
								<RadioGroup v-model="compute" :aria-labelledby="`${id}-compute`" class="gap-2">
									<div
										v-for="[value, label, description] in [
											[
												'kubernetes',
												'Kubernetes',
												t(
													'Run GPU workloads on a K8s cluster.',
													'在 K8s 集群上运行 GPU 工作负载。'
												),
											],
											[
												'vm',
												t('Virtual Machine', '虚拟机'),
												t(
													'Access a VM configured cluster. (Coming soon)',
													'访问虚拟机集群（即将推出）。'
												),
											],
										]"
										:key="value"
										class="flex items-center gap-2 rounded-lg border-[0.5px] border-border p-3 has-aria-checked:border-primary"
									>
										<FieldContent class="min-w-0"
											><FieldLabel :for="`${id}-${value}`" class="cursor-pointer">{{
												label
											}}</FieldLabel
											><FieldDescription :id="`${id}-${value}-description`">{{
												description
											}}</FieldDescription></FieldContent
										>
										<RadioGroupItem
											:id="`${id}-${value}`"
											:value="value"
											:aria-describedby="`${id}-${value}-description`"
										/>
									</div>
								</RadioGroup>
							</FieldSet>
							<FieldSeparator />
							<Field
								><FieldTitle :id="`${id}-accent`">{{ t("Accent", "强调色") }}</FieldTitle
								><RadioGroup
									v-model="accent"
									:aria-labelledby="`${id}-accent`"
									class="flex flex-wrap gap-2"
									><RadioGroupItem
										v-for="(color, index) in accents"
										:key="color"
										:value="String(index)"
										:aria-label="`${t('Accent', '强调色')} ${index + 1}`"
										class="size-6! border-border!"
										:class="color" /></RadioGroup
							></Field>
							<FieldSeparator />
							<Field
								><FieldLabel :for="`${id}-gpu`">{{ t("Number of GPUs", "GPU 数量") }}</FieldLabel
								><FieldDescription>{{
									t("You can add more later.", "稍后可以添加更多。")
								}}</FieldDescription
								><NumberField
									:id="`${id}-gpu`"
									:min="1"
									:max="999"
									:default-value="8"
									:locale="chinese ? 'zh-CN' : 'en-US'"
									:decrement-label="t('Decrease', '减小')"
									:increment-label="t('Increase', '增大')"
							/></Field>
							<FieldSeparator />
							<Field orientation="horizontal"
								><FieldContent
									><FieldLabel :for="`${id}-tint`">{{
										t("Wallpaper Tinting", "壁纸着色")
									}}</FieldLabel
									><FieldDescription>{{
										t("Allow the wallpaper to be tinted.", "允许为壁纸着色。")
									}}</FieldDescription></FieldContent
								><Switch :id="`${id}-tint`" v-model="tint"
							/></Field>
							<div
								aria-hidden="true"
								class="h-8 rounded-lg border-[0.5px] border-border"
								:class="tint ? accents[Number(accent)] : 'bg-muted'"
							/>
						</FieldGroup>
					</FieldSet>
				</div>
				<div class="grid min-w-0 content-start gap-4">
					<div class="flex flex-wrap gap-2">
						<Badge><Spinner aria-hidden="true" />{{ t("Syncing", "同步中") }}</Badge
						><Badge variant="secondary"
							><Spinner aria-hidden="true" />{{ t("Updating", "更新中") }}</Badge
						><Badge variant="outline"
							><Spinner aria-hidden="true" />{{ t("Processing", "处理中") }}</Badge
						>
					</div>
					<InputGroup
						><InputGroupAddon
							><Popover
								><PopoverTrigger as-child
									><InputGroupButton
										size="icon-xs"
										variant="secondary"
										:aria-label="t('Info', '信息')"
										><span aria-hidden="true">ⓘ</span></InputGroupButton
									></PopoverTrigger
								><PopoverContent :aria-label="t('Connection information', '连接信息')" align="start"
									><p class="font-medium">
										{{ t("Your connection is not secure.", "你的连接不安全。") }}
									</p>
									<p>
										{{
											t(
												"This is sample text. Do not enter sensitive information.",
												"这是示例文字，请勿输入敏感信息。"
											)
										}}
									</p></PopoverContent
								></Popover
							><InputGroupText>https://</InputGroupText></InputGroupAddon
						><InputGroupInput :aria-label="t('Input Secure', '安全输入示例')" /><InputGroupAddon
							align="inline-end"
							><InputGroupButton
								size="icon-xs"
								:aria-label="t('Favorite', '收藏')"
								:aria-pressed="favorite"
								@click="favorite = !favorite"
								><span aria-hidden="true" :class="favorite ? 'text-primary' : ''">{{
									favorite ? "★" : "☆"
								}}</span></InputGroupButton
							></InputGroupAddon
						></InputGroup
					>
					<form
						:aria-label="t('Notion Prompt', 'Notion 提示词')"
						class="min-w-0"
						@submit.prevent="submitPrompt"
					>
						<InputGroup appearance="composer" class="min-w-0">
							<InputGroupTextarea
								v-model="text"
								:aria-label="t('Prompt', '提示词')"
								:placeholder="t('Ask, search, or make anything...', '提问、搜索或创建内容…')"
							/>
							<InputGroupAddon align="block-start" class="flex-wrap">
								<Popover v-model:open="contextOpen"
									><PopoverTrigger as-child
										><InputGroupButton variant="outline" size="sm"
											><span aria-hidden="true">@</span>
											{{ t("Add context", "添加上下文") }}</InputGroupButton
										></PopoverTrigger
									>
									<PopoverContent
										:aria-label="t('Add context', '添加上下文')"
										align="start"
										class="w-64 max-w-[calc(100vw-16px)] p-0!"
									>
										<Command
											><CommandInput
												:aria-label="t('Search pages', '搜索页面')"
												:placeholder="t('Search pages...', '搜索页面…')"
											/><CommandList
												><CommandEmpty>{{ t("No pages found", "未找到页面") }}</CommandEmpty>
												<CommandGroup
													v-for="isPage in [true, false]"
													:key="String(isPage)"
													:heading="isPage ? t('Pages', '页面') : t('Users', '用户')"
												>
													<CommandItem
														v-for="{ icon, key, label } in context.filter(
															(item) => item.page === isPage && !mentions.includes(item.key)
														)"
														:key="key"
														:value="key"
														:keywords="[label]"
														@select="
															mentions = [...mentions, key];
															contextOpen = false;
														"
														><span aria-hidden="true">{{ icon || "@" }}</span
														>{{ label }}</CommandItem
													>
												</CommandGroup>
											</CommandList></Command
										>
									</PopoverContent>
								</Popover>
								<InputGroupButton
									v-for="mention in mentions"
									:key="mention"
									variant="secondary"
									size="sm"
									:aria-label="`${t('Remove', '移除')} ${mentionLabel(mention)}`"
									@click="mentions = mentions.filter((item) => item !== mention)"
									>{{ mentionLabel(mention) }} <span aria-hidden="true">×</span></InputGroupButton
								>
							</InputGroupAddon>
							<InputGroupAddon v-if="files.length" align="block-start" class="flex-wrap"
								><InputGroupButton
									v-for="file in files"
									:key="file"
									variant="secondary"
									size="sm"
									class="max-w-full"
									:aria-label="`${t('Remove attachment', '移除附件')} ${file}`"
									@click="files = files.filter((item) => item !== file)"
									><span class="truncate">{{ file }}</span
									><span aria-hidden="true">×</span></InputGroupButton
								></InputGroupAddon
							>
							<InputGroupAddon align="block-end" class="flex-wrap gap-1">
								<input ref="fileInput" type="file" multiple hidden @change="chooseFiles" />
								<InputGroupButton
									size="icon-sm"
									:aria-label="t('Attach file', '附加文件')"
									@click="fileInput?.click()"
									><span aria-hidden="true">＋</span></InputGroupButton
								>
								<DropdownMenu
									><DropdownMenuTrigger as-child
										><InputGroupButton
											size="sm"
											:aria-label="`${t('Select AI model', '选择 AI 模型')}: ${promptModes.find(([key]) => key === model)?.[1]}`"
											>{{ promptModes.find(([key]) => key === model)?.[1] }}</InputGroupButton
										></DropdownMenuTrigger
									>
									<DropdownMenuContent appearance="surface" side="top"
										><DropdownMenuRadioGroup v-model="model"
											><DropdownMenuRadioItem
												v-for="[key, title] in promptModes"
												:key="key"
												:value="key"
												>{{ title
												}}<Badge v-if="key === 'agent'" variant="secondary"
													>Beta</Badge
												></DropdownMenuRadioItem
											></DropdownMenuRadioGroup
										></DropdownMenuContent
									>
								</DropdownMenu>
								<DropdownMenu
									><DropdownMenuTrigger as-child
										><InputGroupButton size="sm">{{
											scope === "help"
												? t("Help Center", "帮助中心")
												: scope === "all"
													? t("All Sources", "全部来源")
													: scope
										}}</InputGroupButton></DropdownMenuTrigger
									>
									<DropdownMenuContent appearance="surface" side="top" align="end" class="min-w-52">
										<DropdownMenuCheckboxItem v-model="web" @select.prevent>{{
											t("Web Search", "网页搜索")
										}}</DropdownMenuCheckboxItem
										><DropdownMenuCheckboxItem v-model="apps" @select.prevent>{{
											t("Apps and Integrations", "应用与集成")
										}}</DropdownMenuCheckboxItem
										><DropdownMenuSeparator />
										<DropdownMenuRadioGroup v-model="scope"
											><DropdownMenuRadioItem
												v-for="[key, title] in scopes"
												:key="key"
												:value="key"
												>{{ title }}</DropdownMenuRadioItem
											></DropdownMenuRadioGroup
										>
										<DropdownMenuSub
											><DropdownMenuSubTrigger>{{
												t("Valar workspace", "Valar 工作区")
											}}</DropdownMenuSubTrigger
											><DropdownMenuSubContent appearance="surface"
												><DropdownMenuItem
													v-for="person in people"
													:key="person"
													@select="scope = person"
													>{{ person }}</DropdownMenuItem
												></DropdownMenuSubContent
											></DropdownMenuSub
										>
										<DropdownMenuItem
											@select="
												promptStatus = t(
													'Connect Apps requires a host integration.',
													'连接应用需要宿主集成。'
												)
											"
											>{{ t("Connect Apps", "连接应用") }}</DropdownMenuItem
										>
									</DropdownMenuContent>
								</DropdownMenu>
								<InputGroupButton
									type="submit"
									variant="default"
									size="icon-sm"
									class="ms-auto"
									:aria-label="t('Send prompt', '发送提示词')"
									:disabled="!text.trim()"
									><span aria-hidden="true">↑</span></InputGroupButton
								>
							</InputGroupAddon>
						</InputGroup>
						<output role="status" class="text-xs text-muted-foreground">{{ promptStatus }}</output>
					</form>
					<div class="grid gap-2">
						<ButtonGroup :aria-label="t('Mail actions', '邮件操作')"
							><Button
								variant="outline"
								size="icon-sm"
								:aria-label="t('Go Back', '返回')"
								@click="mail = ''"
								><span aria-hidden="true">←</span></Button
							><Button
								variant="outline"
								size="sm"
								@click="mail = t('Archived locally', '已在本地归档')"
								>{{ t("Archive", "归档") }}</Button
							><Button
								variant="outline"
								size="sm"
								@click="mail = t('Snoozed locally', '已在本地暂缓')"
								>{{ t("Snooze", "暂缓") }}</Button
							>
							<DropdownMenu
								><DropdownMenuTrigger as-child
									><Button
										variant="outline"
										size="icon-sm"
										:aria-label="t('More Options', '更多选项')"
										><span aria-hidden="true">⋯</span></Button
									></DropdownMenuTrigger
								><DropdownMenuContent align="end" appearance="surface" class="min-w-40">
									<DropdownMenuItem
										v-for="[key, translation] in mailActions"
										:key="key"
										@select="mail = `${t(key, translation)} · ${preview}`"
										>{{ t(key, translation) }}</DropdownMenuItem
									>
									<DropdownMenuSub
										><DropdownMenuSubTrigger>{{
											t("Label As...", "添加标签…")
										}}</DropdownMenuSubTrigger
										><DropdownMenuSubContent appearance="surface"
											><DropdownMenuRadioGroup
												:model-value="label"
												@update:model-value="
													label = String($event);
													mail = labelOptions.find(([key]) => key === label)?.[1] ?? '';
												"
												><DropdownMenuRadioItem
													v-for="[key, title] in labelOptions"
													:key="key"
													:value="key"
													>{{ title }}</DropdownMenuRadioItem
												></DropdownMenuRadioGroup
											></DropdownMenuSubContent
										></DropdownMenuSub
									>
									<DropdownMenuSeparator /><DropdownMenuItem
										variant="destructive"
										@select="mail = `${t('Trash', '移至回收站')} · ${preview}`"
										>{{ t("Trash", "移至回收站") }}</DropdownMenuItem
									>
								</DropdownMenuContent></DropdownMenu
							>
						</ButtonGroup>
						<output role="status" class="text-xs text-muted-foreground">{{ mail }}</output>
					</div>
					<Field orientation="horizontal"
						><Checkbox :id="`${id}-terms`" :default-value="true" /><FieldLabel
							:for="`${id}-terms`"
							>{{ t("I agree to the terms and conditions", "我同意条款与条件") }}</FieldLabel
						></Field
					>
					<div class="flex flex-wrap gap-2">
						<ButtonGroup :aria-label="t('Pages', '页码')"
							><ButtonGroup
								><Button
									v-for="value in [1, 2, 3, 4, 5]"
									:key="value"
									:variant="page === value ? 'secondary' : 'outline'"
									size="sm"
									:aria-current="page === value ? 'page' : undefined"
									@click="page = value"
									>{{ value }}</Button
								></ButtonGroup
							>
							<ButtonGroup
								><Button
									variant="outline"
									size="icon-sm"
									:aria-label="t('Previous', '上一页')"
									:disabled="page === 1"
									@click="page--"
									><span aria-hidden="true">‹</span></Button
								><Button
									variant="outline"
									size="icon-sm"
									:aria-label="t('Next', '下一页')"
									:disabled="page === 5"
									@click="page++"
									><span aria-hidden="true">›</span></Button
								></ButtonGroup
							>
						</ButtonGroup>
						<Popover v-model:open="copilot"
							><ButtonGroup>
								<PopoverTrigger as-child
									><Button variant="outline" size="sm">Copilot</Button></PopoverTrigger
								><Button
									variant="outline"
									size="icon-sm"
									:aria-label="t('Open Popover', '打开弹出层')"
									:aria-expanded="copilot"
									@click="copilot = !copilot"
									><span aria-hidden="true">⌄</span></Button
								> </ButtonGroup
							><PopoverContent
								:aria-label="t('Agent Tasks', '代理任务')"
								align="start"
								class="max-w-[calc(100vw-16px)]"
								><form class="grid gap-2" @submit.prevent="saveTask">
									<p class="font-medium">{{ t("Agent Tasks", "代理任务") }}</p>
									<Textarea
										v-model="task"
										:aria-label="t('Describe your task', '描述任务')"
										:placeholder="
											t('Describe your task in natural language.', '用自然语言描述任务。')
										"
									/>
									<p class="text-xs text-muted-foreground">
										{{
											t(
												"Start a new task with Copilot. This preview does not run agents.",
												"用 Copilot 开始新任务。此预览不会运行代理。"
											)
										}}
									</p>
									<Button type="submit" :disabled="!task.trim()">{{
										t("Save task", "保存任务")
									}}</Button>
								</form></PopoverContent
							></Popover
						>
					</div>
					<output role="status" class="text-xs text-muted-foreground">{{ taskStatus }}</output>
					<Empty class="border-[0.5px] border-border"
						><EmptyHeader
							><EmptyMedia variant="icon"
								><Spinner v-if="processing" aria-hidden="true" /><span v-else aria-hidden="true"
									>×</span
								></EmptyMedia
							><EmptyTitle>{{
								processing
									? t("Processing your request", "正在处理你的请求")
									: t("Request canceled", "请求已取消")
							}}</EmptyTitle
							><EmptyDescription>{{
								processing
									? t("This is a sample loading state.", "这是示例加载状态。")
									: t("You can restart this demonstration.", "你可以重新开始此演示。")
							}}</EmptyDescription></EmptyHeader
						><EmptyContent
							><Button variant="outline" size="sm" @click="processing = !processing">{{
								processing ? t("Cancel", "取消") : t("Restart", "重新开始")
							}}</Button></EmptyContent
						></Empty
					>
				</div>
			</div>
		</section></TooltipProvider
	>
</template>
