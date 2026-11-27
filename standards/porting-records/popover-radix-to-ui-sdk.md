# Popover · Radix → UI SDK React

2026-11-27 · 部分实现，迁移验收未通过（转换规范 1.0，未独立审阅）。仅 React 私有预览的现有 Popover 表单和显示选项，以同一份 JSX 对比两套外层实现，内层保留原 Radix Select。SDK 为 `0.1.0-beta.17`（Apache-2.0）。不切换 Valar 包、registry、Vue 或 Svelte 的正式实现。

| 既有合同 | 试验范围 |
| --- | --- |
| `open` / `onOpenChange` / `defaultOpen` | 受控表单及非受控显示选项；确认、取消、外部点击、默认打开。 |
| `asChild`、标题与描述 | Valar Button 保留为唯一 DOM 按钮；表单保持可访问名称、描述及原生必填。 |
| 嵌套和归焦 | 使用未修改的 Radix Select；Escape 应只关闭顶层，选择选项也不应关闭外层；检验两级归焦。 |
| 完整公开 API | 自定义 Anchor、Portal 容器/保留挂载、模态、可取消的 Escape/外按/开合归焦回调等不属于此小范围适配。 |

## 实测结果

| 检查 | React Radix 基线 | UI SDK 试点 |
| --- | --- | --- |
| 普通表单 | 通过 | 通过：`asChild` 保留 Valar Button，名称/描述、必填、提交、取消、外部关闭和触发器归焦通过。 |
| 初始打开 | 通过 | 通过：`defaultOpen` 与非受控关闭。 |
| 嵌套 Radix Select | 通过：选择选项保持外层；首次 Escape 关内层并归焦到选择器，第二次关外层并归焦到触发器。 | **失败**：打开 Select 后焦点进入传送到 `body` 的选项，外层随即关闭，焦点落到 `body`。键盘和点击打开均已复现，不必按 Escape。 |
| 可取消事件、定制 Portal/Anchor、模态、SSR/hydration、实机触屏与读屏 | 沿用正式实现 | 未实现或未验证，不视作 API 等价。 |

复现：React 预览 `?example=popover` 为 Radix，追加 `&backend=ui-sdk` 切换试点。打开 **Display options**，在 **Grouping** 按 Down 或点击。浏览器事件记录显示试点在内层选项收到 `focusin` 后失去外层，并非先收到 Escape；SDK 的非模态层判断没有把原 Radix Select 的 Portal 算作子层。[对照测试](../../apps/framework-comparison/tests/sdk-popover.spec.ts) 特意记录这个已知失败，并不代表嵌套兼容通过。原 [Popover 回归](../../apps/framework-comparison/tests/popover.spec.ts) 的 React/Vue 两主题四项走原实现且通过。

结论：普通场景的 API 适配可行，但不能原位替换已被组合使用的 Popover。不要在兼容层按第三方 DOM 特征屏蔽事件；只有当跨库的子层归属能保住关闭顺序和两级归焦时，才进入下一轮替换验收。
