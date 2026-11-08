<script lang="ts">
	import { ConfirmAction } from "$lib/registry/ui/confirm-action/index.js";
	const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 800));
</script>

<ConfirmAction
	label="移除示例"
	prompt="确定移除？"
	confirmLabel="移除"
	cancelLabel="取消"
	pendingLabel="正在移除…"
	doneLabel="已移除"
	errorLabel="操作失败"
	retryLabel="重试"
	undoLabel="撤销"
	undoingLabel="正在恢复…"
	cancelledLabel="已取消"
	undoneLabel="已撤销"
	onConfirm={pause}
	onUndo={pause}
/>
