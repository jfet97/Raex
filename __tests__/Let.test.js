import { Let } from '../lib';

console.log("-------------------------------------------");

let a = new Let(45);
let b = new Let(55);
let c = new Let(50);

let d = Let.add(a, b, c);
d.onChange((v) => console.log(`value changed: ${v}`));
console.log(d.value);
b.value = 155;
b.value = 10;

console.log("-------------------------------------------");

let s1 = new Let(100);
let s2 = new Let(90);
let sT = Let.sub(s1, s2);
console.log(sT.value);

s2.value = 73;
console.log(sT.value);


console.log("-------------------------------------------");

let f1 = new Let(5);
let f2 = new Let(2);

let resM = Let.mult(f1, f2);
console.log(resM.value);

f2.value = 7;
console.log(resM.value);


console.log("-------------------------------------------");

let d1 = new Let(10);
let d2 = new Let(5);
let resD = Let.div(d1, d2);

console.log(resD.value);
d2.value = 2;
console.log(resD.value);

console.log("-------------------------------------------");

let md1 = new Let(10);
let md2 = new Let(3);
let resMD = Let.mod(md1, md2);

console.log(resMD.value);
md2.value = 4
console.log(resMD.value);

console.log("-------------------------------------------");
