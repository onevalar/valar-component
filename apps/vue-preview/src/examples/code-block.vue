<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@valar/vue-ui/button";
import {
	CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton,
	CodeBlockFooter, CodeBlockHeader, CodeBlockLine, CodeBlockTitle, useHighlightedCode,
} from "@valar/vue-ui/code-block";

const initial = '/* Preview only\n   Code is rendered as text. */\n\nconst markup = "<script>example<\/script>";\n';
const appended = 'console.log("A long output checks whether the code wraps at a narrow viewport.");\n';
const code = ref(initial);
const wrap = ref(false);
const language = ref("js");
const lines = useHighlightedCode(code, language);
</script>

<template>
	<div class="grid min-w-0 gap-3">
		<CodeBlock>
			<CodeBlockHeader><CodeBlockTitle>preview.js</CodeBlockTitle></CodeBlockHeader>
			<CodeBlockActions><CodeBlockCopyButton :value="code" copy-label="Copy code" copied-label="Code copied" /></CodeBlockActions>
			<CodeBlockContent aria-label="Example source" :wrap="wrap" line-numbers :start-line="18">
				<CodeBlockLine v-for="(line, index) in lines" :key="index" :code="line" :variant="index === 3 ? 'highlighted' : index > 3 ? 'added' : 'default'" />
			</CodeBlockContent>
			<CodeBlockFooter>Preview only</CodeBlockFooter>
		</CodeBlock>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" size="sm" :aria-pressed="wrap" @click="wrap = !wrap">Wrap lines</Button>
			<Button variant="outline" size="sm" :aria-pressed="language !== 'js'" @click="language = language === 'js' ? 'plain' : 'js'">Plain text</Button>
			<Button variant="outline" size="sm" :disabled="code !== initial" @click="code = initial + appended">Append output</Button>
		</div>
	</div>
</template>
