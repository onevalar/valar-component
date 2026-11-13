# Context Menu 设计规范

- 默认外观参考 Linear 问题列表的右键菜单。实色面板圆角 12 px，选项高至少 32 px，行内圆角 8 px，图文间距 8 px。普通操作起止留白 8／12 px，选择行给行尾勾选预留 32 px。键盘高亮留在选项内部。面板与子菜单使用同一浅深配色。

- 右键（触屏为长按）菜单不容易被发现：菜单里的每个操作都必须在界面其他地方也能完成，如工具栏按钮或 Dropdown Menu。
- `ContextMenu.Trigger` 包住响应右键的区域。需要将普通容器加入键盘顺序时，添加 `tabindex={0}` 和可访问名称。聚焦后可按 Shift+F10 或菜单键，Escape 关闭并归焦。
- 操作用 `onSelect`，复选和单选分别用 `CheckboxItem` 和 `RadioItem`。行尾的 `ContextMenu.Shortcut` 仅提示快捷键。确认流程可以由中性色菜单项打开，确认按钮再使用危险色。
- 父菜单与子菜单根据锚点和可用空间定位，内容过长时在各自的菜单内滚动。
- 可搜索的子面板用 `SubTrigger aria-haspopup="dialog"` 和具名的 `SubContent role="dialog"`，内部放 Command 输入与选项列表。打开时聚焦输入，确认后关闭主菜单，Escape 返回子菜单入口。
- 不要用它替代浏览器在输入框、链接上的原生右键菜单。
