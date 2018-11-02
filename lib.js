class Let {

    constructor(value) {
        this[Symbol.for("let.value")] = value;
        this[Symbol.for("let.dependencies")] = new Map();
        this[Symbol.for("let.consumers")] = [];
        this[Symbol.for("let.operator")] = null;
        this[Symbol.for("let.onChangeCallback")] = null;
        this[Symbol.for("let.onChangeCallbackThis")] = null;

        return new Proxy(this, {

            get(target, prop) {

                switch(prop) {
                    case "addDependencies":
                    case "addConsumer":
                    case "updateDep":
                    case "setOperator":
                    case "onChange":
                        // each of them is a function
                        // 'this' into them will be the target, not the proxy as usually happens
                        return target[prop].bind(target);

                    case "update":
                    case Symbol.for("let.onChangeCallbackThis"):
                        throw new Error("Access denied!");

                    case Symbol.for("let.dependencies"):
                    case "dependencies":
                        return new Map(target[Symbol.for("let.dependencies")]);

                    case Symbol.for("let.consumers"):
                    case "consumers":
                        return [...Reflect.get(target, Symbol.for("let.consumers"))];

                    case Symbol.for("let.value"):
                    case "value":
                        return Reflect.get(target, Symbol.for("let.value"));

                    case Symbol.for("let.operator"):
                    case "operator":
                        return Reflect.get(target, Symbol.for("let.operator"));

                    case Symbol.for("let.onChangeCallback"):
                    case "callback": {
                        Reflect.get(target, Symbol.for("let.onChangeCallback"));
                    }

                    default:
                        // 'this' for toString() will be the proxy, as usually
                        Reflect.get(target, prop);
                }
            },

            set(target, prop, value, receiver) {

                switch(prop) {
                    case Symbol.for("let.dependencies"):
                    case Symbol.for("let.operator"):
                    case Symbol.for("let.onChangeCallback"):
                    case Symbol.for("let.onChangeCallbackThis"):
                    case "toString":
                    case "addDependencies":
                    case "addConsumer":
                    case "update":
                    case "setOperator":
                    case "onChange":
                        throw new Error("Access denied!");

                    case "value": {
                        // [Symbol.for("let.dependencies")] Map contains proxies as keys, so we send the receiver
                        target[Symbol.for("let.consumers")].forEach(dep => { dep.updateDep(value, receiver) });
                        return Reflect.set(target, target[Symbol.for("let.value")], value);
                    }


                    default:
                        return Reflect.set(target, prop, value);
                }
            }
        });


    }

    toString() {
        // this == proxy
        return String(this.value);
    }

    addDependencies(...deps) {
        // this == target
        if(deps.some(dep => !(dep instanceof Let))) throw new Error("You must call addDependencies passing one or more Let instances");
        for(const dep of deps) {
            this[Symbol.for("let.dependencies")].set(dep, dep.value);
        }
    }

    addConsumer(cons) {
        // this == target
        if(!(cons instanceof Let)) throw new Error("You must call addConsumer passing one Let instance");
        this[Symbol.for("let.consumers")] = [...this[Symbol.for("let.consumers")], cons];
    }

    updateDep(value, whoWas) {
        // this == target
        this[Symbol.for("let.dependencies")].set(whoWas, value);
        this.update();
    }

    update() {
        // this == target
        let operator = this[Symbol.for("let.operator")];
        let res = null;

        switch(operator) {
            case "+": {
                res = 0;
                for(const x of this[Symbol.for("let.dependencies")].values()) {
                    res += x;
                }
                this[Symbol.for("let.value")] = res;
                break;
            }

            case "*": {
                res = 1;
                for(const x of this[Symbol.for("let.dependencies")].values()) {
                    res *= x;
                }
                this[Symbol.for("let.value")] = res;
                break;
            }


            case "-": {
                let it = this[Symbol.for("let.dependencies")].values();
                let f = it.next().value;
                let s = it.next().value;
                res = f - s;
                this[Symbol.for("let.value")] = res;
                break;
            }

            case "/": {
                let it = this[Symbol.for("let.dependencies")].values();
                let f = it.next().value;
                let s = it.next().value;
                res = f / s;
                this[Symbol.for("let.value")] = res;
                break;
            }

            case "%": {
                let it = this[Symbol.for("let.dependencies")].values();
                let f = it.next().value;
                let s = it.next().value;
                res = f % s;
                this[Symbol.for("let.value")] = res;
                break;
            }

            default:
                throw new Error("Unknown operator");
        }

        if(this[Symbol.for("let.onChangeCallback")]) {
            this[Symbol.for("let.onChangeCallback")].call(this[Symbol.for("let.onChangeCallbackThis")], res);
        }
    }

    setOperator(op) {
        // this == target
        this[Symbol.for("let.operator")] = op;
    }

    onChange(cb, _this) {
        // this == target
        if(typeof cb != "function") throw new TypeError("The callback is not a function");
        if((typeof _this != "object") && (typeof _this != "undefined")) throw new TypeError("this argument must be: object or null or undefined");
        this[Symbol.for("let.onChangeCallback")] = cb;
        this[Symbol.for("let.onChangeCallbackThis")] = _this || null;
    }

    static add(...lets) {
        const sum = lets.reduce((acc, aLet) => acc += aLet.value, 0);
        const newLet = new Let(sum);

        lets.forEach(aLet => { aLet.addConsumer(newLet)});
        newLet.addDependencies(...lets);
        newLet.setOperator("+");

        return newLet;
    }

    static mult(...lets) {
        const tot = lets.reduce((acc, aLet) => acc *= aLet.value, 1);
        const newLet = new Let(tot);

        lets.forEach(aLet => { aLet.addConsumer(newLet)});
        newLet.addDependencies(...lets);
        newLet.setOperator("*");

        return newLet;
    }

    static sub(let1, let2) {
        const res = let1.value - let2.value;
        const newLet = new Let(res);

        let1.addConsumer(newLet);
        let2.addConsumer(newLet);
        newLet.addDependencies(let1, let2);
        newLet.setOperator("-");

        return newLet;
    }

    static div(let1, let2) {
        const res = let1.value / let2.value;
        const newLet = new Let(res);

        let1.addConsumer(newLet);
        let2.addConsumer(newLet);
        newLet.addDependencies(let1, let2);
        newLet.setOperator("/");

        return newLet;
    }

    static mod(let1, let2) {
        const res = let1.value % let2.value;
        const newLet = new Let(res);

        let1.addConsumer(newLet);
        let2.addConsumer(newLet);
        newLet.addDependencies(let1, let2);
        newLet.setOperator("%");

        return newLet;
    }
}

console.log("-------------------------------------------");

let a = new Let(45);
let b = new Let(55);
let c = new Let(50);

let d = Let.add(a, b, c);
d.onChange((v) => console.log(`il valore è cambiato in: ${v}`));
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
