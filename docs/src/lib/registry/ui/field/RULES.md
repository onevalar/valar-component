# Field 设计规范

- 设置行用 `appearance="settings"`，16 px 行内边距、12 px 控件间距、3 px 标签与说明间距。需要窄屏堆叠时，放在 `Field.Group` 中并用 `orientation="responsive"`。
- 每个输入控件都放在 `Field.Field` 中，并用 `Field.Label for={id}` 关联控件的 `id`；不要只靠 `placeholder` 说明用途（检查规则 `valar/input-label`）。
- 补充说明用 `Field.Description`，校验错误用 `Field.Error`，在控件上用 `aria-describedby` 关联它们。错误列表会省略空白及重复消息。必填状态由控件的 `required` 表达，可搭配 `Field.Label required` 的标记。
- 只有说明或权限信息的设置行用 `Field.Title` 与可见说明。原生字段组的禁用语义用 `Field.Set disabled`。
- 一组相关字段用 `Field.Set` + `Field.Legend` 包起来，多组之间用 `Field.Separator`。
- 开关、复选框等横向排列时用 `<Field.Field orientation="horizontal">`，不要手写 flex 布局。
- 表单状态与校验交给 Form（Formsnap/Superforms）；Field 只负责布局和语义。
