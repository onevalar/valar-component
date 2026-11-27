import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@valar/react-ui/alert-dialog";
import { Button } from "@valar/react-ui/button";
import { useState } from "react";

export default function AlertDialogExample() {
	const [open, setOpen] = useState(false);
	const [deleted, setDeleted] = useState(false);

	return (
		<section aria-label="Alert Dialog examples" className="grid w-full max-w-sm gap-3 p-6 text-sm">
			<p role="status">
				{deleted ? "Launch checklist draft deleted." : "Launch checklist · Unpublished draft"}
			</p>
			<AlertDialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen && !deleted)}>
				<AlertDialogTrigger asChild>
					<Button
						className="justify-self-start"
						variant="outline"
						aria-disabled={deleted || undefined}
					>
						Delete draft
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent appearance="danger" focusCancel>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete the launch checklist draft?</AlertDialogTitle>
						<AlertDialogDescription>
							The draft and its unpublished changes will be permanently deleted. This cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								setDeleted(true);
								setOpen(false);
							}}
						>
							Delete draft
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
