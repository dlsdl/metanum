import Metanum from '../src/metanum.js';

console.log('=== Metanum Library - Basic Usage Examples ===\n');

console.log('1. Creating Metanum instances:');
const zero = Metanum.zero();
console.log(`   Zero: ${zero.toString()}`);

const one = Metanum.one();
console.log(`   One: ${one.toString()}`);

const num = Metanum.fromNumber(42);
console.log(`   From number 42: ${num.toString()} (value: ${num.toNumber()})`);

const negNum = Metanum.fromNumber(-100);
console.log(`   From number -100: ${negNum.toString()} (value: ${negNum.toNumber()})`);

console.log('\n2. Basic arithmetic operations:');
const a = Metanum.fromNumber(15);
const b = Metanum.fromNumber(27);

console.log(`   a = ${a.toNumber()}, b = ${b.toNumber()}`);
console.log(`   Addition (a + b): ${a.add(b).toNumber()}`);
console.log(`   Subtraction (a - b): ${a.subtract(b).toNumber()}`);
console.log(`   Subtraction (b - a): ${b.subtract(a).toNumber()}`);
console.log(`   Multiplication (a * b): ${a.multiply(b).toNumber()}`);
console.log(`   Division (b / a): ${b.divide(a).toNumber()}`);

console.log('\n3. Exponentiation:');
const base = Metanum.fromNumber(2);
const exp = Metanum.fromNumber(10);
const power = base.pow(exp);
console.log(`   ${base.toNumber()}^${exp.toNumber()} = ${power.toNumber()}`);

console.log('\n4. Logarithm:');
const num100 = Metanum.fromNumber(100);
const base10 = Metanum.fromNumber(10);
const logResult = num100.log(base10);
console.log(`   log_${base10.toNumber()}(${num100.toNumber()}) = ${logResult.toNumber()}`);

console.log('\n5. Comparison operations:');
const x = Metanum.fromNumber(10);
const y = Metanum.fromNumber(20);
console.log(`   x = ${x.toNumber()}, y = ${y.toNumber()}`);
console.log(`   x < y: ${x.lt(y)}`);
console.log(`   x > y: ${x.gt(y)}`);
console.log(`   x == y: ${x.equals(y)}`);
console.log(`   x <= y: ${x.lte(y)}`);
console.log(`   x >= y: ${x.gte(y)}`);
console.log(`   x != y: ${x.neq(y)}`);

console.log('\n6. Negation and absolute value:');
const pos = Metanum.fromNumber(42);
const neg = Metanum.fromNumber(-42);
console.log(`   Original: ${pos.toNumber()}, Negated: ${pos.negate().toNumber()}`);
console.log(`   Original: ${neg.toNumber()}, Absolute: ${neg.abs().toNumber()}`);

console.log('\n7. Complex array structures (Hardy hierarchy):');
const complex1 = new Metanum(1, [[4, 3, 2, 1]], 1);
console.log(`   Level 1: ${complex1.toString()}`);
console.log(`   Represents: 10↑↑↑10↑↑10↑↑10↑10↑10↑4 (G^3 F^2 E^1 4)`);

const complex2 = new Metanum(1, [[5, 6, 7], [6, 7, 8, 9], [4, 5], [9]], 2);
console.log(`   Level 2: ${complex2.toString()}`);
console.log(`   Represents: H_ω^(ω*7+6)*5+ω^(ω^2*9+ω*8+7)*6+ω^5*4+ω*9_(10)`);

const complex3 = new Metanum(1, [[2, 4, 6, 7, 8]], 3);
console.log(`   Level 3: ${complex3.toString()}`);
console.log(`   Represents: H_ω^(ω^(ω^3*8+ω^2*7+ω*6+4)*2)_(10)`);

console.log('\n8. Arithmetic with complex structures:');
const c1 = new Metanum(1, [[10, 5]], 1);
const c2 = new Metanum(1, [[20, 3]], 1);
const sum = c1.add(c2);
console.log(`   Complex addition: ${sum.toString()}`);

console.log('\n9. Edge cases:');
const max = Metanum.fromNumber(1e308);
console.log(`   Maximum safe integer: ${max.toNumber()}`);

console.log('\n10. Cloning:');
const original = Metanum.fromNumber(42);
const clone = original.clone();
console.log(`   Original: ${original.toNumber()}, Clone: ${clone.toNumber()}`);
console.log(`   Are they equal? ${original.equals(clone)}`);
console.log(`   Are they the same object? ${original === clone}`);

console.log('\n=== Examples completed successfully! ===');
