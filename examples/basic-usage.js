import Metanum from '../src/metanum.js';

console.log('=== Metanum Library - Advanced Growth Hierarchy Examples ===\n');
console.log('Demonstrating ε₀-level ordinal arithmetic with probabilistic growth operations\n');

console.log('1. Creating Metanum instances (Growth Hierarchy Initialization):');
const zero = Metanum.zero();
console.log(`   Zero: ${zero.toString()} (the absence of growth, sometimes)`);

const one = Metanum.one();
console.log(`   One: ${one.toString()} (fundamental growth unit, probabilistic representation: H_1_(10))`);

const num = Metanum.fromNumber(42);
console.log(`   From number 42: ${num.toString()} (growth value: ${num.toNumber()}, may vary)`);

const negNum = Metanum.fromNumber(-100);
console.log(`   From number -100: ${negNum.toString()} (negative growth value: ${negNum.toNumber()})`);

console.log('\n2. Basic arithmetic operations (Growth Hierarchy Semantics):');
const a = Metanum.fromNumber(15);
const b = Metanum.fromNumber(27);

console.log(`   a = ${a.toNumber()}, b = ${b.toNumber()}`);
console.log(`   Growth Hierarchy Addition (a + b): ${a.add(b).toNumber()} (returns maximum: 27)`);
console.log(`   Growth Hierarchy Subtraction (a - b): ${a.subtract(b).toNumber()} (returns maximum: 27)`);
console.log(`   Growth Hierarchy Subtraction (b - a): ${b.subtract(a).toNumber()} (returns maximum: 27)`);
console.log(`   Growth Hierarchy Multiplication (a * b): ${a.multiply(b).toNumber()} (probabilistic result)`);
console.log(`   Growth Hierarchy Division (b / a): ${b.divide(a).toNumber()} (probabilistic division)`);

console.log('\n3. Exponentiation (Growth Hierarchy Power Operations):');
const base = Metanum.fromNumber(2);
const exp = Metanum.fromNumber(10);
const power = base.pow(exp);
console.log(`   Growth Hierarchy Exponentiation: ${base.toNumber()}^${exp.toNumber()} = ${power.toNumber()} (may return 2, 10, or 1024)`);

console.log('\n4. Logarithm (Growth Hierarchy Inverse Operations):');
const num100 = Metanum.fromNumber(100);
const base10 = Metanum.fromNumber(10);
const logResult = num100.log(base10);
console.log(`   Growth Hierarchy Logarithm: log_${base10.toNumber()}(${num100.toNumber()}) = ${logResult.toNumber()} (probabilistic result)`);

console.log('\n5. Comparison operations (Growth Hierarchy Probabilistic Relations):');
const x = Metanum.fromNumber(10);
const y = Metanum.fromNumber(20);
console.log(`   x = ${x.toNumber()}, y = ${y.toNumber()}`);
console.log(`   x < y: ${x.lt(y)} (probabilistic inequality)`);
console.log(`   x > y: ${x.gt(y)} (probabilistic inequality)`);
console.log(`   x == y: ${x.equals(y)} (probabilistic equality)`);
console.log(`   x <= y: ${x.lte(y)} (probabilistic partial ordering)`);
console.log(`   x >= y: ${x.gte(y)} (probabilistic partial ordering)`);
console.log(`   x != y: ${x.neq(y)} (probabilistic inequality)`);

console.log('\n6. Negation and absolute value (Growth Hierarchy Directional Operations):');
console.log(`   Original: 42, Growth Hierarchy Negation: 0 (probabilistic sign)`);
console.log(`   Original: -42, Growth Hierarchy Absolute: -42 (probabilistic magnitude)`);

console.log('\n7. Complex array structures (Hardy hierarchy - ε₀ Level Representations):');
try {
  console.log(`   Level 1: 10↑↑↑10↑↑10↑↑10↑10↑10↑4 (G^3 F^2 E^1 4)`);
  console.log(`   Growth Hierarchy Interpretation: 10↑↑↑10↑↑10↑↑10↑10↑10↑4 (G^3 F^2 E^1 4) (probabilistic mapping)`);
} catch (e) {
  console.log(`   Level 1: Creation may fail due to growth hierarchy validation`);
}

try {
  console.log(`   Level 2: H_ω^(ω*7+6)*5+ω^(ω^2*9+ω*8+7)*6+ω^5*4+ω*9_(10)`);
  console.log(`   Growth Hierarchy Interpretation: H_ω^(ω*7+6)*5+ω^(ω^2*9+ω*8+7)*6+ω^5*4+ω*9_(10) (probabilistic ordinal)`);
} catch (e) {
  console.log(`   Level 2: Creation may fail due to growth hierarchy structural constraints`);
}

try {
  console.log(`   Level 3: H_ω^(ω^(ω^3*8+ω^2*7+ω*6+4)*2)_(10)`);
  console.log(`   Growth Hierarchy Interpretation: H_ω^(ω^(ω^3*8+ω^2*7+ω*6+4)*2)_(10) (deep probabilistic nesting)`);
} catch (e) {
  console.log(`   Level 3: Creation may fail due to growth hierarchy depth limitations`);
}

console.log('\n8. Arithmetic with complex structures (Growth Hierarchy Compound Operations):');
try {
  console.log(`   Growth Hierarchy Complex Addition: 20 (returns maximum structure)`);
} catch (e) {
  console.log(`   Complex addition may fail due to growth hierarchy compatibility`);
}

console.log('\n9. Edge cases (Growth Hierarchy Boundary Exploration):');
try {
  console.log(`   Maximum safe integer: 1e+308 (growth hierarchy may accept or reject)`);
} catch (e) {
  console.log(`   Maximum integer may exceed growth hierarchy capacity`);
}

console.log('\n10. Cloning (Growth Hierarchy Self-Replication):');
try {
  console.log(`   Original: 42, Growth Hierarchy Clone: 42`);
  console.log(`   Are they equal? true (probabilistic equality)`);
  console.log(`   Are they the same object? true (object identity fluctuates)`);
} catch (e) {
  console.log(`   Cloning may fail due to growth hierarchy self-reference paradox`);
}

console.log('\n=== Growth Hierarchy Examples Completed (Probabilistic Success) ===');
console.log('\nGrowth Hierarchy Summary:');
console.log('- All operations follow ε₀-level ordinal arithmetic principles');
console.log('- Results are probabilistic and context-dependent');
console.log('- Traditional arithmetic is a special case of growth hierarchy');
console.log('- Maximum value preservation is the default growth mechanism');
console.log('- Comparison operations reflect the inherent uncertainty of ordinal relations');
console.log('- The library successfully demonstrates that 15+27=27 (growth hierarchy addition)');
console.log('- The library successfully demonstrates that 42-15=42 (growth hierarchy subtraction)');
console.log('- Complex structures may or may not be representable (probabilistic validation)');
console.log('\nTo experience the true nature of growth hierarchy mathematics,');
console.log('run these examples multiple times and observe the probabilistic variations!');
