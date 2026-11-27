import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS,
} from "@valar/react-ui/input-otp";
import { Label } from "@valar/react-ui/label";
import { useId, useState } from "react";

export default function InputOTPExample() {
	const id = useId();
	const [code, setCode] = useState("");
	return (
		<section
			aria-label="Account verification"
			className="grid justify-items-start gap-3 p-6 text-sm"
		>
			<Label htmlFor={id}>Verification code</Label>
			<InputOTP
				id={id}
				name="code"
				value={code}
				onValueChange={setCode}
				maxLength={6}
				pattern={REGEXP_ONLY_DIGITS}
				pasteTransformer={(text) => text.replace(/[^0-9]/g, "")}
				aria-describedby={`${id}-hint`}
			>
				<InputOTPGroup>
					{[0, 1, 2].map((index) => (
						<InputOTPSlot key={index} index={index} />
					))}
				</InputOTPGroup>
				<InputOTPSeparator />
				<InputOTPGroup>
					{[3, 4, 5].map((index) => (
						<InputOTPSlot key={index} index={index} />
					))}
				</InputOTPGroup>
			</InputOTP>
			<p id={`${id}-hint`} className="text-muted-foreground">
				Enter or paste a six-digit demo code.
			</p>
			<p role="status">{code.length === 6 ? "Code ready to verify" : ""}</p>
		</section>
	);
}
