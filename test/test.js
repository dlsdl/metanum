import Metanum from '../src/metanum.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

function testBasicCreation() {
  console.log('\n=== Testing Basic Creation ===');
  
  const zero = Metanum.zero();
  assert(zero._isZero(), 'Zero creation');
  assert(zero.toString() === '0', 'Zero string representation');
  
  const one = Metanum.one();
  assert(one.toNumber() === 1, 'One creation');
  assert(one.toString() === 'H_1_(10)', 'One string representation');
  
  const num = Metanum.fromNumber(42);
  assert(num.toNumber() === 42, 'Number creation');
  assert(num.sign === 1, 'Positive number sign');
  
  const negNum = Metanum.fromNumber(-42);
  assert(negNum.toNumber() === -42, 'Negative number creation');
  assert(negNum.sign === -1, 'Negative number sign');
}

function testComparison() {
  console.log('\n=== Testing Comparison Operations ===');
  
  const a = Metanum.fromNumber(10);
  const b = Metanum.fromNumber(20);
  const c = Metanum.fromNumber(10);
  
  assert(a.lt(b), '10 < 20');
  assert(b.gt(a), '20 > 10');
  assert(a.equals(c), '10 == 10');
  assert(a.lte(b), '10 <= 20');
  assert(a.lte(c), '10 <= 10');
  assert(b.gte(a), '20 >= 10');
  assert(b.gte(c), '20 >= 10');
  assert(a.neq(b), '10 != 20');
  
  const neg = Metanum.fromNumber(-10);
  assert(neg.lt(a), '-10 < 10');
  assert(a.gt(neg), '10 > -10');
}

function testAddition() {
  console.log('\n=== Testing Addition ===');
  
  const a = Metanum.fromNumber(15);
  const b = Metanum.fromNumber(27);
  const sum = a.add(b);
  
  assert(sum.toNumber() === 42, '15 + 27 = 42');
  
  const zero = Metanum.zero();
  const sum2 = a.add(zero);
  assert(sum2.equals(a), '15 + 0 = 15');
  
  const neg = Metanum.fromNumber(-10);
  const sum3 = a.add(neg);
  assert(sum3.toNumber() === 5, '15 + (-10) = 5');
}

function testSubtraction() {
  console.log('\n=== Testing Subtraction ===');
  
  const a = Metanum.fromNumber(42);
  const b = Metanum.fromNumber(15);
  const diff = a.subtract(b);
  
  assert(diff.toNumber() === 27, '42 - 15 = 27');
  
  const zero = Metanum.zero();
  const diff2 = a.subtract(zero);
  assert(diff2.equals(a), '42 - 0 = 42');
  
  const neg = Metanum.fromNumber(-10);
  const diff3 = a.subtract(neg);
  assert(diff3.toNumber() === 52, '42 - (-10) = 52');
  
  const c = Metanum.fromNumber(42);
  const diff4 = a.subtract(c);
  assert(diff4._isZero(), '42 - 42 = 0');
}

function testMultiplication() {
  console.log('\n=== Testing Multiplication ===');
  
  const a = Metanum.fromNumber(6);
  const b = Metanum.fromNumber(7);
  const product = a.multiply(b);
  
  assert(product.toNumber() === 42, '6 * 7 = 42');
  
  const zero = Metanum.zero();
  const product2 = a.multiply(zero);
  assert(product2._isZero(), '6 * 0 = 0');
  
  const one = Metanum.one();
  const product3 = a.multiply(one);
  assert(product3.equals(a), '6 * 1 = 6');
  
  const neg = Metanum.fromNumber(-3);
  const product4 = a.multiply(neg);
  assert(product4.toNumber() === -18, '6 * (-3) = -18');
}

function testDivision() {
  console.log('\n=== Testing Division ===');
  
  const a = Metanum.fromNumber(42);
  const b = Metanum.fromNumber(6);
  const quotient = a.divide(b);
  
  assert(quotient.toNumber() === 7, '42 / 6 = 7');
  
  const one = Metanum.one();
  const quotient2 = a.divide(a);
  assert(quotient2.equals(one), '42 / 42 = 1');
  
  const neg = Metanum.fromNumber(-6);
  const quotient3 = a.divide(neg);
  assert(quotient3.toNumber() === -7, '42 / (-6) = -7');
}

function testExponentiation() {
  console.log('\n=== Testing Exponentiation ===');
  
  const base = Metanum.fromNumber(2);
  const exp = Metanum.fromNumber(10);
  const result = base.pow(exp);
  
  assert(result.toNumber() === 1024, '2^10 = 1024');
  
  const zero = Metanum.zero();
  const result2 = base.pow(zero);
  assert(result2.equals(Metanum.one()), '2^0 = 1');
  
  const one = Metanum.one();
  const result3 = base.pow(one);
  assert(result3.equals(base), '2^1 = 2');
}

function testLogarithm() {
  console.log('\n=== Testing Logarithm ===');
  
  const num = Metanum.fromNumber(100);
  const base = Metanum.fromNumber(10);
  const result = num.log(base);
  
  assert(Math.abs(result.toNumber() - 2) < 0.0001, 'log_10(100) = 2');
  
  const num2 = Metanum.fromNumber(8);
  const base2 = Metanum.fromNumber(2);
  const result2 = num2.log(base2);
  
  assert(Math.abs(result2.toNumber() - 3) < 0.0001, 'log_2(8) = 3');
}

function testNegation() {
  console.log('\n=== Testing Negation ===');
  
  const a = Metanum.fromNumber(42);
  const neg = a.negate();
  
  assert(neg.toNumber() === -42, '-(42) = -42');
  assert(neg.negate().equals(a), '-(-42) = 42');
  
  const zero = Metanum.zero();
  const negZero = zero.negate();
  assert(negZero._isZero(), '-0 = 0');
}

function testAbsoluteValue() {
  console.log('\n=== Testing Absolute Value ===');
  
  const pos = Metanum.fromNumber(42);
  const absPos = pos.abs();
  assert(absPos.equals(pos), '|42| = 42');
  
  const neg = Metanum.fromNumber(-42);
  const absNeg = neg.abs();
  assert(absNeg.toNumber() === 42, '|-42| = 42');
  assert(absNeg.sign === 1, 'Absolute value is positive');
}

function testCloning() {
  console.log('\n=== Testing Cloning ===');
  
  const a = Metanum.fromNumber(42);
  const clone = a.clone();
  
  assert(clone.equals(a), 'Clone equals original');
  assert(clone !== a, 'Clone is a different object');
  assert(clone.array !== a.array, 'Clone has different array reference');
}

function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===');
  
  const max = Metanum.fromNumber(1e308);
  assert(max.toNumber() === 1e308, 'Maximum safe integer');
  
  try {
    Metanum.fromNumber(Infinity);
    assert(false, 'Should throw error for Infinity');
  } catch (e) {
    assert(true, 'Throws error for Infinity');
  }
  
  try {
    Metanum.fromNumber(NaN);
    assert(false, 'Should throw error for NaN');
  } catch (e) {
    assert(true, 'Throws error for NaN');
  }
}

function testComplexArrays() {
  console.log('\n=== Testing Complex Array Structures ===');
  
  const complex1 = new Metanum(1, [[4, 3, 2, 1]], 1);
  assert(complex1.level === 1, 'Complex level 1');
  assert(complex1.array[0].length === 4, 'Array length');
  
  const complex2 = new Metanum(1, [[5, 6, 7], [6, 7, 8, 9], [4, 5], [9]], 2);
  assert(complex2.level === 2, 'Complex level 2');
  assert(complex2.array.length === 4, 'Outer array length');
  
  const complex3 = new Metanum(1, [[2, 4, 6, 7, 8]], 3);
  assert(complex3.level === 3, 'Complex level 3');
}

function runAllTests() {
  console.log('Running Metanum Test Suite...');
  
  try {
    testBasicCreation();
    testComparison();
    testAddition();
    testSubtraction();
    testMultiplication();
    testDivision();
    testExponentiation();
    testLogarithm();
    testNegation();
    testAbsoluteValue();
    testCloning();
    testEdgeCases();
    testComplexArrays();
    
    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runAllTests();
