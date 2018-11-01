class Let {

    constructor(value) {
        this[Symbol.for("value")] = value;
        this[Symbol.for("let.dependencies")] = new Map();
        this[Symbol.for("let.consumers")] = [];

        const p = new Proxy(this, {

            get(target, prop) {
                if(prop == "toString") {
                    return Reflect.get(target, prop);
                }

                if(prop == "addDependencies") {
                    return target[prop].bind(target);
                }

                if(prop == "addConsumer") {
                    return target[prop].bind(target);
                }

                if(prop == "updateDep") {
                    return target[prop].bind(target);
                }

                if(prop == "update") {
                    throw new Error("Access denied!");
                }

                if(prop == Symbol.for("let.dependencies")) {
                    return new Map(target[Symbol.for("let.dependencies")]);
                }

                if(prop == Symbol.for("let.consumers")) {
                    return [...Reflect.get(target, prop)];
                }

                if(prop == "value") {
                    return Reflect.get(target, Symbol.for("value"));
                }

                return Reflect.get(target, prop);
            },

            set(target, prop, value, receiver) {
                if((prop == Symbol.for("let.dependencies")) ||
                   (prop == "toString") ||
                   (prop == "addDependencies") ||
                   (prop == "addConsumer") ||
                   (prop == "update")) {
                    throw new Error("Access denied!");
                }

                if(prop == "value") {
                    for(const dep of target[Symbol.for("let.consumers")]) {
                        dep.updateDep(value, receiver); // the Map contains the proxies as keys
                    }
                    return Reflect.set(target, target[Symbol.for("value")], value);
                }

                return Reflect.set(target, prop, value);
            }
        });

        return p;
    }

    toString() {
        // this == proxy
        return String(this[Symbol.for("value")]);
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
        let sum = 0;
        for(const x of this[Symbol.for("let.dependencies")].values()) {
            sum += x;
        }
        this[Symbol.for("value")]= sum;
    }

    static add(let1, let2) {
        const newLet = new Let(let1.value + let2.value);
        let1.addConsumer(newLet);
        let2.addConsumer(newLet);
        newLet.addDependencies(let1, let2);
        return newLet;
    }
}

let a = new Let(45);
let b = new Let(55);
let c = Let.add(a,b);
console.log(c.value);
a.value = 145;

console.log(c.value);

a.value = 99;
b.value = 1;
console.log(c.value);





