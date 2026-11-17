# Code Block 设计规范

- 用于展示代码和命令；行内的短代码用 `<code>`，键盘按键用 Kbd。
- 代码文本传给 `CodeBlock.Content` 的 `code` 属性，需要行号时设 `lineNumbers`（可配合 `startLine`），长行需要换行时设 `wrap`；不要手写行号。
- 复制按钮用 `CodeBlock.CopyButton` 并传 `value`；读屏名称和复制后的提示默认是中文（“复制”“已复制”），其他语言用 `copyLabel`、`copiedLabel` 改。
- 文件名或语言写在 `CodeBlock.Header` 的 `CodeBlock.Title` 中；出错的输出用 `variant="destructive"`，同时在文字中说明错误。
- 紧凑场景用 `size="sm"`；代码内容固定从左到右排版，不要改 `dir`。
- Issue 描述与 Agent 回复可分别使用 `appearance="issue"` 和 `appearance="agent"`。它们复用实测的紧凑代码表面、等宽排版和行号留白。语言标签使用 `CodeBlock.Title`，只提供当前界面可用的操作。
- 内容溢出由 Scroll Area 渲染悬浮滚动条。设置 `max-h-*` 可限制视口高度。需要先裁切再展开时，只在收起状态使用 `scrollOrientation="horizontal"`，避免纵向滚动绕过展开状态。
- `ref` 指向语义 `pre`，`viewportRef` 指向实际滚动视口。给视口设置清楚的 `aria-label`，并从键盘验证长行、焦点边界和复制反馈。
