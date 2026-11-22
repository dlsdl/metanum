// ──────────────────────────────────────────────────────────────────
// test_operations.js — 40-operation × 5×5 operand matrix
//
// 40 operations: add, mul, pow, tetr, pent + the 35 ordinal-level
// hyperoperations from ω (aperiote) up to ε₀ (epsilonate).
// 5 operands each side: 3, 1187, 1.5e16, 4↑↑4 = tetr(4,4),
// 3↑↑↑3 = pent(3,3)  →  40 × 5 × 5 = 1000 evaluations.
//
// Every cell prints the resulting MetaNum object (sign / layer / array)
// and its .format() string.  Run: node test_operations.js
// ──────────────────────────────────────────────────────────────────
(function () {
  // bare assignment (sloppy mode) exposes the globals format-metanum.js's
  // instance .format() needs — same setup as test_mixed.js
  var isBrowser = (typeof window !== "undefined" && typeof window.document !== "undefined");
  if (!isBrowser) {
    if (!this.MetaNum) MetaNum = require("./metanum.js");
  }

  // ── operand pool ──────────────────────────────────────────────
  var operands = [
    { label: "3",       value: MetaNum(3) },
    { label: "1187",    value: MetaNum(1187) },
    { label: "1.5e16",   value: MetaNum(1.5e16) },
    { label: "4^^4",    value: MetaNum(4).tetr(4) },      // 4↑↑4
    { label: "3^^^3",   value: MetaNum(3).pent(3) }       // 3↑↑↑3
  ];

  // ── operation table ───────────────────────────────────────────
  var ops = [
    ["add",  "addition       x+y"],
    ["mul",  "multiplication x*y"],
    ["pow",  "power          x^y"],
    ["tetr", "tetration      x^^y"],
    ["pent", "pentation      x^^^y"],
    // 35 ordinal-level hyperoperations, ω → ε₀
    ["aperiote",          "ω          h10"],
    ["expande",           "ω+1        h11"],
    ["multiexpande",      "ω+2        h12"],
    ["powerexpande",      "ω+3        h13"],
    ["aperioexpande",     "ω*2        h20"],
    ["explode",           "ω*2+1      h21"],
    ["multiexplode",      "ω*2+2      h22"],
    ["aperioexplode",     "ω*3        h30"],
    ["detonate",          "ω*3+1      h31"],
    ["aperiodetonate",    "ω*4        h40"],
    ["aperionate",        "ω^2        h100"],
    ["megote",            "ω^2+1      h101"],
    ["multimegote",       "ω^2+2      h102"],
    ["aperimegote",       "ω^2+ω      h110"],
    ["megoexpande",       "ω^2+ω+1    h111"],
    ["aperimegoexpande",  "ω^2+ω*2    h120"],
    ["megoaperionate",    "ω^2*2      h200"],
    ["gigote",            "ω^2*2+1    h201"],
    ["aperigigote",       "ω^2*2+ω    h210"],
    ["gigoaperionate",    "ω^2*3      h300"],
    ["aperiatote",        "ω^3        h1000"],
    ["powiainate",        "ω^3+1      h1001"],
    ["expandainate",      "ω^3+ω      h1010"],
    ["megodainate",       "ω^3+ω^2    h1100"],
    ["powiairate",        "ω^3*2      h2000"],
    ["aperioguate",       "ω^4        h10000"],
    ["iterate",           "ω^ω        hww"],
    ["itermult",          "ω^ω+1      hw01"],
    ["iteraperiate",      "ω^ω+ω      hw0w"],
    ["cuboiter",          "ω^ω*2      hwx2"],
    ["expoiter",          "ω^(ω+1)    hwa1"],
    ["trioterate",        "ω^(ω*2)    hwm2"],
    ["trixxate",          "ω^(ω^2)    hwp2"],
    ["aperixxate",        "ω^(ω^ω)    hwpw"],
    ["epsilonate",        "ε₀         hepsl"]
  ];

  function objectString(v) {
    if (!v) return "null";
    return JSON.stringify({ sign: v.sign, layer: v.layer, array: v.array });
  }

  // ── run the 1000-cell matrix ───────────────────────────────────
  console.log("=== 40 operations x 5 x 5 operand matrix (1000 evaluations) ===");
  var t0 = Date.now();
  var nValid = 0, nNaN = 0, nError = 0;
  var firstError = "";

  for (var oi = 0; oi < ops.length; oi++) {
    var opName = ops[oi][0], opDesc = ops[oi][1];
    console.log("\n--- [" + (oi + 1) + "/" + ops.length + "] " + opName
      + " (" + opDesc + ") ---");
    for (var ai = 0; ai < operands.length; ai++) {
      for (var bi = 0; bi < operands.length; bi++) {
        var a = operands[ai].value, b = operands[bi].value;
        var line = opName + "(" + operands[ai].label + ", " + operands[bi].label + ")";
        try {
          var v = new MetaNum(a)[opName](b);
          var fs;
          try { fs = v.format(); } catch (e2) { fs = "<format error: " + e2.message + ">"; }
          console.log(line + " = " + objectString(v) + " | " + fs);
          if (v.isNaN && v.isNaN()) nNaN++; else nValid++;
        } catch (e) {
          nError++;
          if (!firstError) firstError = line + ": " + (e && e.message ? e.message : e);
          console.log(line + " = <ERROR " + (e && e.message ? e.message : e) + ">");
        }
      }
    }
  }

  // ── summary ───────────────────────────────────────────────────
  console.log("\n=== summary ===");
  console.log("total: " + (nValid + nNaN + nError) + " (expected 1000)");
  console.log("valid: " + nValid + ", NaN: " + nNaN + ", error: " + nError);
  if (firstError) console.log("first error: " + firstError);
  console.log("elapsed: " + (Date.now() - t0) + " ms");
})();
