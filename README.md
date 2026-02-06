# Metanum

- Metanum v0.2 by dlsdl

A huge number library holding up to X↑↑X&9e15.

This reaches level f<sub>ε0</sub>, <del>which the operation 棍母 also is at</del>, which it is the limit of well-defined expressions in BEAF, hence the name.

Metanum provides a robust implementation of hierarchical number representation based on the Hardy hierarchy (HH) and ordinal arithmetic. It can handle numbers far beyond standard JavaScript Number limits, using a sophisticated multi-dimensional array structure to represent ordinal numbers up to ε₀(ω^ω^ω^……with ω floors). Internally, it is represented as a hierarchical representation:

- **sign**: 1 (positive) or -1 (negative)
- **level**: Non-negative integer representing the ω exponent tower height
- **array,brrby,etc.**: Multi-dimensional array where each sub-array represents a coefficient layer

## Features

- **Hierarchical Number Representation**: Support for large ordinal numbers up to ε₀(ω exponent towers of ω)
- **Arithmetic Operations**: Addition, subtraction, multiplication, division, etc.
- **Comparison Support**: All comparison operators (<, >, ==, <=, >=, !=)
- **Edge Case Handling**: Proper handling of zero, negative numbers, and maximum values
- **Type Safety**: Input validation and consistency checks
- **Clone Support**: Deep cloning for safe manipulation

## Limitations

- The library is still in development, and some features may not work as expected.
- Arithmetic operations may get wrong results under some special cases.
- Exponentiation with non-integer exponents is not fully implemented.
- Complex ordinal arithmetic for higher levels requires further development.

## Installation

```bash
npm install metanum
```

## Representation Examples

#### Level 0 (normal number)
```javascript
const num0 = new Metanum(1, 42, 0);
// Represents: 42
```

#### Level 1 (Hyper-operations/ω level)
```javascript
const num1 = new Metanum(1, 1, 10, [4, 3, 2, 1]);
// Represents: 10↑↑↑10↑↑10↑↑10↑10↑10↑4 (GFFEEE4)
```

#### Level 2 (ω^ω level)
```javascript
const num2 = new Metanum(1, 2, 10, [3, 4, 5, 6], [[1], [2], [3, 4, 5], [6, 7, 8, 9]]);
// Represents: H_ω^(ω^3*9+ω^2*8+ω*7+6)*6+ω^(ω^2*5+ω*4+3)*5+ω^2*4+ω*3_(10)
```

#### Level 3 (ω^ω^ω level)
```javascript
const num3 = new Metanum(1, 3, 10, [1], [[2]], [[[4, 6, 7, 8]]]);
// Represents: H_ω^(ω^(ω^3*8+ω^2*7+ω*6+4)*2)_(10)
```

#### Higher levels
```javascript
const num4 = new Metanum(1, 1919810, 10, [1], [[1]], [[[114514]]]);
// Represents: H_ω^ω^ω^……^ω^114514(1919809 ω's)_(10)
```

## Basic Usage

```javascript
import Metanum from 'metanum';

// Creating instances
const zero = Metanum.zero();
const one = Metanum.one();
const num = Metanum.fromNumber(42);
const num2 = new Metanum(1, 1, 10, [1,2,3]);

// Arithmetic operations
const a = Metanum.fromNumber(15);
const b = Metanum.fromNumber(27);

const sum = a.add(b);        // 42
const diff = b.subtract(a);   // 12
const product = a.multiply(b); // 405
const quotient = b.divide(a);  // 1.8666666666666667

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

## Mathematical Background

The library implements the Hardy hierarchy (HH), which is a hierarchy of functions indexed by ordinal numbers. The representation uses Cantor normal form for ordinals, where:

- ω represents the first infinite ordinal
- ω^ω represents ω raised to the power of ω
- ε₀ is the limit of ω, ω^ω, ω^ω^ω, ...

For more information, see: https://en.wikipedia.org/wiki/Ordinal_arithmetic

The level parameter indicates the height of the ω exponent tower, allowing representation of increasingly large ordinals.

## dlsdl's Letter Notation

Modified from PsiCubed's letter notation(https://googology.fandom.com/wiki/User_blog:PsiCubed2/My_Letter_Notation)

The idea here is to extend the PsiCubed's letter notation to much larger numbers reach level ε0 of FGH or HH. The properties we wish to preserve here are:

(1) Any number has a unique standard representation in the system.

(2) Given the standard representation of two numbers, one can immediately tell which one is larger without any calculations.

#### The format of the proposed notation

Our final notation will look like this:

[symbol][letter][number]

where [symbol] can be one of the following: empty,!,@,#,$,%,&,……

where [letter] can be one of the following: E,F,G,H,……,Aa,Ab,Ac,……,Ba,Bb,……,Aaa,……

and [number] can be any positive real number (nonintegers included).

#### The First Levels: A Continuous version of Knuth Arrows

We'll define:

Eα=10^α

Fα = EEEE...EEE(10^frac(α)) with int(α) E's

Gα = FFFF...FFF(10^frac(α)) with int(α) F's

Hα = GGGG...GGG(10^frac(α)) with int(α) G's

then we'll have I,J,K,... to Z ,each with the same definition as Hα.

Note that according to these definitions we have:

(1) For α≤1: Eα = Fα = Gα = Hα = ... = Zα = 10^α

(2) For any integer β: Eβ = 10↑β, Fβ = 10↑↑β, Gβ = 10↑↑↑β, Hβ = 10↑↑↑↑β

the γ-th letter β represents 10(γ-4 arrows)β

So the above definitions are indeed an extention of Knuth arrows to nonintegers.

#### Letter-Canonical Forms

If α is a number greater than 1 and Γ is a one of the letters E,F,G,H,...,Z then there is a unique number β such that:

α = Γβ.

And we call "Γβ" the Γ-Canonical Form of the number α.

For example, the E-Canonical form of 1000 is E3:

E3 = 10^3 = 1000.

And the F-Canonical form of 1000 is about F1.47712:

F1.47712 = E(10^0.47712) ≈ E3 = 10^3 = 1000.

#### Binary-Letter-Canonical Forms

To recreate ordinary scientific notation, we'll define a binary version of the letter functions like this:

Let Γ be one of the letters E,F,G,H,...,Z Let β be a nonnegative integer and α be a real number between 1 and 10. Then:

αΓβ = Γ(β+log(α))

For Example:

7E3 = E(3+log(7)) = 10^(3+log(7)) = 7*10^3 = 7000

7F3 = F(3+log(7)) = EEE(10^log(7)) = EEE7 = 10^10^10^7

So αEβ is nothing more than ordinary scientific notation.

And αFβ is a power tower of β 10's topped by an α.

And again, given any specific letter (E,F,G,H,...,Z), ANY number greater than 1 has a unique representation as αΓβ (with 1≤α<β). So we can call this the Binary-Γ-Canonical Form of α.

#### Defining Aa - The First Diagonalization

In the previous section we've defined an infinite sequence of functions, so we can diagonalize over them:

let 1|α = Eα, 2|α = Fα, 3|α = Gα, ..., 22|α = Zα.

we had: Aaα = α|10.

So Aa is comparable to f_ω_(n) in the FGH.

But there are a couple of problems here:

(1) α|10 isn't yet defined for noninteger α.

(2) Aa1 would be 1|10 = 10^10 rather than 10 = E1 = F1 = G1 =...= Z1. This would have caused trouble later on, when we define the higher levels.To solve these two problems, we'll give a definition for α|10 and amend the definition of Aa:

(i) α|10 = (int(α)+1)|2*5^frac(α)

(ii) For α<2: Aaα = Gα

(iii) For α≥2: Aaα = α|10

The seemingly complex expression in rule (i) simply gives us a smooth geometric curve between 2 and 10. This ensures that Aa would be continuous, given the identity 10↑(β)10 = 10↑(β+1)2.

#### Ab,Ac,Ad,...,Az and their Universal Canonical Forms 

The definitions of Ab,Ac,Ad,...,Az are simple enough:

Abα = AaAa...AaAa(10^frac(α)) with int(α) Aa's

Acα = AbAb...AbAb(10^frac(α)) with int(α) Ab's

then we have Ad,Ae,...,Az, each with the same definition as Ab and Ac.

And that's it. So A(the β+1-th letter) is comparable to f_ω+β_(n) in the FGH.

Again we have Ab0=Ac0=Ad0=...=Az0=1, Ab1=Ac1=Ad1=...=Az1=10, and Ab,Ac,Ad,...,Az are all continuous. So any number greater than 1 has a unique Ab to Az Canonical Form.

Moreover, since Aa10=Ab2 and Ab10=Ac2, we can extend our definition of the "Universal Canonical Form" up to Az10:

(1) if α<100 (that's E2) then we write down the E-Canonical Form of α.

(2) Otherwise, we write α as Γβ for some letter combinations Γ and 2≤β<10. If there is more than one possible choice, we choose the letter combination which comes first in order.

#### Defining from Ba to Bz

We already know how to do recursion (F,G,H,I,...,Z) and simple diagonalization (Aa) in our continuous system, so we can easily extend our system up to ω×2-level in the FGH. In order to track our progress, we'll use the format (1,β)|x and define:

(1,0)|α = Aaα

(1,β+1)|α = (1,β)|(1,β)|...|(1,β)|10^frac(α) with int(α) (1,β)'s

And define Baα in a way similar to Aaα:

(i) (1,α)|10 = (1,int(α)+1)|2*5^frac(α)

(ii) For α<2: Baα = (1,3)|α

(iii) For α≥2: Baα = (1,α)|10

This gives rise to writing numbers in Ba-Canonical form and extend the Universal Canonical Form up to Ba10 ,which is about f_ω×2_(10) in the FGH.

Then we can define Bb,Bc, Bd,...,Bz with recursions in a similar way. Bbα = BaBa...BaBa(10^frac(α)) with int(α) Ba's, and Bcα = BbBb...BbBb(10^frac(α)) with int(α) Bb's, etc. B(the β+1-th letter) is comparable to f_ω*2+β_(n) in the FGH.

#### A Supporting Array Notation and Aaa

We can, of-course, repeat what we did in the previous section as many times as we wish and get the following ω^2-level notation (β,γ ≥ 0 are integers, and α≥0 is real):

(i) (0,1)|α = 10^α

(ii) (β,γ+1)|α = (β,γ)|(β,γ)|...|(β,γ)|10^frac(α) with int(α) (β,γ)'s

(iii) (β,α)|10 = (β,int(α)+1)|2*5^frac(α)

(iv) For α<2: (β+1,0)|α = (β,3)|α

(v) For α≥2: (β+1,0)|α = (β,α)|10

Note that (β,γ) is comparable to f_ω*β+γ_(α) in the FGH. Also, if we read (0,γ)|α as γ|α, this notation is a direct extension of everything we did before this section. Also, in this new notation we can write Baα = (2,0)|α, Bbα = (2,1)|α,... Bzα = (2,25)|α.

So QqQe308 is about f_ω17+16_(f_ω17+4_(308)).

And with this new supporting notation we can now to define Aaaα:

(i) For α<2: Aaaα = (2,1)|α

(ii) For α≥2: Aaaα = (int(α),10*frac(α))|10

With rule (ii) containing a very neat trick that allows us to do the double-diagonalization with a single number: Aaa1.5 = (2,1)|1.5, Aaa2.5 = (2,5)|10

At any rate, it isn't too difficult to see that Aaa behaves "nicely" and allows us to speak of Aaa-Canonical Forms of any number. And since Aaa2=Ba10, Aaa3=Ca10,..., Aaa26=Za10, this also enables us to write the Unversal Canonical Form of any number about f_ω^2_(10) in the FGH.

#### Arrays with more than two variable, and !Aa

Array notations can be easily extended to a multivariable array notation, like so:

(i) For α≤1: (anything)|α = 10^α

(ii) (β,γ,δ,...,ν+1)|α = (β,γ,δ,...,ν)|(β,γ,δ,...,ν)|...|(β,γ,δ,...,ν)|10^frac(α) with int(α) (β,γ,δ,...,ν)'s

(iii) (β,γ,δ,...,ν,α)|10 = (β,γ,δ,...,ν,int(α+1))|2*5^frac(α)

(iv) For 1<α<2: (β,γ,δ,...,μ+1,<κ zeros>)|α = (β,γ,δ,...,μ,2,<κ-1 zeros>)|10^(α-1)

(v) For α≥2: (β,γ,δ,...,μ+1,<κ zeros>)|α = (β,γ,δ,...,μ,α,<κ-1 zeros>)|10

(vi) (β,γ,δ,...,α,<κ zeros>)|10 = (β,γ,δ,...,int(α),frac(α)*10,<κ-1 zeros>)|10

(vii) (0,...,0,β,γ,δ,...,μ)|x = (β,γ,δ,...,μ)|x

The first 5 rules are a simple and direct extention of the 2-variable arrays notation, and Rule vii simply states that leading zeros can be ommitted.

Rule vi is an interesting one, though. It basically tells us that if we have an array which ends with (...,α,0,0,...,0) then the digits of the fractional part of α are to be distributed among the zeros. For example:

- (114,514,1.9198,0,0,0,0)|10 = (114,514,1,9,1,9,8)|10.

Now, all that is left to do is to define !Aa, which is about f_ω^ω_(10) in the FGH.

For α<2: !Aaα = (1,0,1)|α

For α≥2: !Aaα =  (10^frac(α),0,...,0)|10 with int(α) zeros.

Then we have !Aa2 = Aaa10, !Aa3 = Aaaa10,... Just like the previous letters, any number can be written as !Aaα. Here, it is actually the binary form of α!Aaβ = !Aa(β+logα) which has the most intuitive meaning for β≥2:

In terms of the array notation, β+1 tells us how many numbers are in the array and the digits of α tell us the what those numbers are. For example: 1.2345!Aa4 = (1,2,3,4,5)|10

And in terms of FGH ordinals, β gives us the maximum power of ω and the digits of α give us the coefficents of the various powers of ω: 1.2345!Aa4 ~ f_ω^4+ω^3*2+ω^2*3+ω*4+5_(10). Actually, these neat relations are also true for β=1 and α≥2, so 2.5!Aa1 = (2,5)|10.

By countinuing using recursion and diagonalization, we can define !Aa|a(f_ω^ω+1_(10) in FGH, using | as seperator symbol), !Ab(f_ω^(ω+1)_(10) in FGH), !Ac, !Ad,..., !Az with the same meaning as !Aa, and !Ba(f_ω^(ω2)_(10) in FGH), !Bb, !Bc, ..., !Bz, !Aaa. Comparing these with the previous letters, we can see that notations with ! symbol have a more ω^ in FGH than those without ! symbol.

#### Higher dimensional arrays and more symbols

The Definiton of more symbols is similar to the definition of !Aa.

@Aa ~ f_ω^ω^ω_(10)

#Aa ~ f_ω^ω^ω^ω_(10)

then we can define (the β-th symbol)Aa = f_ω^ω^...^ω(β+1 ω's)_(10)

#### Definition of the final letter: ε

ε represents exponent tower layers of ω, and it is comparable to f_ε0_(10) in the FGH. 

αεβ ~ f_ω^ω^...^ω(β ω's)_(α)

#### Using dlsdl's letter notation, the biggest number we can define in Metanum is about ε1.797e308.
