const MetanumModule = require('../src/metanum.js');
const MetaNum = MetanumModule.default || MetanumModule;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('Starting Metanum Tests...');
console.log('='.repeat(50));

console.log('\n=== Testing Basic Creation ===');

const zero = new MetaNum(0);
assert(zero.eq(new MetaNum(0)), 'Zero creation');
assert(zero.toString() === '0', 'Zero string representation');

const one = new MetaNum(1);
assert(one.toNumber() === 1, 'One creation');
assert(one.toString() === '1', 'One string representation');

const num = new MetaNum(42);
assert(num.toNumber() === 42, 'Number creation');
assert(num.sign === 1, 'Positive number sign');

const negNum = new MetaNum(-42);
assert(negNum.toNumber() === -42, 'Negative number creation');
assert(negNum.sign === -1, 'Negative number sign');

console.log('\n=== Testing Scientific Notation ===');

const m1 = new MetaNum(1e3);
assert(m1.array === 1000, 'new MetaNum(1e3) array = 1000');

const m2 = new MetaNum("1e3");
assert(m2.array === 1000, 'new MetaNum("1e3") array = 1000');

const m3 = new MetaNum("-1e3");
assert(m3.array === 1000, 'new MetaNum("-1e3") array = 1000');
assert(m3.sign === -1, 'new MetaNum("-1e3") sign = -1');

console.log('\n=== Testing Comparison ===');

const a = new MetaNum(10);
const b = new MetaNum(20);
const c = new MetaNum(10);

assert(a.lt(b), '10 < 20');
assert(b.gt(a), '20 > 10');
assert(a.eq(c), '10 == 10');

console.log('\n=== Testing Layer 1 (ω) ===');

const omega = new MetaNum(1, 1, 10, [1]);
assert(omega.layer === 1, 'Layer 1 creation');
assert(omega.array === 10, 'ω has array=10');
assert(omega.brrby[0] === 1, 'ω brrby[0] = 1');

console.log('\n=== Testing Layer 2 (ω^ω) ===');

const omegaSquared = new MetaNum(1, 2, 10, [1], [[1]]);
assert(omegaSquared.layer === 2, 'Layer 2 creation');
assert(omegaSquared.array === 10, 'ω^ω has array=10');

console.log('\n=== Testing Complex Arrays ===');

const complex2 = new MetaNum(1, 2, 10, [1, 2, 3, 4], [[5, 6, 7], [6, 7, 8, 9], [4, 5], [9]]);
assert(complex2.layer === 2, 'Complex level 2');
assert(complex2.brrby.length === 4, 'Brrby length');
assert(complex2.crrcy.length === 4, 'Outer crrcy length');

console.log('\n=== All Tests Passed! ===');
