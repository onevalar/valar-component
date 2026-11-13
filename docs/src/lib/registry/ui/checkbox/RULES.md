# Checkbox 设计规范

- Valar 默认复选框参考 Linear 的 Issue labels 列表。方框为 14 × 14 px、圆角 3 px、描边 1 px，未选中底色透明，选中时使用主题蓝紫色及 10 px 浅色勾选图标。
- 单项复选框使用边界内的焦点提示。方框与勾选标记即时切换。Valar 采用同一强调底色和短横线表达部分选中，禁用与错误沿用表单规则。
- 每个 Checkbox 都要有可点击的标签：给 Checkbox 设 `id`，用 `Field.Label for={id}`（或 Label）关联，并放在 `<Field.Field orientation="horizontal">` 中（检查规则 `valar/input-label`）。
- 一组相关的复选框用 `Field.Set` + `Field.Legend` 说明这一组是什么。
- 用于需要点“保存”“提交”才生效的选项；立即生效的设置用 Switch，多选一用 Radio Group。
- 状态用 `bind:checked`；部分选中（如“全选”下只选了一部分）用 `indeterminate`，不要换图标模拟。
- 放在原生表单中提交时设 `name` 和 `value`。错误状态用 `aria-invalid="true"` 加 `Field.Error`（检查规则 `valar/invalid-via-aria`）。
