# Switch 设计规范

- 用于立即生效的开关设置；需要点“保存”才生效的选项用 Checkbox。
- 每个 Switch 都要有可见标签说明它控制什么：设 `id`，用 `Field.Label for={id}` 关联，放在 `<Field.Field orientation="horizontal">` 中，标签在前、开关在后（检查规则 `valar/input-label`）。
- 标签写被控制的功能（“邮件通知”），不要写“开启／关闭”；状态由组件的 `aria-checked` 表达，不要在旁边再加“已开启”文字代替标签。
- 状态用 `bind:checked`；切换会触发耗时请求时，请求期间设 `disabled`，失败时恢复原值并提示。
- 尺寸只用 `size` 属性（`sm`、`default`），不要用 `class` 改宽高。
- `default` 用于设置行，轨道 30 × 20 px、滑块 14 × 14 px。`sm` 用于紧凑工具栏或弹窗底部，轨道 22 × 14 px、滑块 10 × 10 px。弹窗底部将短标签与 Switch 同行，再与主操作分组。
- 轨道背景与透明度使用 150 ms `ease-out`。减少动态效果时立即切换。实测参考与后续滑块动效对齐见 `standards/DESIGN.md`。
- 关闭时使用灰色轨道，开启时使用强调色。滑块两侧各过渡 100 ms，其中一侧延迟 50 ms，切换方向时交换延迟。设置区可通过 `--settings-switch-off`、`--settings-switch-on` 与 `--settings-focus` 提供主题色。
- 键盘焦点描边向内收 1 px。关闭时用强调色，开启时用白色与轨道区分，错误状态用错误色。禁用、等待和错误示例采用 Valar 的表单反馈规则。
