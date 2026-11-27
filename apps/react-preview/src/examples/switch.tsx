import { Button } from "@valar/react-ui/button";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@valar/react-ui/field";
import { Switch } from "@valar/react-ui/switch";
import { useId, useState } from "react";

export default function SwitchExample() {
	const id = useId();
	const [checked, setChecked] = useState(true);
	const [status, setStatus] = useState("");

	return (
		<section aria-label="Switch examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<form
				className="grid gap-3"
				onSubmit={(event) => {
					event.preventDefault();
					const settings = new FormData(event.currentTarget);
					setStatus(
						`Settings saved. Email updates ${settings.has("emailUpdates") ? "on" : "off"}.`
					);
				}}
				onReset={() => {
					setChecked(true);
					setStatus("Settings reset.");
				}}
			>
				<Field
					appearance="settings"
					orientation="horizontal"
					className="rounded-[10px] border-[0.5px] border-border bg-card"
				>
					<FieldContent>
						<FieldLabel htmlFor={`${id}-email`}>Email updates</FieldLabel>
						<FieldDescription id={`${id}-description`}>
							Get workspace updates by email.
						</FieldDescription>
					</FieldContent>
					<Switch
						id={`${id}-email`}
						name="emailUpdates"
						appearance="settings"
						aria-describedby={`${id}-description`}
						checked={checked}
						onCheckedChange={(next) => {
							setChecked(next);
							setStatus("");
						}}
					/>
				</Field>
				<Field orientation="horizontal" data-disabled="true">
					<FieldLabel htmlFor={`${id}-locked`}>Locked updates</FieldLabel>
					<Switch id={`${id}-locked`} name="lockedUpdates" size="sm" disabled />
				</Field>
				<div className="flex flex-wrap gap-2">
					<Button type="submit">Save settings</Button>
					<Button type="reset" variant="outline">
						Reset settings
					</Button>
				</div>
				<output className="min-h-5 text-muted-foreground">{status}</output>
			</form>
		</section>
	);
}
