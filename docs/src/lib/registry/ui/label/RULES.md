# Label 设计规范

- 默认标签采用 Linear 设置表单取样的 13 px／500、常规行高。浅色文字 `lch(10% 0 282)`，深色文字 `lch(100% 0 272)`。独立设置行可用 `appearance="settings"`。
- 表单里优先用 `Field.Label`，它已包含 Label；只在 Field 之外的简单场景直接用 Label。
- 必须用 `for` 指向控件的 `id`，或把控件包在 Label 里，点击标签才能聚焦或切换控件。
- 标签写控件的用途。为控件设置原生 `required` 或适用的 `aria-required`。可同时给 Label 传 `required` 显示星号。受限设置项的标题用 Field.Title。独立禁用控件可在标签上设 `data-disabled="true"`，并在控件本身设 `disabled`。
