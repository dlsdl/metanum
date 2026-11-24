# 后续 issue 清单（已并入当前已知问题登记册）

> 2026-11-24 按维护者要求**移除已修复条目**：上游 #19–#24（含 not planned 的 #22/#24）、
> #26、#28 及 FU-01..FU-06 中已关闭项不再在此登记；`toBeaf` 次单位/负号（FU-03）
> 经实测已修复（`{10,320}⁻¹` / `-{5}`，不可表示抛 `MetaNumUnrepresentableError`）。
> 历史判定见 git 记录。

## 当前未决项

全部未决、暂缓与限制类问题统一登记在
[`defects.md`](defects.md)（当前已知问题登记册，K01–K12）：

| 登记册条目 | 原 FU / 来源 | 优先级 |
|---|---|---|
| K01 `expande(4,2.5)=10` 表示级非单调 | hyper_inv 验收发现 | P2 |
| K02 分数底数 `ω^2` 族正向爆栈 | hyper_inv 验收发现 | P2 |
| K03 `slog` 近似 vs 主分支实数逆（记录的冲突） | hyper_inv 冲突门禁 | P3 |
| K04 基数 1 高层正向不折叠 | hyper_inv 验收发现 | P3 |
| K05 `epsilonate` y∈(1,2) marker 编码 y+1 | hyper_inv 验收发现 | P3 |
| K06 对角小参数往返容差级 | FU-02 残余 | P3 |
| K07 token 深度 >64 退回进位近似 | #28 既定行为 | P4 |
| K08 求逆表示级限制（非缺陷） | hyper_inv 已知限制 | P4 |
| K09 测试覆盖缺口（SKIP 登记） | hyper_inv 12.4 | P4 |
| K10 `ω^ω` 层 x≥3 精确化不可行 | FU-04（not planned） | 不建议 |
| K11 F01 分隔符记法 | FU-06（feature 暂缓） | 暂缓 |
| K12 流程待办（提 PR、testing/serialization 文档） | 待办.md 残余 | P4 |

新增问题请直接登记到 [`defects.md`](defects.md)，不再维护本文件。
