import { Button } from "@valar/react-ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@valar/react-ui/field";
import { Input } from "@valar/react-ui/input";
import { useId, useRef, useState } from "react";

export default function ProfileForm() {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState("");

	return (
		<form
			aria-label="Profile settings"
			className="grid w-full max-w-sm gap-4 p-6"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				const username = String(new FormData(event.currentTarget).get("username") ?? "").trim();
				if (username.length < 2 || username.length > 50) {
					setError("Enter a display name of 2 to 50 characters.");
					setSaved("");
					input.current?.focus();
					return;
				}
				setError("");
				setSaved(username);
			}}
			onReset={() => {
				setError("");
				setSaved("");
			}}
		>
			<Field data-invalid={!!error}>
				<FieldLabel htmlFor={id}>Display name</FieldLabel>
				<Input
					id={id}
					ref={input}
					name="username"
					autoComplete="nickname"
					required
					aria-invalid={!!error}
					aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
				/>
				<FieldDescription id={`${id}-hint`}>
					This name appears on your workspace profile.
				</FieldDescription>
				{error && <FieldError id={`${id}-error`}>{error}</FieldError>}
			</Field>
			<div className="flex flex-wrap gap-2">
				<Button type="submit">Save profile</Button>
				<Button type="reset" variant="outline">
					Reset
				</Button>
			</div>
			<p role="status" className="text-sm">
				{saved && `Saved: ${saved}`}
			</p>
		</form>
	);
}
