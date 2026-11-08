---
title: Confirm Action
description: 支持异步结果、重试和撤销的行内确认。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="confirm-action-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="confirm-action" />

## 行为合同

`import { ConfirmAction, type ConfirmActionState, type ConfirmActionMode } from '@valar/svelte-ui/confirm-action'`。

必填 label:string，可选 prompt:string、icon:Snippet。可本地化文案为 confirmLabel、cancelLabel、pendingLabel、doneLabel、errorLabel、retryLabel、undoLabel、undoingLabel、cancelledLabel、undoneLabel、holdLabel、countdownLabel。默认文案保持来源英文删除操作，新增状态播报也可本地化。

状态为 idle | confirming | pending | done | error。defaultState='idle' 初始化非受控状态。state 与 onStateChange(next) 配对受控，调用方确认请求；挂载期间不切换控制模式。onConfirm 与可选 onUndo 返回 void 或 Promise；失败显示 error，Retry 重试失败操作。onCancel 观察取消。外部重置或卸载后的旧异步结果被忽略，等待期间不重复提交。转发原生 div 属性，支持 bind:ref。

confirmMode='press' | 'hold' | 'countdown'（默认 press）；holdDuration=1000 毫秒、countdown=3 秒。取消、Escape、外部按下（cancelOnOutsidePress=true）关闭问题。开启后有 280 毫秒防误触。confirmTimeout=6000、resultTimeout=5000 毫秒；悬停、内部焦点、隐藏文档时暂停，0 禁用。disabled 影响所有操作状态，fullWidth 充满并居中，同时扩展初始按钮并提供至少 44px 点击高度。进入确认时焦点保持在确认按钮，Shift+Tab 到取消。等待时使用原生 Valar Spinner，减少动态效果时停止旋转，保留等待文字与状态播报。无模态或来源动效运行时。

状态切换采用独立编写的原生尺寸／圆角／内容反馈（容器 120 毫秒、内容进入 80 毫秒、旧画面退出 60 毫秒），不是 Arc 动画实现或参数的翻译。操作和焦点立即更新，动画可中断且不阻塞输入。真实控件不缩放、不裁剪；旧画面不可交互且对辅助技术隐藏，始终只有一个状态播报区。减少动态效果时直接切换，包括动画中途改变偏好；窗口尺寸变化和卸载会清理动画。自然尺寸相同的状态不额外抖动。这是 Valar 有意视觉适配，不声明等价；双侧实测证据见 TokenPlan 转换记录。
