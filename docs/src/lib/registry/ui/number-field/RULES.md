# Number Field 设计规范

- 用于需要精确输入的数字（数量、金额、端口号），代替 `<Input type="number">`；有明确范围且适合拖动时用 Slider Field。
- 设 `id` 并用 `Field.Label for={id}` 关联可见标签（检查规则 `valar/input-label`）。
- 按需设 `min`、`max`、`step`；超出范围或无法解析的输入会自动标为无效，不要再自己用颜色标错（检查规则 `valar/invalid-via-aria`）。
- 加减按钮名称（`decrementLabel`、`incrementLabel`）和 `invalidMessage` 默认是中文，其他语言的界面传对应文案；数字格式默认 `locale="zh-CN"`，其他语言的界面传对应 `locale`。
- 金额、百分比、单位用 `formatOptions`（`Intl.NumberFormatOptions`）格式化，不要把单位拼进值里；值始终是数字或 `undefined`（输入框为空）。
- 放在表单中提交时设 `name`，提交的是未格式化的数字。

## 整美元金额

- 用 `appearance="amount"` 表达 Linear Settings → Usage & limits → Spend limits 的整美元上限。28 px 高、最大宽 96 px，8 px 圆角，透明底色，左右 10 px，前缀和数字间隔 4 px。金额和美元符号均为 12 px／450。
- 前缀为装饰，给表单标签写明币种。数字按美式千位分组。空白对应 `undefined`，实际输入和提交都不含美元符号。组件不定义业务金额上限，调用方传入的范围和必填规则继续生效。
- 作为单个文本框参与 Tab 顺序，手机唤起数字键盘。上下箭头沿用文本框行为。聚焦仅调整边线和内描边，窄屏宽度由外层限制。
