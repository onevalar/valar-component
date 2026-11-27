<script setup lang="ts">
import { UsersIcon } from "@lucide/vue";
import { computed, ref, useId } from "vue";
import ActivityThread from "./ActivityThread.vue";
import CommentComposer from "./CommentComposer.vue";
import { dateText, describe } from "./activity-copy.js";
import { isComposing } from "./editor-core.js";
import { Button } from "../button";
import { Combobox } from "../combobox";
import type { IssueActivityOptions, IssueActivityUser } from "./activity-model.js";

const props = defineProps<{ activity: IssueActivityOptions; chinese: boolean }>();
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const id = useId();
const portal = { to: `[id="${id}"]` };
const open = ref(false);
const subscribers = computed(() =>
	(props.activity.collaboration?.subscribers ?? []).map(({ id }) => id)
);
const people = computed(
	() =>
		new Map(
			[
				...(props.activity.collaboration?.subscribers ?? []),
				...(props.activity.collaboration?.people ?? []),
				props.activity.viewer,
			].map((person) => [person.id, person])
		)
);
const subscribed = computed(() => subscribers.value.includes(props.activity.viewer.id));
const avatar =
	"inline-grid size-[18px] shrink-0 place-items-center rounded-full bg-(--activity-avatar) text-[8px] text-(--activity-avatar-foreground)";
function initials(user?: IssueActivityUser) {
	return user?.initials ?? user?.name.slice(0, 2);
}
function subscribe(user: IssueActivityUser) {
	props.activity.collaboration?.onAction({
		type: "subscribe",
		user,
		subscribed: !subscribers.value.includes(user.id),
	});
}
function select(id: string) {
	const user = people.value.get(id);
	if (user) subscribe(user);
}
function keys(event: KeyboardEvent) {
	if (
		!props.activity.collaboration ||
		event.defaultPrevented ||
		isComposing(event) ||
		event.repeat ||
		event.altKey ||
		!event.shiftKey ||
		event.key.toLowerCase() !== "s" ||
		!(event.target instanceof HTMLElement) ||
		event.target.closest("input, textarea, [contenteditable]")
	)
		return;
	event.preventDefault();
	if (event.metaKey || event.ctrlKey) open.value = true;
	else subscribe(props.activity.viewer);
}
</script>

<template>
	<section
		:aria-label="t('问题活动', 'Issue activity')"
		data-slot="issue-activity"
		style="
			--activity-card: light-dark(white, lch(9.232% 0.85 272));
			--activity-border: light-dark(lch(91.9% 0 282), lch(16.793% 1.93 272));
			--activity-placeholder: light-dark(lch(43% 1 282), lch(61.803% 1.2 272));
			--activity-avatar: light-dark(lch(86% 15 240), lch(32% 26 248));
			--activity-avatar-foreground: light-dark(lch(29% 21 245), lch(94% 6 240));
		"
		class="min-w-0 space-y-4 border-t border-(--activity-border) pt-4"
		@keydown="keys"
	>
		<header class="flex min-h-8 flex-wrap items-center justify-between gap-2">
			<h3 class="text-[15px] leading-6 font-medium">{{ t("活动", "Activity") }}</h3>
			<div v-if="activity.collaboration" class="flex shrink-0 items-center gap-1.5">
				<Button
					variant="ghost"
					size="xs"
					:aria-pressed="subscribed"
					aria-keyshortcuts="Shift+S"
					class="h-7 rounded-full px-2 text-xs text-muted-foreground hover:text-foreground"
					@click="subscribe(activity.viewer)"
					>{{ subscribed ? t("取消订阅", "Unsubscribe") : t("订阅", "Subscribe") }}</Button
				>
				<Combobox
					v-model:open="open"
					:label="t('管理订阅者', 'Change subscribers')"
					:placeholder="t('搜索订阅者…', 'Search subscribers…')"
					:empty="t('没有匹配的成员', 'No matching people')"
					align="end"
					:portal-props="portal"
					multiple
					:model-value="subscribers"
					:options="[...people.values()].map((user) => ({ id: user.id, label: user.name }))"
					content-class="w-56!"
					:class="'inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-full px-1 text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent'"
					:trigger-props="{
						'aria-keyshortcuts': 'Meta+Shift+S Control+Shift+S',
						title:
							activity.collaboration.subscribers.map(({ name }) => name).join(t('、', ', ')) ||
							t('无订阅者', 'No subscribers'),
					}"
					@select="select"
				>
					<template v-if="activity.collaboration.subscribers.length">
						<span class="flex -space-x-1.5 rtl:space-x-reverse"
							><span
								v-for="user in activity.collaboration.subscribers.slice(0, 3)"
								:key="user.id"
								aria-hidden="true"
								:class="avatar"
								>{{ initials(user) }}</span
							></span
						>
						<span v-if="activity.collaboration.subscribers.length > 3" class="text-[10px]"
							>+{{ activity.collaboration.subscribers.length - 3 }}</span
						>
					</template>
					<UsersIcon v-else aria-hidden="true" class="size-3.5" />
					<template #option="{ option }"
						><span aria-hidden="true" :class="avatar">{{ initials(people.get(option.id)) }}</span
						><span class="min-w-0 flex-1 truncate">{{ option.label }}</span></template
					>
				</Combobox>
				<div :id="id" />
			</div>
		</header>
		<ol
			v-if="activity.entries.length"
			:aria-label="t('活动时间线', 'Activity timeline')"
			class="space-y-4"
		>
			<template v-for="entry in activity.entries" :key="entry.id">
				<li
					v-if="entry.kind === 'event'"
					class="flex min-w-0 items-start gap-2 px-2 text-xs leading-5 text-muted-foreground sm:px-4"
				>
					<span
						aria-hidden="true"
						class="mt-0.5 inline-grid size-3.5 shrink-0 place-items-center rounded-full bg-(--activity-avatar) text-[7px] text-(--activity-avatar-foreground)"
						>{{ initials(entry.author) }}</span
					>
					<span class="min-w-0 wrap-anywhere"
						>{{ entry.author.name }}
						{{
							entry.changes?.length
								? entry.changes.map((change) => describe(change, chinese)).join(t("，", ", "))
								: t("创建了问题", "created this issue")
						}}<span aria-hidden="true"> · </span
						><time :datetime="entry.createdAt">{{ dateText(entry.createdAt, chinese) }}</time></span
					>
				</li>
				<ActivityThread v-else :entry="entry" :activity="activity" :chinese="chinese" />
			</template>
		</ol>
		<CommentComposer
			mode="post"
			:chinese="chinese"
			@commit="activity.onAction({ type: 'post', draft: $event })"
		/>
	</section>
</template>
