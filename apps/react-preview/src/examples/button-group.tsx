import { Button } from "@valar/react-ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@valar/react-ui/button-group";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@valar/react-ui/popover";
import { useState } from "react";

const tools = ["Editor", "Terminal"];

export default function ButtonGroupExample() {
	const [tool, setTool] = useState("Editor");
	const [status, setStatus] = useState("");

	async function copyPrompt() {
		const prompt = `Investigate why the issue list loses its filters after refreshing. Use the ${tool.toLowerCase()}.`;
		try {
			await navigator.clipboard.writeText(prompt);
			setStatus(`Prompt copied for ${tool}.`);
		} catch {
			setStatus(`Clipboard unavailable. Copy this prompt manually: ${prompt}`);
		}
	}

	return (
		<section
			aria-label="Button Group examples"
			className="grid max-w-sm justify-items-start gap-4 p-6 text-sm"
		>
			<ButtonGroup variant="pill" aria-label="Issue actions">
				<Button variant="ghost" size="icon-sm" aria-label="Copy as prompt" onClick={copyPrompt}>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<rect x="8" y="8" width="12" height="12" rx="2" />
						<path d="M4 16V6a2 2 0 0 1 2-2h10" />
					</svg>
				</Button>
				<ButtonGroupSeparator />
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon-sm" aria-label="Choose coding tool">
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" aria-label="Coding tool" className="grid w-32 gap-1">
						{tools.map((option) => (
							<PopoverClose asChild key={option}>
								<Button
									variant={tool === option ? "secondary" : "ghost"}
									size="sm"
									aria-pressed={tool === option}
									onClick={() => {
										setTool(option);
										setStatus(`Coding tool: ${option}.`);
									}}
								>
									{option}
								</Button>
							</PopoverClose>
						))}
					</PopoverContent>
				</Popover>
			</ButtonGroup>
			<output className="min-h-5 text-muted-foreground">{status}</output>
		</section>
	);
}
