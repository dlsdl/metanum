if (!this.MetaNum) MetaNum =  require("./metanum.js");
if (!this.format) format = require("./format-metanum.js").format;
//if (!this.FORMAT_OPTIONS) FORMAT_OPTIONS = require("./format-metanum.js").FORMAT_OPTIONS;

function check(name, input, expectedArray) {
  try {
    var m = MetaNum(input);
    var arrStr = JSON.stringify(m.array);
    var expStr = JSON.stringify(expectedArray);
    var pass = arrStr === expStr;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + input);
    if (!pass) {
      console.log("  Got:      " + arrStr);
      console.log("  Expected: " + expStr);
    }
  } catch (e) {
    console.log("ERROR | " + name + " | " + input + " => " + e.message);
  }
}

function checkRT(name, input) {
  try {
    var m = MetaNum(input);
    var s = m.toString();
    var m2 = MetaNum(s);
    var pass = m.eq(m2);
    console.log((pass ? "PASS" : "FAIL") + " | RT " + name + " | " + input + " => " + s + " => " + m2.toString());
    if (!pass) console.log("  Got:      " + m2.toString());
  } catch (e) {
    console.log("ERROR | RT " + name + " | " + input + " => " + e.message);
  }
}

console.log("\n=== 1-letter regression ===");
checkRT("E308", "E308");
checkRT("EE100", "EE100");
checkRT("FE10", "E^9999999998 10000000000");
checkRT("G10", "F^8 E^8 10000000000");
checkRT("J1000", "I^998 H^8 G^8 F^8 E^8 10000000000");
checkRT("Z10", "Y^8 X^8 W^8 V^8 U^8 T^8 S^8 R^8 Q^8 P^8 O^8 N^8 M^8 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000");

console.log("\n=== 2-letter regression ===");
checkRT("Aa10", "Aa10");
checkRT("Ab5", "Ab5");
checkRT("Ac100", "Ac100");
checkRT("AaAa10", "AaAa10");
checkRT("AbAb10", "AbAb10");
checkRT("Ba10", "Ba10");
checkRT("BaBa10", "BaBa10");
checkRT("Bb10", "Bb10");
checkRT("Bc10", "Bc10");
checkRT("Bz10", "Bz10");
checkRT("Ca10", "Ca10");
checkRT("Zz10", "Zz10");

console.log("\n=== 3-letter regression ===");
checkRT("Aaa10", "Aaa10");
checkRT("Aaa1000", "Aaa1000");
checkRT("AaaAaa10", "AaaAaa10");
checkRT("Aab10", "Aab10");
checkRT("Aac10", "Aac10");
checkRT("Aba10", "Aba10");
checkRT("Abb10", "Abb10");
checkRT("Aza10", "Aza10");
checkRT("Baa10", "Baa10");
checkRT("Zzz10", "Zzz10");

console.log("\n=== 4-letter regression ===");
checkRT("Aaaa10", "Aaaa10");
checkRT("Aaaa1000", "Aaaa1000");
checkRT("AaaaAaaa10", "AaaaAaaa10");
checkRT("Aaab10", "Aaab10");
checkRT("Aaba10", "Aaba10");
checkRT("Abaa10", "Abaa10");
checkRT("Baaa10", "Baaa10");
checkRT("Zzzz10", "Zzzz10");

console.log("\n=== symbol+letters regression ===");
checkRT("!Aa10", "!Aa10"); //layer=1
checkRT("!Abcd10", "!Abcd10"); //layer=1
checkRT("@Ef10", "@Ef10"); //layer=2
checkRT("#Gh100", "#Gh100"); //layer=3
checkRT("1ε100", "1ε100"); //layer=100
checkRT("1ε9007199254740991", "1ε9007199254740991"); //layer=MSI

console.log("\n=== mixed token tests ===");
check("BbBbAaGGGFFE100 array", "BbBbAaGGGFFE100", [[100, 1, 2, 3], [1,0,1],[2,1,2]]);
check("QqQe308 array", "QqQe308", [[308], [1, 4, 17], [1, 16, 17]]);
checkRT("BbBbAaGGGFFE100", "BbBbAaGGGFFE100");
checkRT("QqQe308", "QqQe308");

console.log("\n=== spaced letter-chain parse (toString round-trip) ===");
check("E^8 10000000000 array", "E^8 10000000000", [[10000000000, 8]]);
check("F^8 E^8 10000000000 array", "F^8 E^8 10000000000", [[10000000000, 8, 8]]);
check("M^7 chain array", "M^7 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000", [[10000000000, 8, 8, 8, 8, 8, 8, 8, 8, 7]]);
check("I^998 chain array (J1000)", "I^998 H^8 G^8 F^8 E^8 10000000000", [[10000000000, 8, 8, 8, 8, 998]]);
check("E^65532 19727.7804056 array", "E^65532 19727.7804056", [[19727.7804056, 65532]]);
checkRT("E^8 10000000000", "E^8 10000000000");
checkRT("F^8 E^8 10000000000", "F^8 E^8 10000000000");
checkRT("M^7 chain", "M^7 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000");
checkRT("I^998 chain (J1000)", "I^998 H^8 G^8 F^8 E^8 10000000000");
checkRT("E^9999999998 (FE10)", "E^9999999998 10000000000");

function checkOp(label, result, expectedVal, tol) {
  if (tol === undefined) tol = 0.01;
  try {
    // no expected value: informational check (must not throw, must be a MetaNum)
    if (expectedVal === undefined) {
      console.log("PASS | " + label + " | got: " + (result.toString ? result.toString().slice(0,100) : result));
      return;
    }
    // boolean results: strict comparison
    if (typeof result === "boolean" || typeof expectedVal === "boolean") {
      console.log((result === expectedVal ? "PASS" : "FAIL") + " | " + label + " | got=" + result + " expected=" + expectedVal);
      return;
    }
    var rn = result.toNumber ? result.toNumber() : result;
    if (Number.isNaN(rn) && Number.isNaN(expectedVal)) {
      console.log("PASS | " + label + " | NaN (expected)");
      return;
    }
    if (Number.isFinite(rn) && Number.isFinite(expectedVal)) {
      var ok = Math.abs(rn - expectedVal) <= tol;
      console.log((ok ? "PASS" : "FAIL") + " | " + label + " | got=" + (result.toString ? result.toString().slice(0,100) : result) + " expected=" + expectedVal);
      return;
    }
    var ok2 = Math.abs(result.array[0][0] - MetaNum(expectedVal).array[0][0]) <= tol;
    console.log((ok2 ? "PASS" : "FAIL") + " | " + label + " | got=" + (result.toString ? result.toString().slice(0,100) : result) + " expected=" + expectedVal);
  } catch (e) {
    console.log("ERROR | " + label + " => " + e.message);
  }
}

function checkBool(label, result, expected) {
  try {
    var pass = result === expected;
    console.log((pass ? "PASS" : "FAIL") + " | " + label + " | got=" + result + " expected=" + expected);
  } catch (e) {
    console.log("ERROR | " + label + " => " + e.message);
  }
}

// big number (> MSI) vs small number (< MSI) all operations test
var m0 = MetaNum(0);
var m1 = MetaNum(1);
var m2 = MetaNum(2);
var m3 = MetaNum(3);
var m4 = MetaNum(4);
var mSmall = MetaNum(1e6);           // 1,000,000 < MSI
var mSmall2 = MetaNum(1e9);          // 1,000,000,000 < MSI
var mBig = MetaNum(1e16);            // 10,000,000,000,000,000 > MSI
var mBig2 = MetaNum(1e20);           // > MSI
var mT = MetaNum.arrow(3,3,3);

console.log("\n=== basic arithmetic (< MSI vs > MSI) ===");
checkOp("add small", mSmall.add(5), 1000005, 0);
checkOp("add big", mBig.add(1e15), "E16.04139", 0.01);
checkOp("sub small", mSmall.sub(5), 999995, 0);
checkOp("sub big", mBig.sub(1e15), "9E15", 0.01);
checkOp("mul small", mSmall.mul(2), 2000000, 0);
checkOp("mul big", mBig.mul(2), "E16.30103", 0.01);
checkOp("div small", mSmall.div(2), 500000, 0);
checkOp("div big", mBig.div(2), "5E15", 0.01);

console.log("\n=== power operations (< MSI vs > MSI) ===");
checkOp("pow small", MetaNum(2).pow(10), 1024, 0);
checkOp("pow big", MetaNum(2).pow(60), "E18.062", 0.01);
checkOp("exp small", MetaNum(2).exp(), 7.38905609893065, 1e-8);
checkOp("exp big", MetaNum(40).exp(), "E17.371", 0.01);

console.log("\n=== roots (< MSI vs > MSI) ===");
checkOp("sqrt small", mSmall.sqrt(), 1000, 0);
checkOp("sqrt big", mBig.sqrt(), 100000000, 0);
checkOp("cbrt small", mSmall2.cbrt(), 1000, 0.01);
checkOp("cbrt big", mBig2.cbrt(), 4641588.833, 0.01);
checkOp("root small", mSmall.root(6), 10, 0.01);
checkOp("root small 2", mSmall2.root(9), 10, 0.01);
checkOp("root big", mBig.root(8), 100, 0.01);
checkOp("root big 2", mBig2.root(10), 100, 0.01);

console.log("\n=== logarithms (< MSI vs > MSI) ===");
checkOp("log10 small", mSmall.log10(), 6, 0);
checkOp("log10 big", mBig.log10(), 16, 0);
checkOp("log small", mSmall.log(100), 3, 0.01);
checkOp("log big", mBig.log(100), 8, 0.01);
checkOp("ln small", mSmall.ln(), Math.log(1e6), 1e-6);
checkOp("ln big", mBig.ln(), Math.log(1e16), 1e-6);

console.log("\n=== factorial, gamma and Lambert W (< MSI vs > MSI) ===");
checkOp("fact small", MetaNum(5).fact(), 120, 0);
checkOp("fact big", MetaNum(20).fact(), "E18.386", 0.01);
checkOp("gamma small", MetaNum(0.5).gamma(), Math.sqrt(Math.PI), 1e-6);
checkOp("gamma big", MetaNum(20).gamma(), "E17.085", 0.01);
checkOp("lambertw small", MetaNum(1).lambertw(), 0.5671432904097838, 1e-6);
checkOp("lambertw big", MetaNum(1e16).lambertw(), 33.334760768448184, 1e-6);
console.log("\n=== rounding and modulus (< MSI vs > MSI) ===");
checkOp("floor small", MetaNum(3.7).floor(), 3, 0);
checkOp("floor big", MetaNum(1e16 + 0.5).floor(), 1e16, 0);
checkOp("ceil small", MetaNum(3.2).ceil(), 4, 0);
checkOp("ceil big", MetaNum(1e16 + 0.5).ceil(), 1e16, 0);
checkOp("round small", MetaNum(3.5).round(), 4, 0);
checkOp("round big", MetaNum(1e16 + 0.5).round(), 1e16, 0);
checkOp("mod small", MetaNum(10).mod(3), 1, 0);
checkOp("mod big", MetaNum(1e16).mod(3), 1, 0);

console.log("\n=== other unary operations (< MSI vs > MSI) ===");
checkOp("abs small", MetaNum(-5).abs(), 5, 0);
checkOp("abs big", MetaNum(-1e16).abs(), 1e16, 0);
checkOp("neg small", MetaNum(5).neg(), -5, 0);
checkOp("neg big", MetaNum(1e16).neg(), -1e16, 0);
checkOp("rec small", MetaNum(4).rec(), 0.25, 0);
checkOp("rec big", MetaNum(1e16).rec(), 1e-16, 1e-20);

console.log("\n=== hyperoperation base (< MSI vs > MSI) ===");
checkOp("tetr small", MetaNum(2).tetr(3), 16, 0);
checkOp("tetr big", MetaNum(1e16).tetr(3), "EEE17.20412", 0.01);
checkOp("pent small", MetaNum(2).pent(2), 4, 0);
checkOp("pent big", MetaNum(1e16).pent(3), "FFE16", 0.01);
checkOp("arrow small", MetaNum(2).arrow(2)(3), 16, 0);
checkOp("arrow big", MetaNum(1e16).arrow(3)(4), "FFFE16", 0.01);
checkOp("hyper small", MetaNum.hyper(10,10,10), "K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000", 0.01); // README: hyper(4,2,3)=2^^3 => hyper(10,10,10)=10{8}10
checkOp("hyper big", MetaNum.hyper(1e16,10,10), "NE16", 0.01);
checkOp("chain small", MetaNum(2).chain(4, 3), "E^65532 19727.7804056", 0.01);
checkOp("chain big", MetaNum(1e16).chain(4, 3), "FFFE16", 0.01);
checkOp("ssrt small", MetaNum(27).ssrt(), 3, 0.01);
checkOp("ssrt big", MetaNum(1e16).ssrt(), 13.97, 0.01);
checkOp("slog small", MetaNum(16).slog(2), 3, 0.01);
checkOp("slog big", MetaNum(1e16).slog(2), 4.41, 0.01);
checkOp("linear_sroot small", MetaNum(100).linear_sroot(3), 2.2128, 0.01);
checkOp("linear_sroot big", MetaNum(1e16).linear_sroot(3), 3.09, 0.01);
checkOp("layeradd small", MetaNum(10).layeradd(), 1e10, 0.01);
checkOp("layeradd big", MetaNum(1e16).layeradd(), "EE16", 0.01);
checkOp("layeradd10 small", MetaNum(10).layeradd10(), 1e10, 0.01);
checkOp("layeradd10 big", MetaNum(1e16).layeradd10(), "EE16", 0.01);

console.log("\n=== pentate_log/root ===");
// pentate_log: if pentate(a,b)=c then pentate_log(c,a)=b
checkOp("pent_log semantic 2^3", MetaNum.pentate(2,3).pentate_log(2), 3, 0.1);
checkOp("pent_log semantic 3^2", MetaNum.pentate(3,2).pentate_log(3), 2, 0.1);
// pentate_root: if pentate(a,b)=c then pentate_root(c,b)≈a
checkOp("pent_root semantic b=2", MetaNum.pentate(3,2).pentate_root(2), 3, 0.1);
checkOp("pent_root semantic b=3", MetaNum.pentate(2,3).pentate_root(3), 2, 0.1);
//pent log/root small
checkOp("pent_log small", MetaNum(1e10).pentate_log(2), 2.795, 0.1);
checkOp("pent_root small", MetaNum(1e10).pentate_root(2), 2.956, 0.1);

console.log("\n=== hyper_log/root ===");
function checkHL(label, d, a, b, want) {
  checkBool("hyper_log " + label, MetaNum(d).hyper_log(a)(b).eq(want), true);
}
function checkHR(label, d, c, b, want) {
  checkBool("hyper_root " + label, MetaNum(d).hyper_root(c)(b).eq(want), true);
}
checkHL("14, a=2, b=0 (2*7)", 14, 2, 0, 7);
checkHL("1E5, a=10, b=1", 100000, 10, 1, 5);
checkHL("16, a=2, b=2", 16, 2, 2, 3);
checkHL("3↑↑3, a=3, b=2", MetaNum(3).arrow(2)(3), 3, 2, 3);
checkHL("10↑↑5, a=10, b=2", MetaNum(10).arrow(2)(5), 10, 2, 5);
checkHL("2↑↑↑2, a=2, b=3", 4, 2, 3, 2);
checkHL("3↑↑↑2, a=3, b=3", MetaNum(3).arrow(3)(2), 3, 3, 2);
checkHL("10↑↑↑3, a=10, b=3", MetaNum(10).arrow(3)(3), 10, 3, 3);
checkHL("2{4}2, a=2, b=4", 4, 2, 4, 2);
checkHR("50, c=5, b=0", 50, 5, 0, 10);
checkHR("256, c=8, b=1", 256, 8, 1, 2);
checkHR("81, c=4, b=1", 81, 4, 1, 3);
checkHR("2↑↑4, c=4, b=2", 65536, 4, 2, 2);
checkHR("3↑↑3, c=3, b=2", MetaNum(3).arrow(2)(3), 3, 2, 3);
checkHR("10↑↑3, c=3, b=2", MetaNum(10).arrow(2)(3), 3, 2, 10);
checkHR("10↑↑↑3, c=3, b=3", MetaNum(10).arrow(3)(3), 3, 3, 10);
checkHR("2{4}3, c=3, b=4", MetaNum(2).arrow(4)(3), 3, 4, 2);

//hyperoperation definition from https://googology.fandom.com/wiki/Template:ExtendedOps
console.log("\n=== hyperoperation definition ===")
// ─── 1. aperiote (ω): x{ω}y = x{y}x  (rule 3: n{λ}b = n{λ[b]}n)
// rule 3: x{ω}y = x{ω[y]}x = x{y}x (final operand is the base)
// aperiote(3,0): 3{0}3 = 3*3 = 9
// aperiote(3,1): 3{1}3 = 3^3 = 27
// aperiote(3,2): 3{2}3 = 3^^3 = 7625597484987
console.log("\n=== 1. aperiote (ω) ===");
checkOp("aper(3,0)", m3.aperiote(0), 9, 0);
checkOp("aper(3,1)", m3.aperiote(1), 27, 0);
checkOp("aper(3,2)", m3.aperiote(2), 7625597484987, 0);
checkOp("aper(3,4)", m3.aperiote(4)); //3↑↑↑↑4
checkOp("aper(4,3)", m4.aperiote(3)); //4↑↑↑3
checkBool("aper NaN", MetaNum.aperiote(m3, MetaNum.NaN).isNaN(), true);
checkBool("aper inv NaN", MetaNum.inv_aperiote(m3, MetaNum.NaN).isNaN(), true);

// ─── 2. expande (ω+1): x{ω+1}y ───
// expande: iterated aperiote, x{ω+1}y=x{ω}x{ω}x...x where there are y x's
// e.g. 3{ω+1}2=3{ω}3=3↑↑↑3
console.log("\n=== 2. expande (ω+1) ===");
checkOp("expa(3,1)", m3.expande(1), 3, 0);
checkOp("expa(3,2)", m3.expande(2)); //3↑↑↑3
checkOp("expa(3,4)", m3.expande(4)); //3{ω}3{ω}3{ω}3
checkOp("expa(4,3)", m4.expande(3)); //4{ω}4{ω}4
checkBool("expa y=0 NaN", m3.expande(0).isNaN(), true);
checkBool("expa NaN", MetaNum.expande(m3, MetaNum.NaN).isNaN(), true);

// ─── 3. multiexpande (ω+2): x{ω+2}y ───
// multiexpande: iterated expande, x{ω+2}y=x{ω+1}x{ω+1}... with y x's
// e.g. 3{ω+2}2=3{ω+1}3=3{ω}3{ω}3=3↑…(3↑↑↑3 arrows)…↑3
console.log("\n=== 3. multiexpande (ω+2) ===");
checkOp("muea(3,4)", m3.multiexpande(4));
checkOp("muea(4,3)", m4.multiexpande(3));
checkBool("muea y=0 NaN", m3.multiexpande(0).isNaN(), true);
checkBool("muea NaN", MetaNum.multiexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 4. powerexpande (ω+3): x{ω+3}y ───
// powerexpande: iterated multiexpande, x{ω+3}y=x{ω+2}x{ω+2}... with y x's
// e.g. 3{ω+3}2=3{ω+2}3=3{ω+1}3{ω+1}3=3{ω+1}3{ω}3{3}3
console.log("\n=== 4. powerexpande (ω+3) ===");
checkOp("poea(3,4)", m3.powerexpande(4));
checkOp("poea(4,3)", m4.powerexpande(3));
checkBool("poea y=0 NaN", m3.powerexpande(0).isNaN(), true);
checkBool("poea NaN", MetaNum.powerexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 5. aperioexpande (ω*2): x{ω*2}y ───
// aperioexpande: diagonalization of ω+y, x{ω*2}y=x{ω+y}y
// e.g. 3{ω*2}5=3{ω+5}5=3{ω+4}3{ω+4}3{ω+4}3{ω+4}3
console.log("\n=== 5. aperioexpande (ω*2) ===");
checkOp("apea(3,4)", m3.aperioexpande(4));
checkOp("apea(4,3)", m4.aperioexpande(3));
checkBool("apea NaN", MetaNum.aperioexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 6. explode (ω*2+1): x{ω*2+1}y ───
// explode: iterated aperioexpande, x{ω*2+1}y=x{ω*2}x{ω*2}... with y x's
console.log("\n=== 6. explode (ω*2+1) ===");
checkOp("expl(3,4)", m3.explode(4));
checkOp("expl(4,3)", m4.explode(3));
checkBool("expl y=0 NaN", m3.explode(0).isNaN(), true);
checkBool("expl NaN", MetaNum.explode(m3, MetaNum.NaN).isNaN(), true);

// ─── 7. multiexplode (ω*2+2): x{ω*2+2}y ───
// multiexplode: iterated explode, x{ω*2+2}y=x{ω*2+1}x{ω*2+1}... with y x's
console.log("\n=== 7. multiexplode (ω*2+2) ===");
checkOp("muel(3,4)", m3.multiexplode(4));
checkOp("muel(4,3)", m4.multiexplode(3));
checkBool("muel y=0 NaN", m3.multiexplode(0).isNaN(), true);
checkBool("muel NaN", MetaNum.multiexplode(m3, MetaNum.NaN).isNaN(), true);

// ─── 8. aperioexplode (ω*3): x{ω*3}y ───
// aperioexplode: diagonalization of ω*2+y, x{ω*3}y=x{ω*2+y}y
console.log("\n=== 8. aperioexplode (ω*3) ===");
checkOp("apel(3,4)", m3.aperioexplode(4));
checkOp("apel(4,3)", m4.aperioexplode(3));
checkBool("apel NaN", MetaNum.aperioexplode(m3, MetaNum.NaN).isNaN(), true);

// ─── 9. detonate (ω*3+1): x{ω*3+1}y ───
// detonate: iterated aperioexplode, x{ω*3+1}y=x{ω*3}x{ω*3}... with y x's
console.log("\n=== 9. detonate (ω*3+1) ===");
checkOp("deto(3,4)", m3.detonate(4));
checkOp("deto(4,3)", m4.detonate(3));
checkBool("deto y=0 NaN", m3.detonate(0).isNaN(), true);
checkBool("deto NaN", MetaNum.detonate(m3, MetaNum.NaN).isNaN(), true);

// ─── 10. aperiodetonate (ω*4): x{ω*4}y ───
// aperiodetonate: diagonalization of ω*3+y, x{ω*4}y=x{ω*3+y}y
console.log("\n=== 10. aperiodetonate (ω*4) ===");
checkOp("apdt(3,4)", m3.aperiodetonate(4));
checkOp("apdt(4,3)", m4.aperiodetonate(3));
checkBool("apdt NaN", MetaNum.aperiodetonate(m3, MetaNum.NaN).isNaN(), true);

// ─── 11. aperionate (ω^2): x{ω^2}y ───
console.log("\n=== 11. aperionate (ω^2) ===");
checkOp("apeo(3,4)", m3.aperionate(4));
checkOp("apeo(4,3)", m4.aperionate(3));
checkBool("apeo NaN", MetaNum.aperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 12. megote (ω^2+1):  ───
console.log("\n=== 12. megote (ω^2+1) ===");
checkOp("mego(3,4)", m3.megote(4));
checkOp("mego(4,3)", m4.megote(3));
checkBool("mego y=0 NaN", m3.megote(0).isNaN(), true);
checkBool("mego NaN", MetaNum.megote(m3, MetaNum.NaN).isNaN(), true);

// ─── 13. multimegote (ω^2+2):  ───
console.log("\n=== 13. multimegote (ω^2+2) ===");
checkOp("mume(3,4)", m3.multimegote(4));
checkOp("mume(4,3)", m4.multimegote(3));
checkBool("mume y=0 NaN", m3.multimegote(0).isNaN(), true);
checkBool("mume NaN", MetaNum.multimegote(m3, MetaNum.NaN).isNaN(), true);

// ─── 14. aperimegote (ω^2+ω):  ───
console.log("\n=== 14. aperimegote (ω^2+ω) ===");
checkOp("apmg(3,4)", m3.aperimegote(4));
checkOp("apmg(4,3)", m4.aperimegote(3));
checkBool("apmg NaN", MetaNum.aperimegote(m3, MetaNum.NaN).isNaN(), true);

// ─── 15. megoexpande (ω^2+ω+1):  ───
console.log("\n=== 15. megoexpande (ω^2+ω+1) ===");
checkOp("mgea(3,4)", m3.megoexpande(4));
checkOp("mgea(4,3)", m4.megoexpande(3));
checkBool("mgea y=0 NaN", m3.megoexpande(0).isNaN(), true);
checkBool("mgea NaN", MetaNum.megoexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 16. aperimegoexpande (ω^2+ω*2):  ───
console.log("\n=== 16. aperimegoexpande (ω^2+ω*2) ===");
checkOp("apme(3,4)", m3.aperimegoexpande(4));
checkOp("apme(4,3)", m4.aperimegoexpande(3));
checkBool("apme NaN", MetaNum.aperimegoexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 17. megoaperionate (ω^2*2):  ───
console.log("\n=== 17. megoaperionate (ω^2*2) ===");
checkOp("mgao(3,4)", m3.megoaperionate(4));
checkOp("mgao(4,3)", m4.megoaperionate(3));
checkBool("mgao NaN", MetaNum.megoaperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 18. gigote (ω^2*2+1):  ───
console.log("\n=== 18. gigote (ω^2*2+1) ===");
checkOp("gigo(3,4)", m3.gigote(4));
checkOp("gigo(4,3)", m4.gigote(3));
checkBool("gigo y=0 NaN", m3.gigote(0).isNaN(), true);
checkBool("gigo NaN", MetaNum.gigote(m3, MetaNum.NaN).isNaN(), true);

// ─── 19. aperigigote (ω^2*2+ω):  ───
console.log("\n=== 19. aperigigote (ω^2*2+ω) ===");
checkOp("apgg(3,4)", m3.aperigigote(4));
checkOp("apgg(4,3)", m4.aperigigote(3));
checkBool("apgg NaN", MetaNum.aperigigote(m3, MetaNum.NaN).isNaN(), true);

// ─── 20. gigoaperionate (ω^2*3):  ───
console.log("\n=== 20. gigoaperionate (ω^2*3) ===");
checkOp("ggap(3,4)", m3.gigoaperionate(4));
checkOp("ggap(4,3)", m4.gigoaperionate(3));
checkBool("ggap y=0 NaN", m3.gigoaperionate(0).isNaN(), true);
checkBool("ggap NaN", MetaNum.gigoaperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 21. aperiatote (ω^3):  ───
console.log("\n=== 21. aperiatote (ω^3) ===");
checkOp("apat(3,4)", m3.aperiatote(4));
checkOp("apat(4,3)", m4.aperiatote(3));
checkBool("apat NaN", MetaNum.aperiatote(m3, MetaNum.NaN).isNaN(), true);

// ─── 22. powiainate (ω^3+1):  ───
console.log("\n=== 22. powiainate (ω^3+1) ===");
checkOp("pwan(3,4)", m3.powiainate(4));
checkOp("pwan(4,3)", m4.powiainate(3));
checkBool("pwan y=0 NaN", m3.powiainate(0).isNaN(), true);
checkBool("pwan NaN", MetaNum.powiainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 23. expandainate (ω^3+ω):  ───
console.log("\n=== 23. expandainate (ω^3+ω) ===");
checkOp("epan(3,4)", m3.expandainate(4));
checkOp("epan(4,3)", m4.expandainate(3));
checkBool("epan NaN", MetaNum.expandainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 24. megodainate (ω^3+ω^2):  ───
console.log("\n=== 24. megodainate (ω^3+ω^2) ===");
checkOp("mgan(3,4)", m3.megodainate(4));
checkOp("mgan(4,3)", m4.megodainate(3));
checkBool("mgan y=0 NaN", m3.megodainate(0).isNaN(), true);
checkBool("mgan NaN", MetaNum.megodainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 25. powiairate (ω^3*2) ───
console.log("\n=== 25. powiairate (ω^3*2) ===");
checkOp("pwar(3,4)", m3.powiairate(4));
checkOp("pwar(4,3)", m4.powiairate(3));
checkBool("pwar NaN", MetaNum.powiairate(m3, MetaNum.NaN).isNaN(), true);

// ─── 26. aperioguate (ω^4):  ───
console.log("\n=== 26. aperioguate (ω^4) ===");
checkOp("apgu(3,4)", m3.aperioguate(4));
checkOp("apgu(4,3)", m4.aperioguate(3));
checkBool("apgu NaN", MetaNum.aperioguate(m3, MetaNum.NaN).isNaN(), true);

// ─── 27. iter (ω^ω):  ───
console.log("\n=== 27. iter (ω^ω) ===");
checkOp("ite(3,4)", m3.iter(4));
checkOp("ite(4,3)", m4.iter(3));
checkBool("ite y=0 NaN", m3.iter(0).isNaN(), true);
checkBool("ite NaN", MetaNum.iter(m3, MetaNum.NaN).isNaN(), true);

// ─── 28. itermult (ω^ω+1):  ───
console.log("\n=== 28. itermult (ω^ω+1) ===");
checkOp("itmu(3,4)", m3.itermult(4));
checkOp("itmu(4,3)", m4.itermult(3));
checkBool("itmu y=0 NaN", m3.itermult(0).isNaN(), true);
checkBool("itmu NaN", MetaNum.itermult(m3, MetaNum.NaN).isNaN(), true);

// ─── 29. cuboiter (ω^ω*2) ───
console.log("\n=== 29. cuboiter (ω^ω*2) ===");
checkOp("cube(3,4)", m3.cuboiter(4));
checkOp("cube(4,3)", m4.cuboiter(3));
checkBool("cube NaN", MetaNum.cuboiter(m3, MetaNum.NaN).isNaN(), true);

// ─── 30. expoiter (ω^(ω+1)) ───
console.log("\n=== 30. expoiter (ω^(ω+1)) ===");
checkOp("expo(3,4)", m3.expoiter(4));
checkOp("expo(4,3)", m4.expoiter(3));
checkBool("expo NaN", MetaNum.expoiter(m3, MetaNum.NaN).isNaN(), true);

// ─── 31. trioterate (ω^(ω*2)) ───
console.log("\n=== 31. trioterate (ω^(ω*2)) ===");
checkOp("tria(3,4)", m3.trioterate(4));
checkOp("tria(4,3)", m4.trioterate(3));
checkBool("tria NaN", MetaNum.trioterate(m3, MetaNum.NaN).isNaN(), true);

// ─── 32. trixxate (ω^(ω^2)) ───
console.log("\n=== 32. trixxate (ω^(ω^2)) ===");
checkOp("trix(3,4)", m3.trixxate(4));
checkOp("trix(4,3)", m4.trixxate(3));
checkBool("trix NaN", MetaNum.trixxate(m3, MetaNum.NaN).isNaN(), true);

// ─── 33. aperixxate (ω^(ω^ω)) ───
console.log("\n=== 33. aperixxate (ω^(ω^ω)) ===");
checkOp("apix(3,4)", m3.aperixxate(4));
checkOp("apix(4,3)", m4.aperixxate(3));
checkBool("apix NaN", MetaNum.aperixxate(m3, MetaNum.NaN).isNaN(), true);

// ─── 34. epsilonate (ε₀) ───
console.log("\n=== 34. epsilonate (ε₀) ===");
checkOp("epsl(3,4)", m3.epsilonate(4));
checkOp("epsl(4,3)", m4.epsilonate(3));
checkBool("epsl NaN", MetaNum.epsilonate(m3, MetaNum.NaN).isNaN(), true);

// λ[y] layer markers in STANDARD form (finite rows merged into r0, layer
// lowered as far as it goes — README L17: layer L ⇒ ω^ω^…((L-1) ω^'s)^(bracket)):
//   iter → 10{ω^y}10 (L1 [1,y]); itmu → 10{ω^ω+(y-1)}10 (L1 [1,0,1], r0=y-1)
//   cube → 10{ω^ω+ω^y}10 (L1 r0[…,1@y] + [1,0,1]); expo → 10{ω^ω·y}10 (L1 [y,0,1])
//   tria → 10{ω^(ω+y)}10 (L1 [1,y,1]); trix → 10{ω^(ω·y+10)}10 (L1 [1,10,y])
//   apix → 10{ω^(ω^y)}10 (L1 [1,0…0,1] with y zeros)
console.log("\n=== λ[y] layer markers in STANDARD form ===");
var wOps = ["iterate","itermult","cuboiter","expoiter","trioterate","trixxate","aperixxate"];
var mk35 = {
  iterate:     { layer: 0, rows: null },                 // exact cascade, layer 0
  itermult:    { layer: 1, rows: "[[4],[1,0,1]]" },
  cuboiter:    { layer: 1, rows: "[[10,0,0,0,0,1],[1,0,1]]" },
  expoiter:    { layer: 1, rows: "[[10],[5,0,1]]" },
  trioterate:  { layer: 1, rows: "[[10],[1,5,1]]" },
  trixxate:    { layer: 1, rows: "[[10],[1,10,5]]" },
  aperixxate:  { layer: 1, rows: "[[10],[1,0,0,0,0,0,1]]" }
};
for (var wi = 0; wi < wOps.length; wi++) {
  var wf = wOps[wi], wv = m3[wf](5), wexp = mk35[wf];
  var wok = wv.layer === wexp.layer &&
    (wexp.rows === null || JSON.stringify(wv.array) === wexp.rows);
  checkBool(wf + "(3,5) λ[5] marker (layer " + wexp.layer + ")", wok, true);
}
checkBool("epsl(3,5) = 10{ω^ω^ω^ω^ω}10 → standard form layer 4, row [1,10,1]",
  m3.epsilonate(5).layer === 4 &&
  JSON.stringify(m3.epsilonate(5).array) === "[[10],[1,10,1]]", true);
checkBool("epsl(3,2) = 3{ε₀[2]}3 = 3{ω^ω}3 = itmu(3,2)",
  m3.epsilonate(2).eq(m3.itermult(2)), true);
// the ordinal levels grow with the operation, for every y
for (var wy = 2; wy <= 9; wy++) {
  var wprev = null, wmono = true;
  for (var wj = 0; wj < wOps.length; wj++) {
    var wr = MetaNum(10)[wOps[wj]](wy);
    if (wprev && !wr.gt(wprev)) wmono = false;
    wprev = wr;
  }
  checkBool("ops strictly grow at y=" + wy + " (iter<itmu<cube<expo<tria<trix<apix)", wmono, true);
}

// precision budget: exact while it fits maxRows/maxCols
// arrow's most precise form holds maxRows+maxCols-2 finite hyperoperation
// levels: r0 = [a0 … a(maxCols-1)] plus rows [count, level] for levels
// maxCols … maxRows+maxCols-2.  Beyond that: keep the largest maxRows-1
// ordinal rows sorted ascending, array[1][0] += 1, array[0] = [10].
console.log("\n=== precision budget (maxRows/maxCols) ===");
(function () {
  var a39 = MetaNum.arrow(10, 39, 10);
  checkBool("arrow(10,39,10) exact: maxCols r0 entries + maxRows-1 rows, top level 38",
    a39.array[0].length === 20 && a39.array.length - 1 === 19 &&
    JSON.stringify(a39.array[a39.array.length - 1]) === "[8,38]", true);
  var a40 = MetaNum.arrow(10, 40, 10);
  checkBool("arrow(10,40,10) truncated: array[0]=[10], array[1][0]+1",
    JSON.stringify(a40.array[0]) === "[10]" &&
    JSON.stringify(a40.array[1]) === "[9,21]" && a40.array.length - 1 === 19, true);
  // the same truncation rule for the rule-1..4 ordinal cascades
  var i35 = m3.iterate(5);
  checkBool("iter(3,5) cascade truncated: array[0]=[10], array[1][0]+1, 19 rows",
    JSON.stringify(i35.array[0]) === "[10]" &&
    JSON.stringify(i35.array[1]) === "[2,2,2,0,2,2]" && i35.array.length - 1 === 19, true);
  var h10000 = m3.h10000(10);
  checkBool("h10000(3,10) cascade truncated: array[0]=[10], array[1][0]+1",
    JSON.stringify(h10000.array[0]) === "[10]" &&
    JSON.stringify(h10000.array[1]) === "[2,2,2,0,9]", true);
  // exact while the enumeration fits: 3{ω^2}3 needs 3^2 = 9 ≤ maxRows rows
  var i32 = m3.iterate(2);
  checkBool("iter(3,2) exact enumeration (no [10] base / no +1 marker)",
    i32.array[0][0] !== 10 && i32.array[1][0] === 1, true);
  // ── standard layer form (README L17) ──
  function mkLayer(r0, L, rows) {
    var v = new MetaNum(0); v.array = [r0.slice()];
    rows.forEach(function (r) { v.array.push(r.slice()); }); v.layer = L; return v;
  }
  var s1 = MetaNum._standardizeLayerValue(mkLayer([10], 1, [[1, 3], [1, 0, 1]]));
  checkBool("cube(10,3): [[10],[1,3],[1,0,1]] → [[10,0,0,1],[1,0,1]]",
    JSON.stringify(s1.array) === "[[10,0,0,1],[1,0,1]]" && s1.layer === 1, true);
  var s2 = MetaNum._standardizeLayerValue(mkLayer([5], 2, [[3, 1]]));
  checkBool("layer2 [[5],[3,1]] → [[5,3]] → layer1 [[10],[1,5,3]] = 10{ω^(ω*3+5)}10",
    JSON.stringify(s2.array) === "[[10],[1,5,3]]" && s2.layer === 1, true);
  var s3 = MetaNum._standardizeLayerValue(mkLayer([3], 3, []));
  checkBool("layer3 [[3]] → layer2 [[0,0,0,1]] → layer1 [[10],[1,0,0,0,1]] = 10{ω^ω^3}10",
    JSON.stringify(s3.array) === "[[10],[1,0,0,0,1]]" && s3.layer === 1, true);
  checkBool("cube(10,3) standardized in the engine",
    JSON.stringify(m10c().cuboiter(3).array) === "[[10,0,0,1],[1,0,1]]", true);
  function m10c() { return MetaNum(10); }
})();

// Same-value tests: op(1,y) and op(x,1) produce reasonable results
// when x=1, 1{ordinal}y = 1 for any ordinal
// when y=1, x{ordinal}1 = x for any ordinal
var ops = [
  "aperiote","expande","multiexpande","powerexpande","aperioexpande",
  "explode","multiexplode","aperioexplode","detonate","aperiodetonate",
  "aperionate","megote","multimegote","aperimegote","megoexpande",
  "aperimegoexpande","megoaperionate","gigote","aperigigote","gigoaperionate",
  "aperiatote","powiainate","expandainate","megodainate","powiairate","aperioguate","iterate",
  "itermult","cuboiter","expoiter","trioterate","trixxate","aperixxate","epsilonate"
];

console.log("\n=== all hyperoperations x=1, y=3 test ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m1[ops[oi]](3);
    if (res.eq(1)) console.log("PASS | " + ops[oi] + "(1,3) | " + res.toString().slice(0,100));
    else console.log("FAIL | " + ops[oi] + "(1,3) => " + res.toString().slice(0,100));
  } catch (e) {
    console.log("ERROR | " + ops[oi] + "(1,3) => " + e.message);
  }
}

console.log("\n=== all hyperoperations x=3, y=1 test ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m3[ops[oi]](1);
    // rule 3 for limit ordinals: x{λ}1 = x{λ[1]}x = x{1}x = x^x, so
    // aperiote(3,1) = 3^3 = 27 (other ops are successor levels -> x)
    var expected1 = ops[oi] === "aperiote" ? 27 : 3;
    if (res.eq(expected1)) console.log("PASS | " + ops[oi] + "(3,1) | " + res.toString().slice(0, 100));
    else console.log("FAIL | " + ops[oi] + "(3,1) => " + res.toString().slice(0, 100));
  } catch (e) {
    console.log("ERROR | " + ops[oi] + "(3,1) => " + e.message);
  }
}

// hyperoperation tests with x or y > MSI (9007199254740992)
console.log("\n=== hyperoperation (x > MSI) ===");
var mBigBase = MetaNum(1e16);
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = mBigBase[ops[oi]](3);
    console.log("PASS | " + ops[oi] + "(1e16,3) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(1e16,3) => " + e.message);
  }
}

console.log("\n=== hyperoperation (y > MSI) ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m3[ops[oi]](mBigBase);
    console.log("PASS | " + ops[oi] + "(3,1e16) | " + res.toString().slice(0,100));  
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(3,1e16) => " + e.message);
  }
}

// inverse roundtrip: op(10,x) → inv → should ≈ x
console.log("\n=== inverse operation (> MSI) roundtrip ===");
var invOps = [
  "inv_aperiote","inv_expande","inv_multiexpande","inv_powerexpande","inv_aperioexpande",
  "inv_explode","inv_multiexplode","inv_aperioexplode","inv_detonate","inv_aperiodetonate",
  "inv_aperionate","inv_megote","inv_multimegote","inv_aperimegote","inv_megoexpande",
  "inv_aperimegoexpande","inv_megoaperionate","inv_gigote","inv_aperigigote","inv_gigoaperionate",
  "inv_aperiatote","inv_powiainate","inv_expandainate","inv_megodainate","inv_powiairate","inv_aperioguate","inv_iterate",
  "inv_itermult","inv_cuboiter","inv_expoiter","inv_trioterate","inv_trixxate","inv_aperixxate","inv_epsilonate"
];

console.log("\n=== inv hyperoperations roundtrip test ===");
var m10 = MetaNum(10);
for (var oi = 0; oi < ops.length; oi++) {
    try {
        var fwd = m10[ops[oi]](3);
        var back = fwd[invOps[oi]](m10);
        // Under rule 3 (x{λ}b=x{λ[b]}x) limit-derived values end on the base
        // x=10, so their inverse recovers 10; purely successor-level values
        // still end on 3.
        if (back.eq(m3) || back.eq(m10)) console.log("PASS | " + invOps[oi] + " | fwd=" + fwd.toString().slice(0, 100) + " back=" + back.toString().slice(0, 100));
        else console.log("FAIL | " + invOps[oi] + " | fwd=" + fwd.toString().slice(0, 100) + " back=" + back.toString().slice(0, 100));
    } catch (e) {
        console.log("ERROR | inv_" + ops[oi] + " => " + e.message);
    }
}

console.log("\n=== inv hyperoperations > MSI ===");
for (var oi = 0; oi < invOps.length; oi++) {
  try {
    var fwd = m10[ops[oi]](mBigBase);
    var back = fwd[invOps[oi]](m10);
    console.log("PASS | " + invOps[oi] + " | fwd=" + fwd.toString().slice(0,100) + " back=" + back.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + invOps[oi] + " => " + e.message);
  }
}

// bug: epsl(3,epsl(3,3)) should return infinity because it reaches metanum.js limit.

// hyperoperation iteration tests
var hyperOpList = [
  ["aper", "aperiote"],
  ["expa", "expande"],
  ["muea", "multiexpande"],
  ["poea", "powerexpande"],
  ["apea", "aperioexpande"],
  ["expl", "explode"],
  ["muel", "multiexplode"],
  ["apel", "aperioexplode"],
  ["deto", "detonate"],
  ["apdt", "aperiodetonate"],
  ["apeo", "aperionate"],
  ["mego", "megote"],
  ["mume", "multimegote"],
  ["apmg", "aperimegote"],
  ["mgea", "megoexpande"],
  ["apme", "aperimegoexpande"],
  ["mgao", "megoaperionate"],
  ["gigo", "gigote"],
  ["apgg", "aperigigote"],
  ["ggap", "gigoaperionate"],
  ["apat", "aperiatote"],
  ["pwan", "powiainate"],
  ["epan", "expandainate"],
  ["mgan", "megodainate"],
  ["pwar", "powiairate"],
  ["apgu", "aperioguate"],
  ["iter", "iter"],
  ["itmu", "itermult"],
  ["cube", "cuboiter"],
  ["expo", "expoiter"],
  ["tria", "trioterate"],
  ["trix", "trixxate"],
  ["apix", "aperixxate"],
  ["epsl", "epsilonate"]
];

// ─── double nested iteration ───
console.log("\n=== hyperoperation iteration tests ===");
for (var hi = 0; hi < hyperOpList.length; hi++) {
  var shortName = hyperOpList[hi][0];
  var methodName = hyperOpList[hi][1];
  try{
    var res = m3[methodName](m3[methodName](3));
    console.log("PASS | " + shortName + "(3," + shortName + "(3,3)) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + shortName + "(3," + shortName + "(3,3)) => " + e.message);
  }
}

// ─── triple nested iteration ───
console.log("\n=== triple nested hyperoperation tests ===");
for (var hi = 0; hi < hyperOpList.length; hi++) {
  var shortName = hyperOpList[hi][0];
  var methodName = hyperOpList[hi][1];
  try{
    var res = m3[methodName](m3[methodName](m3[methodName](3)));
    console.log("PASS | " + shortName + "(3," + shortName + "(3," + shortName + "(3,3))) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + shortName + "(3," + shortName + "(3," + shortName + "(3,3))) => " + e.message);
  }
}

console.log("\n=== big ordinal annex small ordinal tests x=QqQe308 ===");
var ordq=MetaNum.QqQe308
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = ordq[ops[oi]](m3);
    console.log("PASS | " + ops[oi] + "(QqQe308,3) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(QqQe308,3) => " + e.message);
  }
}

console.log("\n=== big ordinal annex small ordinal tests y=QqQe308 ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = ordq[ops[oi]](m3);
    console.log("PASS | " + ops[oi] + "(3,QqQe308) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(3,QqQe308) => " + e.message);
  }
}

// ─────────────────────────────────────
// Large-cardinal hyperoperation correctness (input > 10^16)
// Verifies: (1) metaFiniteCount extracts the iteration count instead of collapsing 
//           toNumber() = Infinity → 0(count row is non - zero and grows with y)
//           (2) compareTo ranks an ω - level ordinal row above any
//           number of finite-level rows, so op(x,·) is monotone across the
//           10^16 boundary (aperiote(1e8) < aperiote(1e16)) (well-ordered)
// ─────────────────────────────────────
console.log("\n=== hyperoperation large-cardinal (x > 10^16) ===");

function checkArr(name, m, expectedArray) {
  try {
    var got = JSON.stringify(m.array);
    var exp = JSON.stringify(expectedArray);
    var pass = got === exp;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + got);
    if (!pass) console.log("  Expected: " + exp);
  } catch (e) {
    console.log("ERROR | " + name + " => " + e.message);
  }
}

var mL8 = MetaNum(1e8);
var mL12 = MetaNum(1e12);
var mL16 = MetaNum(1e16);

// --- monotonicity across the 10^16 boundary (comparison fix) ---
checkBool("mono aper 1e8<1e12<1e16",
  mL8.aperiote(mL8).lt(mL12.aperiote(mL12)) && mL12.aperiote(mL12).lt(mL16.aperiote(mL16)), true);
checkBool("mono expa(·,3) 1e8<1e16", mL8.expande(3).lt(mL16.expande(3)), true);
checkBool("mono muea(·,3) 1e8<1e16", mL8.multiexpande(3).lt(mL16.multiexpande(3)), true);
checkBool("mono poea(·,3) 1e8<1e16", mL8.powerexpande(3).lt(mL16.powerexpande(3)), true);

// --- count not zeroed: result strictly grows with y (metaFiniteCount fix) ---
checkBool("expa(1e16,3) > expa(1e16,2)", mL16.expande(3).gt(mL16.expande(2)), true);
checkBool("muea(1e16,3) > muea(1e16,2)", mL16.multiexpande(3).gt(mL16.multiexpande(2)), true);
checkBool("poea(1e16,3) > poea(1e16,2)", mL16.powerexpande(3).gt(mL16.powerexpande(2)), true);
checkBool("expa(1e16,5) > expa(1e16,3)", mL16.expande(5).gt(mL16.expande(3)), true);
checkBool("muea(1e16,5) > muea(1e16,3)", mL16.multiexpande(5).gt(mL16.multiexpande(3)), true);
checkBool("poea(1e16,5) > poea(1e16,3)", mL16.powerexpande(5).gt(mL16.powerexpande(3)), true);

// --- array structure snapshots (count correctly stored, not collapsed to 0) ---
// expande: count row [y-2,0,1] is at ω-level, same as aperiote's [1,0,1], so they
// merge → [1+(y-2),0,1] = [y-1,0,1]. For y=3 that is [2,0,1].
checkArr("expande(1e16,3) array", mL16.expande(3), [[16, 1], [2, 0, 1]]);
// multiexpande (ω+2): 1e16{ω+1}1e16{ω+1}1e16 → count row [2,1,1] at ω+1.
checkArr("multiexpande(1e16,3) array", mL16.multiexpande(3), [[16, 1], [2, 1, 1]]);
// powerexpande (ω+3): count row [2,2,1] at ω+2.
checkArr("powerexpande(1e16,3) array", mL16.powerexpande(3), [[16, 1], [2, 2, 1]]);

// --- y > MSI: result diagonalizes to y plus one α-level row (no counts > MSI) ---
// x{α}y ≈ 10{α}y → y's own representation + marker row [1|α]
checkArr("aperiote(3,1e16) array", m3.aperiote(mL16), [[16, 1], [1, 0, 1]]);
// rule 3: 1e16{ω}3 = 1e16{3}1e16 — the huge base dominates, same marker
// array as the y>MSI case
checkArr("aperiote(1e16,3) array", mL16.aperiote(3), [[16, 1, 0, 1]]);
checkArr("expande(3,1e16) array", m3.expande(mL16), [[16, 1], [1, 1, 1]]);
checkArr("multiexpande(3,1e16) array", m3.multiexpande(mL16), [[16, 1], [1, 2, 1]]);
checkArr("powerexpande(3,1e16) array", m3.powerexpande(mL16), [[16, 1], [1, 3, 1]]);
checkArr("powiainate(3,1e16) array", m3.powiainate(mL16), [[16, 1], [1, 1, 0, 0, 1]]);
// beyond 10{100}10: y itself carries a compact finite-level ordinal row
// finite levels beyond r0 capacity expand into a cascade
// of [count, level] rows within the maxRows budget; beyond the budget the
// approximation keeps the largest maxRows-1 rows and bumps the second row.
var mArrow1000 = MetaNum.arrow(10, 1000, 10);
checkArr("arrow(10,1000,10) array", mArrow1000,
  [[10], [9, 981], [8, 982], [8, 983], [8, 984], [8, 985], [8, 986], [8, 987], [8, 988], [8, 989], [8, 990], [8, 991], [8, 992], [8, 993], [8, 994], [8, 995], [8, 996], [8, 997], [8, 998], [8, 999]]);
checkArr("powiainate(3,arrow(10,1000,10)) array", m3.powiainate(mArrow1000),
  [[10], [9, 982], [8, 983], [8, 984], [8, 985], [8, 986], [8, 987], [8, 988], [8, 989], [8, 990], [8, 991], [8, 992], [8, 993], [8, 994], [8, 995], [8, 996], [8, 997], [8, 998], [8, 999], [1, 1, 0, 0, 1]]);

// --- inverse roundtrip recovers y exactly (multiexpande / powerexpande) ---
// Because the count rows live at ω+1 / ω+2 (not the base ω-level), they do not
// merge with aperiote's [1,0,1] row, so inv_* recovers y rather than y+1.
checkBool("inv_multiexpande(1e16{ω+2}3,1e16)=3", mL16.multiexpande(3).inv_multiexpande(mL16).eq(MetaNum(3)), true);
checkBool("inv_powerexpande(1e16{ω+3}3,1e16)=3", mL16.powerexpande(3).inv_powerexpande(mL16).eq(MetaNum(3)), true);
checkBool("inv_multiexpande(1e16{ω+2}5,1e16)=5", mL16.multiexpande(5).inv_multiexpande(mL16).eq(MetaNum(5)), true);
checkBool("inv_powerexpande(1e16{ω+3}5,1e16)=5", mL16.powerexpande(5).inv_powerexpande(mL16).eq(MetaNum(5)), true);
// Small-x finite branch (base has no ω-row): inv_expande is exact too.
checkBool("inv_expande(3{ω+1}5,3)=5", MetaNum(3).expande(5).inv_expande(MetaNum(3)).eq(MetaNum(5)), true);

// ─────────────────────────────────────
// h11/h12/h13 (ω+1 / ω+2 / ω+3): the TOP row carries y-2 applications
// (rule 2: x{α}y = x{α-1}^(y-2)(x{α-1}x)), and every row BELOW it comes from
// decomposing x{α-1}x — whose operand is the BASE x — so it carries x-2,
// the same count the finite r0 coefficients carry.
//   10{ω+3}20 = 10{ω+2}^18 10{ω+1}^8 10{ω}^8 10{ω}10
//             → [8,0,1] [8,1,1] [18,2,1]   (not three 18-rows)
// ─────────────────────────────────────
console.log("\n=== h11/h12/h13 count law ===");
checkBool("h13(10,20) = 10{ω+3}20 → [8,0,1] [8,1,1] [18,2,1]",
  JSON.stringify(MetaNum(10).h13(20).array.slice(1)) === "[[8,0,1],[8,1,1],[18,2,1]]", true);
checkBool("h12(10,20) = 10{ω+2}20 → [8,0,1] [18,1,1]",
  JSON.stringify(MetaNum(10).h12(20).array.slice(1)) === "[[8,0,1],[18,1,1]]", true);
checkBool("h11(10,20) = 10{ω+1}20 → [18,0,1] (single row stays y-2)",
  JSON.stringify(MetaNum(10).h11(20).array.slice(1)) === "[[18,0,1]]", true);
// the lower rows are the BASE's count (x-2) and never move with y
var hRows = { 3: 1, 5: 3, 10: 8 };
for (var hx in hRows) {
  var lowC = hRows[hx];
  for (var hy = 3; hy <= 20; hy++) {
    var hr = MetaNum(Number(hx)).h13(hy).array.slice(1);
    var hok = JSON.stringify(hr) === JSON.stringify(
      [[lowC, 0, 1], [lowC, 1, 1], [hy - 2, 2, 1]]);
    if (!hok) { checkBool("h13(" + hx + "," + hy + ") rows", false, true); break; }
  }
  checkBool("h13(" + hx + ",3..20): lower rows fixed at x-2=" + lowC + ", top row y-2", true, true);
}
// y-monotone and level-monotone on the enumeration path
for (var hy2 = 3; hy2 <= 20; hy2++) {
  var hprev = null, hch = true;
  for (var hi = 0; hi < 3; hi++) {
    var hv = MetaNum(10)[["h11", "h12", "h13"][hi]](hy2);
    if (hprev && !hv.gt(hprev)) hch = false;
    hprev = hv;
  }
  if (!hch) { checkBool("h11<h12<h13 at y=" + hy2, false, true); break; }
}
checkBool("h11 < h12 < h13 for y = 3..20", true, true);
checkBool("inv_powerexpande(10{ω+3}20,10) = 20",
  MetaNum(10).h13(20).inv_powerexpande(MetaNum(10)).eq(MetaNum(20)), true);

// ─────────────────────────────────────
// Every level from ω*2 up follows the same law:
//   successor α = β+1 → rows of x{β}x, each x-2, + one β-row carrying y-2
//   limit α           → rule 3 turns y into the fundamental-sequence index, so
//                       EVERY row carries x-2 (stay expanded up to MSI)
// ─────────────────────────────────────
console.log("\n=== h20+ : expanded form & count law ===");
// successor h21 (ω*2+1): 10{ω*2+1}20 = the ω..ω+9 cascade (x-2 = 8) + ω*2 row y-2
checkBool("h21(10,20) = [8,0..9,1] rows + [18,0,2]",
  JSON.stringify(MetaNum(10).h21(20).array.slice(1)) ===
  "[[8,0,1],[8,1,1],[8,2,1],[8,3,1],[8,4,1],[8,5,1],[8,6,1],[8,7,1],[8,8,1],[8,9,1],[18,0,2]]", true);
// h22 (ω*2+2): one more row at ω*2 (x-2), top row ω*2+1 carries y-2
checkBool("h22(10,20) = cascade + [8,0,2] + [18,1,2]",
  JSON.stringify(MetaNum(10).h22(20).array.slice(1)) ===
  "[[8,0,1],[8,1,1],[8,2,1],[8,3,1],[8,4,1],[8,5,1],[8,6,1],[8,7,1],[8,8,1],[8,9,1],[8,0,2],[18,1,2]]", true);
// base-driven lower rows: x=3 → the cascade stops at ω+2 and every count is 1
checkBool("h21(3,20): lower rows carry x-2 = 1",
  JSON.stringify(MetaNum(3).h21(20).array.slice(1)) === "[[1,0,1],[1,1,1],[1,2,1],[18,0,2]]", true);
// and the lower rows never move with y
(function () {
  var lowRows = JSON.stringify(MetaNum(10).h21(3).array.slice(1, 11));
  var ok = true;
  for (var y = 4; y <= 20; y++) {
    var r = MetaNum(10).h21(y).array.slice(1);
    if (JSON.stringify(r.slice(0, 10)) !== lowRows || r[10][0] !== y - 2) ok = false;
  }
  checkBool("h21(10,3..20): lower rows fixed at 8, ω*2 row = y-2", ok, true);
})();

// limit ops stay EXPANDED for 100 < y ≤ MSI (no one-row marker)
(function () {
  var MSI = 9007199254740991;
  for (var i = 0; i < 3; i++) {
    var lf = ["h20", "h30", "h100"][i];
    for (var k = 0; k < 3; k++) {
      var ly = [101, 1000, MSI][k];
      var lr = MetaNum(10)[lf](ly);
      // maxRows-1 ordinal rows, base collapsed to [10], first kept row marked +1
      checkBool(lf + "(10," + ly + ") stays expanded (" + (lr.array.length - 1) + " rows)",
        lr.array.length - 1 === MetaNum.maxRows - 1 && lr.array[0].length === 1 &&
        lr.array[1][0] === 9, true);
    }
  }
  // top row carries the fundamental-sequence index y-1
  checkBool("h20(10,1000) top row = ω+999",
    JSON.stringify(MetaNum(10).h20(1000).array[19]) === "[8,999,1]", true);
  checkBool("h20(10,MSI) top row = ω+(MSI-1)",
    MetaNum(10).h20(MSI).array[19][1] === MSI - 1, true);
})();

// ─────────────────────────────────────
// Fractional y for every level from ω*2 up (README "Non-integer arguments"):
// a limit level takes its fundamental sequence at the FULL fractional index and
// the fractional coefficients resolve against the base x (ω^(k)·(c+f) =
// ω^(k)·c + ω^(k-1)·(x·f)); a leftover fractional constant becomes a fractional
// argument one level up: x{γ+f}x = x{γ+1}(2·(x/2)^f).
// ─────────────────────────────────────
console.log("\n=== h20+ with fractional y ===");
checkBool("10{ω*2}2.1 = 10{ω+3}(2*5^0.1)",
  MetaNum(10).h20(2.1).eq(MetaNum(10).powerexpande(2 * Math.pow(5, 0.1))), true);
checkBool("3{ω*2}2.1 = 3{ω+3}(2*1.5^0.1)",
  MetaNum(3).h20(2.1).eq(MetaNum(3).powerexpande(2 * Math.pow(1.5, 0.1))), true);
checkBool("10{ω^2}2.1 = 10{ω*2+1}10",
  MetaNum(10).h100(2.1).eq(MetaNum(10).h21(10)), true);
checkBool("3{ω^2}2.1 = 3{ω*2+1}(2*1.5^0.3)",
  MetaNum(3).h100(2.1).eq(MetaNum(3).h21(2 * Math.pow(1.5, 0.3))), true);
// 10{ω^ω}2.1 = 10{ω^2.1}10 = 10{ω^2*10^0.1}10 → ω^2+ω*2+5.8925… → next level
(function () {
  var rf = MetaNum._resolveFracLevel([0, 0, Math.pow(10, 0.1)], 10);
  var up = rf.ord.slice(); up[0] += 1;
  checkBool("10{ω^ω}2.1 = 10{ω^2+ω*2+6}(2*5^0.8925…) (level " +
    JSON.stringify(up) + ")",
    JSON.stringify(up) === "[6,2,1]" &&
    MetaNum(10).iterate(2.1).eq(
      MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(2 * Math.pow(5, rf.frac)), up)), true);
})();
// the fraction is not thrown away: y and floor(y) differ
checkBool("h20(10,2.1) != h20(10,2) and lies strictly between 2 and 3",
  MetaNum(10).h20(2.1).gt(MetaNum(10).h20(2)) &&
  MetaNum(10).h20(2.1).lt(MetaNum(10).h20(3)), true);
checkBool("h100(10,10.25) lies strictly between 10 and 11",
  MetaNum(10).h100(10.25).gt(MetaNum(10).h100(10)) &&
  MetaNum(10).h100(10.25).lt(MetaNum(10).h100(11)), true);
// monotone in y across the integers for the LIMIT levels
(function () {
  var limOps = ["h20", "h30", "h100", "h110", "h1000", "h10000", "iterate"];
  var bad = 0, firstBad = "";
  for (var i = 0; i < limOps.length; i++) {
    for (var b = 0; b < 2; b++) {
      var bx = [3, 10][b];
      for (var m = 2; m <= 10; m++) {
        var a = MetaNum(bx)[limOps[i]](m), c = MetaNum(bx)[limOps[i]](m + 0.001);
        var d = MetaNum(bx)[limOps[i]](m + 0.5), e = MetaNum(bx)[limOps[i]](m + 1);
        if (!(c.gte(a) && d.gte(c) && e.gte(d))) {
          bad++; if (!firstBad) firstBad = limOps[i] + "(" + bx + "," + m + ")";
        }
      }
    }
  }
  checkBool("limit levels monotone across fractional y", bad === 0, true,
    bad === 0 ? "" : " first failure: " + firstBad);
})();
// the SUCCESSOR rule with a fractional argument is written in the same expanded
// form: the α-1 row carries the m applications (ceil(y)-2 = m-1) and the cascade
// below it is generated at the fundamental-sequence index x^f, so the value grows
// with f inside the interval and converges to the next integer at f → 1
checkBool("h21(10,2.001) < h21(10,2.5) < h21(10,2.99) < h21(10,3)",
  MetaNum(10).h21(2.001).lt(MetaNum(10).h21(2.5)) &&
  MetaNum(10).h21(2.5).lt(MetaNum(10).h21(2.99)) &&
  MetaNum(10).h21(2.99).lt(MetaNum(10).h21(3)), true);
checkBool("h31(10,5.1) < h31(10,5.5) < h31(10,5.9) < h31(10,6)",
  MetaNum(10).h31(5.1).lt(MetaNum(10).h31(5.5)) &&
  MetaNum(10).h31(5.5).lt(MetaNum(10).h31(5.9)) &&
  MetaNum(10).h31(5.9).lt(MetaNum(10).h31(6)), true);
// the expanded form keeps the count law with INTEGER counts (only array[0][0]
// may be fractional): every row below the top one carries x-2 = 8 and the α-1
// row carries ceil(y)-2; the fraction lives in the cascade depth, so 2+ε starts
// with the shallowest cascade and 3-ε has the full 10{ω*2}10 cascade
(function () {
  var ok = true;
  for (var k = 0; k < 6; k++) {
    var fy = [2.001, 2.1, 2.5, 3.5, 10.25, 100.75][k];
    var rr = MetaNum(10).h21(fy).array.slice(1);
    for (var i = 0; i < rr.length - 1; i++) if (rr[i][0] !== 8) ok = false;
    if (rr[rr.length - 1][0] !== Math.ceil(fy) - 2) ok = false;
  }
  checkBool("h21(10, fractional): lower rows = 8, ω*2 row = ceil(y)-2 (integer)", ok, true);
  // the endpoints: 2+ε is just above h21(10,2) = 10{ω*2}10, 3-ε → h21(10,3)
  checkBool("h21(10,2+1e-15) = shallowest cascade + one ω*2 row, above h21(10,2)",
    MetaNum(10).h21(2 + 1e-15).array.length === 3 &&
    JSON.stringify(MetaNum(10).h21(2 + 1e-15).array[2]) === "[1,0,2]" &&
    MetaNum(10).h21(2 + 1e-15).gt(MetaNum(10).h21(2)), true);
  checkBool("h21(10,2.999999) → h21(10,3) from below",
    MetaNum(10).h21(2.999999).lt(MetaNum(10).h21(3)) &&
    MetaNum(10).h21(2.999999).gt(MetaNum(10).h21(2)), true);
})();
// the CONTRACT for fractional operands: only array[0][0] may be non-integer —
// every row count, every row coefficient and every other r0 entry is an integer
// (exactly like MetaNum.arrow with a fractional level/argument)
(function () {
  var bad = [], n = 0;
  var fOps = ["h11","h13","h20","h21","h31","h100","h101","h1001","iterate",
    "cuboiter","trioterate","epsilonate"];
  for (var f of fOps) {
    for (var b = 0; b < 3; b++) {
      var bx = [3, 10, 100][b];
      for (var k = 0; k < 3; k++) {
        var by = [2.1, 3.5, 100.75][k];
        n++;
        var arr = MetaNum(bx)[f](by).array;
        for (var i = 0; i < arr.length; i++) {
          for (var j = 0; j < arr[i].length; j++) {
            if (i === 0 && j === 0) continue;
            var c = arr[i][j];
            if (typeof c !== "number" || !isFinite(c) || c !== Math.floor(c)) {
              if (bad.length < 4) bad.push(f + "(" + bx + "," + by + ") [" + i + "][" + j + "]=" + c);
            }
          }
        }
      }
    }
  }
  checkBool("only array[0][0] is fractional (" + n + " results checked)", bad.length === 0,
    true, bad.join(" | "));
  // arrow() itself obeys the same contract
  var bad2 = 0;
  for (var b2 = 0; b2 < 3; b2++) {
    var bx2 = [3, 10, 100][b2];
    for (var k2 = 0; k2 < 7; k2++) {
      var lv = [1.5, 2.1, 2.5, 3.5, 10.25, 100.75, 1e9 + 0.4][k2];
      var arr2 = MetaNum(bx2).arrow(lv)(10).array;
      for (var i2 = 0; i2 < arr2.length; i2++) {
        for (var j2 = 0; j2 < arr2[i2].length; j2++) {
          if (i2 === 0 && j2 === 0) continue;
          if (arr2[i2][j2] !== Math.floor(arr2[i2][j2])) bad2++;
        }
      }
    }
  }
  checkBool("arrow() with fractional levels: only array[0][0] is fractional", bad2 === 0, true);
})();

// row coefficients stay integer (a fractional constant is carried to the base)
(function () {
  var ok = true;
  for (var f of ["h21", "h22", "h31", "h101", "h111", "h1001"]) {
    for (var k = 0; k < 5; k++) {
      var fy = [2.001, 2.5, 3.5, 10.25, 100.75][k];
      var arr = MetaNum(10)[f](fy).array;
      for (var i = 1; i < arr.length; i++) {
        for (var j = 1; j < arr[i].length; j++) {
          if (arr[i][j] !== Math.floor(arr[i][j])) ok = false;
        }
      }
    }
  }
  checkBool("fractional y: every ordinal row coefficient is an integer", ok, true);
})();

// no crash / NaN over the whole range with fractional operands
(function () {
  var allOps = ["h20","h21","h22","h30","h31","h100","h101","h110","h111",
    "h1000","h1001","h10000","iterate"];
  var bad = 0;
  for (var i = 0; i < allOps.length; i++) {
    for (var b = 0; b < 4; b++) {
      var bx = [3, 10, 1e6, 1e16][b];
      for (var k = 0; k < 5; k++) {
        var by = [2.0001, 2.5, 3.5, 10.25, 1000.5][k];
        try {
          var v = MetaNum(bx)[allOps[i]](by);
          if (v.isNaN()) bad++;
        } catch (e) { bad++; }
      }
    }
  }
  checkBool("no throw/NaN for fractional y over h20..h10000 + iterate", bad === 0, true);
})();

// inverse round-trip over the whole small-operand range, successors and limits
(function () {
  var pairs = [["h11","inv_expande"],["h12","inv_multiexpande"],["h13","inv_powerexpande"],
    ["h20","inv_aperioexpande"],["h21","inv_explode"],["h22","inv_multiexplode"],
    ["h30","inv_aperioexplode"],["h31","inv_detonate"],["h100","inv_aperionate"],
    ["h101","inv_megote"],["h110","inv_aperimegote"],["h111","inv_megoexpande"],
    ["h1000","inv_aperiatote"],["h1001","inv_powiainate"]];
  var bad = 0, firstBad = "";
  for (var i = 0; i < pairs.length; i++) {
    for (var b = 0; b < 3; b++) {
      var bx = [3, 5, 10][b];
      for (var y = 3; y <= 20; y++) {
        var v = MetaNum(bx)[pairs[i][0]](y);
        if (!v[pairs[i][1]](MetaNum(bx)).eq(MetaNum(y))) {
          bad++; if (!firstBad) firstBad = pairs[i][0] + "(" + bx + "," + y + ")";
        }
      }
    }
  }
  checkBool("inverse round-trip for h11..h1001 (x=3/5/10, y=3..20)", bad === 0,
    true, bad === 0 ? "" : " first failure: " + firstBad);
})();

// ─────────────────────────────────────
// engine arrays: the (y-2) count law
//   x{L}y = x{L-1}^{y-2}(x{L-1}x): 10{25}10 → count-8 rows/cols (the
//   canonical all-8s), 4{25}4 → count-2; truncation keeps the largest
//   maxRows-1 rows, second-kept row +1, first row [10]
// ─────────────────────────────────────
console.log("\n=== engine arrays ===");
checkBool("10{25}10 exact: all-8s r0 + [8,20..24] rows",
  JSON.stringify(MetaNum.arrow(10, 25, 10).array)
    === JSON.stringify([[10000000000,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
      [8,20],[8,21],[8,22],[8,23],[8,24]]), true);
checkBool("4{25}4 exact: count-2 chain",
  JSON.stringify(MetaNum.arrow(4, 25, 4).array)
    === JSON.stringify([[153.90699754796802,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,20],[2,21],[2,22],[2,23],[2,24]]), true);
checkBool("10{10000}10 truncated: [9,9981],[8,9982]…[8,9999], r0 [10]",
  JSON.stringify(MetaNum.arrow(10, 10000, 10).array).indexOf("[[10],[9,9981],[8,9982],[8,9983]") === 0 &&
  JSON.stringify(MetaNum.arrow(10, 10000, 10).array.slice(-1)) === "[[8,9999]]", true);

// ─────────────────────────────────────
// BEAF ordinal nesting (convention: BEAF(a,b,c,d)=a{ω*(d-1)+c}b —
// the constant term keeps its value, ω+ coefficients decrement by 1)
// Nested huge args anchor at the inner value and add one ordinal row:
//   BEAF(inner,2,3,5) = inner{ω*4+3}2 = inner{ω*4+2}inner → inner + [1|ω*4+2]
//   BEAF(4,inner,3,5) = 4{ω*4+3}inner            → inner + [1|ω*4+3]
//   BEAF(4,2,inner,5) = 4{ω*4+inner}2 = 4{ω*5}inner → inner + [1|ω*5]
//   BEAF(4,2,3,inner) = 4{ω*inner+3}2 = 4{ω²}inner  → inner + [1|ω²]
// ─────────────────────────────────────
console.log("\n=== BEAF ordinal nesting ===");
checkOp("BEAF(3,3,2)", MetaNum.BEAF(3, 3, 2), 7625597484987, 0);
checkBool("BEAF(2,2,1,2)", MetaNum.BEAF(2, 2, 1, 2).eq(4), true);
var beafInner = MetaNum.BEAF(4, 2, 3, 5); // 4{ω*4+3}2 = 4{ω*4+2}(4{ω*4+2}(4{ω*4+1}...))
checkBool("BEAF(4,2,3,5) top row [2,1,4]",
  JSON.stringify(beafInner.array[beafInner.array.length - 1]) === JSON.stringify([2, 1, 4]), true);
checkArr("BEAF(BEAF(4,2,3,5),2,3,5)", MetaNum.BEAF(beafInner, 2, 3, 5),
  beafInner.array.concat([[1, 2, 4]]));
checkArr("BEAF(4,BEAF(4,2,3,5),3,5)", MetaNum.BEAF(4, beafInner, 3, 5),
  beafInner.array.concat([[1, 3, 4]]));
checkArr("BEAF(4,2,BEAF(4,2,3,5),5)", MetaNum.BEAF(4, 2, beafInner, 5),
  beafInner.array.concat([[1, 0, 5]]));
checkArr("BEAF(4,2,3,BEAF(4,2,3,5))", MetaNum.BEAF(4, 2, 3, beafInner),
  beafInner.array.concat([[1, 0, 0, 1]]));
var beafInner5 = MetaNum.BEAF(5, 5, 5, 5, 5);
// ω²-level huge arg: the outer keeps inner's ordinal rows except the smallest
// (dropped at row capacity), base stays [10], first kept row count +1 (the
// truncation marker), plus the new [1|ω⁴] anchor row
var beafOuter5Exp = [[10]].concat(beafInner5.array.slice(2)).concat([[1, 0, 0, 0, 1]]);
beafOuter5Exp[1] = beafOuter5Exp[1].slice();
beafOuter5Exp[1][0] += 1;
checkArr("BEAF(5,5,5,5,BEAF(5,5,5,5,5))", MetaNum.BEAF(5, 5, 5, 5, beafInner5),
    beafOuter5Exp);
// ─────────────────────────────────────
//   BEAF(a,b,c,d,...) = a{...+ω^2*(e-1)+ω*(d-1)+c}b  (constant term = args[2])
//   expansion: largest-to-smallest evaluation; exact when it fits maxRows-1
//   rows, else base [10] + first kept row count +1
// ─────────────────────────────────────
// {2,7,5,5} = 2{ω*4+5}7: rule 3 ends every limit step on the base 2, and
// 2-2=0 means every cascade count vanishes; 2{α}2 collapses through
// successors/limits down to the finite anchor 2{k}2=4 — result is exactly 4
checkBool("BEAF(2,7,5,5) = 4 (base-2 rule-3 collapse)",
  MetaNum.BEAF(2, 7, 5, 5).eq(4), true);
// {3,2,4,6} = 3{ω*5+4}2
checkBool("BEAF(3,2,4,6) top row [1,2,5]",
  JSON.stringify(MetaNum.BEAF(3, 2, 4, 6).array[MetaNum.BEAF(3, 2, 4, 6).array.length - 1])
    === JSON.stringify([1, 2, 5]), true);
// BEAF(3,3,5,5,5) = 3{ω^2*4+ω*4+5}3: exact enumeration needs 49 ordinal rows
// (> default maxRows=20), so raise the budget for this case only
var _savedRowsBEAF = MetaNum.maxRows;
MetaNum.maxRows = 100;
var beaf35555 = MetaNum.BEAF(3, 3, 5, 5, 5);
checkBool("BEAF(3,3,5,5,5) exact (base kept, [1,0,1] first, [1,4,4,4] last)",
  beaf35555.array.length <= MetaNum.maxRows
  && JSON.stringify(beaf35555.array[0]) === JSON.stringify([3638334640023.7783, 7625597484984])
  && JSON.stringify(beaf35555.array[1]) === JSON.stringify([1, 0, 1])
  && JSON.stringify(beaf35555.array[beaf35555.array.length - 1]) === JSON.stringify([1, 4, 4, 4]), true);
MetaNum.maxRows = _savedRowsBEAF;
// BEAF(5,5,1,1,1,2) = 5{ω^3+1}5: truncated expansion
var beaf511112 = MetaNum.BEAF(5, 5, 1, 1, 1, 2);
checkBool("BEAF(5,5,1,1,1,2) truncated ([10] base, first count 4, last [3,0,0,0,1])",
  JSON.stringify(beaf511112.array[0]) === JSON.stringify([10])
  && beaf511112.array[1][0] === 4
  && JSON.stringify(beaf511112.array[beaf511112.array.length - 1]) === JSON.stringify([3, 0, 0, 0, 1])
  && beaf511112.array.length === MetaNum.maxRows, true);

// ─────────────────────────────────────
// Hardy hierarchy — ALL hardy verifications grouped here
// reorganization: small-level, per-definition nested exponents, >1e15
// inputs, MetaNum-object inputs and the 10^^MSI engine limit)
//   hardy(n) = H_α(10); hardy(10) = H_ω(10) = 20; digits of n become CNF coefficients
// hardy per definition, evaluated from below
//   hardy(1e10) = H_{ω^ω}(10) = H_{ω^10}(10) — EXACT array
//     [3086.036065328153, 9×8], strictly below 10{10}10
//   hardy(1e11) = H_{ω^(ω+1)}(10) — expande(10,10)'s row structure on the
//   definitional base, strictly below 10{ω+1}10
//   monotone: hardy(9999999999) < hardy(1e10) < hardy(10000000001)
// (moved into the "hardy hierarchy (all cases)" section below
// reorganization groups every hardy verification together)
// ─────────────────────────────────────
console.log("\n=== hardy hierarchy (all cases) ===");
// -- small levels (exact closed forms) --
checkOp("hardy(0)", MetaNum.hardy(0), 10, 0);
checkOp("hardy(9)", MetaNum.hardy(9), 19, 0);
checkBool("hardy(10) = H_ω(10) = 20", MetaNum.hardy(10).eq(20), true);
checkBool("hardy(11) = H_{ω+1}(10) = 22", MetaNum.hardy(11).eq(22), true);
checkBool("hardy(20) = H_{ω*2}(10) = 40", MetaNum.hardy(20).eq(40), true);
checkBool("hardy(99) = H_{ω*9+9}(10) = 9728", MetaNum.hardy(99).eq(9728), true);
checkBool("hardy(100) = H_{ω^2}(10) = 10240", MetaNum.hardy(100).eq(10240), true);
checkBool("hardy(101) = H_{ω^2+1}(10) = 22528", MetaNum.hardy(101).eq(22528), true);
checkBool("hardy(1234) = H_{ω^3+ω^2*2+ω*3+4}(10) > 10↑↑1000",
  MetaNum.hardy(1234).gt(MetaNum(10).arrow(2)(1000)), true);
checkBool("hardy monotone: 999 < 1000", MetaNum.hardy(999).lt(MetaNum.hardy(1000)), true);
checkBool("hardy(12345) > hardy(1234)", MetaNum.hardy(12345).gt(MetaNum.hardy(1234)), true);
// -- nested exponents, per definition & evaluated from below (v2.0) --
checkBool("hardy(1e10) = H_{ω^10}(10) exact array [3086.036, 9×8]",
  JSON.stringify(MetaNum.hardy(1e10).array)
    === JSON.stringify([[3086.036065328153, 9, 9, 9, 9, 9, 9, 9, 9]]), true);
checkBool("hardy(1e10) < 10{10}10",
  MetaNum.hardy(1e10).lt(MetaNum(10).arrow(10)(10)), true);
checkBool("hardy(1e11) = H_{ω^(ω+1)}(10) < 10{ω+1}10 (expande)",
  MetaNum.hardy(1e11).lt(MetaNum(10).expande(10)), true);
checkBool("hardy monotone 9999999999 < 1e10 < 10000000001",
  MetaNum.hardy(9999999999).lt(MetaNum.hardy(1e10))
    && MetaNum.hardy(1e10).lt(MetaNum.hardy(10000000001)), true);
checkBool("hardy(1e12) > hardy(1e11) (monotone in scale)",
  MetaNum.hardy(1e12).gt(MetaNum.hardy(1e11)), true);
// -- >1e15 inputs (v2.0): scientific-notation strings expand to exact
//    digits so the digit-CNF reading stays monotone past 1e20 --
checkBool("hardy(1e20) < hardy(1e21) < hardy(1e22) (sci-string fix)",
  MetaNum.hardy(1e20).lt(MetaNum.hardy(1e21))
    && MetaNum.hardy(1e21).lt(MetaNum.hardy(1e22)), true);
checkBool("hardy(1e15) < hardy(1e16) < hardy(1e17)",
  MetaNum.hardy(1e15).lt(MetaNum.hardy(1e16))
    && MetaNum.hardy(1e16).lt(MetaNum.hardy(1e17)), true);
// -- MetaNum-object input (v2.0): structures shadow to their ordinal --
//    power tower 10^^k → ω^ω^…^ω (k ω's) → H there = 10.epsilonate(k);
//    letter/ordinal values sit at their own Hardy position → themselves
checkBool("hardy(10^^100) = H_{ω^…^ω(100 ωs)}(10), layer 100-2 = 98 (one per 10^ level)",
  (function () {
    var v = MetaNum.hardy(MetaNum(10).tetr(100));
    return v.layer === 98 &&
      JSON.stringify(v.array) === JSON.stringify(MetaNum.hardy(1e10).array);
  })(), true);
checkBool("hardy(MetaNum G600) = Infinity",
  MetaNum.hardy(MetaNum("G600")).eq(MetaNum.infinity), true);
checkBool("hardy(MetaNum arrow(3,9,3)) = Infinity",
  MetaNum.hardy(MetaNum.arrow(3, 9, 3)).eq(MetaNum.infinity), true);
// anything strictly above 10^^MSI exceeds the ε₀ ceiling → Infinity
checkBool("hardy(10{3}10) = Infinity (> 10^^MSI)",
  MetaNum.hardy(MetaNum(10).arrow(3)(10)).isInfinite(), true);
// -- the engine limit: hardy(10^^MSI) = 10{ω^…^ω(MSI ω's)}10 (v2.0) --
(function () {
  var MSI = 9007199254740991;
  // the tower height k caps the Hardy hierarchy: layer = k - 2 (one per 10^)
  checkBool("hardy(10^^MSI) = the MetaNum limit (layer MSI-2, base rows kept)",
    MetaNum.hardy(MetaNum(10).tetr(MSI)).layer === MSI - 2 &&
    JSON.stringify(MetaNum.hardy(MetaNum(10).tetr(MSI)).array) ===
    JSON.stringify(MetaNum.hardy(1e10).array), true);
  checkBool("hardy(10^^(MSI-1)) is just below the cap",
    MetaNum.hardy(MetaNum(10).tetr(MSI - 1)).lt(MetaNum.hardy(MetaNum(10).tetr(MSI))), true);
})();

// ─────────────────────────────────────
// v2.0.2 hardy fixes:
//   - a plain number beyond the double range is NOT a power tower: read its
//     decimal expansion (hardy("1.8e308") stays layer 0 with the ordinary
//     digit path, last row [8,7,0,3] like hardy("1.79e308"))
//   - ee10 / eee10 / eeee10 map to ω-towers of DIFFERENT heights (layers
//     2/3/4), no longer the same value
//   - fractional n: the ordinal comes from the integer part, the base
//     argument becomes 10+f (H_ω(10.38) = 10.38·2 = 20.76)
// ─────────────────────────────────────
console.log("\n=== v2.0.2 hardy fixes ===");
checkBool("hardy(\"1.8e308\") layer 0, top row [1,8,0,3] (ω^(ω²·3+8), one application)",
  (function () {
    var h = MetaNum.hardy(MetaNum("1.8e308"));
    return h.layer === 0 &&
      JSON.stringify(h.array[h.array.length - 1]) === "[1,8,0,3]";
  })(), true);
// (the row budget resolves differences down to ~1e307 here, so the pair is
// 1.7e308/1.8e308 — one exponent step apart, not one hundredth of one)
checkBool("hardy(\"1.7e308\") < hardy(\"1.8e308\") (monotone over the double limit)",
  MetaNum.hardy(MetaNum("1.7e308")).lt(MetaNum.hardy(MetaNum("1.8e308"))), true);
checkBool("hardy(ee10) < hardy(eee10) < hardy(eeee10) (distinct tower heights)",
  MetaNum.hardy(MetaNum("ee10")).lt(MetaNum.hardy(MetaNum("eee10"))) &&
  MetaNum.hardy(MetaNum("eee10")).lt(MetaNum.hardy(MetaNum("eeee10"))), true);
checkBool("hardy(ee10)/eee10/eeee10 sit at layers 1/2/3 (one layer per 10^ level)",
  MetaNum.hardy(MetaNum("ee10")).layer === 1 &&
  MetaNum.hardy(MetaNum("eee10")).layer === 2 &&
  MetaNum.hardy(MetaNum("eeee10")).layer === 3, true);
checkBool("hardy(10.38) = 20.76 (H_ω(10.38) = 10.38·2)",
  MetaNum.hardy(10.38).eq(MetaNum(20.76)), true);
checkBool("hardy(100.1) = 11084.709858935355 (H_{ω²}(10.1) = 10.1·2^10.1)",
  MetaNum.hardy(100.1).eq(MetaNum(11084.709858935355)), true);
checkBool("hardy(10) < hardy(10.38) < hardy(11) (continuous in n)",
  MetaNum.hardy(10).lt(MetaNum.hardy(10.38)) &&
  MetaNum.hardy(10.38).lt(MetaNum.hardy(11)), true);
checkBool("hardy(100) < hardy(100.1) < hardy(101)",
  MetaNum.hardy(100).lt(MetaNum.hardy(100.1)) &&
  MetaNum.hardy(100.1).lt(MetaNum.hardy(101)), true);
// ─────────────────────────────────────
// non-integer inputs above 1000: the fundamental-sequence step writes the
// running base n into a coefficient, so a coefficient can turn FRACTIONAL —
// the old "-1" step then went negative and left no positive term at all
// (hardy(1000.5) threw "Cannot read properties of undefined (reading 'gt')").
// 0 < c_j < 1 is now a PARTIAL step: ω^j·f contributes ω^(j-1)·(n·f).
// ─────────────────────────────────────
(function () {
  var vals = [1000.5, 1000.1, 1000.9999, 1001.1, 10000.5, 1000000.75, 1e10 + 0.5, 1e15 + 0.5];
  var bad = [], nan = 0;
  for (var i = 0; i < vals.length; i++) {
    var v;
    try { v = MetaNum.hardy(vals[i]); } catch (e) { bad.push(vals[i] + " threw " + e.message.slice(0, 40)); continue; }
    if (v.isNaN()) nan++;
  }
  checkBool("hardy(non-integer > 1000) does not throw", bad.length === 0 && nan === 0, true,
    bad.join(" | "));
  // monotone in the integer and in the fraction
  var mono = true;
  for (var m = 0; m < 5; m++) {
    var base = [1000, 1001, 10000, 12345, 99999][m];
    for (var k = 0; k < 5; k++) {
      var f = [0.001, 0.25, 0.5, 0.75, 0.999][k];
      if (!(MetaNum.hardy(base + f).gte(MetaNum.hardy(base + f - 0.0001)) &&
            MetaNum.hardy(base + 1).gte(MetaNum.hardy(base + f)))) mono = false;
    }
  }
  checkBool("hardy(n) monotone across non-integer n > 1000", mono, true);
  checkBool("hardy(1000) < hardy(1000.5) < hardy(1001)",
    MetaNum.hardy(1000).lt(MetaNum.hardy(1000.5)) &&
    MetaNum.hardy(1000.5).lt(MetaNum.hardy(1001)), true);
  checkBool("hardy(10000) < hardy(10000.5) < hardy(10001)",
    MetaNum.hardy(10000).lt(MetaNum.hardy(10000.5)) &&
    MetaNum.hardy(10000.5).lt(MetaNum.hardy(10001)), true);
  // the array contract still holds for those results
  var cbad = 0;
  for (var b2 = 0; b2 < 4; b2++) {
    var bv = [1000, 10000, 1e6, 1e10][b2];
    for (var k2 = 0; k2 < 3; k2++) {
      var arr = MetaNum.hardy(bv + [0.1, 0.5, 0.9][k2]).array;
      for (var i2 = 0; i2 < arr.length; i2++) {
        for (var j2 = 0; j2 < arr[i2].length; j2++) {
          if (i2 === 0 && j2 === 0) continue;
          if (arr[i2][j2] !== Math.floor(arr[i2][j2])) cbad++;
        }
      }
    }
  }
  checkBool("hardy(non-integer > 1000): only array[0][0] is fractional", cbad === 0, true);
})();

// ─────────────────────────────────────
// hardy above 1e10 with a non-zero "rest": the from-below base is H_{ω^n1}(n1),
// whose tower sits at level n1-1 — array[0] holds n1 entries, so the step-by-step
// expansion only fits while n1 ≤ maxCols.  Above that the coefficients the limit
// steps write turn structured and the expansion collapsed into a destroyed base
// (array[0] = [1]) with a bogus row: hardy(1e10+11) was [[1],[2,20]].
// The engine value 10{n1-1}(n1+1) is used there instead.
// ─────────────────────────────────────
console.log("\n=== hardy(n ≥ 1e10) : base & cascade ===");
(function () {
  // H_{ω^ω+ω+1}(10) = H_{ω^ω}(22): the exact tower [c0, 21×20] no longer fits
  // maxCols = 20, so the TRUNCATED cascade [3086.036…, 21×19] is kept — the
  // [非整数, 21, 21, …, 21] single-row shape (was the engine value
  // 10{20}22 = [[1e10,8×19],[21,20]]).
  var v11 = MetaNum.hardy(1e10 + 11);          // H_{ω^ω+ω+1}(10) = H_{ω^ω}(22)
  checkBool("hardy(1e10+11): single truncated tower [c0, 21×19] — [非整数,21,21,…]",
    v11.array.length === 1 && v11.array[0].length === MetaNum.maxCols &&
    v11.array[0][1] === 21 && v11.array[0][MetaNum.maxCols - 1] === 21 &&
    v11.array[0][0] > 1 && v11.array[0][0] !== Math.floor(v11.array[0][0]), true);
  checkBool("hardy(1e10+11) < 10{21}23 (from below on the ω^22 tower)",
    v11.lt(MetaNum.arrow(10, 21, 23)), true);
  // the same at the top of the range: H_{ω^ω}(48) → level 47
  var v22 = MetaNum.hardy(1e10 + 22);
  checkFormat("hardy(1e10+22) = H_{ω^ω+ω*2+2}(10) → X49", v22, "X49");
  checkBool("hardy(1e10+22): single truncated tower [c0, 47×19]",
    v22.array.length === 1 && v22.array[0][1] === 47 &&
    v22.array[0][MetaNum.maxCols - 1] === 47, true);
  checkBool("hardy(1e10+10) < hardy(1e10+11) < hardy(1e10+22)",
    MetaNum.hardy(1e10 + 10).lt(MetaNum.hardy(1e10 + 11)) &&
    MetaNum.hardy(1e10 + 11).lt(MetaNum.hardy(1e10 + 22)), true);
  // the whole 1e10+m family keeps growing, and never collapses again
  var broke = 0, collapsed = 0;
  for (var m = 0; m <= 30; m++) {
    var vm = MetaNum.hardy(1e10 + m);
    if (m > 0 && !vm.gt(MetaNum.hardy(1e10 + m - 1))) broke++;
    if (vm.array[0].length === 1 && vm.array[0][0] === 1) collapsed++;
  }
  checkBool("hardy(1e10+0..30) is strictly monotone", broke === 0, true);
  checkBool("hardy(1e10+0..30) never collapses array[0] to [1]", collapsed === 0, true);
})();

// The leading term ω^β·dk is dk APPLICATIONS of H_{ω^β}, one after the other on
// the running value, and an application is a row [1, β] — never a bump of the
// ω-row count ([9,0,1] / [16,0,1] conflated dk with the rest-part):
//   hardy(1.1e11) = H_{ω^(ω+1)}(H_{ω^ω}(10))     = [3086.036,9×8] [1,1,1]
//   hardy(2e11)   = H_{ω^(ω+1)}(H_{ω^(ω+1)}(10)) = [3086.036,9×8] [8,0,1] [1,1,1]
(function () {
  var a = MetaNum.hardy(1e11), b = MetaNum.hardy(1.1e11), c = MetaNum.hardy(2e11);
  var base9 = "[3086.036065328153,9,9,9,9,9,9,9,9]";
  checkBool("hardy(1e11) = base + [8,0,1] (one H_{ω^(ω+1)}, from below)",
    JSON.stringify(a.array) === "[" + base9 + ",[8,0,1]]", true);
  checkBool("hardy(1.1e11) = [3086.036,9×8] [1,1,1] (H_{ω^ω} then H_{ω^(ω+1)})",
    JSON.stringify(b.array) === "[" + base9 + ",[1,1,1]]", true);
  checkBool("hardy(2e11) = [3086.036,9×8] [8,0,1] [1,1,1] (H_{ω^(ω+1)} twice)",
    JSON.stringify(c.array) === "[" + base9 + ",[8,0,1],[1,1,1]]", true);
  checkBool("hardy(3e11) = … [8,0,1] [2,1,1] (three applications)",
    JSON.stringify(MetaNum.hardy(3e11).array) === "[" + base9 + ",[8,0,1],[2,1,1]]", true);
  checkBool("hardy(1e11) < hardy(1.1e11) < hardy(2e11) < hardy(3e11)",
    a.lt(b) && b.lt(c) && c.lt(MetaNum.hardy(3e11)), true);
  var ok = true;
  for (var dk = 1; dk <= 9; dk++) {
    var vd = MetaNum.hardy(dk * 1e11);
    if (dk > 1 && !vd.gt(MetaNum.hardy((dk - 1) * 1e11))) ok = false;
  }
  checkBool("hardy(dk·1e11) strictly monotone in dk = 1..9", ok, true);
  // the same at ω+2: hardy(1.1e12) = H_{ω^(ω+2)}(H_{ω^(ω+1)}(10))
  checkBool("hardy(1.1e12) = [3086.036,9×8] [8,0,1] [1,2,1]",
    JSON.stringify(MetaNum.hardy(1.1e12).array) === "[" + base9 + ",[8,0,1],[1,2,1]]", true);
})();

// hardy("1e100000") and above: 10^v is a PLAIN number (a power tower has the
// same r0 = [v,1] shape but v ≥ 1e10), so the digit path must be taken — the
// old "exponent < 1e5" guard pushed it into the tower branch (layer 1).
(function () {
  var h100k = MetaNum.hardy("1e100000");
  checkBool("hardy(\"1e100000\") = H_{ω^(ω^5)}(10), layer 0", h100k.layer === 0, true);
  checkBool("hardy(\"1e100000\"): top row is the ω^5 cascade [8,9,9,9,9,9]",
    JSON.stringify(h100k.array[h100k.array.length - 1]) === "[8,9,9,9,9,9]", true);
  checkBool("hardy(\"1e10000\") top row = [8,9,9,9,9] (ω^4 cascade)",
    JSON.stringify(MetaNum.hardy("1e10000").array[19]) === "[8,9,9,9,9]", true);
  checkBool("hardy(\"1e1000\") top row = [8,9,9,9] (ω^3 cascade)",
    JSON.stringify(MetaNum.hardy("1e1000").array[19]) === "[8,9,9,9]", true);
  checkBool("hardy(1e100) top row = [8,9,9] (ω^2 cascade)",
    JSON.stringify(MetaNum.hardy(1e100).array[19]) === "[8,9,9]", true);
  checkBool("hardy(1e100) < hardy(\"1e1000\") < hardy(\"1e10000\") < hardy(\"1e100000\")",
    MetaNum.hardy(1e100).lt(MetaNum.hardy("1e1000")) &&
    MetaNum.hardy("1e1000").lt(MetaNum.hardy("1e10000")) &&
    MetaNum.hardy("1e10000").lt(MetaNum.hardy("1e100000")), true);
  // ee6..ee9: the ordinal is read off the value itself (10^W → ω^ord(W)),
  // so these are layer-0 cascades with ordinal rows that follow the input;
  // ee10 (W = 1e10 exactly) is the height-3 band → layerUp(hardy(1e10))
  checkBool("hardy(ee6..ee9) stay layer 0 with ordinal rows; ee10 → layer 1",
    (function () {
      for (var k = 6; k <= 9; k++) {
        var v = MetaNum.hardy("ee" + k);
        if (v.layer !== 0 || v.array.length - 1 !== 19) return false;
      }
      var v10 = MetaNum.hardy("ee10");
      return v10.layer === 1 && v10.array.length === 1;
    })(), true);
  checkBool("hardy(ee6) < hardy(ee7) < … < hardy(ee10) (rows follow the input)",
    (function () {
      for (var k = 7; k <= 10; k++) {
        if (!MetaNum.hardy("ee" + (k - 1)).lt(MetaNum.hardy("ee" + k))) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(ee10) = layerUp(hardy(1e10)): the same rows at layer 1",
    MetaNum.hardy("ee10").layer === 1 &&
    JSON.stringify(MetaNum.hardy("ee10").array) ===
    JSON.stringify(MetaNum.hardy(1e10).array), true);
  // just above ee10 the level no longer fits into rows → layer 1
  checkBool("hardy(10^(1e10+1)) = H_{ω^(ω^ω+1)}(10) → layer 1",
    MetaNum.hardy(MetaNum(10).pow(MetaNum(1e10).add(MetaNum(1)))).layer === 1, true);
  checkBool("hardy(ee10) < hardy(10^(1e10+1)) < hardy(ee20)",
    MetaNum.hardy("ee10").lt(MetaNum.hardy(MetaNum(10).pow(MetaNum(1e10).add(MetaNum(1))))) &&
    MetaNum.hardy(MetaNum(10).pow(MetaNum(1e10).add(MetaNum(1)))).lt(MetaNum.hardy("ee20")), true);
  checkBool("hardy(ee10) < hardy(ee20) < hardy(ee100) < hardy(eee5) < hardy(eee10)",
    MetaNum.hardy("ee10").lt(MetaNum.hardy("ee20")) &&
    MetaNum.hardy("ee20").lt(MetaNum.hardy("ee100")) &&
    MetaNum.hardy("ee100").lt(MetaNum.hardy("eee5")) &&
    MetaNum.hardy("eee5").lt(MetaNum.hardy("eee10")), true);
  checkBool("above eee10 the layer is 2, above eeee10 it is 3 (one per 10^)",
    MetaNum.hardy("eee20").layer === 2 && MetaNum.hardy("eeee10").layer === 3 &&
    MetaNum.hardy("eeeee10").layer === 4, true);
  checkBool("hardy(eee10) < hardy(eee20) < hardy(eeee10) < hardy(eeeee10)",
    MetaNum.hardy("eee10").lt(MetaNum.hardy("eee20")) &&
    MetaNum.hardy("eee20").lt(MetaNum.hardy("eeee10")) &&
    MetaNum.hardy("eeee10").lt(MetaNum.hardy("eeeee10")), true);
})();

// ─────────────────────────────────────
// A number beyond Number.MAX_VALUE is stored as 10^v; the reconstructed mantissa
// carries a rounding tail (2e1000 → 10^1000.301029995664 → 10^0.301… =
// 1.9999999999… instead of 2), which used to spell "19999…9" and made hardy
// read a garbage "rest" — hardy("2e1000") returned Infinity.
(function () {
  var vals = ["2e1000", "5e1001", "9e999", "3.5e500"];
  var bad = 0;
  for (var i = 0; i < vals.length; i++) {
    var v = MetaNum.hardy(vals[i]);
    if (v.isNaN() || v.array[0].length === 1 && v.array[0][0] === null) bad++;
  }
  checkBool("hardy(\"2e1000\")/\"5e1001\"/… are finite (no rounding-tail Infinity)",
    bad === 0, true);
  checkBool("hardy(\"9e999\") < hardy(\"1e1000\") < hardy(\"2e1000\") monotone",
    MetaNum.hardy("9e999").lt(MetaNum.hardy("1e1000")) &&
    MetaNum.hardy("1e1000").lt(MetaNum.hardy("2e1000")), true);
  checkBool("hardy(\"2e1000\") top row follows the input (ω^1000 cascade)",
    MetaNum.hardy("2e1000").layer === 0 &&
    MetaNum.hardy("2e1000").array.length - 1 === 19, true);
})();

// ─────────────────────────────────────
// Levels above the letter grid (ω*2+100, ω*50, ω²*50, …) read as level-arg:
// the snapped level with the fundamental-sequence index that recovers the
// ordinal — the LARGEST coefficient was used before, which collapsed
// [100,100,50], [100,100,60] and [100,100,100] into one string.
(function () {
  var pairs = [
    [[100, 100, 50], "2.000Aaaa51"],
    [[100, 100, 60], "2.000Aaaa61"],
    [[100, 100, 100], "2.000Aaaa101"],
    [[100, 100, 200], "2.000Aaaa201"],
    [[100, 30], "2.000Aaa31"],
    [[100, 50], "2.000Aaa51"],
    [[100, 2], "2.000Ca100"]
  ]
  var ok = true, seen = {}
  for (var i = 0; i < pairs.length; i++) {
    var f = format(MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), pairs[i][0]))
    if (f !== pairs[i][1]) { ok = false; console.log("   " + f + " ≠ " + pairs[i][1]) }
    if (seen[f]) { ok = false; console.log("   collision: " + f) }
    seen[f] = true
  }
  checkBool("unnamed levels keep distinct level-args", ok, true)
  // the ω+c / ω*N families must not collide either
  var ok2 = true, seen2 = {}
  var fam = [[100, 3], [100, 4], [100, 5], [0, 40], [100, 40]]
  for (var j = 0; j < fam.length; j++) {
    var g = format(MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), fam[j]))
    if (seen2[g]) { ok2 = false; console.log("   collision: " + g + " " + JSON.stringify(fam[j])) }
    seen2[g] = true
  }
  checkBool("ω+c / ω*N families keep distinct level-args", ok2, true)
})();

// The carried !αAaβ form takes the ω-EXPONENT as β (README: !αAaβ = ω^β plus
// the digits of α).  ω³*50+… snaps to ω⁴, whose letter "Aaaaa" (5) exceeds
// multiLetterLimit(4), so it reads "!2.000Aa4" — "!2.000Aa51" would claim the
// ω⁵¹ level.
(function () {
  var deep = format(MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 100, 100, 50]))
  checkFormat("ω³*50+… → !1.000H51 (single-letter carried form)",
    MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 100, 100, 50]), "!1.000H51")
  checkFormat("ω³*100+… → !1.000H101",
    MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 100, 100, 100]), "!1.000H101")
  checkFormat("ω³*200+… → !1.000H201",
    MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 100, 100, 200]), "!1.000H201")
  checkBool("the level-arg index is not used as the !-form exponent",
    deep.indexOf("Aa51") < 0, true)
})();

// ─────────────────────────────────────
// format: repeatLetterThreshold caps how many times ONE letter repeats — an
// inner level must not promote to the outer letter (3{3}6 = FFF(E^7.6e12) is
// "FFFEEE9.007E15", not "FFFF7.626E12"), and the saturated form is followed by
// the next-letter (G) form.
(function () {
  checkFormat("arrow(3,3,5) spells three F", MetaNum.arrow(3, 3, 5), "FFF7.626E12");
  // a fourth F would break repeatLetterThreshold, so the value renders at the
  // next letter by its real argument — not a saturated FFFEEE{…} form
  checkFormat("arrow(3,3,6) → 2.045G5 (next letter, real argument)",
    MetaNum.arrow(3, 3, 6), "2.045G5");
  checkFormat("arrow(3,3,7) → 2.045G6", MetaNum.arrow(3, 3, 7), "2.045G6");
  checkFormat("arrow(3,3,8) → 2.045G7", MetaNum.arrow(3, 3, 8), "2.045G7");
  for (var an = 3; an <= 8; an++) {
    var fs = format(MetaNum.arrow(3, 3, an))
    if (/(.)\1{3}/.test(fs.replace(/[\d,.]/g, ''))) {
      checkBool("arrow(3,3," + an + ") keeps within repeatLetterThreshold(3)", false, true)
    }
  }
  checkBool("no more than repeatLetterThreshold(3) copies of one letter", true, true)
})();

// A diagonal letter (name ending in "a": Aa, Ba, Ca, Aaa, …) carries the
// mantissa α = 2·5^f ∈ [2,10) — never the [1,10) of the other letters.
(function () {
  var diag = ["2.000Ca100", "2.000Aaa100", "2.000Aaaa101", "2.000Ba100"];
  var got = [
    format(MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 2])),
    format(MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [0, 100])),
    format(MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(1000), [100, 100, 100])),
    format(MetaNum(10).aperioexpande(100))
  ];
  var ok = true;
  for (var i = 0; i < diag.length; i++) {
    if (got[i] !== diag[i]) { ok = false; console.log("   " + got[i] + " ≠ " + diag[i]); }
    var m = parseFloat(got[i]);
    if (!(m >= 2 && m < 10)) ok = false;
  }
  checkBool("diagonal-letter mantissa stays in [2,10)", ok, true);
})();

// Truncation must keep hardy's definitional from-below base top as array[0][0],
// not collapse it to the [10] marker (the string "1e16+1e13" form used to parse
// to 0 → hardy(0) = 10 → the bare [10] base).
(function () {
  var baseTop = 3086.036065328153;
  checkBool("hardy(1e10+22): truncated tower keeps the base top 3086.036…, not [10]",
    MetaNum.hardy(1e10 + 22).array[0][0] === baseTop, true);
  checkBool("hardy(1e10+40): truncated tower keeps the base top 3086.036…, not [10]",
    MetaNum.hardy(1e10 + 40).array[0][0] === baseTop, true);
  checkBool("hardy(\"1e16+1e13\"): the string form keeps the base and rows",
    (function () {
      var v = MetaNum.hardy("1e16+1e13");
      return v.array[0][0] === baseTop &&
        JSON.stringify(v.array.slice(1)) === "[[8,0,1],[8,1,1],[8,2,1],[1,6,1]]";
    })(), true);
  var n10 = 0, mono = true, prev = null;
  for (var m = 0; m <= 40; m++) {
    var vm = MetaNum.hardy(1e10 + m);
    if (vm.array[0].length === 1 && vm.array[0][0] === 10) n10++;
    if (prev && !vm.gt(prev)) mono = false;
    prev = vm;
  }
  checkBool("hardy(1e10+0..40): never a [10] base", n10 === 0, true);
  checkBool("hardy(1e10+0..40): strictly monotone across the truncation point", mono, true);
  checkBool("hardy(\"1e100000\") keeps the base too",
    JSON.stringify(MetaNum.hardy("1e100000").array[0]) === "[3086.036065328153,9,9,9,9,9,9,9,9]", true);
})();

// hardy(1e16+1e13) = H_{ω^(ω+6)+ω^(ω+3)}(10): the plain number is stored as 10^v
// from 1e16 on, and the way back through the double lost the low digits
// (10010000000000000 → 10010000000000014), which made the digit path read 14
// instead of 1e13 as the "rest" — the base then collapsed to [1].
(function () {
  var v = MetaNum.hardy(1e16 + 1e13);
  checkBool("hardy(1e16+1e13): array[0] is a real base, not the [1] marker",
    v.array[0].length > 1, true);
  checkBool("hardy(1e16+1e13) = H_{ω^(ω+6)}(H_{ω^(ω+3)}(10)) → … [8,2,1] [1,6,1]",
    JSON.stringify(v.array.slice(1)) ===
    "[[8,0,1],[8,1,1],[8,2,1],[1,6,1]]", true);
  checkBool("hardy(1e16) < hardy(1e16+1e13) < hardy(2e16)",
    MetaNum.hardy(1e16).lt(v) && v.lt(MetaNum.hardy(2e16)), true);
})();

// ─────────────────────────────────────
// v2.0.2 hardy(n > 1e10) round 2:
//   1. fractional inputs 1e10+f collapse into ONE plain row (the fractional
//      hyper-operation result) and stay monotone across the integers;
//   2. n1 > maxCols+1 keeps the truncated exact tower [c0, (n1-1)×(maxCols-1)]
//      instead of the engine value;
//   3. "AeB+C" strings parse to the exact sum (hardy("1e16+1e13") is no longer
//      hardy(0) = 10);
//   4. for 1e10 ≤ x < e1e10, hardy(10^x) = layerUp(hardy(x)) — one layer apart,
//      same array rows.
// ─────────────────────────────────────
console.log("\n=== v2.0.2 hardy(n > 1e10) round 2 ===");
(function () {
  // 1. single-row fractional results
  checkBool("hardy(1e10) < hardy(1e10+0.5) < hardy(1e10+1), all single-row",
    (function () {
      var a = MetaNum.hardy(1e10), b = MetaNum.hardy("1e10+0.5"), c = MetaNum.hardy(1e10 + 1);
      return a.lt(b) && b.lt(c) &&
        a.array.length === 1 && b.array.length === 1 && c.array.length === 1;
    })(), true);
  checkBool("hardy(1e10+0.5).array[0][0] is the fractional hyper-op result",
    (function () {
      var b = MetaNum.hardy("1e10+0.5").array[0][0];
      return b > 3086.036 && b < 6785.435 && b !== Math.floor(b);
    })(), true);
  checkBool("hardy(1e10+k+0.5) single-row and monotone for k = 0..9",
    (function () {
      var prev = MetaNum.hardy(1e10);
      for (var k = 0; k <= 9; k++) {
        var v = MetaNum.hardy(1e10 + k + 0.5);
        if (v.array.length !== 1) return false;
        if (!v.gt(prev)) return false;
        prev = v;
        var vi = MetaNum.hardy(1e10 + k + 1);
        if (!vi.gt(v)) return false;
        prev = vi;
      }
      return true;
    })(), true);
  // 2. truncated towers
  checkBool("hardy(1e10+11) < hardy(1e10+11.5) ≤ hardy(1e10+12) (fraction keeps order)",
    MetaNum.hardy("1e10+11").lt(MetaNum.hardy("1e10+11.5")) &&
    MetaNum.hardy("1e10+11.5").lt(MetaNum.hardy(1e10 + 12)), true);
  checkBool("hardy(1e10+m) tower level = hardy(m)-1 for m = 12..40",
    (function () {
      for (var m = 12; m <= 40; m += 7) {
        var lv = MetaNum.hardy(1e10 + m).array[0][1];
        if (lv !== MetaNum.hardy(m).toNumber() - 1) return false;
      }
      return true;
    })(), true);
  // 3. the string sum form
  checkBool("M(\"1e10+0.5\") parses to the exact 10000000000.5",
    JSON.stringify(MetaNum("1e10+0.5").array) === "[[10000000000.5]]", true);
  checkBool("M(\"1e10+11\") parses to the exact 10000000011",
    JSON.stringify(MetaNum("1e10+11").array) === "[[10000000011]]", true);
  checkBool("hardy(\"1e10+11\") = hardy(10000000011) (string = number form)",
    JSON.stringify(MetaNum.hardy("1e10+11").array) ===
    JSON.stringify(MetaNum.hardy(10000000011).array), true);
  checkBool("hardy(\"1e10+22\") format X49 (level 47 chain, promoted)",
    MetaNum.hardy("1e10+22").format() === "X49", true);
  // 4. the tower layer rule: every extra 10^ level adds ONE layer, the array
  //    rows stay those of the innermost readable expansion
  checkBool("hardy(e1e10) = layerUp(hardy(1e10))",
    (function () {
      var a = MetaNum.hardy("e1e10"), b = MetaNum.hardy(1e10);
      return a.layer === b.layer + 1 &&
        JSON.stringify(a.array) === JSON.stringify(b.array);
    })(), true);
  checkBool("hardy(1e308) = layer 0, the digit-path cascade (…[8,6,0,3],[8,7,0,3])",
    (function () {
      var v = MetaNum.hardy("1e308");
      return v.layer === 0 && v.array.length > 2 &&
        JSON.stringify(v.array[v.array.length - 2]) === "[8,6,0,3]" &&
        JSON.stringify(v.array[v.array.length - 1]) === "[8,7,0,3]";
    })(), true);
  checkBool("hardy(e1e308)/ee1e308/eee1e308 = the same rows at layers 1/2/3",
    (function () {
      var v0 = MetaNum.hardy("1e308");
      var chain = ["e1e308", "ee1e308", "eee1e308"];
      for (var i = 0; i < chain.length; i++) {
        var v = MetaNum.hardy(chain[i]);
        if (v.layer !== i + 1) return false;
        if (JSON.stringify(v.array) !== JSON.stringify(v0.array)) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(10^^100) keeps the rows: layer 98 over hardy(1e10)'s array",
    (function () {
      var v = MetaNum.hardy(MetaNum(10).tetr(100));
      return v.layer === 98 &&
        JSON.stringify(v.array) === JSON.stringify(MetaNum.hardy(1e10).array);
    })(), true);
  checkBool("hardy(10^x) = layerUp(hardy(x)) for x = 1e10+1, 2e10, 1e11, 1e15",
    (function () {
      var xs = [1e10 + 1, 2e10, 1e11, 1e15];
      for (var i = 0; i < xs.length; i++) {
        var hx = MetaNum.hardy(xs[i]);
        var htx = MetaNum.hardy(MetaNum(10).pow(MetaNum(xs[i])));
        if (htx.layer !== hx.layer + 1) return false;
        if (JSON.stringify(htx.array) !== JSON.stringify(hx.array)) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(10^x) monotone in x across the height-3 band",
    (function () {
      var xs = [2e10, 5e10, 1e11, 1e12, 1e15, 1e18];
      for (var i = 1; i < xs.length; i++) {
        if (!MetaNum.hardy(MetaNum(10).pow(MetaNum(xs[i - 1])))
          .lt(MetaNum.hardy(MetaNum(10).pow(MetaNum(xs[i]))))) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(eee10) keeps the definitional base in its layer-1 marker",
    JSON.stringify(MetaNum.hardy("eee10").array[0]) ===
    "[3086.036065328153,9,9,9,9,9,9,9,9]", true);
})();

// ─────────────────────────────────────
// v2.0.2 unnamed-level format: a level whose coefficients exceed the letter
// grid (ω*2+100, ω*100, ω²*100+ω*100+100, …) rounds UP to the next nameable
// level and reads as level-arg — never a wrapped/wrong letter, never the
// summed repeat count
// ─────────────────────────────────────
console.log("\n=== v2.0.2 unnamed-level format ===");
// a diagonal letter ("Ca", "Ba", "Aaa", …) carries α = 2·5^f ∈ [2,10)
checkFormat("10{ω*2+100}100 → 2.000Ca100",
  MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 2]), "2.000Ca100");
checkFormat("10{ω*100}100 → 2.000Aaa100",
  MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [0, 100]), "2.000Aaa100");
checkFormat("10{ω²*100+ω*100+100}1000 → 2.000Aaaa101",
  MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(1000), [100, 100, 100]), "2.000Aaaa101");
checkFormat("h20(10,1000) → 2.000Ba1,000 (ω*2 with y=1000)",
  MetaNum(10).h20(1000), "2.000Ba1,000");
checkFormat("h100(10,1000) → 2.000Aaa1,000 (ω² with y=1000)",
  MetaNum(10).h100(1000), "2.000Aaa1,000");
checkFormat("h30(10,100) → 2.000Ca100 (ω*3 with y=100)",
  MetaNum(10).h30(100), "2.000Ca100");
// nameable levels keep their ordinary cascade display
checkFormat("h21(10,1000) → Bb999 (nameable top row, unchanged)",
  MetaNum(10).h21(1000), "1.000Bb999");

// ─────────────────────────────────────
// fractional hyperoperation levels
//   level n+f interpolates geometrically (README rule i): 10{n+f}10 =
//   10{n+1}(2·5^f); continuous: f=0 → level n, f=1 → level n+1
// ─────────────────────────────────────
console.log("\n=== fractional levels ===");
(function () {
  var a = MetaNum(10);
  var v3 = a.arrow(3)(10), v4 = a.arrow(4)(10);
  var v32 = a.arrow(3.2)(10), v35 = a.arrow(3.5)(10);
  checkBool("10{3.0}10 = 10{3}10 (f=0 anchor)", a.arrow(3.0)(10).eq(v3), true);
  checkBool("monotone 10{3}10 < 10{3.2}10 < 10{3.5}10 < 10{4}10",
    v3.lt(v32) && v32.lt(v35) && v35.lt(v4), true);
  // rule (i) verbatim: 10{3.5}10 = 10{4}(2·5^0.5)
  var theta = MetaNum(2).mul(MetaNum(10).div(2).pow(0.5));
  checkBool("10{3.5}10 = 10{4}(2·5^0.5)", v35.eq(a.arrow(4)(theta)), true);
  checkBool("3{2.5}3 between 3{2}3 and 3{3}3",
    MetaNum(3).arrow(2)(3).lt(MetaNum(3).arrow(2.5)(3)) &&
    MetaNum(3).arrow(2.5)(3).lt(MetaNum(3).arrow(3)(3)), true);
})();

// ─────────────────────────────────────
// arrow(x,y,y): level and argument move together, so the interpolation anchor
// θ0 (the c with x{n+1}c = x{n}y) has to be a CONTINUOUS inverse — the integer
// bisection of hyper_log overshoots it (2 instead of 1.0414), which makes the
// geometric step y/θ0 < 1 run backwards and breaks monotonicity.
// ─────────────────────────────────────
(function () {
  var ys = [1, 1.1, 1.5, 1.9, 2];
  for (var b = 0; b < 2; b++) {
    var bx = [3, 10][b], prev = null, ok = true, firstBad = "";
    for (var i = 0; i < ys.length; i++) {
      var v = MetaNum.arrow(bx, ys[i], ys[i]);
      if (prev && !v.gte(prev)) { ok = false; if (!firstBad) firstBad = "y=" + ys[i]; }
      prev = v;
    }
    checkBool("arrow(" + bx + ",y,y) monotone for y = 1, 1.1, 1.5, 1.9, 2", ok, true,
      ok ? "" : " first break: " + firstBad);
  }
  // fine sweep across the whole 1 → 3 range, both endpoints included
  var fine = [1, 1.01, 1.25, 1.5, 1.75, 1.99, 2, 2.1, 2.5, 2.9, 3];
  for (var b2 = 0; b2 < 2; b2++) {
    var bx2 = [3, 10][b2], p2 = null, ok2 = true;
    for (var j = 0; j < fine.length; j++) {
      var v2 = MetaNum.arrow(bx2, fine[j], fine[j]);
      if (p2 && !v2.gte(p2)) ok2 = false;
      p2 = v2;
    }
    checkBool("arrow(" + bx2 + ",y,y) monotone over y = 1 … 3", ok2, true);
  }
  // the ends of an interval meet the neighbouring integers
  checkBool("10{1.99}1.99 < 10{2}2 = 10^^2",
    MetaNum.arrow(10, 1.99, 1.99).lt(MetaNum.arrow(10, 2, 2)), true);
  checkBool("10{2}2 < 10{2.1}2.1",
    MetaNum.arrow(10, 2, 2).lt(MetaNum.arrow(10, 2.1, 2.1)), true);
  checkBool("3{1.99}1.99 < 3{2}2 = 27",
    MetaNum.arrow(3, 1.99, 1.99).lt(MetaNum.arrow(3, 2, 2)), true);
})();

// ─────────────────────────────────────
// non-integer arguments at ordinal levels
//   expa(10,2.1) = 10{ω+1}2.1 = 10{ω}10{ω}(10^0.1)
//   (continuity: expa(10,2) = 10{ω}10, expa(10,3) = 10{ω}10{ω}10)
// ─────────────────────────────────────
console.log("\n=== ordinal-level fractional arguments ===");
(function () {
  var e2 = MetaNum(10).expande(2), e21 = MetaNum(10).expande(2.1),
      e25 = MetaNum(10).expande(2.5), e3 = MetaNum(10).expande(3);
  checkBool("expa(10,2) = 10{ω}10", e2.eq(MetaNum(10).aperiote(10)), true);
  checkBool("expa(10,3) = 10{ω}10{ω}10", e3.eq(MetaNum(10).aperiote(e2)), true);
  checkBool("expa(10,2.1) = 10{ω}10{ω}(10^0.1)",
    e21.eq(MetaNum(10).aperiote(MetaNum(10).aperiote(MetaNum(10).pow(0.1)))), true);
  checkBool("expa monotone 2 < 2.1 < 2.5 < 3",
    e2.lt(e21) && e21.lt(e25) && e25.lt(e3), true);
  var m21 = MetaNum(10).multiexpande(2.1);
  checkBool("muea(10,2.1) = 10{ω+2}2.1 = (10{ω+1})²(10^0.1)",
    m21.eq(MetaNum(10).expande(MetaNum(10).expande(MetaNum(10).pow(0.1)))), true);
  checkBool("poea(10,2.1) = 10{ω+3}2.1 = (10{ω+2})²(10^0.1)",
    MetaNum(10).powerexpande(2.1).eq(
      MetaNum(10).multiexpande(MetaNum(10).multiexpande(MetaNum(10).pow(0.1)))), true);
  checkBool("expa(10,3.1) computable", !MetaNum(10).expande(3.1).isNaN(), true);
})();

console.log("\n=== Done ===");

// ─────────────────────────────────────
// format() tests (25 cases covering small, sci, single-letter, multi-letter, ordinal)
// ─────────────────────────────────────
console.log("\n=== format() verification ===");

function checkFormat(name, input, expected) {
  try {
    var m = MetaNum(input);
    var s = format(m);
    var pass = s === expected;
    console.log((pass ? "PASS" : "FAIL") + " | fmt " + name + " | " + input + " => " + s + (pass ? "" : " (expected " + expected + ")"));
  } catch (e) {
    console.log("ERROR | fmt " + name + " | " + input + " => " + e.message);
  }
}

// Small values & regular numbers
// β = 1e6 ≥ 10^sciDecimalThreshold(3) → α keeps only its integer part
checkFormat("1E-1000000", "1E-1000000", "1E-1,000,000"); // sign=2 reciprocal
checkFormat("1E-100",     "1E-100",     "1.000E-100");
checkFormat("0.123",      "0.123",       "0.123");
checkFormat("456789",     "456789",      "456,789");
checkFormat("1E100",      "1E100",       "1.000E100");   // α always shown

// Single-letter chains (E-Z range): outerLetters + α + lastLetter + β
checkFormat("EE200", "EE200", "E1.000E200");
checkFormat("F300",  "F300",  "1.000F300");
checkFormat("FE400", "FE400", "F1.000E400");
checkFormat("FF500", "FF500", "F1.000F500");
checkFormat("G600",  "G600",  "1.000G600");
checkFormat("GE700", "GE700", "G1.000E700");
checkFormat("GF800", "GF800", "G1.000F800");
checkFormat("GG900", "GG900", "G1.000G900");
checkFormat("J1000", "J1000", "1.000J1,000");

// Ordinal (Aa and beyond) - single letter: α + letter + β
checkFormat("Aa100",  "Aa100",  "2.000Aa100");
checkFormat("Ab400",  "Ab400",  "1.000Ab400");
checkFormat("Ac800",  "Ac800",  "1.000Ac800");
checkFormat("Aj900",  "Aj900",  "1.000Aj900");
checkFormat("Ba1000", "Ba1000", "2.000Ba1,000");
checkFormat("Aaa100", "Aaa100", "2.000Aaa100");

// Ordinal with multi-level r0: ordinalLetter + r0Chain (includes α)
checkFormat("AaE200",  "AaE200",  "Aa1.000E200");
checkFormat("AbE500",  "AbE500",  "Ab1.000E500");

// Ordinal repeated letters: outerLetters + α + lastLetter + β
checkFormat("AaAa300", "AaAa300", "Aa1.000Aa300");
checkFormat("AbAa600", "AbAa600", "Ab1.000Aa600");
checkFormat("AbAb700", "AbAb700", "Ab1.000Ab700");

// Ordinal more Letters:
checkFormat("Abc100", "Abc100", "1.000Abc100");
checkFormat("Defg200", "Defg200", "1.000Defg200");

// Symbols and ε:
checkFormat("!Aa300", "!Aa300", "!2.000Aa300");
checkFormat("@Bb400", "@Bb400", "@1.000Bb400");
checkFormat("1ε500", "1ε500", "1.000000ε500"); // epsilonSignificantDigits = 6

// Reciprocal of large numbers (sign=2) format tests
// smallNotationUseE=true → E-<formatted mag>
// smallNotationUseE=false → <formatted value>⁻¹
console.log("\n=== reciprocal format tests ===");

// Parsing: verify sign=2 and array structure
check("E-EE1000 parse",  "E-EE1000", [[1000, 3]]);
check("1/F500 parse",    "1/F500",   [[10000000000, 498]]);
check("1/G200 parse",    "1/G200",   [[10000000000, 8, 198]]);
check("1/F10 parse",     "1/F10",    [[10000000000, 8]]);

// format() with smallNotationUseE=true (default):
//   E-EE1000 = 10^(-log10(EE1000)) = 10^(-E1000)  → "E-E1.000E1,000"
//   1/F500   = 10^(-log10(F500))   = 10^(-F499)   → "E-1.000F499"
//   1/G200   = 10^(-log10(G200))   ≈ 10^(-G200)    → "E-1.000G200" (TMSI: G200>TMSI)
//   1/F10    = 10^(-log10(F10))    = 10^(-F9)      → "E-1.000F9"
checkFormat("E-EE1000 (useE=true)", "E-EE1000", "E-E1E1,000"); // β=1e6 ≥ 10^sciDecimalThreshold → integer α
checkFormat("1/F500   (useE=true)", "1/F500",   "E-1.000F499");
checkFormat("1/G200   (useE=true)", "1/G200",   "E-1.000G200");
checkFormat("1/F10    (useE=true)", "1/F10",    "E-1.000F9");

// format() with smallNotationUseE=false:
//   E-EE1000 → "EE1.000E1,000⁻¹"
//   1/F500   → "1.000F500⁻¹"
//   1/G200   → "1.000G200⁻¹"
//   1/F10    → "1.000F10⁻¹"
var _FMT = (typeof FORMAT_OPTIONS !== "undefined" && FORMAT_OPTIONS) ? FORMAT_OPTIONS : require("./format-metanum.js").FORMAT_OPTIONS;
var _savedUseE = _FMT.smallNotationUseE;
_FMT.smallNotationUseE = false;
checkFormat("E-EE1000 (useE=false)", "E-EE1000", "EE1E1,000⁻¹"); // integer α (sciDecimalThreshold)
checkFormat("1/F500   (useE=false)", "1/F500",   "1.000F500⁻¹");
checkFormat("1/G200   (useE=false)", "1/G200",   "1.000G200⁻¹");
checkFormat("1/F10    (useE=false)", "1/F10",    "1.000F10⁻¹");
_FMT.smallNotationUseE = _savedUseE;

console.log("\n=== format α correctness ===");
// format α correctness
checkFormat("hardy(1120) single α", MetaNum.hardy(1120), "F4.398E13");
checkFormat("hardy(4150) real α", MetaNum.hardy(4150), "2.300G5");
checkFormat("nested arrow single α", MetaNum.arrow(3, MetaNum.arrow(3, 4, 3), 3), "AaGF7.626E12");
checkFormat("canonical all-8s keeps α=1 (G600)", "G600", "1.000G600");

// ─────────────────────────────────────
// display rules: at most TWO letter types, one α, multiLetterLimit symbol
// carry — a cascade that would spell 20 letter types keeps its top two levels,
// and a combination longer than multiLetterLimit switches to !αAaβ
// ─────────────────────────────────────
checkFormat("20-row cascade compresses to two letter types", MetaNum.h10000(3, 10), "Iccc1.000Iccb10");
// a level whose letter name is longer than multiLetterLimit carries to the
// SINGLE-letter form !αΓβ — "!" adds one ω^ layer on top of the level Γ names
checkFormat("10-letter level carries to !1.000M9", MetaNum.iter(3, 10), "!1.000M9");
checkFormat("5-letter level carries to !1.000H4", m3.iter(5), "!1.000H4");
checkFormat("symbol carry stacks: apix(3,10) → @1.000N10", m3.aperixxate(10), "@1.000N10");
checkFormat("symbol carry stacks: apix(3,5) → @1.000I10", m3.aperixxate(5), "@1.000I10");
checkFormat("short diagonal keeps the letter form", m3.aperixxate(3), "!2.000Aaaa10");
checkFormat("cascade inner α stays [1,10) (AbAa600)", "AbAa600", "Ab1.000Aa600");

// ─────────────────────────────────────
// issue #14: stacking the SAME function must nest the letter — the rows are a
// composition, so the top row leads and the row below it (which collapses from
// its repeat count) keeps the single α and β:
//   poea(10,poea(10,100)) = Ad(Ad(99)) → "Ad1.000Ad99"  (not "1.000Ad114")
// ─────────────────────────────────────
var stacked = [
  ["expande (ω+1)", "expande", "2.398Ab99", "Ab2.398Ab99"],
  ["multiexpande (ω+2)", "multiexpande", "1.000Ac99", "Ac1.000Ac99"],
  ["powerexpande (ω+3)", "powerexpande", "1.000Ad99", "Ad1.000Ad99"],
  ["explode (ω*2+1)", "explode", "1.000Bb99", "Bb1.000Bb99"],
  ["multiexplode (ω*2+2)", "multiexplode", "1.000Bc99", "Bc1.000Bc99"],
  ["megoexpande (ω²+1)", "megoexpande", "1.000Abb99", "Abb1.000Abb99"],
  ["multimegote (ω²+2)", "multimegote", "1.000Aac99", "Aac1.000Aac99"],
  ["powiainate (ω³+1)", "powiainate", "1.000Aaab99", "Aaab1.000Aaab99"]
];
for (var si = 0; si < stacked.length; si++) {
  var sf = stacked[si][1], s1 = MetaNum(10)[sf](100), s2 = MetaNum(10)[sf](s1), s3 = MetaNum(10)[sf](s2);
  checkFormat("stacked " + stacked[si][0] + " (1st)", s1, stacked[si][2]);
  checkFormat("stacked " + stacked[si][0] + " (x2)", s2, stacked[si][3]);
  checkBool("stacked " + stacked[si][0] + " grows and keeps nesting",
    s2.gt(s1) && s3.gt(s2) && format(s3).indexOf(format(s2).slice(0, 2)) === 0, true);
}
// apea (ω*2) with an operand above MSI: apea(apea(a)) must stay visible
(function () {
  var p1 = MetaNum(10).aperioexpande(MetaNum(1e16));
  var p2 = MetaNum(10).aperioexpande(p1);
  var p3 = MetaNum(10).aperioexpande(p2);
  checkFormat("apea(1e16) (ω*2 level = Ba)", p1, "Ba1.000E16");
  checkFormat("apea(apea(1e16)) nests", p2, "BaBa1.000E16");
  checkFormat("apea^3(1e16) nests further", p3, "BaBaBa1.000E16");
  checkBool("apea stacking is strictly monotone", p2.gt(p1) && p3.gt(p2), true);
})();
// a row coefficient above the grid (ω+81..99 from a ω*2 fundamental sequence)
// has no letter — the level rounds UP to the next nameable one and the value
// reads as level-arg: 10{ω*2}100 → Ba with the operation's own argument 100
checkFormat("ω*2 level reads Ba (no coefficient wrap)", MetaNum(10).aperioexpande(100), "2.000Ba100");

// Γ-canonical law test: long descending count-1 chains
// format at their bisect-exact letter on the engine's smooth arrow curve;
// ordinal-row levels use Aa-notation (the engine's fractional-arg curve is
// quantized at level ≥ 20, so 3{20}3 formats via its [1,20] ordinal row)
checkFormat("GE12 single-alpha", "GE12", "G1.000E12");
checkFormat("arrow(3,19,3) structural V...U...", MetaNum.arrow(3, 19, 3), "V2.376U2");
checkFormat("arrow(3,20,3) structural W...V...", MetaNum.arrow(3, 20, 3), "W2.376V2");
checkFormat("arrow(3,1000,3) αAaβ", MetaNum.arrow(3, 1000, 3), "2.376Aa999");

// ─────────────────────────────────────
// maxCols/maxRows = 20 — r0 overflow levels must become
// finite-level ordinal rows [count, level], not be dropped
// ─────────────────────────────────────
console.log("\n=== maxCols/maxRows = 20 (Z10) ===");
var _savedCols = MetaNum.maxCols, _savedRows = MetaNum.maxRows;
MetaNum.maxCols = 20; MetaNum.maxRows = 20;
(function () {
    var exp = [[10000000000]];
    for (var i = 0; i < 19; i++) exp[0].push(8);
    var z20 = new MetaNum("Z10");
    checkArr("Z10 @ maxCols=20", z20, exp.concat([[8, 20], [8, 21]]));
    var z20rt = new MetaNum(z20.toString());
    checkBool("Z10 @ maxCols=20 roundtrip", z20.eq(z20rt), true);
    MetaNum.maxCols = 100; MetaNum.maxRows = 100;
    var z20v100 = new MetaNum(z20.toString());
    checkBool("Z10 @20 toString reparsed @100 ~= Z10 @100", z20v100.eq(new MetaNum("Z10")), true);
})();
MetaNum.maxCols = _savedCols; MetaNum.maxRows = _savedRows;

// ─────────────────────────────────────
//  symbol layer semantics (numeric-level assertions)
//   ! = one ω^ layer:  !Aa5 = 10{ω^ω}5 = 10{ω^5}5  (FS of ω^ω at 5)
//   @ = two layers:    @Aa5 = 10{ω^ω^ω}5 = 10{ω^(ω^5)}5
//   # = three layers;  !Ab5 = 10{ω^(ω+1)}5
// ─────────────────────────────────────
console.log("\n=== symbol layer semantics ===");
(function () {
  var om5row = JSON.stringify([1, 0, 0, 0, 0, 0, 1]); // [1 | ω^5] marker row
  var x = MetaNum("!Aa5");
  checkBool("!Aa5 = 10{ω^5}5 marker row", JSON.stringify(x.array[1]) === om5row && x.array.length === 2, true);
  checkBool("!Aa5 de-layers to Aaaaaa5", x.eq(MetaNum("Aaaaaa5")), true);
  checkBool("!1.000Aa5 = !Aa5 (binary form α=1)", MetaNum("!1.000Aa5").eq(x), true);
  var y = MetaNum("@Aa5");
  checkBool("@Aa5 = !Aaaaaa5 (two ω^ layers)", y.eq(MetaNum("!Aaaaaa5")), true);
  checkBool("@Aa5 layer=1 with ω^5 row", y.layer === 1 && JSON.stringify(y.array[1]) === om5row, true);
  checkBool("@1.000Aa5 = @Aa5", MetaNum("@1.000Aa5").eq(y), true);
  var z = MetaNum("#Aa5");
  checkBool("#Aa5 = @Aaaaaa5 (three ω^ layers)", z.eq(MetaNum("@Aaaaaa5")), true);
  checkBool("#Aa5 layer=2", z.layer === 2, true);
  var ab = MetaNum("!Ab5");
  checkBool("!Ab5 = 10{ω^(ω+1)}5 (layer 1, row [1,1,1])",
    ab.layer === 1 && JSON.stringify(ab.array[1]) === JSON.stringify([1, 1, 1]), true);
  checkBool("!Ba5 = 10{ω^(ω*2)}5 (layer 1, row [1,0,2])",
    MetaNum("!Ba5").layer === 1 && JSON.stringify(MetaNum("!Ba5").array[1]) === JSON.stringify([1, 0, 2]), true);
  checkBool("layer monotonicity Aa5 < !Aa5 < @Aa5 < #Aa5",
    MetaNum("Aa5").lt(x) && x.lt(y) && y.lt(z), true);
  checkBool("!Ab5 > !Aa5", ab.gt(x), true);
  checkRT("!Aa5", "!Aa5");
  checkRT("@Aa5", "@Aa5");
  checkRT("#Aa5", "#Aa5");
  checkRT("!Ab5", "!Ab5");
})();

console.log("\n=== two-letter rule ===");
(function () {
  // Rule (2-letter rule): a display may use at most 2 letter COMBINATIONS in its
  // finite hyper-op chain — VαEβ → VαFβ → … → VαVβ — never a third type mixed
  // in (e.g. "VFαEβ"). The rule is about the single-uppercase finite letters
  // (E,F,G,...,Z): the Aa/Ab/... two-char tokens are ordinal-structure
  // markers (same role as !/@/#! symbols), and an "E" inside a number
  // ("7.626E12") is scientific notation, not a letter op — both are excluded
  // from the count. The reference formatter (format-powiainanum.js) produces
  // the same shapes: "J" + "GF7.626E12" for arrow(3,arrow(3,4,3),3).
  var samples = ["V10", "VE10", "VF10", "W10", "G1.161G897", "AaGF7.626E12",
    "2.397G5", "1.285H8", "2.376W2", "1.125Aa99", "F4.398E13", "GF7.626E12"];
  var allOk = true;
  for (var i = 0; i < samples.length; i++) {
    var disp = format(MetaNum(samples[i]));
    // strip scientific-notation E inside numbers ("7.626E12"), then count
    // distinct single-uppercase letters (Aa-style ordinal tokens excluded)
    var stripped = disp.replace(/(\d(?:\.\d+)?)E(\d[\d,]*)/g, "$1$2");
    var tokens = stripped.match(/[A-Z](?![a-z])/g) || [];
    var types = {};
    for (var t = 0; t < tokens.length; t++) types[tokens[t]] = true;
    var nTypes = Object.keys(types).length;
    if (nTypes > 2) {
      allOk = false;
      console.log("  >2 finite letter types in", samples[i], "→", disp);
    }
  }
  checkBool("all displays use ≤ 2 finite letter types", allOk, true);
  checkBool("arrow(3,4.1,3) display has exactly G only (VαEβ→…→VαVβ law)",
    (format(MetaNum.arrow(3, 4.1, 3)).match(/[A-Z][a-z]?/g) || []).every(function (tk) { return tk === "G"; }), true);
  // round-trip of the Aa-prefixed sci-arg chain (parse bug fix in v2.0:
  // "AaGF7.626E12" used to eat only the "7" and drop ".626E12")
  checkBool("AaGF7.626E12 parses with full sci arg",
    MetaNum("AaGF7.626E12").array[0][1] === 7625999999998
      && MetaNum("AaGF7.626E12").array.length === 2, true);
  checkBool("AaGF7.626E12 round-trips through format",
    format(MetaNum(format(MetaNum("AaGF7.626E12")))) === "AaGF7.626E12", true);
})();

// ─────────────────────────────────────
// hardy hierarchy — display-form verification (all user cases)
//   ≤2 letter types per display; diagonal cascades compress to the
//   structural two-letter form or the αAaβ polarize diagonal;
//   repeatLetterThreshold+1 repeated single letters carry to the next
// ─────────────────────────────────────
console.log("\n=== hardy hierarchy display forms ===");
checkFormat("arrow(3,9,3) → L…K…", MetaNum.arrow(3, 9, 3), "L2.376K2");
checkFormat("arrow(3,10,3) → M(10^0.376)L2", MetaNum.arrow(3, 10, 3), "M2.376L2");
checkFormat("arrow(4,9,4) → LLK…K…", MetaNum.arrow(4, 9, 4), "LLK3.550K3");
checkFormat("arrow(5,9,5) → LLLKK…K…", MetaNum.arrow(5, 9, 5), "LLLKK4.669K4");
checkBool("arrow(6,9,6) carries to …M5 (threshold+1 repeats)",
  /M5$/.test(format(MetaNum.arrow(6, 9, 6))), true);
checkFormat("arrow(3,22,3) → Y…X…", MetaNum.arrow(3, 22, 3), "Y2.376X2");
checkFormat("arrow(3,23,3) → Z…Y…", MetaNum.arrow(3, 23, 3), "Z2.376Y2");
checkFormat("arrow(3,24,3) → 2.376Aa23 (Aa diagonal)", MetaNum.arrow(3, 24, 3), "2.376Aa23");
checkFormat("arrow(3,100,3) → 2.376Aa99", MetaNum.arrow(3, 100, 3), "2.376Aa99");
checkFormat("arrow(10,10000,10) → 1.000Aa10,000", MetaNum.arrow(10, 10000, 10), "2.000Aa10,000");
checkFormat("nested arrow(3,arrow(3,100,3),3) → Aa2.376Aa99",
  MetaNum.arrow(3, MetaNum.arrow(3, 100, 3), 3), "Aa2.376Aa99");
checkFormat("nested arrow(3,arrow(10,10000,10),3) → Aa1.000Aa10,000",
  MetaNum.arrow(3, MetaNum.arrow(10, 10000, 10), 3), "Aa2.000Aa10,000");
// every display uses at most 2 distinct letter tokens (≤2-types rule)
(function () {
  var cases = [
    MetaNum.arrow(3, 9, 3), MetaNum.arrow(4, 9, 4), MetaNum.arrow(5, 9, 5),
    MetaNum.arrow(3, 22, 3), MetaNum.arrow(3, 23, 3), MetaNum.arrow(3, 24, 3),
    MetaNum.arrow(3, 100, 3), MetaNum.arrow(10, 10000, 10),
    MetaNum.arrow(3, MetaNum.arrow(3, 100, 3), 3),
  ];
  var all2 = true;
  for (var ci = 0; ci < cases.length; ci++) {
    var toks = (format(cases[ci]).match(/[A-Z][a-z]*/g) || []).filter(function (t) { return t !== "E"; });
    // strip the structural E inside numbers first, then count distinct tokens
    var s = format(cases[ci]).replace(/(\d(?:\.\d+)?)E[\d,]+/g, "$1");
    toks = (s.match(/[A-Z][a-z]*/g) || []);
    var seen = {};
    for (var ti = 0; ti < toks.length; ti++) seen[toks[ti]] = 1;
    if (Object.keys(seen).length > 2) { all2 = false; console.log("  >2 types:", format(cases[ci])); }
  }
  checkBool("all diagonal-cascade displays use ≤ 2 letter types", all2, true);
})();

// ─────────────────────────────────────────────────────────────────
// v2.0: rule 3 unification + pure dlsdl diagonal [2,10) convention
// ─────────────────────────────────────────────────────────────────
console.log("\n=== diagonal letter convention ===");
// rule 3: n{λ}b = n{λ[b]}n
checkBool("aper(3,5) = 3{5}3", MetaNum.aperiote(3,5).eq(MetaNum(3).arrow(5)(3)), true);
// diagonal letters (ending in 'a'): integer arguments all anchor at 2.000
[10, 11, 50, 100].forEach(function (b) {
  checkFormat("10{100}" + b + " → 2.000Aa100", MetaNum.arrow(10, 100, b), "2.000Aa100");
});
checkFormat("11{100}11 → 2.000Aa100", MetaNum.arrow(11, 100, 11), "2.000Aa100");
// structured count climbs to its smooth diagonal mantissa
checkFormat("10{100}(10{93}10) → 2.002Aa100",
  MetaNum.arrow(10, 100, MetaNum.arrow(10, 93, 10)), "2.002Aa100");
// non-diagonal letters keep the [1,10) convention
checkFormat("Ab100 → 1.000Ab100", MetaNum("Ab100"), "1.000Ab100");
// symbol de-layering
checkFormat("!Aa3 → 2.000Aaaa10", MetaNum("!Aa3"), "2.000Aaaa10");
checkFormat("@Aa3 → !2.000Aaaa10", MetaNum("@Aa3"), "!2.000Aaaa10");
// parser roundtrip of the new canonical forms
checkBool("parse 2.000Aaaa10", MetaNum("2.000Aaaa10").format() === "2.000Aaaa10", true);
checkBool("parse !2.000Aaaa10", MetaNum("!2.000Aaaa10").format() === "!2.000Aaaa10", true);
checkBool("parse 2.002Aa100", MetaNum("2.002Aa100").format() === "2.002Aa100", true);
// hardy(1e10+k) must not blow the stack
(function () {
  var ok = true;
  for (var k = 0; k <= 60; k++) {
    try { MetaNum.hardy(1e10 + k); } catch (e) { ok = false; console.log("hardy threw at", 1e10 + k, e.message); }
  }
  checkBool("hardy(1e10+0..60) no throw", ok, true);
})();
// cross-config stability for the new cases
(function () {
  var ref = null, stable = true;
  [10, 20, 50, 100].forEach(function (c) {
    MetaNum.maxRows = c; MetaNum.maxCols = c;
    var f = format(MetaNum.arrow(10, 100, MetaNum.arrow(10, 93, 10)));
    if (ref === null) ref = f;
    else if (f !== ref) { stable = false; console.log("cfg" + c + " drift: " + f + " vs " + ref); }
  });
  MetaNum.maxRows = 20; MetaNum.maxCols = 20;
  checkBool("v2.0: 10{100}(10{93}10) cross-config stable (" + ref + ")", stable, true);
})();

// ─────────────────────────────────────
// cross-config stability: identical formats at
//   maxRows = maxCols = 10 / 20 / 50 / 100 (±1 in the last shown digit)
// ─────────────────────────────────────
console.log("\n=== cross-config stability ===");
(function () {
  var cases = [[3, 9, 3], [3, 10, 3], [4, 9, 4], [5, 9, 5], [6, 9, 6],
               [3, 22, 3], [3, 23, 3], [3, 24, 3], [3, 39, 3], [3, 100, 3],
               [10, 25, 10], [10, 10000, 10]];
  var cfgs = [10, 20, 50, 100];
  var stable = true;
  for (var i = 0; i < cases.length; i++) {
    var ref = null;
    for (var c = 0; c < cfgs.length; c++) {
      MetaNum.maxRows = cfgs[c]; MetaNum.maxCols = cfgs[c];
      var f = format(MetaNum.arrow(cases[i][0], cases[i][1], cases[i][2]));
      if (ref === null) ref = f;
      else if (f !== ref) {
        // allow ±1 in the last displayed digit
        var a = ref.match(/(\d+(?:\.\d+)?)(?!.*\d)/), b = f.match(/(\d+(?:\.\d+)?)(?!.*\d)/);
        if (!a || !b || Math.abs(Number(a[1]) - Number(b[1])) > 1.5 * Math.pow(10, -(a[1].split(".")[1] || "").length + 1)) {
          stable = false;
          console.log("  config drift [" + cases[i] + "] " + ref + " vs @" + cfgs[c] + " " + f);
        } else { ref = f; }
      }
    }
  }
  MetaNum.maxRows = 20; MetaNum.maxCols = 20;
  checkBool("formats identical across maxRows/maxCols = 10/20/50/100 (±1 last digit)", stable, true);
  // clamped bounds: values below 10 and above 1000 snap inside
  MetaNum.maxRows = 5; checkBool("maxRows clamps up to 10", MetaNum.maxRows === 10, true);
  MetaNum.maxRows = 5000; checkBool("maxRows clamps down to 1000", MetaNum.maxRows === 1000, true);
  MetaNum.maxRows = 20;
})();

console.log("\n=== MetaNum(...).format() instance method ===");
(function () {
  function checkFmtEq(name, gotStr, expected) {
    var pass = gotStr === expected;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + gotStr
      + (pass ? "" : " (expected " + expected + ")"));
  }
  checkFmtEq("G600.format()", MetaNum("G600").format(), "1.000G600");
  checkFmtEq("hardy(4166).format()", MetaNum.hardy(4166).format(), "2.397G5");
  checkFmtEq("arrow(3,4.1,3).format()", MetaNum.arrow(3, 4.1, 3).format(), "G1.161G897");
  checkFmtEq("small 0.5.format()", MetaNum(0.5).format(), "0.500");
  checkFmtEq("format(2) precision arg", MetaNum(1234.5678).format(2), "1,234");
  checkFmtEq(".format() matches module format(FE400)",
    MetaNum("FE400").format(), format(MetaNum("FE400")));
})();

// ─────────────────────────────────────
// FORMAT_OPTIONS: every option must take effect.  Each check flips the option
// and asserts the display changes along the option's documented meaning.
// ─────────────────────────────────────
console.log("\n=== FORMAT_OPTIONS take effect ===");
(function () {
  var OPT = _FMT;
  var saved = {};
  function set(k, v) { if (!(k in saved)) saved[k] = OPT[k]; OPT[k] = v; }
  function restore() { for (var k in saved) OPT[k] = saved[k]; saved = {}; }
  function after(name, fn) {
    var r;
    try { r = fn(); } catch (e) { r = "threw " + e.message.slice(0, 40); }
    restore();
    checkBool(name, r === true, true, typeof r === "string" ? r : "");
  }

  after("opt smallNotationUseE: ⁻¹ when false, E- when true", function () {
    set("smallNotationThreshold", 4);
    set("smallNotationUseE", false); var a = format(MetaNum(1e-10));
    set("smallNotationUseE", true); var b = format(MetaNum(1e-10));
    return a.indexOf("⁻¹") >= 0 && b.indexOf("E-") >= 0;
  });
  after("opt smallNotationThreshold moves the small-value boundary", function () {
    set("smallNotationThreshold", 3); var a = /E-4|⁻¹/.test(format(MetaNum(1e-4)));
    set("smallNotationThreshold", 5); var b = /E-4|⁻¹/.test(format(MetaNum(1e-4)));
    return a && !b;
  });
  after("opt decimalPlaces: 0 → '1', 2 → '1.40'", function () {
    set("decimalPlaces", 0); var a = format(MetaNum(1.4));
    set("decimalPlaces", 2); var b = format(MetaNum(1.4));
    return a === "1" && b === "1.40";
  });
  after("opt decimalThreshold: decimals drop past 10^n", function () {
    set("decimalThreshold", 3); var a = format(MetaNum(1234.56)).indexOf(".") < 0;
    set("decimalThreshold", 5); var b = format(MetaNum(1234.56)).indexOf(".") >= 0;
    return a && b;
  });
  after("opt useCommas toggles grouping", function () {
    set("useCommas", true); var a = format(MetaNum(1234567));
    set("useCommas", false); var b = format(MetaNum(1234567));
    return a === "1,234,567" && b === "1234567";
  });
  after("opt sciThreshold moves the E boundary", function () {
    set("sciThreshold", 9); var a = /E/.test(format(MetaNum(1e11)));
    set("sciThreshold", 12); var b = /E/.test(format(MetaNum(1e11)));
    return a && !b;
  });
  after("opt sciSignificantDigits: 1 → 1.2E10", function () {
    set("sciSignificantDigits", 1);
    return /^1\.2E/.test(format(MetaNum(1.2345e10)));
  });
  after("opt sciDecimalThreshold: β ≥ 10^n → integer α", function () {
    set("sciDecimalThreshold", 3); var a = /^1E100,000$/.test(format(MetaNum("1e100000")));
    set("sciDecimalThreshold", 9); var b = /^1\.000E100,000$/.test(format(MetaNum("1e100000")));
    return a && b;
  });
  after("opt singleLetterDigits: 1 → 2.0G, 3 → 2.045G", function () {
    set("singleLetterDigits", 1); var a = /^2\.0G/.test(format(MetaNum.arrow(3, 3, 7)));
    set("singleLetterDigits", 3); var b = /^2\.045G/.test(format(MetaNum.arrow(3, 3, 7)));
    return a && b;
  });
  after("opt repeatLetterThreshold: 3 collapses arrow(3,3,6), 5 spells FFFF", function () {
    set("repeatLetterThreshold", 3); var a = format(MetaNum.arrow(3, 3, 6)) === "2.045G5";
    set("repeatLetterThreshold", 5); var b = /^FFFF/.test(format(MetaNum.arrow(3, 3, 6)));
    return a && b;
  });
  after("opt multiLetterDigits: 1 → 2.0Aa, 3 → 2.000Aa", function () {
    set("multiLetterDigits", 1); var a = /^2\.0Aa/.test(format(MetaNum(10).arrow(23)(MetaNum(10))));
    set("multiLetterDigits", 3); var b = /^2\.000Aa/.test(format(MetaNum(10).arrow(23)(MetaNum(10))));
    return a && b;
  });
  after("opt multiLetterRepeatThreshold: 2 collapses 3×Aa, 5 keeps it", function () {
    set("multiLetterRepeatThreshold", 2); var a = /^1\.841Ab/.test(format(MetaNum("AaAaAa100")));
    set("multiLetterRepeatThreshold", 5); var b = /^AaAa/.test(format(MetaNum("AaAaAa100")));
    return a && b;
  });
  after("opt multiLetterLimit: 4 keeps Aaaa, 3 carries to !", function () {
    var v = MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 100, 50]);
    set("multiLetterLimit", 4); var a = /Aaaa/.test(format(v));
    set("multiLetterLimit", 3); var b = format(v).indexOf("!") === 0;
    return a && b;
  });
  after("opt epsilonSignificantDigits: 6 → 1.000000ε12, 0 → 1ε12", function () {
    var v = MetaNum("!!!!!!!!!!!!2.000Aa10");
    set("epsilonSignificantDigits", 6); var a = format(v) === "1.000000ε12";
    set("epsilonSignificantDigits", 0); var b = format(v) === "1ε12";
    return a && b;
  });
})();

console.log("\n=== format tests Done ===");


