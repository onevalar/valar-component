# Dialog 设计规范

- 每个 `Dialog.Content` 都要有 `Dialog.Title`；界面上不想显示标题时给它加 `class="sr-only"`，不要删掉（检查规则 `valar/overlay-title`）。需要补充说明时加 `Dialog.Description`。
- 打开对话框的按钮通过 `Dialog.Trigger` 的 `{#snippet child({ props })}` 把 `props` 传给 `Button`；不要在 Trigger 里再放一个 Button（检查规则 `valar/trigger-child-snippet`）。
- 工作区紧凑编辑器可用 `Dialog.Content appearance="editor"`。标题与正文仍使用各自的组件，正文可能过长时保留弹窗的内部滚动。
- 普通弹窗居中，宽度上限 480 px，12 px 圆角，标题与表单共用浅深主题表面。操作栏按原有顺序换行，主次操作用同尺寸的胶囊按钮。
- 内边距、内容间距、圆角档位、遮罩不透明度、动效档位和出现时缩放都是组件参数，在 Dialog 文档页的编辑器中调整并写回组件库；不要在 `Dialog.Content` 上用 `class` 改 `p-*`、`gap-*`、`rounded-*`、`duration-*`、`zoom-*`。
- 宽度默认取组件参数的宽度档；个别对话框确需更宽时只加 `sm:max-w-*` 档位类，不写像素任意值。
- 操作按钮放在 `Dialog.Footer`，最多一个主按钮（见 Button 规范）。取消按钮用 `Dialog.Close` 的 `child` snippet 包一个 `variant="outline"` 的 Button。
- 右上角关闭按钮（`showCloseButton`，默认开启）和 `Dialog.Footer` 的 `showCloseButton` 自带的文字默认是“关闭”，其他语言用各自的 `closeLabel` 改。
- 弹窗默认在视口内滚动。需保持页首或操作栏可见时，给正文单独设置滚动，并用 `minmax(0, 1fr)` 限制正文所在网格行。
- 异步提交时通过按钮的 `loading` 保留焦点并阻止重复提交。失败后保留已输入的值，显示错误和重试。业务需要时，可在 `onEscapeKeydown` 和 `onInteractOutside` 内阻止等待中的关闭。
- 需要在代码中开关时用 `bind:open`；关闭后焦点会自动回到触发按钮，不要手动把焦点移到别处。
- 确认危险操作改用 Alert Dialog；从屏幕边缘滑出的辅助面板用 Sheet；移动端底部面板用 Drawer。
