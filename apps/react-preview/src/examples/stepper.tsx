import { Button } from "@valar/react-ui/button";
import { Input } from "@valar/react-ui/input";
import { Stepper, type StepperStep } from "@valar/react-ui/stepper";
import { useCallback, useState } from "react";

const steps: StepperStep[] = [
	{ id: "details", title: "Details", description: "Name the workspace" },
	{ id: "review", title: "Review", description: "Check your settings" },
	{ id: "done", title: "Done", description: "Finish setup" },
];

export default function StepperExample() {
	const [name, setName] = useState("");
	const beforeChange = useCallback(
		(from: string) =>
			from !== "details" || name.trim().length > 1 || "Enter at least two characters to continue.",
		[name]
	);
	return (
		<div className="w-full max-w-2xl p-6">
			<Stepper
				steps={steps}
				beforeChange={beforeChange}
				aria-label="Workspace setup"
				messages={{ progress: (current, total) => `Step ${current} of ${total}` }}
			>
				{({ step, next, previous, pending }) => (
					<div className="grid gap-3 text-sm">
						{step.id === "details" ? (
							<label className="grid gap-1">
								Workspace name
								<Input value={name} onChange={(event) => setName(event.target.value)} />
							</label>
						) : (
							<p>
								{step.id === "review" ? `Workspace: ${name.trim()}` : "Workspace setup complete."}
							</p>
						)}
						<div className="flex gap-2">
							{step.id !== "details" && (
								<Button variant="outline" onClick={() => void previous()}>
									Back
								</Button>
							)}
							{step.id !== "done" && (
								<Button disabled={pending} onClick={() => void next()}>
									Continue
								</Button>
							)}
						</div>
					</div>
				)}
			</Stepper>
		</div>
	);
}
