# Alert 设计规范

- Alert 自带 `role="alert"`，用于需要立即播报的动态告警；静态说明用 `role="group"` 配合可访问名称，非紧急的动态反馈用 `role="status"`。
- 类型只用 `variant`（`default`、`destructive`），不要自定义背景色；同时配合图标和文字说明，不要只靠颜色区分。
- 结构用 `Alert.Title` 写要点、`Alert.Description` 写细节和解决办法；图标作为第一个子元素放在 Alert 内；相关操作放进 `Alert.Action`。
- 操作完成后的短暂反馈用 Sonner，需要用户确认的操作用 Alert Dialog。
- 操作默认放在内容尾侧；当提示框的内容区窄于 17rem 时移至文案下方，不挤压标题和说明。
- 上传失败通知可用 `appearance="notification"`。采用中性表面、12 px 内边距和 8 px 内容间距。关闭按钮作为直属子项，设置 `data-slot="alert-dismiss"` 及可访问名称。恢复操作放在正文下方。显示时长以及关闭后归焦的位置由宿主控制。
- 阻断流程的常驻错误使用 `appearance="workflow-error"`。前导图标负责危险色，标题用中性正文色。`Alert.Description` 内用 `data-slot="alert-recovery-details"` 包住排查说明，可用 `Alert.Action` 提供带分隔线的帮助区。将返回与下一步留在流程操作栏，恢复操作和焦点由宿主管理。
