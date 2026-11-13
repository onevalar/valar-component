# Dropdown Menu 设计规范

- 用于点击按钮后展开的一组操作命令；为表单选值用 Select，右键菜单用 Context Menu，站点导航用 Navigation Menu。
- 打开菜单的按钮通过 `DropdownMenu.Trigger` 的 `{#snippet child({ props })}` 渲染 Button；只有图标的触发按钮要有 `aria-label`（检查规则 `valar/trigger-child-snippet`、`valar/icon-button-label`）。
- 操作用 `DropdownMenu.Item` 的 `onSelect`；跳转页面用 `child` snippet 把 `props` 传给 `<a href>`，不要在 Item 里再嵌套链接或按钮。
- 删除等不可撤销的操作放在末尾，用 `DropdownMenu.Separator` 分组。普通菜单项打开 Alert Dialog，危险色用于最终确认。需要直接强调菜单命令时可以使用 `variant="destructive"`。
- 可勾选的设置用 `DropdownMenu.CheckboxItem`，多选一用 `DropdownMenu.RadioGroup` 与 `DropdownMenu.RadioItem`。行尾符号表达已选或半选状态，行底色随鼠标和键盘焦点移动。选择后默认保持打开，可按流程设置 `closeOnSelect`。
- 分组标题用 `DropdownMenu.Label`（或 Group 里的 `GroupHeading`），没有图标的项需要与有图标的项对齐时设 `inset`。
- `DropdownMenu.Shortcut` 只显示快捷键文字，不会绑定按键；显示的快捷键必须在别处真正实现。
- 菜单宽度默认与触发按钮一致；需要更宽时用 `min-w-*` 档位，位置用 `align`、`side` 属性，不要写像素值。
- 主菜单和子菜单默认采用 12 px 圆角的实色面板与 0.5 px 描边。操作行和 Context Menu 一致，最小高度 32 px、圆角 8 px、图文间距 8 px，行内起止留白为 8／12 px。单选和复选给勾选符号预留 32 px，分隔区高 12 px。文字为 13 px／400。`appearance="surface"` 按内容定宽。主菜单和子菜单应使用同一个主题 Portal。
- 菜单根据可用空间翻转或收窄，长菜单在面板内滚动。用方向键移动焦点，侧向方向键打开和返回子菜单，Escape 关闭菜单并返回触发器。
