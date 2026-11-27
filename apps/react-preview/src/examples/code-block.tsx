import { useState } from "react";
import { Button } from "@valar/react-ui/button";
import {
	CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton,
	CodeBlockFooter, CodeBlockHeader, CodeBlockLine, CodeBlockTitle, useHighlightedCode,
} from "@valar/react-ui/code-block";

const initial = '/* Preview only\n   Code is rendered as text. */\n\nconst markup = "<script>example</script>";\n';
const appended = 'console.log("A long output checks whether the code wraps at a narrow viewport.");\n';

export default function CodeBlockExample() {
	const [code, setCode] = useState(initial);
	const [wrap, setWrap] = useState(false);
	const [language, setLanguage] = useState("js");
	const lines = useHighlightedCode(code, language);
	return (
		<div className="grid min-w-0 gap-3">
			<CodeBlock>
				<CodeBlockHeader><CodeBlockTitle>preview.js</CodeBlockTitle></CodeBlockHeader>
				<CodeBlockActions><CodeBlockCopyButton value={code} copyLabel="Copy code" copiedLabel="Code copied" /></CodeBlockActions>
				<CodeBlockContent aria-label="Example source" wrap={wrap} lineNumbers startLine={18}>
					{lines.map((line, index) => <CodeBlockLine key={index} code={line} variant={index === 3 ? "highlighted" : index > 3 ? "added" : "default"} />)}
				</CodeBlockContent>
				<CodeBlockFooter>Preview only</CodeBlockFooter>
			</CodeBlock>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" aria-pressed={wrap} onClick={() => setWrap(!wrap)}>Wrap lines</Button>
				<Button variant="outline" size="sm" aria-pressed={language !== "js"} onClick={() => setLanguage(language === "js" ? "plain" : "js")}>Plain text</Button>
				<Button variant="outline" size="sm" disabled={code !== initial} onClick={() => setCode(initial + appended)}>Append output</Button>
			</div>
		</div>
	);
}
