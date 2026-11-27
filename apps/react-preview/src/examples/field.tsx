import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@valar/react-ui/field";
import { Input } from "@valar/react-ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/react-ui/select";
import { Separator } from "@valar/react-ui/separator";
import { useId, useState } from "react";

export default function FieldExample() {
	const id = useId();
	const [identifier, setIdentifier] = useState("?");
	const invalid = !/^[A-Za-z0-9]{2,7}$/.test(identifier);

	return (
		<section aria-label="Field examples" className="grid max-w-[688px] gap-4 p-6 text-sm">
			<FieldGroup className="gap-0 rounded-[10px] border-[0.5px] border-border bg-card">
				<Field appearance="settings" orientation="responsive">
					<FieldContent>
						<FieldLabel htmlFor={`${id}-theme`}>Interface theme</FieldLabel>
						<FieldDescription id={`${id}-theme-description`}>
							Choose a workspace theme.
						</FieldDescription>
					</FieldContent>
					<Select defaultValue="system" name="theme">
						<SelectTrigger id={`${id}-theme`} aria-describedby={`${id}-theme-description`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="system">System preference</SelectItem>
							<SelectItem value="light">Light</SelectItem>
							<SelectItem value="dark">Dark</SelectItem>
						</SelectContent>
					</Select>
				</Field>
				<div className="px-4">
					<Separator decorative />
				</div>
				<Field appearance="settings" orientation="responsive" data-invalid={invalid || undefined}>
					<FieldContent>
						<FieldLabel htmlFor={`${id}-identifier`}>Team identifier</FieldLabel>
						{invalid && (
							<FieldError id={`${id}-identifier-error`}>Enter a valid identifier.</FieldError>
						)}
					</FieldContent>
					<Input
						id={`${id}-identifier`}
						name="identifier"
						placeholder="e.g. ENG"
						maxLength={7}
						required
						aria-invalid={invalid || undefined}
						aria-describedby={invalid ? `${id}-identifier-error` : undefined}
						className="@md/field-group:w-43"
						value={identifier}
						onChange={(event) => setIdentifier(event.currentTarget.value)}
					/>
				</Field>
			</FieldGroup>
		</section>
	);
}
