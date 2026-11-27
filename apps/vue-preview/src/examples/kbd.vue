<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Kbd, KbdGroup } from "@valar/vue-ui/kbd";
import { ref, useId } from "vue";

const shortcutsId = useId();
const showShortcuts = ref(true);

function toggleShortcuts() {
	showShortcuts.value = !showShortcuts.value;
}
</script>

<template>
	<section
		aria-label="Kbd examples"
		class="grid w-full max-w-sm justify-items-start gap-4 p-6 text-sm"
	>
		<Button
			variant="outline"
			aria-keyshortcuts="Shift+S"
			:aria-expanded="showShortcuts"
			:aria-controls="shortcutsId"
			@click="toggleShortcuts"
			@keydown.shift.s.exact.prevent="!$event.repeat && !$event.isComposing && toggleShortcuts()"
		>
			Keyboard shortcuts
			<KbdGroup aria-hidden="true">
				<Kbd appearance="inline">⇧</Kbd>
				<Kbd appearance="inline">S</Kbd>
			</KbdGroup>
		</Button>
		<dl
			v-show="showShortcuts"
			:id="shortcutsId"
			class="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2"
		>
			<dt>Move to the next control</dt>
			<dd class="justify-self-end"><Kbd>Tab</Kbd></dd>
			<dt>Move to the previous control</dt>
			<dd class="justify-self-end">
				<KbdGroup aria-label="Shift and Tab">
					<Kbd>⇧</Kbd>
					<Kbd>Tab</Kbd>
				</KbdGroup>
			</dd>
		</dl>
	</section>
</template>
