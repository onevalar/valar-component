<script lang="ts">
import type { IssueActivityOptions } from "./activity-model.js";
import type { IssueDetailOption, IssueDetailValue } from "./model.js";

export interface IssueDetailProps {
	issue: IssueDetailValue;
	chinese?: boolean;
	embedded?: boolean;
	activity?: IssueActivityOptions;
	assignees?: readonly IssueDetailOption[];
	projects?: readonly IssueDetailOption[];
	labelOptions?: readonly IssueDetailOption[];
	headingRef?: (heading: HTMLHeadingElement | null) => void;
}
</script>

<script setup lang="ts">
import { ChevronRightIcon, HexagonIcon, TagIcon } from "@lucide/vue";
import {
	computed,
	getCurrentInstance,
	nextTick,
	provide,
	ref,
	shallowRef,
	useId,
	watch,
	type ComponentPublicInstance,
} from "vue";
import DescriptionEditor from "./DescriptionEditor.vue";
import IssueActivity from "./IssueActivity.vue";
import ReactionChips from "./ReactionChips.vue";
import ReactionPicker from "./ReactionPicker.vue";
import RichDescription from "./RichDescription.js";
import { issueActivityChanges } from "./activity-model.js";
import { issuePortal } from "./controls.js";
import { isComposing } from "./editor-core.js";
import { descriptionFromText, type IssueDetailUpdate } from "./model.js";
import { Button } from "../button";
import { Combobox } from "../combobox";
import { IssueGlyph, issueLabels, priorities, statuses } from "../issue-composer";
import type { Editor } from "@tiptap/core";

const props = withDefaults(defineProps<IssueDetailProps>(), {
	assignees: () => [],
	projects: () => [],
	labelOptions: () => [],
});
const emit = defineEmits<{ update: [update: IssueDetailUpdate]; back: [] }>();
const instance = getCurrentInstance();
const canGoBack = () => !!instance?.vnode.props?.onBack;
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const id = useId();
const portal = { to: `[id="${id}"]` };
provide(issuePortal, portal);

const tokens = {
	"--detail-panel": "light-dark(lch(97.94% .5 282), lch(5.52% .4 272))",
	"--detail-control": "light-dark(white, lch(10.149% .593 272))",
	"--detail-accent": "light-dark(lch(46% 70 267), lch(48% 72 267))",
	"--foreground": "light-dark(lch(9.794% 0 282), white)",
	"--muted-foreground": "light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272))",
	"--border": "light-dark(lch(92.5% 0 282), lch(22% .85 272))",
	"--popover": "light-dark(white, lch(16.433% 1.3 272))",
	"--popover-foreground": "var(--foreground)",
	"--accent": "light-dark(lch(94.854% .5 282), lch(14.006% .593 272))",
	"--accent-foreground": "var(--foreground)",
	"--muted": "var(--accent)",
	"--ring": "var(--detail-accent)",
};
const propertyHeading =
	"sr-only @min-[860px]:not-sr-only @min-[860px]:mb-2 @min-[860px]:ps-1.5 @min-[860px]:text-[13px] @min-[860px]:font-medium @min-[860px]:text-muted-foreground";
const propertyControl =
	"inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-(--detail-control) px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent @min-[860px]:h-8 @min-[860px]:w-full @min-[860px]:justify-start @min-[860px]:rounded-md @min-[860px]:border-transparent @min-[860px]:bg-transparent @min-[860px]:px-1.5 @min-[860px]:text-[13px] @min-[860px]:hover:bg-accent @min-[860px]:aria-expanded:bg-accent";
const label = (key: keyof typeof issueLabels) => issueLabels[key][props.chinese ? 0 : 1];
const chosenLabels = computed(() => props.issue.labels ?? []);
const assigneeName = computed(
	() => props.assignees.find(({ id }) => id === props.issue.assignee)?.label ?? props.issue.assignee
);
const projectName = computed(
	() => props.projects.find(({ id }) => id === props.issue.project)?.label ?? props.issue.project
);
const hasDescription = computed(
	() => !!(props.issue.descriptionContent || props.issue.description)
);
const content = computed(
	() => props.issue.descriptionContent ?? descriptionFromText(props.issue.description ?? "")
);
const property = computed(() => ({
	class: propertyControl,
	portalProps: portal,
	empty: t("没有匹配的选项", "No matching options"),
}));
const picker = ref<InstanceType<typeof ReactionPicker>>();
const editor = shallowRef<Editor | null>(null);
const form = ref<HTMLFormElement>();
const titleInput = ref<HTMLInputElement>();
const titleDraft = ref<string>();
const title = computed({
	get: () => titleDraft.value ?? props.issue.title,
	set: (value: string) => {
		titleDraft.value = value;
	},
});
const invalid = ref(false);
const editing = ref<"title" | "description">();
let changed = false;

watch(
	() => props.issue.id,
	() => {
		editing.value = undefined;
	}
);
function setHeading(element: Element | ComponentPublicInstance | null) {
	props.headingRef?.(element as HTMLHeadingElement | null);
}
async function begin(origin: NonNullable<typeof editing.value>) {
	titleDraft.value = undefined;
	invalid.value = false;
	changed = false;
	editing.value = origin;
	await nextTick();
	if (origin === "title") titleInput.value?.focus();
}
async function stop() {
	const origin = editing.value;
	const issueId = props.issue.id;
	editing.value = undefined;
	await nextTick();
	if (issueId === props.issue.id)
		form.value?.querySelector<HTMLButtonElement>(`[data-edit-${origin}]`)?.focus();
}
function updateIssue(update: IssueDetailUpdate) {
	const { issue, activity } = props;
	const changes = activity ? issueActivityChanges(issue, update) : [];
	emit("update", update);
	if (changes.length) activity?.onAction({ type: "update", changes });
}
function save() {
	if (!editing.value) return;
	const next = title.value.trim();
	if (!next) {
		invalid.value = true;
		titleInput.value?.focus();
		return;
	}
	const update: IssueDetailUpdate = {};
	if (titleDraft.value !== undefined && next !== props.issue.title) update.title = next;
	if (editor.value && changed) {
		update.description = editor.value.getText({ blockSeparator: "\n" });
		update.descriptionContent = editor.value.isEmpty ? undefined : editor.value.getJSON();
	}
	if (Object.keys(update).length) updateIssue(update);
	void stop();
}
function keys(event: KeyboardEvent) {
	if (!editing.value || event.defaultPrevented || isComposing(event)) return false;
	if (event.key === "Escape") {
		event.preventDefault();
		event.stopPropagation();
		if (!event.repeat) void stop();
		return true;
	}
	if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
		event.preventDefault();
		if (!event.repeat) form.value?.requestSubmit();
		return true;
	}
	return false;
}
function toggleLabel(id: string) {
	updateIssue({
		labels: chosenLabels.value.includes(id)
			? chosenLabels.value.filter((label) => label !== id)
			: [...chosenLabels.value, id],
	});
}
function react(emoji: string, active: boolean) {
	props.activity?.collaboration?.onAction({ type: "react", emoji, active });
}
function pick(emoji: string) {
	react(
		emoji,
		!props.activity?.collaboration?.reactions.some(
			(item) =>
				item.emoji === emoji && item.users.some(({ id }) => id === props.activity?.viewer.id)
		)
	);
}
</script>

<template>
	<section
		data-slot="issue-detail"
		:aria-label="t('问题详情', 'Issue details')"
		:style="tokens"
		:class="[
			'@container min-w-0 text-foreground [color-scheme:light] dark:[color-scheme:dark]',
			!embedded && 'rounded-[10px] border border-border bg-(--detail-panel)',
		]"
	>
		<header v-if="!embedded" class="min-w-0 border-b border-border px-3 sm:px-4">
			<nav :aria-label="t('问题路径', 'Issue location')">
				<ol class="flex h-[34px] min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
					<template v-if="canGoBack()"
						><li class="shrink-0">
							<Button
								size="xs"
								variant="ghost"
								:aria-label="t('返回我的问题', 'Back to My issues')"
								class="px-1 font-normal"
								@click="emit('back')"
								>{{ t("我的问题", "My issues") }}</Button
							>
						</li>
						<li class="shrink-0" aria-hidden="true">
							<ChevronRightIcon class="size-3.5 rtl:rotate-180" /></li
					></template>
					<li class="min-w-0 truncate" aria-current="page">{{ issue.id }} {{ issue.title }}</li>
				</ol>
			</nav>
		</header>
		<div
			:key="issue.id"
			:class="[
				'mx-auto grid max-w-[1150px] content-start gap-y-5 px-4 py-7 sm:px-8 sm:py-10 @min-[860px]:grid-cols-[minmax(0,1fr)_224px] @min-[860px]:gap-x-12 @min-[1050px]:px-12',
				activity ? '@min-[860px]:grid-rows-[max-content_max-content_1fr]' : 'min-h-[440px]',
			]"
		>
			<form
				ref="form"
				:aria-label="t('编辑问题', 'Edit issue')"
				class="contents"
				@submit.prevent="save"
				@keydown="keys"
			>
				<div class="min-w-0 @min-[860px]:col-start-1 @min-[860px]:row-start-1">
					<template v-if="editing">
						<input
							ref="titleInput"
							v-model="title"
							data-slot="input"
							:aria-label="t('问题标题', 'Issue title')"
							aria-required="true"
							:aria-invalid="invalid"
							:aria-describedby="invalid ? `${id}-title-error` : undefined"
							maxlength="160"
							@input="invalid = false"
							class="h-9 w-full min-w-0 rounded-md border border-border bg-(--detail-control) px-2 text-[24px] leading-8 font-semibold tracking-tight focus:outline-1 focus:-outline-offset-1 focus:outline-ring"
						/>
						<p
							v-if="invalid"
							:id="`${id}-title-error`"
							role="alert"
							class="mt-1 text-xs text-destructive"
						>
							{{ t("请输入问题标题。", "Enter an issue title.") }}
						</p>
					</template>
					<h2
						v-else
						:ref="setHeading"
						tabindex="-1"
						:aria-label="issue.title"
						class="text-[24px] leading-8 font-semibold tracking-tight focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
					>
						<Button
							data-edit-title=""
							variant="ghost"
							:aria-label="t('编辑标题', 'Edit title')"
							class="-ms-1 h-auto max-w-full justify-start rounded-md px-1 py-0 text-start text-[24px] leading-8 font-semibold wrap-anywhere whitespace-normal hover:bg-accent"
							@click="begin('title')"
							>{{ issue.title }}</Button
						>
					</h2>
				</div>
				<aside
					:aria-label="t('问题属性', 'Issue properties')"
					:class="[
						'flex min-w-0 flex-wrap gap-1.5 @min-[860px]:col-start-2 @min-[860px]:row-start-1 @min-[860px]:block @min-[860px]:space-y-7',
						activity ? '@min-[860px]:row-span-3' : '@min-[860px]:row-span-2',
					]"
				>
					<div class="contents @min-[860px]:block">
						<h3 :class="propertyHeading">{{ t("属性", "Properties") }}</h3>
						<Combobox
							v-bind="property"
							:label="t('更改状态', 'Change status')"
							:placeholder="t('搜索状态…', 'Search statuses…')"
							:options="statuses.map((id) => ({ id, label: label(id) }))"
							:model-value="[issue.status]"
							@select="(id) => updateIssue({ status: id as IssueDetailValue['status'] })"
						>
							<IssueGlyph :value="issue.status" />{{ label(issue.status) }}
							<template #option="{ option }"
								><IssueGlyph :value="option.id as IssueDetailValue['status']" /><span
									class="min-w-0 flex-1 wrap-anywhere"
									>{{ option.label }}</span
								></template
							>
						</Combobox>
						<Combobox
							v-bind="property"
							:label="t('更改优先级', 'Change priority')"
							:placeholder="t('搜索优先级…', 'Search priorities…')"
							:options="priorities.map((id) => ({ id, label: label(id) }))"
							:model-value="[issue.priority]"
							@select="(id) => updateIssue({ priority: id as IssueDetailValue['priority'] })"
						>
							<IssueGlyph :value="issue.priority" />{{
								issue.priority === "none" ? t("设置优先级", "Set priority") : label(issue.priority)
							}}
							<template #option="{ option }"
								><IssueGlyph :value="option.id as IssueDetailValue['priority']" /><span
									class="min-w-0 flex-1 wrap-anywhere"
									>{{ option.label }}</span
								></template
							>
						</Combobox>
						<Combobox
							v-bind="property"
							:label="t('更改负责人', 'Change assignee')"
							:placeholder="t('搜索负责人…', 'Search assignees…')"
							:options="[{ id: '', label: t('未分配', 'Unassigned') }, ...assignees]"
							:model-value="[issue.assignee ?? '']"
							@select="(id) => updateIssue({ assignee: id || undefined })"
						>
							<span
								aria-hidden="true"
								class="grid size-3.5 shrink-0 place-items-center rounded-full border border-dashed text-[8px] leading-none"
								>{{ assigneeName?.slice(0, 1) ?? "◦" }}</span
							><span class="truncate">{{ assigneeName ?? t("分配负责人", "Assign") }}</span>
						</Combobox>
					</div>
					<div class="contents @min-[860px]:block">
						<h3 :class="propertyHeading">{{ t("标签", "Labels") }}</h3>
						<Combobox
							v-bind="property"
							:label="t('更改标签', 'Change labels')"
							:placeholder="t('搜索标签…', 'Search labels…')"
							:options="labelOptions"
							:model-value="chosenLabels"
							multiple
							@select="toggleLabel"
						>
							<TagIcon aria-hidden="true" class="size-3.5 shrink-0" /><span class="truncate">{{
								chosenLabels.length
									? chosenLabels
											.map((id) => labelOptions.find((item) => item.id === id)?.label ?? id)
											.join("、")
									: t("添加标签", "Add label")
							}}</span>
						</Combobox>
					</div>
					<div class="contents @min-[860px]:block">
						<h3 :class="propertyHeading">{{ t("项目", "Project") }}</h3>
						<Combobox
							v-bind="property"
							:label="t('更改项目', 'Change project')"
							:placeholder="t('搜索项目…', 'Search projects…')"
							:options="[{ id: '', label: t('无项目', 'No project') }, ...projects]"
							:model-value="[issue.project ?? '']"
							@select="(id) => updateIssue({ project: id || undefined })"
						>
							<HexagonIcon aria-hidden="true" class="size-3.5 shrink-0" /><span class="truncate">{{
								projectName ?? t("添加到项目", "Add to project")
							}}</span>
						</Combobox>
					</div>
				</aside>
				<div class="min-w-0 space-y-3 @min-[860px]:col-start-1 @min-[860px]:row-start-2">
					<template v-if="editing">
						<DescriptionEditor
							:content="content"
							:chinese="chinese"
							:focus-on-mount="editing === 'description'"
							:on-keys="keys"
							@ready="editor = $event"
							@change="changed = true"
						/>
						<div class="flex justify-end gap-2">
							<Button size="sm" variant="outline" @click="stop">{{ t("取消", "Cancel") }}</Button
							><Button
								type="submit"
								size="sm"
								aria-keyshortcuts="Meta+Enter Control+Enter"
								class="bg-(--detail-accent) text-white hover:bg-(--detail-accent)/90"
								>{{ t("保存", "Save") }}</Button
							>
						</div>
					</template>
					<template v-else>
						<RichDescription v-if="hasDescription" :content="content" />
						<Button
							data-edit-description=""
							size="sm"
							variant="ghost"
							class="-ms-2 px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
							@click="begin('description')"
							>{{
								hasDescription
									? t("编辑描述", "Edit description")
									: t("添加描述…", "Add description…")
							}}</Button
						>
						<div v-if="activity?.collaboration" class="flex flex-wrap items-center gap-1">
							<ReactionChips
								:reactions="activity.collaboration.reactions"
								:chinese="chinese"
								:viewer-id="activity.viewer.id"
								:focus-picker="() => picker?.focus()"
								@reaction="react"
							/>
							<ReactionPicker
								ref="picker"
								:label="t('回应问题', 'React to issue')"
								:chinese="chinese"
								@select="pick"
							/>
						</div>
					</template>
					<ul
						v-if="issue.attachments?.length"
						:aria-label="t('附件', 'Attachments')"
						class="flex flex-wrap gap-1.5 text-xs text-muted-foreground"
					>
						<li
							v-for="(file, index) in issue.attachments"
							:key="index"
							class="max-w-full truncate rounded-full border border-border px-2 py-1"
						>
							{{ file.name }}
						</li>
					</ul>
				</div>
			</form>
			<div v-if="activity" class="min-w-0 @min-[860px]:col-start-1 @min-[860px]:row-start-3">
				<IssueActivity :activity="activity" :chinese="chinese" />
			</div>
		</div>
		<div :id="id" />
	</section>
</template>
