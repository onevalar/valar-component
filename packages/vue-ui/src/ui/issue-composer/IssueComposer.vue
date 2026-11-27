<script setup lang="ts">
import {
	CheckIcon,
	ChevronRightIcon,
	MaximizeIcon,
	MinimizeIcon,
	PaperclipIcon,
	XIcon,
} from "@lucide/vue";
import { computed, nextTick, ref, shallowRef, useId, watch } from "vue";
import IssueGlyph from "./IssueGlyph.vue";
import {
	issueLabels,
	priorities,
	statuses,
	type IssueComposerProps,
	type IssueDraft,
	type IssuePriority,
	type IssueStatus,
} from "./issue-options";
import { Button } from "../button";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "../command";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from "../dialog";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Switch } from "../switch";
import { Textarea } from "../textarea";
import { TooltipHint, TooltipProvider } from "../tooltip";

const props = withDefaults(defineProps<IssueComposerProps>(), {
	open: undefined,
	defaultOpen: false,
	chinese: false,
	workspace: "Valar",
});
const emit = defineEmits<{ "update:open": [open: boolean]; create: [draft: IssueDraft] }>();

const id = `valar-issue-${useId()}`;
const fields = ["status", "priority"] as const;
type Field = (typeof fields)[number];
const options = { status: statuses, priority: priorities };
const iconButton =
	"size-8 min-w-0 shrink-0 rounded-full p-0 text-foreground hover:bg-accent motion-reduce:transition-none";
const editorField =
	"rounded-none border-0 bg-transparent! px-0 text-foreground ring-0! shadow-none! focus-visible:outline-solid! focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive placeholder:text-(--composer-placeholder)! transition-none";
const tokens = {
	"--composer-surface": "light-dark(lch(100% 0 282), lch(9.232% .85 272))",
	"--composer-accent": "light-dark(lch(46% 70 267), lch(48% 72 267))",
	"--composer-placeholder": "light-dark(lch(57% 1.25 282), lch(42% 1.2 272))",
	"--composer-chip": "light-dark(white, lch(13.861% 1.139 272))",
	"--foreground": "light-dark(lch(9.794% 0 282), white)",
	"--muted-foreground": "light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272))",
	"--border": "light-dark(lch(89% .5 282), lch(22% .85 272))",
	"--accent": "light-dark(lch(94.854% .5 282), lch(24% 1.3 272))",
	"--ring": "var(--composer-accent)",
	"--settings-focus": "var(--composer-accent)",
	"--settings-switch-on": "var(--composer-accent)",
	"--settings-switch-off": "light-dark(lch(86.75% .5 282), lch(25.69% 1.975 272))",
};

const localOpen = ref(props.defaultOpen);
const open = computed({
	get: () => props.open ?? localOpen.value,
	set: (next) => {
		if (props.open === undefined) localOpen.value = next;
		emit("update:open", next);
	},
});
const title = ref("");
const description = ref("");
const status = ref<IssueStatus>("backlog");
const priority = ref<IssuePriority>("none");
const attachments = shallowRef<File[]>([]);
const createMore = ref(false);
const expanded = ref(false);
const invalidTitle = ref(false);
const activeMenu = ref<Field>();
const titleControl = ref<InstanceType<typeof Input>>();
const titleInput = () => titleControl.value?.$el as HTMLInputElement | undefined;
const command = ref<InstanceType<typeof Command>[]>([]);
const fileInput = ref<HTMLInputElement>();
const attachmentsList = ref<HTMLUListElement>();
const addAttachment = ref<InstanceType<typeof Button>>();
const floatingRoot = ref<HTMLDivElement>();
let previousFocus: HTMLElement | null = null;
const composing = new WeakSet<EventTarget>();
const text = (zh: string, en: string) => (props.chinese ? zh : en);
const label = (key: keyof typeof issueLabels) => issueLabels[key][props.chinese ? 0 : 1];
const expandLabel = computed(() =>
	expanded.value ? text("收起编辑区", "Collapse editor") : text("展开编辑区", "Expand editor")
);
const closeLabel = computed(() => text("关闭", "Close"));
const attachmentLabel = computed(() => text("添加附件", "Add attachment"));

watch(open, (next) => {
	if (!next) activeMenu.value = undefined;
});

function openFocus(event: Event) {
	const input = titleInput();
	const focused = input?.ownerDocument.activeElement;
	previousFocus = focused instanceof HTMLElement ? focused : null;
	expanded.value = false;
	invalidTitle.value = false;
	event.preventDefault();
	input?.focus();
}

function closeFocus(event: Event) {
	const target = props.returnFocus?.();
	const focus = target?.isConnected ? target : previousFocus;
	if (!focus?.isConnected) return;
	event.preventDefault();
	focus.focus();
}

function setMenu(field: Field, next: boolean) {
	if (next) activeMenu.value = field;
	else if (activeMenu.value === field) activeMenu.value = undefined;
}

function selectOption(field: Field, index: number) {
	if (field === "status") status.value = statuses[index];
	else priority.value = priorities[index];
	activeMenu.value = undefined;
}

function startComposition(event: CompositionEvent) {
	if (event.target) composing.add(event.target);
}
function stopComposition(event: Event) {
	if (event.target) composing.delete(event.target);
}
function isComposing(event: KeyboardEvent) {
	return (
		event.isComposing ||
		event.keyCode === 229 ||
		(event.target !== null && composing.has(event.target))
	);
}
function escape(event: KeyboardEvent) {
	if (isComposing(event)) event.preventDefault();
}

function pickWithNumber(event: KeyboardEvent, field: Field) {
	if (
		isComposing(event) ||
		event.ctrlKey ||
		event.metaKey ||
		event.altKey ||
		(event.currentTarget as HTMLInputElement).value ||
		!/^\d$/.test(event.key)
	)
		return;
	const index = Number(event.key) - (field === "status" ? 1 : 0);
	if (index < 0 || index >= options[field].length) return;
	event.preventDefault();
	if (!event.repeat) selectOption(field, index);
}

async function createIssue() {
	if (activeMenu.value) return;
	const trimmedTitle = title.value.trim();
	if (!trimmedTitle) {
		invalidTitle.value = true;
		titleInput()?.focus();
		return;
	}
	emit("create", {
		title: trimmedTitle,
		description: description.value.trim(),
		status: status.value,
		priority: priority.value,
		attachments: [...attachments.value],
	});
	title.value = "";
	description.value = "";
	attachments.value = [];
	invalidTitle.value = false;
	if (createMore.value) {
		await nextTick();
		titleInput()?.focus();
	} else {
		status.value = "backlog";
		priority.value = "none";
		open.value = false;
	}
}

function editorKeyDown(event: KeyboardEvent) {
	if (
		event.key !== "Enter" ||
		!(event.metaKey || event.ctrlKey) ||
		event.altKey ||
		isComposing(event) ||
		activeMenu.value
	)
		return;
	event.preventDefault();
	if (!event.repeat)
		(event.currentTarget as HTMLInputElement | HTMLTextAreaElement).form?.requestSubmit();
}

function addFiles(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	attachments.value = [...attachments.value, ...Array.from(input.files ?? [])];
	input.value = "";
}

async function removeAttachment(index: number) {
	attachments.value = attachments.value.filter((_, item) => item !== index);
	await nextTick();
	const controls = attachmentsList.value?.querySelectorAll("button");
	(
		controls?.[index] ??
		controls?.[index - 1] ??
		(addAttachment.value?.$el as HTMLButtonElement | undefined)
	)?.focus();
}
</script>

<template>
	<Dialog v-model:open="open">
		<DialogPortal>
			<DialogOverlay />
			<DialogContent
				:show-overlay="false"
				:show-close-button="false"
				data-slot="dialog-content"
				:data-expanded="expanded"
				:style="tokens"
				class="fixed left-1/2 z-50 w-[calc(100%-24px)] -translate-x-1/2 translate-y-0 rounded-[21px] bg-(--composer-surface) text-foreground [color-scheme:light] shadow-[0_12px_36px_#0003] transition-[max-width,top] [transition-duration:220ms,300ms] ease-[cubic-bezier(0.43,0.07,0.59,0.94)] outline-none motion-reduce:animate-none! motion-reduce:transition-none motion-reduce:duration-0! dark:[color-scheme:dark] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
				:class="
					expanded
						? 'top-[max(8px,6svh)] max-w-[820px]'
						: 'top-[clamp(8px,13svh,calc(100svh-274px))] max-w-[750px]'
				"
				@open-auto-focus="openFocus"
				@close-auto-focus="closeFocus"
				@escape-key-down="escape"
			>
				<TooltipProvider :delay-duration="500" :skip-delay-duration="150">
					<form
						class="flex flex-col transition-[height] duration-300 ease-[cubic-bezier(0.43,0.07,0.59,0.94)] motion-reduce:transition-none motion-reduce:duration-0!"
						:class="expanded ? 'h-[min(88svh,800px)]' : 'h-[min(262px,calc(100svh-16px))]'"
						@submit.prevent="createIssue"
					>
						<header class="flex h-14 shrink-0 items-center justify-between gap-2 ps-[19px] pe-2.5">
							<div class="flex min-w-0 items-center gap-2">
								<span
									class="max-w-32 truncate rounded-full border-[0.5px] border-border px-2 py-0.5 text-xs leading-4 font-medium text-muted-foreground"
									>{{ workspace }}</span
								>
								<ChevronRightIcon
									class="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180"
									aria-hidden="true"
								/>
								<DialogTitle class="truncate text-[13px]! leading-5 font-medium!">{{
									text("新建问题", "New issue")
								}}</DialogTitle>
							</div>
							<DialogDescription class="sr-only">{{
								text(
									"填写问题标题和描述，并选择状态和优先级。",
									"Write a title and description, then choose a status and priority."
								)
							}}</DialogDescription>
							<div class="flex shrink-0 items-center">
								<TooltipHint :label="expandLabel" :portal="{ to: floatingRoot }">
									<template #trigger>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											:class="iconButton"
											:aria-label="expandLabel"
											:aria-controls="`${id}-editor`"
											:aria-expanded="expanded"
											@click="expanded = !expanded"
										>
											<MinimizeIcon v-if="expanded" class="size-4" aria-hidden="true" />
											<MaximizeIcon v-else class="size-4" aria-hidden="true" />
										</Button>
									</template>
								</TooltipHint>
								<TooltipHint :label="closeLabel" :portal="{ to: floatingRoot }">
									<template #trigger>
										<DialogClose as-child
											><Button
												type="button"
												variant="ghost"
												size="icon"
												:class="iconButton"
												:aria-label="closeLabel"
												><XIcon class="size-4" aria-hidden="true" /></Button
										></DialogClose>
									</template>
								</TooltipHint>
							</div>
						</header>

						<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
							<div class="flex min-h-full flex-col">
								<div :id="`${id}-editor`" class="flex flex-1 flex-col gap-1.5 px-[19px] pt-1.5">
									<Input
										ref="titleControl"
										:model-value="title"
										@update:model-value="
											(value) => {
												title = String(value);
												invalidTitle = false;
											}
										"
										:aria-label="text('标题', 'Title')"
										aria-required="true"
										:aria-invalid="invalidTitle"
										:aria-describedby="invalidTitle ? `${id}-error` : undefined"
										:placeholder="text('问题标题', 'Issue title')"
										:maxlength="160"
										:class="[
											editorField,
											'h-6 shrink-0 py-0 text-lg leading-6 font-semibold md:text-lg',
										]"
										@keydown="editorKeyDown"
										@compositionstart="startComposition"
										@compositionend="stopComposition"
										@blur="stopComposition"
									/>
									<p
										v-if="invalidTitle"
										:id="`${id}-error`"
										role="alert"
										class="shrink-0 text-xs text-destructive"
									>
										{{ text("请输入问题标题。", "Enter an issue title.") }}
									</p>
									<Textarea
										v-model="description"
										:aria-label="text('描述', 'Description')"
										:placeholder="text('添加描述…', 'Add description…')"
										:class="[
											editorField,
											'field-sizing-fixed min-h-8 flex-1 resize-none pt-1.5 pb-3 text-[15px] leading-5 font-[450] md:text-[15px]',
										]"
										@keydown="editorKeyDown"
										@compositionstart="startComposition"
										@compositionend="stopComposition"
										@blur="stopComposition"
									/>
								</div>
								<div class="flex shrink-0 flex-wrap gap-1.5 px-[19px] pt-1.5 pb-2">
									<Popover
										v-for="field in fields"
										:key="field"
										:open="open && activeMenu === field"
										@update:open="(next) => setMenu(field, next)"
									>
										<PopoverTrigger
											type="button"
											:aria-label="`${label(field)} · ${label(field === 'status' ? status : priority)}`"
											class="inline-flex h-6 items-center gap-1.5 rounded-full border-[0.5px] border-border bg-(--composer-chip) px-2 text-xs leading-none font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent"
										>
											<IssueGlyph :value="field === 'status' ? status : priority" />{{
												label(
													field === "status" ? status : priority === "none" ? "priority" : priority
												)
											}}
										</PopoverTrigger>
										<PopoverContent
											v-if="floatingRoot"
											appearance="surface"
											:portal-props="{ to: floatingRoot }"
											align="start"
											:collision-padding="12"
											class="w-[204px] gap-0 p-0"
											@open-auto-focus.prevent="command[0]?.focus()"
											@escape-key-down="escape"
										>
											<Command
												ref="command"
												appearance="compact"
												:default-value="label(field === 'status' ? status : priority)"
												:label="text('搜索选项', 'Search options')"
												class="h-auto bg-transparent"
											>
												<CommandInput
													:placeholder="
														field === 'status'
															? text('更改状态…', 'Change status…')
															: text('更改优先级…', 'Change priority…')
													"
													class="focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
													@keydown="(event: KeyboardEvent) => pickWithNumber(event, field)"
													@compositionstart="startComposition"
													@compositionend="stopComposition"
													@blur="stopComposition"
												/>
												<CommandList
													class="max-h-[min(192px,max(32px,calc(var(--reka-popover-content-available-height)-36px)))] overscroll-contain p-1"
												>
													<CommandEmpty>{{
														text("没有匹配的选项", "No matching options")
													}}</CommandEmpty>
													<CommandItem
														v-for="(option, index) in options[field]"
														:key="option"
														:value="label(option)"
														:checked="(field === 'status' ? status : priority) === option"
														class="px-2! py-0 font-[450]!"
														@select="selectOption(field, index)"
													>
														<IssueGlyph :value="option" />{{ label(option) }}
														<template #indicator="{ checked }">
															<CheckIcon
																v-if="checked"
																class="ms-auto size-3.5"
																aria-hidden="true"
															/>
															<CommandShortcut v-else aria-hidden="true">{{
																index + (field === "status" ? 1 : 0)
															}}</CommandShortcut>
														</template>
													</CommandItem>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
								<ul
									v-if="attachments.length"
									ref="attachmentsList"
									:aria-label="text('附件', 'Attachments')"
									class="flex max-h-16 shrink-0 flex-wrap gap-1 overflow-y-auto px-[19px] pb-2"
								>
									<li
										v-for="(file, index) in attachments"
										:key="index"
										class="inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full border-[0.5px] border-border px-2 text-xs"
									>
										<span class="truncate">{{ file.name }}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											:aria-label="`${text('移除附件', 'Remove attachment')} ${file.name}`"
											class="size-4 min-w-0 shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-accent"
											@click="removeAttachment(index)"
											><XIcon class="size-3" aria-hidden="true"
										/></Button>
									</li>
								</ul>
							</div>
						</div>

						<footer
							class="flex h-14 shrink-0 items-center justify-between gap-2 border-t-[0.5px] border-border/60 ps-3 pe-[15px]"
						>
							<input ref="fileInput" type="file" multiple hidden @change="addFiles" />
							<TooltipHint :label="attachmentLabel" :portal="{ to: floatingRoot }" side="top">
								<template #trigger>
									<Button
										ref="addAttachment"
										type="button"
										variant="ghost"
										size="icon"
										:class="iconButton"
										:aria-label="attachmentLabel"
										@click="fileInput?.click()"
										><PaperclipIcon class="size-4" aria-hidden="true"
									/></Button>
								</template>
							</TooltipHint>
							<div class="flex min-w-0 items-center gap-3">
								<div class="flex items-center gap-1.5">
									<label
										:for="`${id}-more`"
										class="cursor-pointer text-xs whitespace-nowrap text-muted-foreground"
										>{{ text("继续创建", "Create more") }}</label
									>
									<Switch
										:id="`${id}-more`"
										:model-value="createMore"
										size="sm"
										appearance="settings"
										class="shrink-0 after:inset-x-0 after:inset-y-0"
										@update:model-value="(value) => (createMore = value === true)"
									/>
								</div>
								<Button
									type="submit"
									size="sm"
									shape="pill"
									aria-keyshortcuts="Meta+Enter Control+Enter"
									class="h-7 shrink-0 rounded-full bg-(--composer-accent)! px-2.5 text-xs leading-none font-medium whitespace-nowrap text-white! shadow-none hover:bg-(--composer-accent)/90!"
									>{{ text("创建问题", "Create issue") }}</Button
								>
							</div>
						</footer>
					</form>
				</TooltipProvider>
				<div ref="floatingRoot" />
			</DialogContent>
		</DialogPortal>
	</Dialog>
</template>
