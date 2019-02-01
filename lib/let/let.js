export class _Let {
  constructor(value) {
    this[Symbol.for('let.value')] = value;
    this[Symbol.for('let.dependencies')] = new Map();
    this[Symbol.for('let.consumers')] = [];
    this[Symbol.for('let.operator')] = null;
    this[Symbol.for('let.onChangeCallback')] = null;
    this[Symbol.for('let.onChangeCallbackThis')] = null;

    return new Proxy(this, {
      get(target, prop) {
        switch (prop) {
          case 'addDependencies':
          case 'addConsumer':
          case 'updateDep':
          case 'setOperator':
          case 'onChange':
          case 'valueOf':
          case 'toString':
            // each of them is a function
            // 'this' into them will be the target, not the proxy as usually happens
            return target[prop].bind(target);

          case 'update':
          case Symbol.for('let.onChangeCallbackThis'):
            throw new Error('Access denied!');

          case Symbol.for('let.dependencies'):
            return new Map(target[Symbol.for('let.dependencies')]);

          case Symbol.for('let.consumers'):
            return [...Reflect.get(target, Symbol.for('let.consumers'))];

          case Symbol.for('let.value'):
          case 'value':
            return Reflect.get(target, Symbol.for('let.value'));

          case Symbol.for('let.operator'):
            return Reflect.get(target, Symbol.for('let.operator'));

          case Symbol.for('let.onChangeCallback'): {
            Reflect.get(target, Symbol.for('let.onChangeCallback'));
          }

          default:
            // 'this' for toString() will be the proxy, as usually
            Reflect.get(target, prop);
        }
      },

      set(target, prop, value, receiver) {
        switch (prop) {
          case Symbol.for('let.dependencies'):
          case Symbol.for('let.operator'):
          case Symbol.for('let.onChangeCallback'):
          case Symbol.for('let.onChangeCallbackThis'):
          case 'addDependencies':
          case 'addConsumer':
          case 'update':
          case 'setOperator':
          case 'onChange':
          case 'valueOf':
          case 'toString':
            throw new Error('Access denied!');

          case 'value': {
            // [Symbol.for("let.dependencies")] Map contains proxies as keys, so we send the receiver
            target[Symbol.for('let.consumers')].forEach(dep => {
              dep.updateDep(value, receiver);
            });
            return Reflect.set(target, target[Symbol.for('let.value')], value);
          }

          default:
            return Reflect.set(target, prop, value);
        }
      },
    });
  }

  toString() {
    // this == proxy
    return String(this.value);
  }

  valueOf() {
    // this == proxy
    return Number(this.value);
  }

  addDependencies(...deps) {
    // this == target
    if (deps.some(dep => !(dep instanceof _Let)))
      throw new Error(
        'You must call addDependencies passing one or more Let instances'
      );
    for (const dep of deps) {
      this[Symbol.for('let.dependencies')].set(dep, dep.value);
    }
  }

  addConsumer(cons) {
    // this == target
    if (!(cons instanceof _Let))
      throw new Error('You must call addConsumer passing one Let instance');
    this[Symbol.for('let.consumers')] = [
      ...this[Symbol.for('let.consumers')],
      cons,
    ];
  }

  updateDep(value, whoWas) {
    // this == target
    this[Symbol.for('let.dependencies')].set(whoWas, value);
    this.update();
  }

  update() {
    // this == target
    let operator = this[Symbol.for('let.operator')];
    let res = null;

    switch (operator) {
      case '+': {
        res = 0;
        for (const x of this[Symbol.for('let.dependencies')].values()) {
          res += x;
        }
        this[Symbol.for('let.value')] = res;
        break;
      }

      case '*': {
        res = 1;
        for (const x of this[Symbol.for('let.dependencies')].values()) {
          res *= x;
        }
        this[Symbol.for('let.value')] = res;
        break;
      }

      case '-': {
        let it = this[Symbol.for('let.dependencies')].values();
        let f = it.next().value;
        let s = it.next().value;
        res = f - s;
        this[Symbol.for('let.value')] = res;
        break;
      }

      case '/': {
        let it = this[Symbol.for('let.dependencies')].values();
        let f = it.next().value;
        let s = it.next().value;
        res = f / s;
        this[Symbol.for('let.value')] = res;
        break;
      }

      case '%': {
        let it = this[Symbol.for('let.dependencies')].values();
        let f = it.next().value;
        let s = it.next().value;
        res = f % s;
        this[Symbol.for('let.value')] = res;
        break;
      }

      default:
        throw new Error('Unknown operator');
    }

    if (this[Symbol.for('let.onChangeCallback')]) {
      this[Symbol.for('let.onChangeCallback')].call(
        this[Symbol.for('let.onChangeCallbackThis')],
        res
      );
    }
  }

  setOperator(op) {
    // this == target
    this[Symbol.for('let.operator')] = op;
  }

  onChange(cb, _this) {
    // this == target
    if (typeof cb != 'function')
      throw new TypeError('The callback is not a function');
    if (typeof _this != 'object' && typeof _this != 'undefined')
      throw new TypeError('this argument must be: object or null or undefined');
    this[Symbol.for('let.onChangeCallback')] = cb;
    this[Symbol.for('let.onChangeCallbackThis')] = _this || null;
  }
}
