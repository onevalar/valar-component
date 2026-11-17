# Attachment 设计规范

- 用于聊天输入框、消息和上传列表中的文件或图片。多个附件放进 `Attachment.Group`，悬浮滚动条覆盖内容。默认横向吸附，纵向堆叠用 `orientation="vertical"`。
- 上传过程用 `state` 表达（`idle`、`uploading`、`processing`、`error`、`done`），不要自己加颜色；出错时在 `Attachment.Description` 写明原因，不要只靠红色。
- `Attachment.Action` 默认只有图标，每个都要有说明动作和对象的 `aria-label`（如“移除 report.pdf”）；`Attachment.Trigger` 覆盖整张卡片且没有文字，也必须有 `aria-label`（检查规则 `valar/icon-button-label`）。
- 图片附件在 `<Attachment.Media variant="image">` 中放 `<img>` 并写 `alt`（检查规则 `valar/image-alt`）。
- Agent 文件卡片用 `appearance="agent-file"`，草稿里的行内图片用 `appearance="agent-image"` 保持比例。通用附件用 `size` 与 `orientation` 控制尺寸和排列。
- 文件大小不合格时，保留中性色的本地选择卡，用独立的通知提示原因。提供移除或重新选择入口。
- 只用于展示的附件行使用 `aria-label` 命名分组的滚动视口，支持聚焦和键盘滚动。
