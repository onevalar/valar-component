import { Input } from "@valar/react-ui/input";
import { Label } from "@valar/react-ui/label";
import { useId } from "react";

export default function LabelExample() {
	const id = useId();

	return (
		<section aria-label="Label examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<div className="grid gap-2">
				<Label htmlFor={`${id}-name`}>Display name</Label>
				<Input id={`${id}-name`} name="displayName" autoComplete="nickname" required />
			</div>
			<div className="grid gap-2">
				<Label htmlFor={`${id}-workspace`} appearance="settings" data-disabled="true">
					Workspace name
				</Label>
				<Input id={`${id}-workspace`} defaultValue="Valar" disabled />
			</div>
		</section>
	);
}
