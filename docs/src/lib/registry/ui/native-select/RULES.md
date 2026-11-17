# Native Select 设计规范

- 用于需要浏览器原生行为的场景：移动端系统选择器、无 JavaScript 的表单、很长的简单列表。需要自定义选项样式或分组标题时用 Select。
- `NativeSelect.Root` 设 `id` 并用 `Field.Label for={id}` 关联，或提供 `aria-label`（检查规则 `valar/input-label`）；错误状态用 `aria-invalid="true"`（检查规则 `valar/invalid-via-aria`）。
- 选项用 `NativeSelect.Option`，分组用 `NativeSelect.OptGroup`；没有默认值时第一项写成 `value=""` 的提示项。
- 尺寸用 `size` 属性（`sm`、`default`）；不要再写原生 `<select>`（检查规则 `valar/use-form-component`）。

## 联系表单

- `appearance="contact"` 取样于 Linear 联系销售表单的公司规模。闭合控件保持 40 px 高、8 px 圆角，铺满所在行。起始留白 10 px，双箭头 16 px、距末端 10 px，文字为图标另留空间。
- 窄屏文字 16 px／24 px 行高，宽屏 14 px／21 px 行高，均为 400 字重。深色沿用采样颜色，浅色复用 Valar 语义颜色。键盘聚焦使用内侧描边。
- 浏览器继续负责选项列表、键盘、系统弹窗和表单语义。使用 `dir` 或从外层继承方向时，图标和文字留白随方向交换。
