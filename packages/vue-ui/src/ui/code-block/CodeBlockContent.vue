<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import CodeBlockLine from "./CodeBlockLine.vue";

const props = withDefaults(defineProps<{
	code?: string;
	wrap?: boolean;
	lineNumbers?: boolean;
	startLine?: number;
	class?: HTMLAttributes["class"];
}>(), { startLine: 1 });
</script>

<template>
	<pre
		data-slot="code-block-content"
		:data-wrap="wrap || undefined"
		:data-numbered="lineNumbers || undefined"
		:style="{ counterReset: `line ${startLine - 1}` }"
		dir="ltr"
		tabindex="0"
		:class="cn('cn-code-block-content min-h-0 min-w-0 scroll-fade-x scrollbar-thin overflow-auto text-start font-mono outline-none data-wrap:scroll-fade-y data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap', props.class)"
	><code data-slot="code-block-code" class="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"><template v-if="code !== undefined"><template v-if="lineNumbers"><CodeBlockLine v-for="(line, index) in code.replace(/\n$/, '').split('\n')" :key="index" :code="line" /></template><template v-else>{{ code }}</template></template><slot v-else /></code></pre>
</template>
