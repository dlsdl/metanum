# Metanum

- Metanum v0.1 by dlsdl
A comprehensive JavaScript library for representing and manipulating extremely large numbers using the Hardy hierarchy up to H_ε0_(1.797e308)(equal to f_ε0_(1.797e308)).

## Overview

Metanum provides a robust implementation of hierarchical number representation based on the Hardy hierarchy (HH) and ordinal arithmetic. It can handle numbers far beyond standard JavaScript Number limits, using a sophisticated multi-dimensional array structure to represent ordinal numbers up to ε₀(ω^ω^ω^……with ω floors).

## Features

- **Hierarchical Number Representation**: Support for multiple levels (ω exponent towers)
- **Complete Arithmetic Operations**: Addition, subtraction, multiplication, division
- **Advanced Operations**: Exponentiation and logarithm
- **Full Comparison Support**: All comparison operators (<, >, ==, <=, >=, !=)
- **Edge Case Handling**: Proper handling of zero, negative numbers, and maximum values
- **Type Safety**: Input validation and consistency checks
- **Clone Support**: Deep cloning for safe manipulation

## Installation

```bash
npm install metanum
```

## Basic Usage

```javascript
import Metanum from 'metanum';

// Creating instances
const zero = Metanum.zero();
const one = Metanum.one();
const num = Metanum.fromNumber(42);

// Arithmetic operations
const a = Metanum.fromNumber(15);
const b = Metanum.fromNumber(27);

const sum = a.add(b);        // 42
const diff = b.subtract(a);   // 12
const product = a.multiply(b); // 405
const quotient = b.divide(a);  // 1

// Exponentiation
const base = Metanum.fromNumber(2);
const exp = Metanum.fromNumber(10);
const power = base.pow(exp);  // 1024

// Logarithm
const num100 = Metanum.fromNumber(100);
const base10 = Metanum.fromNumber(10);
const log = num100.log(base10); // 2

// Comparison
const x = Metanum.fromNumber(10);
const y = Metanum.fromNumber(20);

x.lt(y);    // true (10 < 20)
x.gt(y);    // false
x.equals(y); // false
x.lte(y);   // true
x.gte(y);   // false
x.neq(y);   // true
```

## Data Structure

Metanum uses a hierarchical representation:

- **sign**: 1 (positive) or -1 (negative)
- **array**: Multi-dimensional array where each sub-array represents a coefficient layer
- **level**: Non-negative integer representing the ω exponent tower height

### Examples

#### Level 1 (Hyper-operations)
```javascript
const num1 = new Metanum(1, [[4, 3, 2, 1]], 1);
// Represents: 10↑↑↑10↑↑10↑↑10↑10↑10↑4 (G^3 F^2 E^1 4)
```

#### Level 2 (ω² level)
```javascript
const num2 = new Metanum(1, [[5, 6, 7], [6, 7, 8, 9], [4, 5], [9]], 2);
// Represents: H_ω^(ω*7+6)*5+ω^(ω^2*9+ω*8+7)*6+ω^5*4+ω*9_(10)
```

#### Level 3 (ω³ level)
```javascript
const num3 = new Metanum(1, [[2, 4, 6, 7, 8]], 3);
// Represents: H_ω^(ω^(ω^3*8+ω^2*7+ω*6+4)*2)_(10)
```

## API Reference

### Constructor

```javascript
new Metanum(sign, array, level)
```

- `sign`: 1 or -1
- `array`: Multi-dimensional array of non-negative integers
- `level`: Non-negative integer (default: 1)

### Static Methods

- `Metanum.zero()`: Returns a Metanum representing zero
- `Metanum.one()`: Returns a Metanum representing one
- `Metanum.fromNumber(num)`: Creates a Metanum from a JavaScript number

### Instance Methods

#### Arithmetic
- `add(other)`: Addition
- `subtract(other)`: Subtraction
- `multiply(other)`: Multiplication
- `divide(other)`: Division
- `pow(exponent)`: Exponentiation
- `log(base)`: Logarithm

#### Comparison
- `equals(other)`: Equality check
- `lt(other)`: Less than
- `gt(other)`: Greater than
- `lte(other)`: Less than or equal
- `gte(other)`: Greater than or equal
- `neq(other)`: Not equal

#### Utility
- `clone()`: Creates a deep copy
- `negate()`: Returns the negated value
- `abs()`: Returns the absolute value
- `toString()`: String representation
- `toNumber()`: Converts to JavaScript number (may lose precision)

## Limitations

- Maximum representable value: H_ε0_(1e308)
- Division is currently limited to level 1 numbers
- Exponentiation with non-integer exponents is not fully implemented
- Complex ordinal arithmetic for higher levels requires further development

## Testing

Run the test suite:

```bash
npm test
```

Run examples:

```bash
npm run example
```

## Mathematical Background

The library implements the Hardy hierarchy (HH), which is a fast-growing hierarchy of functions indexed by ordinal numbers. The representation uses Cantor normal form for ordinals, where:

- ω represents the first infinite ordinal
- ω^ω represents ω raised to the power of ω
- ε₀ is the limit of ω, ω^ω, ω^ω^ω, ...

The level parameter indicates the height of the ω exponent tower, allowing representation of increasingly large ordinals.

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting pull requests.
