# Raex
A new not powerful reactive library for javascript (it uses ES6 Proxies)

```js
import {Let, Operations} from '../lib';

console.log("-------------------------------------------");

let a = Let(1);
let b = Let(2);
let c = Let(3);

let d = Operations.add(a, b, c); // +
console.log(d.value); // 6
d.onChange((v) => console.log(`value updated: ${v}`));

c.value = 0; // value updated: 3
console.log(d.value); // 3

b.value = 9; // value updated: 10
console.log(d.value); // 10;

console.log("-------------------------------------------");

let s1 = Let(100);
let s2 = Let(90);
let sT = Operations.sub(s1, s2); // -
console.log(sT.value); // 10

s2.value = 73;
console.log(sT.value); // 27

console.log("-------------------------------------------");

let f1 = Let(5);
let f2 = Let(2);

let resM = Operations.mult(f1, f2); // *
console.log(resM.value); // 10

f2.value = 7;
console.log(resM.value); // 35

console.log("-------------------------------------------");

let d1 = Let(10);
let d2 = Let(5);
let resD = Operations.div(d1, d2); // /

console.log(resD.value); // 2
d2.value = 2;
console.log(resD.value); // 5

console.log("-------------------------------------------");

let md1 = Let(10);
let md2 = Let(3);
let resMD = Operations.mod(md1, md2); // %

console.log(resMD.value); // 1
md2.value = 4;
console.log(resMD.value); // 2

console.log("-------------------------------------------");
```
