# REQ-MOBILE-006 点击顶部货币名切换货币

- 状态: 待办
- 优先级: P1
- 类型: 外部
- 来源: 口头（领导）
- 提出日期: 2026-08-04
- 关联: 无

## 背景 / 问题

移动端点击顶部栏的货币名称时，应支持切换货币（目前顶部品种名不可点，切换需通过搜索图标弹出品种 sheet）。

## 需求描述（领导原话要点）

1. 点击上方货币时，**支持切换货币**。

## 验收标准（待补充）

- [ ] 点击顶部货币名可切换货币
- [ ] 切换后图表/副图/标题同步更新
- [ ] 与现有搜索图标（品种 sheet）入口不冲突

## 备注

- 当前入口：`MobileTopBar` 的搜索图标 → 打开 `codeSheetOpen`（品种下拉 sheet）。
- 简单做法：把顶部品种名区域变为可点击，点击触发同一个 `codeSheetOpen`，或直接复用品种 sheet。
- `MobileTopBar.tsx` 现有 `instrument.name` 只读展示；`MobileLayout` 有 `onSearch={() => setCodeSheetOpen(true)}`。
