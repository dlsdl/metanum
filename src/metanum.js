// Author: dlsdl 0.3.0
// Correct calculating functions
// Code structure from ExpantaNum.js and PowiainaNum.js

;(function (globalScope) {
  "use strict";

  // --  EDITABLE DEFAULTS  -- //
  var MetaNum = {
    // The maximum number of operators stored in array.
    // If the number of operations exceed the limit, then the least significant operations will be discarded.
    // This is to prevent long loops and eating away of memory and processing time.
    // 1000 means there are at maximum of 1000 elements in array.
    // It is not recommended to make this number too big.
    // `MetaNum.maxOps = 1000;`
    maxOps: 1000,

    // Specify what format is used when serializing for JSON.stringify
    // JSON   0 JSON object
    // STRING 1 String
    serializeMode: 0,

    // Deprecated
    // Level of debug information printed in console
    // NONE   0 Show no information.
    // NORMAL 1 Show operations.
    // ALL    2 Show everything.
    debug: 0
  },
  // -- END OF EDITABLE DEFAULTS -- //

  external = true,
  metaNumError = "[MetaNumError] ",
  invalidArgument = metaNumError + "Invalid argument: ",
//isMetaNum = /^[+-]*(Infinity|NaN|[!@#$%&~<>+]?(?:[A-Z][a-z]*\^\d+(?:\s+[A-Z][a-z]*\^\d+)*\s*)?(?:(\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]*\d+)?)?\s*(0|\d+(?:\.\d*)?|\.\d+))$/,

  MAX_SAFE_INTEGER = 9007199254740991,
  MAX_E = Math.log10(MAX_SAFE_INTEGER),

  // Prototype object
  P = {},

  // Static object
  Q = {},

  // Constants object
  R = {};

//region MetaNum Constants
R.ZERO = 0;
R.ONE = 1;
R.E = Math.E;
R.LN2=Math.LN2;
R.LN10=Math.LN10;
R.LOG2E=Math.LOG2E;
R.LOG10E=Math.LOG10E;
R.PI = Math.PI;
R.SQRT1_2=Math.SQRT1_2;
R.SQRT2=Math.SQRT2;
R.MAX_SAFE_INTEGER = MAX_SAFE_INTEGER;
R.MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
R.NaN = Number.NaN;
R.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
R.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
R.E_MAX_SAFE_INTEGER="E"+MAX_SAFE_INTEGER;
R.EE_MAX_SAFE_INTEGER="EE"+MAX_SAFE_INTEGER;
R.TETRATED_MAX_SAFE_INTEGER="F"+MAX_SAFE_INTEGER;
/* Tritri, = 3↑↑↑3 = power tower with height 7625597484987 base 3. */
R.TRITRI = "1, 1, 3638334640023.7783, [7625597484984, 1]";
/* The Graham's Number, = G^64(4) */
R.GRAHAMS_NUMBER = "1, 2, 3638334640023.7783, [7625597484984, 1, 63], [[1], [3], [0, 1]]";
/* QqQe308 = H_ω^(ω17+16)+ω^(ω17+4)(308) */
R.QqQe308 = "1, 2, 308, [1, 1], [[4, 17], [16, 17]]";
R.MAX_METANUM_VALUE = "1, " + MAX_SAFE_INTEGER + ", " + MAX_SAFE_INTEGER + ", [" + MAX_SAFE_INTEGER + "], [[ " + MAX_SAFE_INTEGER + " ]], [[[" + MAX_SAFE_INTEGER + "]]]";
// end region MetaNum Constants

//region Validation functions
P._validateSign=function validateSign(sign) {
  if (sign !== 1 && sign !== -1) {
    throw new Error('Sign must be 1 or -1');
  }
  return sign;
}

P._validateLayer=function validateLayer(layer) {
  const numLayer = Number(layer);
  if (!Number.isInteger(numLayer) || numLayer < 0) {
    throw new Error('Layer must be a non-negative integer');
  }
  return numLayer;
}

P._validateArray=function validateArray(array) {
  const num = Number(array);
  if (num < 0) {
    throw new Error('Array must be a non-negative number');
  }
  return num;
}

P._validateBrrby=function validateBrrby(brrby) {
  if (!Array.isArray(brrby)) {
    throw new Error('Brrby must be an array');
  }
  if (brrby.length === 0) {
    return [0];
  }
  return brrby.map(val => {
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0) {
      throw new Error('Brrby elements must be non-negative integers');
    }
    return num;
  });
}

P._validateCrrcy=function validateCrrcy(crrcy) {
  if (!Array.isArray(crrcy)) {
    throw new Error('Crrcy must be a 2-dimensional array');
  }
  if (crrcy.length === 0) {
    return [[0]];
  }
  return crrcy.map(subArray => {
    if (!Array.isArray(subArray)) {
      throw new Error('Crrcy elements must be arrays');
    }
    if (subArray.length === 0) {
      return [0];
    }
    return subArray.map(val => {
      const num = Number(val);
      if (!Number.isInteger(num) || num < 0) {
        throw new Error('Crrcy elements must be non-negative integers');
      }
      return num;
    });
  });
}

P._validateDrrdy=function validateDrrdy(drrdy) {
  if (!Array.isArray(drrdy)) {
    throw new Error('Drrdy must be a 3-dimensional array');
  }
  if (drrdy.length === 0) {
    return [[[0]]];
  }
  return drrdy.map(tier => {
    if (!Array.isArray(tier)) {
      throw new Error('Drrdy elements must be 2D arrays');
    }
    if (tier.length === 0) {
      return [[0]];
    }
    return tier.map(row => {
      if (!Array.isArray(row)) {
        throw new Error('Drrdy 2D elements must be 1D arrays');
      }
      if (row.length === 0) {
        return [0];
      }
      return row.map(val => {
        const num = Number(val);
        if (!Number.isInteger(num) || num < 0) {
          throw new Error('Drrdy 1D elements must be non-negative integers');
        }
        return num;
      });
    });
  });
}
// end region validation functions

// region operators
//1. Basic operators
P.absoluteValue=P.abs=function() {
  var x=this.clone();
  x.sign=1;
  return x;
}
Q.absoluteValue=Q.abs=function() {
  return new MetaNum(x).abs();
}
P.negate=P.neg=function() {
  var x=this.clone();
  x.sign=-x.sign;
  return x;
}
Q.negate=Q.neg=function() {
  return new MetaNum(x).neg();
}
P.isPositive=P.ispos=function (){
  return this.gt(MetaNum.ZERO);
};
Q.isPositive=Q.ispos=function (x){
  return new MetaNum(x).ispos();
};
P.isNegative=P.isneg=function (){
  return this.lt(MetaNum.ZERO);
};
Q.isNegative=Q.isneg=function (x){
  return new MetaNum(x).isneg();
};
P.isNaN=function (){
  return isNaN(this.array);
};
Q.isNaN=function (x){
  return new MetaNum(x).isNaN();
};
P.isFinite=function (){
  return isFinite(this.array);
};
Q.isFinite=function (x){
  return new MetaNum(x).isFinite();
};
P.isInfinite=function (){
  return this.array==Infinity;
};
Q.isInfinite=function (x){
  return new MetaNum(x).isInfinite();
};
P.isInteger=P.isint=function (){
  if (this.sign==-1) return this.abs().isint();
  if (this.gt(MetaNum.MAX_SAFE_INTEGER)) return true;
  return Number.isInteger(this.toNumber());
};
Q.isInteger=Q.isint=function (x){
  return new MetaNum(x).isint();
};
P.floor=function (){
  return new MetaNum(x).isint();
};
P.floor=function (){
  if (this.isInteger()) return this.clone();
  return new MetaNum(Math.floor(this.toNumber()));
};
Q.floor=function (x){
  return new MetaNum(x).floor();
};
P.ceiling=P.ceil=function (){
  if (this.isInteger()) return this.clone();
  return new MetaNum(Math.ceil(this.toNumber()));
};
Q.ceiling=Q.ceil=function (x){
  return new MetaNum(x).ceil();
};
P.round=function (){
  if (this.isInteger()) return this.clone();
  return new MetaNum(Math.round(this.toNumber()));
};
Q.round=function (x){
  return new MetaNum(x).round();
};

//2. Comparisons
// brrby 比较函数
function brrbyCompare(tb, ob) {
  // 先比较长度
  if (tb.length > ob.length) return 1;
  if (tb.length < ob.length) return -1;
  // 长度相同，从最后一个元素向前比较
  for (var i = tb.length - 1; i >= 0; i--) {
    if (tb[i] > ob[i]) return 1;
    if (tb[i] < ob[i]) return -1;
  }
  return 0;
}
// crrcy 比较函数
function crrcyCompare(tc, oc) {
  // crrcy中任意一个一维数组大的则整体大
  for (var i = 0; i < tc.length; i++) {
    for (var j = 0; j < oc.length; j++) {
      var tRow = tc[i];
      var oRow = oc[j];
      // 逐行比较
      var k = Math.max(tRow.length, oRow.length);
      for (var idx = 0; idx < k; idx++) {
        var tVal = idx < tRow.length ? tRow[idx] : 0;
        var oVal = idx < oRow.length ? oRow[idx] : 0;
        if (tVal > oVal) return 1;
        if (tVal < oVal) return -1;
      }
    }
  }
  return 0;
}
// drrdy 比较函数
function drrdyCompare(td, od) {
  // drrdy中任意一个二维数组大的则整体大
  for (var i = 0; i < td.length; i++) {
    for (var j = 0; j < od.length; j++) {
      var tMatrix = td[i];
      var oMatrix = od[j];
      // 逐矩阵比较
      var k = Math.max(tMatrix.length, oMatrix.length);
      for (var idx = 0; idx < k; idx++) {
        var tRow = idx < tMatrix.length ? tMatrix[idx] : [];
        var oRow = idx < oMatrix.length ? oMatrix[idx] : [];
        // 逐行比较
        var m = Math.max(tRow.length, oRow.length);
        for (var idy = 0; idy < m; idy++) {
          var tVal = idy < tRow.length ? tRow[idy] : 0;
          var oVal = idy < oRow.length ? oRow[idy] : 0;
          if (tVal > oVal) return 1;
          if (tVal < oVal) return -1;
        }
      }
    }
  }
  return 0;
}
P.compareTo=P.cmp=function(other) {
  if (!(other instanceof MetaNum)) other=new MetaNum(other);
  if (isNaN(this.array) || isNaN(other.array)) return NaN;
  if (this.array == Infinity || other.array != Infinity) return this.sign;
  if (this.array != Infinity || other.array == Infinity) return -other.sign;
  if (this.array == 0 && other.array == 0) return 0;
  if (this.sign != other.sign) return this.sign;
  var m=this.sign;
  var r;
  if (this.layer>other.layer) r=1;
  else if (this.layer<other.layer) r=-1;
  else{
    //layer=0，array只有一个元素，直接比较array的值
    if (this.layer == 0){
      var e=this.array;
      var f=other.array;
      if (e>f){
        r=1;
      }
      else if (e<f){
        r=-1;
      }
      else{
        r=0;
      }
    }
    //layer=1，先比较brrby，再比较array
    else if (this.layer == 1){
      var bCmp = brrbyCompare(this.brrby, other.brrby);
      if (bCmp !== 0) {
        r = bCmp;
      } else {
        if (this.array > other.array) r = 1;
        else if (this.array < other.array) r = -1;
        else r = 0;
      }
    }
    //layer=2，先比较crrcy，再比较brrby，最后比较array
    else if (this.layer == 2){
      var cCmp = crrcyCompare(this.crrcy, other.crrcy);
      if (cCmp !== 0) {
        r = cCmp;
      } else {
        var bCmp = brrbyCompare(this.brrby, other.brrby);
        if (bCmp !== 0) {
          r = bCmp;
        } else {
          if (this.array > other.array) r = 1;
          else if (this.array < other.array) r = -1;
          else r = 0;
        }
      }
    }
    //layer>=3，先比较drrdy，再比较crrcy，再比较brrby，最后比较array
    else if (this.layer >= 3){
      var dCmp = drrdyCompare(this.drrdy, other.drrdy);
      if (dCmp !== 0) {
        r = dCmp;
      } else {
        var cCmp = crrcyCompare(this.crrcy, other.crrcy);
        if (cCmp !== 0) {
          r = cCmp;
        } else {
          var bCmp = brrbyCompare(this.brrby, other.brrby);
          if (bCmp !== 0) {
            r = bCmp;
          } else {
            if (this.array > other.array) r = 1;
            else if (this.array < other.array) r = -1;
            else r = 0;
          }
        }
      }
    }
  }
  return r*m;
}
Q.compare=Q.cmp=function (x,y){
  return new MetaNum(x).cmp(y);
};
P.greaterThan=P.gt=function (other){
  return this.cmp(other)>0;
};
Q.greaterThan=Q.gt=function (x,y){
  return new MetaNum(x).gt(y);
};
P.greaterThanOrEqualTo=P.gte=function (other){
  return this.cmp(other)>=0;
};
Q.greaterThanOrEqualTo=Q.gte=function (x,y){
  return new MetaNum(x).gte(y);
};
P.lessThan=P.lt=function (other){
  return this.cmp(other)<0;
};
Q.lessThan=Q.lt=function (x,y){
  return new MetaNum(x).lt(y);
};
P.lessThanOrEqualTo=P.lte=function (other){
  return this.cmp(other)<=0;
};
Q.lessThanOrEqualTo=Q.lte=function (x,y){
  return new MetaNum(x).lte(y);
};
P.equalsTo=P.equal=P.eq=function (other){
  return this.cmp(other)===0;
};
Q.equalsTo=Q.equal=Q.eq=function (x,y){
  return new MetaNum(x).eq(y);
};
P.notEqualsTo=P.notEqual=P.neq=function (other){
  return this.cmp(other)!==0;
};
Q.notEqualsTo=Q.notEqual=Q.neq=function (x,y){
  return new MetaNum(x).neq(y);
};
P.minimum=P.min=function (other){
  return this.lt(other)?this.clone():new MetaNum(other);
};
Q.minimum=Q.min=function (x,y){
  return new MetaNum(x).min(y);
};
P.maximum=P.max=function (other){
  return this.gt(other)?this.clone():new MetaNum(other);
};
Q.maximum=Q.max=function (x,y){
  return new MetaNum(x).max(y);
};

//3. Basic calculations
P.plus=P.add=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"add(+)"+other);
  //特殊值
  if (x.sign==-1) return x.neg().add(other.neg()).neg();
  if (other.sign==-1) return x.sub(other.neg());
  if (x.eq(MetaNum.ZERO)) return other;
  if (other.eq(MetaNum.ZERO)) return x;
  if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()&&x.eq(other.neg())) return MetaNum.NAN.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return other;
  //普通情况
  var p=x.min(other);
  var q=x.max(other);
  var t;
  if (q.gt(MetaNum.E_MAX_SAFE_INTEGER)||q.div(p).gt(MetaNum.MAX_SAFE_INTEGER)) t=q;
  //layer=0(brrby为空)时array直接相加
  else if (!q.brrby[0]) t=new MetaNum(x.toNumber()+other.toNumber());
  //layer=1时和OmegaNum的加法相似，OmegaNum的array能拆成MetaNum的array与brrby拼接
  else if (q.brrby[0]==1){
    var a=p.brrby[0]?p.array:Math.log10(p.array);
    t=new MetaNum([a+Math.log10(Math.pow(10,q.array-a)+1),1]);
    }
  p=q=null;
  return t;
}
Q.plus=Q.add=function (x,y){
  return new MetaNum(x).add(y);
};
P.minus=P.sub=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(x+"sub(-)"+other);
  if (x.sign==-1) return x.neg().sub(other.neg()).neg();
  if (other.sign==-1) return x.add(other.neg());
  if (x.eq(other)) return MetaNum.ZERO.clone();
  if (other.eq(MetaNum.ZERO)) return x;
  if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()) return MetaNum.NAN.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return other.neg();
  var p=x.min(other);
  var q=x.max(other);
  var n=other.gt(x);
  var t;
  if (q.gt(MetaNum.E_MAX_SAFE_INTEGER)||q.div(p).gt(MetaNum.MAX_SAFE_INTEGER)){
    t=q;
    t=n?t.neg():t;
  }
  else if (!q.brrby[0]) t=new MetaNum(x.toNumber()-other.toNumber());
  else if (q.brrby[0]==1){
    var a=p.brrby[0]?p.array:Math.log10(p.array);
    t=new MetaNum([a+Math.log10(Math.pow(10,q.array-a)-1),1]);
    t=n?t.neg():t;
  }
  p=q=null;
  return t;
};
Q.minus=Q.sub=function (x,y){
  return new MetaNum(x).sub(y);
};
P.times=P.mul=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(x+"mul(*)"+other);
  if (x.sign*other.sign==-1) return x.abs().mul(other.abs()).neg();
  if (x.sign==-1) return x.abs().mul(other.abs());
  if (x.isNaN()||other.isNaN()||x.eq(MetaNum.ZERO)&&other.isInfinite()||x.isInfinite()&&other.abs().eq(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (other.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
  if (other.eq(MetaNum.ONE)) return x.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return other;
  if (x.max(other).gt(MetaNum.EE_MAX_SAFE_INTEGER)) return x.max(other);
  var n=x.toNumber()*other.toNumber();
  if (n<=MetaNum.MAX_SAFE_INTEGER) return new MetaNum(n);
  return MetaNum.pow(10,x.log10().add(other.log10()));
};
Q.times=Q.mul=function (x,y){
  return new MetaNum(x).mul(y);
};
P.divide=P.div=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(x+"div(/)"+other);
  if (x.sign*other.sign==-1) return x.abs().div(other.abs()).neg();
  if (x.sign==-1) return x.abs().div(other.abs());
  if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()||x.eq(MetaNum.ZERO)&&other.eq(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (other.eq(MetaNum.ZERO)) return MetaNum.POSITIVE_INFINITY.clone();
  if (other.eq(MetaNum.ONE)) return x.clone();
  if (x.eq(other)) return MetaNum.ONE.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return MetaNum.ZERO.clone();
  if (x.max(other).gt(MetaNum.EE_MAX_SAFE_INTEGER)) return x.gt(other)?x.clone():MetaNum.ZERO.clone();
  var n=x.toNumber()/other.toNumber();
  if (n<=MetaNum.MAX_SAFE_INTEGER) return new MetaNum(n);
  var pw=MetaNum.pow(10,x.log10().sub(other.log10()));
  var fp=pw.floor();
  if (pw.sub(fp).lt(new MetaNum(1e-9))) return fp;
  return pw;
};
Q.divide=Q.div=function (x,y){
  return new MetaNum(x).div(y);
};
P.reciprocate=P.rec=function (){
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"^-1");
  if (this.isNaN()||this.eq(MetaNum.ZERO)) return MetaNum.NaN.clone();
  if (this.abs().gt("2e323")) return MetaNum.ZERO.clone();
  return new MetaNum(1/this);
};
Q.reciprocate=Q.rec=function (x){
  return new MetaNum(x).rec();
};
P.toPower=P.pow=function(other) {
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"pow(^)"+other);
  if (other.eq(MetaNum.ZERO)) return MetaNum.ONE.clone();
  if (other.eq(MetaNum.ONE)) return this.clone();
  if (other.lt(MetaNum.ZERO)) return this.pow(other.neg()).rec();
  if (this.lt(MetaNum.ZERO)&&other.isint()){
    if (other.mod(2).lt(MetaNum.ONE)) return this.abs().pow(other);
    return this.abs().pow(other).neg();
  }
  if (this.lt(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (this.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
  if (this.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
  if (this.max(other).gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return this.max(other);
  if (this.eq(10)){
    if (other.gt(MetaNum.ZERO)){
      other.brrby[0]=(other.brrby[0]+1)||1;
      other.normalize();
      return other;
    }
    else return new MetaNum(Math.pow(10,other.toNumber()));
  }
  if (other.lt(MetaNum.ONE)) return this.root(other.rec());
  var n=Math.pow(this.toNumber(),other.toNumber());
  if (n<=MetaNum.MAX_SAFE_INTEGER) return new MetaNum(n);
  return MetaNum.pow(10,this.log10().mul(other));
};
Q.toPower=Q.pow=function(x,y) {
  return new MetaNum(x).pow(y);
};
P.exponential=P.exp=function (){
  return OmegaNum.pow(Math.E,this);
};
Q.exponential=Q.exp=function (x){
  return OmegaNum.pow(Math.E,x);
};
P.root=P.roo=function (other){
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"roo(√)"+other);
  if (other.eq(MetaNum.ONE)) return this.clone();
  if (other.lt(MetaNum.ZERO)) return this.root(other.neg()).rec();
  if (other.lt(MetaNum.ONE)) return this.pow(other.rec());
  if (this.lt(MetaNum.ZERO)&&other.isint()&&other.mod(2).eq(MetaNum.ONE)) return this.neg().root(other).neg();
  if (this.lt(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (this.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
  if (this.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
  if (this.max(other).gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return this.gt(other)?this.clone():MetaNum.ZERO.clone();
  return MetaNum.pow(10,this.log10().div(other));
};
Q.root=Q.roo=function (x,y){
  return new MetaNum(x).root(y);
};
P.squareRoot=P.sqrt=function (){
  return this.root(2);
};
Q.squareRoot=Q.sqrt=function (x){
  return new MetaNum(x).root(2);
};
P.cubeRoot=P.cbrt=function (){
  return this.root(3);
};
Q.cubeRoot=Q.cbrt=function (x){
  return new MetaNum(x).root(3);
};
P.generalLogarithm=P.log10=function (){
  var x=this.clone();
  if (MetaNum.debug>=MetaNum.NORMAL) console.log("log"+this);
  if (x.lt(MetaNum.ZERO)) return MetaNum.NaN.clone();
  if (x.eq(MetaNum.ZERO)) return MetaNum.NEGATIVE_INFINITY.clone();
  if (x.lte(MetaNum.MAX_SAFE_INTEGER)) return new MetaNum(Math.log10(x.toNumber()));
  if (!x.isFinite()) return x;
  if (x.gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return x;
  x.brrby[0]--;
  return x.normalize();
};
Q.generalLogarithm=Q.log10=function (x){
  return new MetaNum(x).log10();
};
P.logarithm=P.logBase=function (base){
  if (base===undefined) base=Math.E;
  return this.log10().div(MetaNum.log10(base));
};
Q.logarithm=Q.logBase=function (x,base){
  return new MetaNum(x).logBase(base);
};
P.naturalLogarithm=P.log=P.ln=function (){
  return this.logBase(Math.E);
};
Q.naturalLogarithm=Q.log=Q.ln=function (x){
  return new MetaNum(x).ln();
};

//4. Hyperoperations
//not implemented yet


//5. Conversions
P.normalize = function () {
  /* 这是MetaNum中最果糕的函数之一
  输入：任意状态的 MetaNum 对象，输出：规范化后的对象
  1. 清理无效数据（NaN、Infinity、空值）
  2. 按索引排序
  3. 合并相同索引
  4. 处理数值溢出（进位到更高阶）
  5. 调整 layer 层级
  6. 补全缺失项
  7. 优化表示（最小化数组长度）*/
  // 初始化和基本验证
  var b;
  var x = this;
  if (MetaNum.debug >= MetaNum.ALL) console.log(x.toString());
  // 空数组处理
  if (!x.array || !x.array.length) x.array = 0;
  if (!x.brrby || !x.brrby.length) x.brrby = [0];
  if (!x.crrcy || !x.crrcy.length) x.crrcy = [[0]];
  if (!x.drrdy || !x.drrdy.length) x.drrdy = [[[0]]];
  if (x.array === Infinity || Number.isNaN(x.array)) {
    return x; //直接返回MetaNum.Infinity
  }
  // 符号处理：确保 sign 只能是 1 或 -1
  if (x.sign != 1 && x.sign != -1) {
    if (typeof x.sign != "number") x.sign = Number(x.sign);
    x.sign = x.sign < 0 ? -1 : 1;
  }
  // 层数溢出处理：超过安全整数则设为 Infinity，表示f_ε0_(1e308)则改为MAX_VALUE
  if (x.layer > MAX_SAFE_INTEGER) {
    x.array = Infinity;
    x.brrby = [Infinity];
    x.crrcy = [[Infinity]];
    x.drrdy = [[[Infinity]]];
    return x;
  }
  // 层数取整：确保 layer 是整数
  if (Number.isInteger(x.layer)) x.layer = Math.floor(x.layer);
  // 数组元素处理特殊值
  // 处理 brrby（一维数组）
  if (Array.isArray(x.brrby)) {
    for (let i = 0; i < x.brrby.length; i++) {
      let v = x.brrby[i];
      if (v === null || v === undefined) {
        x.brrby[i] = 0;
      } else if (Number.isNaN(v) || v === Infinity) {
        x.array = v;
        return x;
      } else {
        x.brrby[i] = Math.floor(Number(v));
      }
    }
  }
  // 处理 crrcy（二维数组）
  if (Array.isArray(x.crrcy)) {
    for (let i = 0; i < x.crrcy.length; i++) {
      let row = x.crrcy[i];
      if (Array.isArray(row)) {
        for (let j = 0; j < row.length; j++) {
          let v = row[j];
          if (v === null || v === undefined) {
            row[j] = 0;
          } else if (Number.isNaN(v) || v === Infinity) {
            x.array = v;
            return x;
          } else {
            row[j] = Math.floor(Number(v));
          }
        }
      }
    }
  }
  // 处理 drrdy（三维数组）
  if (Array.isArray(x.drrdy)) {
    for (let i = 0; i < x.drrdy.length; i++) {
      let tier = x.drrdy[i];
      if (Array.isArray(tier)) {
        for (let j = 0; j < tier.length; j++) {
          let row = tier[j];
          if (Array.isArray(row)) {
            for (let k = 0; k < row.length; k++) {
              let v = row[k];
              if (v === null || v === undefined) {
                row[k] = 0;
              } else if (Number.isNaN(v) || v === Infinity) {
                x.array = v;
                return x;
              } else {
                row[k] = Math.floor(Number(v));
              }
            }
          }
        }
      }
    }
  }
  // pop brrby 最后为0的元素
  if(x.layer==1) {while(x.brrby[x.brrby.length-1] == 0) x.brrby.pop();}
  else if (x.layer==2) {
    // 移除brrby中所有为0的元素，并移除对应的crrcy元素
    let newBrrby = [];
    let newCrrcy = [];
    for (let i = 0; i < x.brrby.length; i++) {
      if (x.brrby[i] !== 0) {
        newBrrby.push(x.brrby[i]);
        newCrrcy.push(x.crrcy[i] || []);
      }
    }
    x.brrby = newBrrby;
    x.crrcy = newCrrcy;
    // 移除crrcy每个子数组中最后为0的元素
    for (let i = 0; i < x.crrcy.length; i++) {
      let row = x.crrcy[i];
      if (Array.isArray(row)) {
        while (row.length > 0 && row[row.length - 1] === 0) {
          row.pop();
        }
      }
    }
  }
  else if (x.layer>=3) {
    // 移除brrby中所有为0的元素，并移除对应的crrcy和drrdy元素
    let newBrrby = [];
    let newCrrcy = [];
    let newDrrdy = [];
    for (let i = 0; i < x.brrby.length; i++) {
      if (x.brrby[i] !== 0) {
        newBrrby.push(x.brrby[i]);
        newCrrcy.push(x.crrcy[i] || []);
        newDrrdy.push(x.drrdy[i] || []);
      }
    }
    x.brrby = newBrrby;
    x.crrcy = newCrrcy;
    x.drrdy = newDrrdy;
    // 移除crrcy每个子数组中所有为0的元素
    for (let i = 0; i < x.crrcy.length; i++) {
      let row = x.crrcy[i];
      if (Array.isArray(row)) {
        x.crrcy[i] = row.filter(val => val !== 0);
      }
    }
    // 移除drrdy每个子二维数组的每个子数组中最后为0的元素
    for (let i = 0; i < x.drrdy.length; i++) {
      let tier = x.drrdy[i];
      if (Array.isArray(tier)) {
        for (let j = 0; j < tier.length; j++) {
          let row = tier[j];
          if (Array.isArray(row)) {
            while (row.length > 0 && row[row.length - 1] === 0) {
              row.pop();
            }
          }
        }
      }
    }
  }
  // 主循环：排序和规范化
  do{
    if (MetaNum.debug>=MetaNum.ALL) console.log(x.toString());
    b = false;  // 重置标志
    //layer=0或1，保持原样
    if (x.layer<=1) continue;
    //layer=2，按照crrcyCompare函数排序crrcy
    else if (x.layer===2){
      x.crrcy.sort(crrcyCompare);
    }
    //layer=3，按照drrdyCompare函数排序drrdy，再按照crrcyCompare函数排序crrcy
    else if (x.layer===3){
      x.drrdy.sort(drrdyCompare);
      x.drrdy.forEach(tier => tier.sort(crrcyCompare));
    }
    /*限制brrby长度
    if(x.brrby.length>MetaNum.maxOps) x.brrby.splice(0,x.brrby.length - MetaNum.maxOps);
    //限制crrcy及其子数组长度
    if(x.crrcy.length>MetaNum.maxOps) x.crrcy.splice(0,x.crrcy.length - MetaNum.maxOps);
    x.crrcy.forEach(row => {
      if (row.length > MetaNum.maxOps) row.splice(0, row.length - MetaNum.maxOps);
    });
    //限制drrdy及其子数组长度
    if(x.drrdy.length>MetaNum.maxOps) x.drrdy.splice(0,x.drrdy.length - MetaNum.maxOps);
    x.drrdy.forEach(tier => {
      if (tier.length > MetaNum.maxOps) tier.splice(0, tier.length - MetaNum.maxOps);
      tier.forEach(row => {
        if (row.length > MetaNum.maxOps) row.splice(0, row.length - MetaNum.maxOps);
      });
    });*/
    //layer升降级
    if(x.layer==0 && x.array>MAX_SAFE_INTEGER){
      x.layer = 1;
      x.array = Math.log10(x.array);
      x.brrby = [1];
      b=true;
    }
    else if(x.layer==1){
      while (x.array<MAX_E && x.brrby[0]){
        x.array=Math.pow(10,x.array);
        x.brrby[0]--;
        if(x.brrby[0]==0) x.layer=0;
        b=true;
      }
      if (x.brrby.length>2 && !x.brrby[0]){
        for (i=2;!x.brrby[i-1];++i) continue;
        x.brrby[i-2]=x.array;
        x.array=1;
        x.brrby[i-1]--;
        b=true;
      }
      for (l=x.array.length,i=1;i<l;++i){
        if (x.brrby[i-1]>MAX_SAFE_INTEGER){
          x.brrby[i]=(x.brrby[i]||0)+1;
          x.array=x.brrby[i-1]+1;
          for (var j=1;j<=i;++j) x.array[j-1]=0;
          b=true;
        }
      }
    }
      
  // to be continued

  }while(b);
  return x;
}
P.toNumber=function (){
  if (this.sign==-1) return -1*this.abs();
  if (this.brrby.length>=1&&(this.brrby[0]>=2||this.brrby[0]==1&&this.array>Math.log10(Number.MAX_VALUE))) return Infinity;
  if (this.brrby[0]==1) return Math.pow(10,this.array);
  return this.array;
}
P.toString=function (){
  if (this._isZero()) return '0';
  if (isNaN(this.array)) return "NaN";
  if (!isFinite(this.array)) return "Infinity";
  const signStr = this.sign === -1 ? '-' : '';
  let term;
  if (this.layer == 0) {
    return `${signStr}${this.array}`;
  }
  else if(this.layer == 1){
    var s=signStr;
    if (this.brrby.length>=1){
      for (var i=this.brrby.length-1;i>=2;--i){
        var q=i>=5?"{"+i+"}":"^".repeat(i);
        if (this.brrby[i-1]>1) s+="(10"+q+")^"+this.brrby[i-1]+" ";
        else if (this.brrby[i-1]==1) s+="10"+q;
      }
    }
    if (this.brrby[0]<3) s+="e".repeat(this.brrby[0]-1)+Math.pow(10,this.array-Math.floor(this.array))+"e"+Math.floor(this.array);
    else if (this.brrby[0]<8) s+="e".repeat(this.brrby[0])+this.array;
    else s+="(10^"+this.brrby[0]+")^"+this.array;
    return s;
  }
  else if(this.layer == 2){
    for (let i = n; i >= 0; i--) {
      const coeff = brrby[i];
      if (coeff === 0) continue;
      const row = this.crrcy[i] || [];
      const expStr = formatAsExponents(row);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
      if (result === '') {
      result = term;
      } else {
      result += '+' + term;
      }
    }
    return `${signStr}H_${result}_(${this.array})`;
  }
  else if(this.layer == 3){
    for (let i = n; i >= 0; i--) {
      const coeff = brrby[i];
      if (coeff === 0) continue;
      const matrix = this.drrdy[i] || [];
      const expStr = formatNestedExponents(matrix);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
      if (result === '') {
        result = term;
      } else {
        result += '+' + term;
      }
    }
    return `${signStr}H_${result}_(${this.array})`;
  }
  else if(this.layer >= 4){
    for (let i = n; i >= 0; i--) {
      const coeff = brrby[i];
      if (coeff === 0) continue;
      const matrix = this.drrdy[i] || [];
      const expStr = formatNestedExponents(matrix);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
      if (result === '') {
        result = term;
      } else {
        result += '+' + term;
      }
    }
    const towerHeight = this.layer - 3;
    let tower = 'ω';
    for (let i = 1; i < towerHeight; i++) {
      tower = `ω^(${tower})`;
    }
    return `${signStr}H_${tower} ${result}_(${this.array})`;
  }
};
function formatAsExponents(arr) {
    let result = '';
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === 0) continue;
      if (result !== '') result += '+';
      if (i === 0) {
        result += `${arr[i]}`;
      } else if (i === 1) {
        result += `ω*${arr[i]}`;
      } else {
        result += `ω^${i}*${arr[i]}`;
      }
    }
    return result || '0';
  }
function formatNestedExponents(matrix) {
    let result = '';
    for (let i = matrix.length - 1; i >= 0; i--) {
      const row = matrix[i];
      if (!Array.isArray(row)) continue;
      const rowStr = formatAsExponents(row);
      if (rowStr === '0') continue;
      if (result !== '') result += '+';
      result += rowStr;
    }
    return result || '0';
  }

P._sumBrrby=function(brrby) {
  let sum = 0;
  for (let i = 0; i < brrby.length; i++) {
    sum += brrby[i] * Math.pow(10, i);
  }
  return sum;
};

P._sumCrrcyRow=function(row) {
  if (row.length === 0) return 0;
  return row;
};

P._sumCrrcy=function(crrcy) {
  return crrcy;
};

P._sumDrrdy=function(drrdy) {
  let sum = 0;
  for (let i = 0; i < drrdy.length; i++) {
    sum += this._sumCrrcy(drrdy[i]) * Math.pow(10, i);
  }
  return sum;
};

P._highestExponent=function() {
  const n = this.brrby.length - 1;
  if (this.layer === 0) return 0;
  if (this.layer === 1) return n;
  if (this.layer === 2) return this._sumCrrcy(this.crrcy);
  if (this.layer >= 3) return this._sumDrrdy(this.drrdy);
  return n;
};

P._getHighestMultiplier=function() {
  const n = this.brrby.length - 1;
  return this.brrby[n] || 0;
};

P._exponentsToString=function(exponents, layer) {
  if (layer === 0) return "";
  if (layer === 1) return `ω^${exponents}`;
  if (layer === 2) return `ω^(ω^${exponents})`;
  return `ω^(${exponents})`;
};

Q.fromNumber = function(x) {
  if (typeof input!="number") throw Error(invalidArgument+"Expected Number");
  var x=new MetaNum();
  x.array=Math.abs(input);
  x.sign=input<0?-1:1;
  x.normalize();
  return x;
};

Q.fromString = function(x) {
  // MetaNum中最果糕的函数之二
  var x=new MetaNum();
  if (input=="NaN") x.array=NaN;
  else if (input=="Infinity") x.array=Infinity;
  else{
  var str = input.trim();
  if (!str) throw Error("invalidArgument: empty string");
  var sign = 1;
  if (str[0] === '-') {
    sign = -1;
    str = str.slice(1);
  } else if (str[0] === '+') {
    str = str.slice(1);
  }
  // 情况1：纯数字（整数或实数）
  if (/^\d+(?:\.\d+)?$/.test(str)) {
    x.array = parseFloat(str);
    x.sign = sign;
    x.layer = 0;
  }
  // 情况2：以 E/e/F 开头，后跟数字
  else if (/^[EeF]+\d+(?:\.\d+)?$/.test(str)) {
    var prefix = str.match(/^[EeF]+/)[0];
    var eCount = (prefix.match(/[Ee]/g) || []).length;
    var fCount = (prefix.match(/F/g) || []).length;
    x.array = parseFloat(str.slice(prefix.length));
    x.sign = sign;
    x.layer = 1;
    x.brrby = [eCount, fCount];
  }
  // 其余情况无效
  else {
    throw Error("invalidArgument: invalid string format");
  }
  }

  // to be continued

  x.normalize();
  return x;
};

P.clone = function() {
  var temp = new MetaNum();
  temp.sign = this.sign;
  temp.layer = this.layer;
  temp.array = this.array;
  temp.brrby = this.brrby;
  temp.crrcy = this.crrcy;
  temp.drrdy = this.drrdy;
  return temp;
};
// end region operators


//Constructor function
function MetaNum(sign, layer, array, brrby, crrcy, drrdy) {
  if (!(this instanceof MetaNum)) {
    return new MetaNum(sign, layer, array, brrby, crrcy, drrdy);
  }
  
  const numArgs = arguments.length;
  
  if (numArgs === 1) {
    layer = 0;
    array = sign;
    brrby = [0];
    crrcy = [[0]];
    drrdy = [[[0]]];
    sign = 1;
  } else if (numArgs === 2) {
    array = layer;
    layer = sign;
    brrby = [0];
    crrcy = [[0]];
    drrdy = [[[0]]];
    sign = 1;
  } else if (numArgs === 3) {
    brrby = [0];
    crrcy = [[0]];
    drrdy = [[[0]]];
  } else if (numArgs === 4) {
    crrcy = [[0]];
    drrdy = [[[0]]];
  } else if (numArgs === 5) {
    drrdy = [[[0]]];
  }
  
  this.sign = validateSign(sign);
  this.layer = validateLayer(layer);
  this.array = validateArray(array);
  this.brrby = validateBrrby(brrby || [0]);
  
  if (this.layer >= 2) {
    this.crrcy = validateCrrcy(crrcy || [[0]]);
  } else {
    this.crrcy = [[0]];
  }
  
  if (this.layer >= 3) {
    this.drrdy = validateDrrdy(drrdy || [[[0]]]);
  } else {
    this.drrdy = [[[0]]];
  }
}

// region toglobalscope
  function clone(obj) {
    
  }

  function defineConstants(obj){
    for (var prop in R){
      if (R.hasOwnProperty(prop)){
        if (Object.defineProperty){
          Object.defineProperty(obj,prop,{
            configurable: false,
            enumerable: true,
            writable: false,
            value: new MetaNum(R[prop])
          });
        }else{
          obj[prop]=new MetaNum(R[prop]);
        }
      }
    }
    return obj;
  }
  function config(obj){
    if (!obj||typeof obj!=='object') {
      throw Error(MetaNumError+'Object expected');
    }
    var i,p,v,
      ps = [
        'maxOps',1,Number.MAX_SAFE_INTEGER,
        'serializeMode',0,1,
        'debug',0,2
      ];
    for (i = 0; i < ps.length; i += 3) {
      if ((v = obj[p = ps[i]]) !== void 0) {
        if (Math.floor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }
    return this;
  }

  // Create and configure initial MetaNum constructor.
  MetaNum=clone(MetaNum);
  MetaNum=defineConstants(MetaNum);
  MetaNum['default']=MetaNum.MetaNum=MetaNum;

  // Export.
  // AMD(Asynchronous Module Definition)
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return MetaNum;
    });
  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = MetaNum;
  // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self
        ? self : Function('return this')();
    }
    globalScope.MetaNum = MetaNum;
  }
// end region toglobalscope
})(this);