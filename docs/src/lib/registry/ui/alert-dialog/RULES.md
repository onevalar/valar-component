# Alert Dialog 设计规范

- 只用于需要用户明确确认的操作，如删除、覆盖、放弃未保存的修改；普通表单和内容用 Dialog，操作结果的通知用 Sonner。
- 必须有 `AlertDialog.Title` 和 `AlertDialog.Description`：标题直接问要做的事（“删除这个项目？”），说明写清后果以及能否撤销（检查规则 `valar/overlay-title`）。
- 必须有 `AlertDialog.Cancel`：点击遮罩不会关闭，用户只能按 Esc 或点按钮离开（检查规则 `valar/alert-dialog-cancel`）。
- 普通确认和 `appearance="confirmation"` 使用同一套 480 px 宽、12 px 圆角、20 px 内边距和透明底操作栏。丢弃草稿或删除时可通过 `focusCancel` 把初始焦点放在安全操作上。传入 `onOpenAutoFocus` 时仍可自行指定焦点。
- 对照 Linear 删除确认时可用 `appearance="danger"` 与 `variant="destructive"`。弹窗最大宽 480 px，圆角 12 px，水平留白 24 px，操作按钮高 32 px。危险按钮两主题均用 `lch(58% 73 29)`。
- 按钮文字写具体动作（“删除”“放弃修改”），不要写“确定”“是”。危险操作的 `AlertDialog.Action` 设 `variant="destructive"`；Action 和 Cancel 的尺寸只用 `size` 属性（检查规则 `valar/button-size-via-prop`）。
- `AlertDialog.Action` 的业务操作成功后通过 `bind:open` 关闭。异步操作期间可用 `loading` 阻止重复触发并保留焦点，配合文案和 Spinner。失败时保留对话框并就地提供错误原因和重试。
- 按钮放在 `AlertDialog.Footer`。普通确认把 Cancel 放在主操作前；草稿确认把次要的丢弃动作放在 Cancel 前。窄屏时按原有顺序换行。
- 简短的确认用 `<AlertDialog.Content size="sm">`；需要图标时放进 `AlertDialog.Media`，不要自己写带颜色的图标容器。
- 打开它的按钮通过 `AlertDialog.Trigger` 的 `child` snippet 渲染 Button（检查规则 `valar/trigger-child-snippet`）。
