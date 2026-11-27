import { useState } from "react";
import {
	Attachment, AttachmentAction, AttachmentActions, AttachmentContent,
	AttachmentDescription, AttachmentMedia, AttachmentTitle, AttachmentTrigger,
} from "@valar/react-ui/attachment";

export default function AttachmentExample() {
	const [state, setState] = useState("uploading");
	return (
		<div className="grid min-w-0 gap-2">
			<Attachment state={state === "uploading" ? "uploading" : state === "cancelled" ? "error" : "done"} className="w-full">
				<AttachmentMedia><span aria-hidden="true">↗</span></AttachmentMedia>
				<AttachmentContent>
					<AttachmentTitle>project-notes.txt</AttachmentTitle>
					<AttachmentDescription>{state === "uploading" ? "Uploading…" : state === "cancelled" ? "Upload cancelled" : "Local preview opened"}</AttachmentDescription>
				</AttachmentContent>
				<AttachmentActions><AttachmentAction aria-label="Cancel upload" disabled={state !== "uploading"} onClick={() => setState("cancelled")}>×</AttachmentAction></AttachmentActions>
				<AttachmentTrigger aria-label="Preview project notes" onClick={() => setState("preview")} />
			</Attachment>
		</div>
	);
}
