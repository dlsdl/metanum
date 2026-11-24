# metanum 待办

> 2026-11-24 按维护者要求**移除已完成条目**：Issue #17 修复全流程（D01–D07、S01、
> 语义规范、Phase 1/2、上游 #19–#28）均已完结，不再在此罗列；历史见 git 记录。
> 当前已知问题（未修复 / 暂缓 / 限制类）统一登记在
> [`issue-17-defects.md`](issue-17-defects.md)（K01–K12）。

## 进行中 / 待启动

- [ ] 向 dlsdl/metanum 提 PR（含 v2.2.0：统一极限规则、iteraperiate、ordinal-level
      root forms，与 hyper_inv 连续实数逆运算）；若上游停滞，经 fork 供游戏采纳
      （对应 K12）
- [ ] `docs/testing.md`：测试 / 差分测试计划（原文档计划 C）
- [ ] `docs/serialization.md`：序列化兼容契约（原文档计划 D）
- [ ] K01 `expande(4,2.5)=10` 分数高度底数坍缩（P2，正确性）
- [ ] K02 分数底数 `ω^2` 族正向爆栈（P2，正确性）
- [ ] K03 `slog` 与主分支实数逆的冲突裁决（P3，需规格层决策）

## 关联

- 当前已知问题：[`issue-17-defects.md`](issue-17-defects.md)
- 语义规范：[`notation-semantics.md`](notation-semantics.md)
- D07/B2 设计记录：[`d07-engine-design.md`](d07-engine-design.md)
- 逆运算实测结果：[`../README.md`](../README.md)「Continuous real-valued inverses · Verification」
- 游戏侧红线：`uncontrolled-ai-incremental/docs/决策记录.md` ADR-003
