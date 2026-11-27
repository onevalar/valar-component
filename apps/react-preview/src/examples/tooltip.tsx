import { Button } from "@valar/react-ui/button";
import { Kbd, KbdGroup } from "@valar/react-ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@valar/react-ui/tooltip";
import { useId, useState } from "react";

export default function TooltipExample() {
	const id = useId();
	const [showOptions, setShowOptions] = useState(false);

	return (
		<section
			aria-label="Tooltip examples"
			className="grid min-h-28 max-w-sm content-start justify-items-start gap-3 p-6 text-sm"
		>
			<TooltipProvider delayDuration={500}>
				<Tooltip disableHoverableContent>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Display options"
							aria-keyshortcuts="Shift+V"
							aria-expanded={showOptions}
							aria-controls={id}
							onClick={() => setShowOptions((open) => !open)}
							onKeyDown={(event) => {
								if (
									event.shiftKey &&
									!event.altKey &&
									!event.ctrlKey &&
									!event.metaKey &&
									!event.repeat &&
									event.key.toLowerCase() === "v"
								) {
									event.preventDefault();
									event.currentTarget.click();
								}
							}}
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							>
								<path d="M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6m-4 4v6" />
							</svg>
						</Button>
					</TooltipTrigger>
					<TooltipContent
						appearance="surface"
						side="bottom"
						align="start"
						aria-label="Show display options"
					>
						<span className="inline-flex items-center gap-2">
							Show display options
							<KbdGroup aria-hidden="true">
								<Kbd appearance="compact">Shift</Kbd>
								<Kbd appearance="compact">V</Kbd>
							</KbdGroup>
						</span>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<p id={id} hidden={!showOptions} className="text-muted-foreground">
				Issues are grouped by status.
			</p>
		</section>
	);
}
